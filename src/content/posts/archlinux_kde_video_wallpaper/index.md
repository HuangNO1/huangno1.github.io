---
title: "Archlinux KDE 動態桌布"
published: 2020-01-15T15:26:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-03-04T15:58:26+08:00
draft: false
description: ""
tags: ["ArchLinux", "Linux", "kde", "plasma", "video", "desktop", "Wallpaper"]
category: ArchLinux 
image: ./index/compressed/archlinux_kde_video_wallpaper.png
license: ""
lang: zh-TW
---
<!--2020/01/15 edited by Huang Po-Hsun-->

## 前言

**Wallpapaer Engine** 是非常優秀的動態桌布軟體，可惜的是這軟體不僅是需付費，也只支援 **Windows**，關於 **KDE 動態桌布**可能大家會有疑慮，**Plasma KDE** 究竟能不能實現**動態桌布**？答案是**可以的**，在這篇我將分享我完成動態桌布的過程。

當然，我也嘗試過使用 **vlc** 和 **xwinwrap + mplayer**，尤其是 **xwinwrap** 最折騰我，包括開機自啟，最後的效果都讓我不滿意。但是目前網上（包含 KDE 官網）所有關於 KDE 動態桌布的項目不是使用上不美觀或是沒效果（黑屏）。最後終於在一篇 [Github 項目](https://github.com/halverneus/org.kde.video)中看到黑屏的處理方法，無意間那些 KDE Video Wallpaper 插件都可以用了。

如果執意想使用 **vlc** 或是 **xwinwrap + mplayer** 的讀者可以參考某人的 Blog：[设置 Linux 动态桌面的几种办法 - 簡書](https://www.jianshu.com/p/d6ff45e983ce)

## Plasma Video Wallpaper

###  [WuSiYu / Plasma Video Wallpaper](https://github.com/WuSiYu/PlasmaVideoWallpaper)

這是 [Github](https://github.com/WuSiYu/PlasmaVideoWallpaper) 上看到的項目，這也是因為我看到他在 [B 站上的視頻](https://www.bilibili.com/video/av8534344/)才知道有這個項目。

完整項目使用過程他已經在他 Github 項目的 **README.md** 說得很清楚了。

先將項目下載解壓，進入項目目錄輸入以下指令：

> 如果沒有安裝 `cmake`、`make` 就裝一下，如果有權限問題就給權限。

```zsh
sudo pacman -S cmake make # 安裝 cmake make
cmake .
make
sudo make install
```

安裝完後重新登出登入重啟 Plasma。

> 特別注意：這個插件不能用來當鎖屏的動態桌布！我之前曾經試過利用這個將鎖屏設為動態壁紙，一開始還好好的，但是到後面慢慢出現程序問題，換回普通壁紙就好。

### [halverneus / org.kde.video](https://github.com/halverneus/org.kde.video)

這也是我一間發現的項目，號稱是鎖屏動態壁紙插件，但我為了執行內存空間上我還是沒用這個。但我也因為這個項目的 README.md 才發現黑屏原因。

## 黑屏

面對黑屏怎麼辦？黑屏的原因是因為你有些插件沒有安裝。安裝 `qt-gstreamer` 和 `gst-libav`。

> 補充：KDE 是使用 Qt 實現的，所以系統軟體裡自帶 Qt，不能亂砍。

```zsh
sudo pacman -S qt-gstreamer gst-libav
```
安裝完並重啟 Plasma 就可以了，我教我的幾位同學們安裝這兩個插件後動態桌布都可以實現了，不再是黑屏。

## 桌面怖局

記的桌面布局要選擇**桌面**。如果選擇資料夾有可能顯示不出動態桌布。

<!-- ![01.png](https://i.loli.net/2020/01/15/AjVFS74LHQDaGmy.png "設定動態桌布") -->
![01.png](https://imgpoi.com/i/KLRR5E.png "設定動態桌布")

## 重要補充

動態壁紙有時很吃電腦內存，如果內存小於 8GB 建議還是別使用動態桌布。

## Reference

* [WuSiYu/Plasma Video Wallpaper](https://github.com/WuSiYu/PlasmaVideoWallpaper)
* [【原创】Linux KDE Plasma桌面 视频动态壁纸插件](https://www.bilibili.com/video/av8534344/)
* [设置 Linux 动态桌面的几种办法](https://www.jianshu.com/p/d6ff45e983ce)
* [halverneus / org.kde.video](https://github.com/halverneus/org.kde.video)