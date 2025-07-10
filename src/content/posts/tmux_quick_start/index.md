---
title: "Tmux 快速使用"
published: 2025-07-10T11:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-10T11:00:28+08:00
draft: false
description: ""
license: ""
tags: ["tmux", "terminal"]
category:  Research
image: ./index/compressed/tmux-panes.png
lang: zh-TW
---
## 前言

使用 `tmux` 是一個比 `nohup` 更好的選擇，因為它不僅能讓你的程序在後台持續運行，還能讓你隨時方便地重新連接回去，查看實時的輸出、滾動日誌，就像你從未離開過一樣。

下面是使用 `tmux` 來運行你訓練任務的詳細步驟。

## 第 1 步：安裝 tmux

如果你的服務器上還沒有安裝 `tmux`，可以使用包管理器進行安裝。

**對於 Ubuntu/Debian 系統：**

```bash
sudo apt update
sudo apt install tmux
```

**對於 CentOS/RHEL 系統：**

```bash
sudo yum install tmux
```

或

```bash
sudo dnf install tmux
```

## 第 2 步：啟動並使用 tmux 會話

**1. 創建一個新的命名會話 (Session)**

打開你的終端，輸入以下命令來創建一個新的 `tmux` 會話。給會話起一個有意義的名字（例如 `training_session`）是個好習慣。

```bash
tmux new -s training_session
```

執行後，你的終端窗口會刷新，看起來像一個全新的終端，但實際上你已經進入了 `tmux` 的會話環境。窗口底部會有一條綠色的狀態欄。

**2. 在 tmux 會話中運行你的訓練命令**

現在，你就像在普通終端裡一樣，直接運行你的 `accelerate` 命令。

```bash
accelerate launch /path/to/your/train_script.py --your_arguments ...
```

你的模型訓練就會在這個 `tmux` 會話中開始運行，你可以實時看到所有的日誌輸出。

**3. “分離” (Detach) 會話，讓其在後台運行**

這是關鍵一步。當訓練開始後，你可以放心地讓它在後台運行，然後關閉你的SSH連接。

按下組合鍵： Ctrl + b，然後鬆開，再按下 d 鍵。

> **快捷鍵說明**: `Ctrl + b` 是 `tmux` 的前綴鍵 (prefix)，按下它之後 `tmux` 才知道你下一個按鍵是指令。`d` 代表 "detach"。

操作完成後，你會立刻返回到你原來的終端，並看到 `[detached (from session training_session)]` 的提示。此時，`training_session` 和裡面的訓練程序已經在服務器後台穩定運行了。你可以安全地關閉本地終端或斷開SSH。

## 第 3 步：重新連接 (Attach) 回會話

當你想要回來查看訓練進度時：

**1. 查看正在運行的 tmux 會話**

如果你忘記了會話的名字，可以先列出所有正在運行的會話：

```bash
tmux ls
```

你會看到類似 `training_session: 1 windows (created ...)` 的輸出。

**2. 連接到指定的會話**

使用 `attach` 命令和你之前設定的會話名，重新進入會話：

```bash
tmux attach -t training_session
```

執行後，你會立刻回到之前運行訓練命令的那個界面，看到最新的日誌輸出，彷彿你從未離開過。

## 總結與額外技巧

- **創建會話**: `tmux new -s <會話名>`
- **分離會話**: 在會話內按 `Ctrl+b`，再按 `d`
- **查看會話**: `tmux ls`
- **重連會話**: `tmux attach -t <會話名>`
- **終止會話**: 如果你想徹底結束訓練並關閉會話，可以重連進去後按 `Ctrl+c` 停止程序，然後輸入 `exit` 並回車。或者在外部直接使用命令 `tmux kill-session -t <會話名>`。
- **在 `tmux` 中滾動查看歷史輸出**: 按 `Ctrl+b`，然後按 `[` 進入“複製模式”，之後你就可以用上下箭頭或 `PageUp`/`PageDown` 來滾動屏幕了。按 `q` 退出滾動。

使用 `tmux` 可以有效避免因網絡斷開導致的 `SIGHUP` 信號中斷，同時提供了比 `nohup` + `tail -f` 更強大和便捷的管理方式。對於您之前遇到的問題，這是一個非常推薦的解決方案。