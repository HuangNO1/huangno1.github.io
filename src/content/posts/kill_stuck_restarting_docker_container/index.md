---
title: "如何刪除卡住的 Docker 容器：解決 could not kill container 錯誤"
published: 2025-08-16T00:12:00+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-08-16T00:12:00+08:00
draft: false
description: ""
license: ""
tags: ["lab", "website", "framework", "docker"]
category: Web
image: ./index/compressed/docker.png
lang: zh-TW
---
## 問題描述

遇到 Docker 容器處於 **Restarting** 狀態無法刪除的問題：

![docker_restarting_error.png](https://imgpoi.com/i/AUYP8E.png)

錯誤訊息：
> `could not kill container: tried to kill container, but did not receive an exit event`

常見的 `docker stop` 和 `docker rm -f` 命令都無法解決此問題。

## 錯誤原因

這個錯誤通常表示 Docker daemon / containerd 和該容器的 **shim** 卡住了（不是單純應用進程殺不掉），所以常規的刪除方法會失敗。

容器一直 Restarting 通常是因為：
* 啟動指令執行後立刻報錯退出
* 依賴的服務（例如 MySQL）還沒啟動成功  
* 配置文件或環境變數有錯

## 解決方案

以下提供**由淺到深**的處理步驟，按順序執行，通常其中一步就能解決：

### 步驟 0：記錄容器日誌（可選）

在刪除容器前先保存日誌，方便後續排查問題：

```bash
docker logs --tail=200 9a1b9d33d166 > /root/backend_last_200.log 2>&1 || true
```

### 步驟 1：關閉重啟策略 + 強制殺掉

```bash
docker update --restart=no 9a1b9d33d166 || true
docker kill --signal=SIGKILL 9a1b9d33d166 || true
docker rm -f 9a1b9d33d166
```

### 步驟 2：重啟 Docker 服務

> ⚠️ 注意：會短暫中斷所有容器，請選擇合適的業務窗口執行。

```bash
systemctl restart containerd
systemctl restart docker
# Docker 服務重啟後再刪除
docker rm -f 9a1b9d33d166
```

### 步驟 3：使用 containerd 直接處理

繞過 Docker CLI，直接操作 containerd：

```bash
# 找到這個容器的 task
ctr -n moby tasks ls | grep 9a1b9d33d166 || true

# 直接送 KILL 給 task
ctr -n moby tasks kill -KILL 9a1b9d33d166 || true

# 刪除 containerd 層級的容器定義
ctr -n moby containers delete 9a1b9d33d166 || true

# 再讓 Docker 層刪掉
docker rm -f 9a1b9d33d166
```

### 步驟 4：殺掉卡住的 containerd-shim

當 shim 進程卡死導致「收不到退出事件」時：

```bash
# 找到相關的 shim 進程 PID
ps -ef | grep 9a1b9d33d166 | grep -E 'containerd-shim|runc' | grep -v grep

# 強制殺掉這些 shim/runc 進程
kill -9 <上面找到的PID們>

# 再刪除容器
docker rm -f 9a1b9d33d166
```

### 步驟 5：離線修改容器配置

當容器瘋狂重啟、`docker update` 來不及生效時：

```bash
systemctl stop docker
systemctl stop containerd

# 編輯容器的配置文件（ID 目錄前綴即可匹配）
vi /var/lib/docker/containers/9a1b9d33d166*/hostconfig.json
# 找到 "RestartPolicy" 修改為：
# "RestartPolicy":{"Name":"no","MaximumRetryCount":0}

systemctl start containerd
systemctl start docker

docker rm -f 9a1b9d33d166
```

### 步驟 6：終極方案 - 離線清理容器目錄

> ⚠️ **最後手段**：可能留下殭屍記錄，但能救回現場。執行前務必確認不會誤刪資料卷。

```bash
systemctl stop docker
systemctl stop containerd

rm -rf /var/lib/docker/containers/9a1b9d33d166*

systemctl start containerd
systemctl start docker

# 清理無主資源（可選）
docker system prune -f
```

## 後續排查

解決容器刪除問題後，需要排查為什麼容器會一直重啟。常見原因包括：

* **資料庫連接問題**：容器內應連 `lab_web_db:3306`，而不是對外映射的 `3307`
* **環境變數或配置缺失**：檢查必要的環境變數和配置文件
* **健康檢查腳本失敗**：導致容器立即重啟

### 排查步驟

1. **檢查容器日誌**：
```bash
# 查看之前保存的日誌
cat /root/backend_last_200.log

# 或者直接查看最新日誌
docker logs --tail=200 <container_id>
```

2. **檢查容器配置**：
```bash
# 查看環境變數
docker inspect <container_id> --format '{{json .Config.Env}}'

# 查看啟動命令
docker inspect <container_id> --format '{{.Path}} {{.Args}}'
```

3. **Docker Compose 處理**：
如果使用 Docker Compose，建議先停止重啟策略：

```bash
# 修改 docker-compose.yml 中的 restart: always 為 restart: "no"
docker compose down
docker compose up -d
```

## 總結

處理卡住的 Docker 容器刪除問題時，建議按以下順序嘗試：

1. 先嘗試簡單的強制刪除方法
2. 重啟 Docker 服務（最常見有效方法）
3. 使用底層 containerd 工具
4. 手動清理相關進程
5. 最後才考慮離線修改配置或清理目錄

大多數情況下，前幾個步驟就能解決問題。

