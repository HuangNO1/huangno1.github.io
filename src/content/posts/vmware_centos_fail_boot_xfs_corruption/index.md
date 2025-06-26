---
title: "VMware Workstation Pro 中 CentOS 7 啟動崩潰"
published: 2020-12-24T12:17:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-12-24T12:17:26+08:00
draft: false
description: ""
license: ""
tags: ["VMware", "Workstation", "CentOS", "boot", "xfs"]
category: Linux
image: "./index/compressed/vmware_centos_fail_boot_xfs_corruption.png"
lang: zh-TW
---

## 前言

我因為最近在做雲計算實驗中的 Hadoop + Spark，我在我的 Windows 上用 VMware Workstation 開了三個虛擬機，且都裝了 CentOS7 系統。當時因為我下課結束將筆電蓋住，去實驗室將電腦打開的時候，整個 Windows 系統變得很卡，視窗方面無法移動縮放，我只好強制關機重啟筆電，結果一開機啟動虛擬機就出錯了。

## 問題

我的三台 CentOS 虛擬機都出現 **CentOS 7 Fails to Boot – XFS Corruption – Enters Emergency Mode** 這樣的報錯，看起來是 XFS 文件系統出錯了，錯誤畫面如下：

![centos_fail_to_boot.jpg](https://imgpoi.com/i/KWPO39.jpg "CentOS 無法啟動")

我嘗試了很久想想怎麼修復，爬文看看是哪裡出錯了，終於在[一篇文章](https://jc-lan.org/2016/11/13/centos-7-fails-to-boot-xfs-corruption-enters-emergency-mode/)中找到解決辦法。

## 解決

> I chose the default boot option and reached a console. Ideally one should create a dump of the damaged partition by running xfs_metadump, restore the dump to an image using xfs_mdrestore, and then perform the repair on that image. That way you can evaluate the repair done to the image to see if it will work or irreversibly damage your actual data.
> I went ahead and just did the repair on the actual data:
> `xfs_repair -L /dev/mapper/centos-root`
> The repair completed and after a reboot CentOS started successfully.

根據這些內容，於是我在進入的終端裡輸入了**修復鏡像指令**。

```zsh
xfs_repair -L /dev/mapper/centos-root
```

接著我輸入 `exit` 登出後，重新進入系統，結果成功啟動 CentOS 7虛擬機，進入圖形界面也沒問題。

## 衍生問題

經過上面的操作後，雖然能正常啟動 CentOS 了，但是卻導致原本可以連網了 CentOS 虛擬機，現在竟然無法連網...(☉д⊙)，檢查了 VMware 的連網設置，明明設置了 NAT 可以自動連網的呀！？往上一堆奇怪的教學，嘗試了沒用，然後我也不敢直接將物理地址寫死，因為我電腦時常切換網路。

## 結語

用虛擬機實在是太不穩了，原本以為解決了啟動問題，為了可能需要將所有實驗重新做一次捏了一把冷汗，最後還是需要新安裝，重新將所有實驗重做一次。我還是 Too Young Too Simple 了。

## Reference

- [CentOS 7 Fails to Boot – XFS Corruption – Enters Emergency Mode - JC-LAN](https://jc-lan.org/2016/11/13/centos-7-fails-to-boot-xfs-corruption-enters-emergency-mode/)