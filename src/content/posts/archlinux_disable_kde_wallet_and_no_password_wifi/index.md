---
title: "ArchLinx KDE 錢包禁用與解決 WIFI 密碼輸入"
published: 2021-09-30T08:17:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2021-09-30T08:17:26+08:00
draft: false
description: ""
license: ""
tags: ["ArchLinux", "Linux", "kde", "wallet", "password", "WIFI"]
category: ArchLinux 
image: ./index/compressed/archlinux_disable_kde_wallet_and_no_password_wifi.png
lang: zh-TW
---

## 前言

最近滾系統時發現萬惡的 KDE 錢包又出現了，然後每次進入系統都要輸入 KDE 錢包和 WIFI 密碼，讓我很難受，於是就有了這篇文章（別說我在摸魚水文章 @@。

## 解決 KDE Wallet

如果還沒安裝了 KDE 錢包管理就先去安裝它，`kwalletmanager`。

```zsh
sudo pacman -S kwalletmanager
```

安裝完之後需要進入 **設定 -> 個人化 -> KDE 錢包 -> 錢包設定**，將 **開啟 KDE wallet 子系統(E)** 的勾選去掉，套用設定，之後就不需要在碰到需要輸入 KDE 錢包密碼了，畢竟我平常也沒用到這個應用。

![kde_wallet_settings.png](https://imgpoi.com/i/K0UIKM.png "KDE 錢包設定")

## 解決 WIFI 密碼問題

自從 KDE 錢包出現後連帶每次進入進入系統 NetworkManager 都會要我重新輸入 WIFI 密碼，所以想要從根本根治，需要在設定中將其密碼存儲。

![network_setting.png](https://imgpoi.com/i/K0UGO2.png "網路設定")

之後每次進入系統連線 WIFI 都不需要輸入密碼了。

## Reference

- [KDE5: How do i completely disable/remove kdewallet - Archlinux BBS](https://bbs.archlinux.org/viewtopic.php?id=202174)