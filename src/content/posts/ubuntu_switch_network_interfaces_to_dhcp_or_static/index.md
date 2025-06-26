---
title: "類樹梅派上 Ubuntu 連網 IP 問題"
published: 2021-09-30T09:03:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2021-09-30T09:03:28+08:00
draft: false
description: ""
license: ""
tags: ["Linux", "Ubuntu", "Network", "Interface", "DHCP", "static", "IP"]
category: Linux
image: "./index/compressed/ubuntu_switch_network_interfaces_to_dhcp_or_static.jpg"
lang: zh-TW
---

## 前言

題外話：由於我最近已經在上海某家小公司實習了，公司只有 8 個人不到，我是目前公司唯一的研發工程師，剛入職前上一個原本要帶我的研發工程師就跳槽辭職了，以實習薪資來說開的不高，但也不算少了，5000 RMB/Month 包住不包食。

我在公司上班時要初步探索他們的機器去寫一個網頁開發去控制機器內部的串口或是信息，在初步學習的就遇到 IP 問題。

## 網線靜態 IP 連上機器

由於機器沒有無線網卡，但是有兩張網卡，兩個網路接口，**預設 IP 是 `192.168.3.127`、`192.168.4.127`**，我網線將機器和我的筆電連上，並更改我的網卡連線設定，我設置了靜態 IP：

```
# IPv4
# 我接在 eth0 第一個網路接口上，最後一段地址不能跟 eth0 的地址一樣，隨便填了一個
IP Address : 192.168.3.11
NetMask : 255.255.255.0
Broadcast : 0.0.0.0
```

然後先 `ping 192.168.3.127` 看通不通，接著 `ssh root@192.168.3.127`，連接進去，想要去修改這機器的 IP 設定，因為想讓這個機器連上路由器網路。

## 機器連路由器上網

用網線將機器和路由器連接後一開始是還沒辦法連網的，`ping baidu.com` 的掉包率是 100%，**在 `/etc/network/interfaces` 中可以設置相關參數**（比較暴力直接），當然你也可以直接輸入指令去控制。我是直接設成動態 IP。

> 也可以設成靜態 IP 連路由器上網，但是你需要自己去查看路由器的 IP 地址，公司的路由器末 IP 地址 100 - 200 都是可以用的。

**預設：**

```
# /etc/network/interfaces
auto lo eth0 eth1
iface lo inet loopback
                      
iface eth0 inet static       
        address 192.168.3.127
        netmask 255.255.255.0
        network 192.168.3.0    
        broadcast 192.168.3.255
iface eth1 inet static       
        address 192.168.4.127
        netmask 255.255.255.0
        network 192.168.4.0    
        broadcast 192.168.4.255
```

**將 eth1 修改成動態 IP：**

> 設成靜態 IP 可以依樣畫葫蘆，設回來。然後可以在 `/etc/resolv.conf` 設置對應 DNS。

```
# /etc/network/interfaces
auto lo eth0 eth1
iface lo inet loopback
                      
iface eth0 inet static       
        address 192.168.3.127
        netmask 255.255.255.0
        network 192.168.3.0    
        broadcast 192.168.3.255

# 設成 dhcp 自動分配 ip
iface eth1 inet dhcp
# iface eth1 inet static       
#         address 192.168.4.127
#         netmask 255.255.255.0
#         network 192.168.4.0    
#         broadcast 192.168.4.255
```

接著重啟網路服務：

```
# 兩種啟動指令，效果都一樣
# 第一種
sudo systemctl restart networking
# 第二種
/etc/init.d/networking restart
```

接下來要啟用 `eth1` 的連線：

```
sudo dhclient eth1
```

這樣子再 `ping baidu.com` 就通了。

## 意外情況

### 網線沒接好

有可能你在 `dhclient eth1` 後也 ping 不通，這時需要檢查你的網路接口是否有接好，像我用的這個機器網路接口不敏感，容易斷掉。

**如果 `ip a` 顯示 `eth1` 是 `linkdown`**，就需要重新插好線。

```
ip r # 檢測是否接上線
```

### 舊的 IP 地址沒被清除

如果依然 ping 不上，就檢查一下網卡 IP。

```
ip a # 檢查接口
```

如果存在兩個 IP 地址就去清除，像我就遇到舊的 `192.168.4.127` 還沒被刪去。

```
ip a del dev eth1 192.168.4.127/24 刪除 eth1 網卡舊地址
```

### dhclient 報錯

如果你 `dhclient eth1` 後報以下錯誤。

```
RTNETLINK answers: File exists
```

你可以重新更新 dhclient。

```
dhclient -r
```

如果還不夠的話可以刪除 leases，並且獲得新的 lease。

```
sudo rm /var/lib/dhcp/dhclient.leases
```

最後：

```
sudo dhclient eth1
```

## Reference

- [一天一点linux(10):ubuntu如何设置静态IP和动态IP？ - segment fault](https://segmentfault.com/a/1190000004651192)
- [dhclient: What does "RTNETLINK answers: File exists" Mean? - server fault](https://serverfault.com/questions/601450/dhclient-what-does-rtnetlink-answers-file-exists-mean)