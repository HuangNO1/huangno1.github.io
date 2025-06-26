---
title: "Archlinux 安裝 Part 3 - 基本軟體包安裝與 Mac 風界面設計"
# 副標題
subtitle: ""
description: ""
# 上次修改的時間
lastmod: 2020-07-29T15:58:26+08:00
published: 2020-01-05T15:25:28+08:00
draft: false
tags: ["ArchLinux", "Linux"]
category: ArchLinux 
image: ./index/compressed/archlinux_install_part3_install_some_software_and_mac_style.png
license: ""
lang: zh-TW
---
<!--2020/01/05 edited by Huang Po-Hsun-->

## 前言

我們在 Part 2 中已將基本的圖形界面以及中文字體等配置好，接下來我會在這篇中推薦一些實用的軟體與界面風格。

## 文本編輯器

### Kate

可作為記事本使用。

```zsh
sudo pacman -S kate
```

### [Typora](https://www.typora.io/)

美化你的文本，編寫 Markdowm 語言，具有跨平台優點，Linux 上的 `*.docx` 拿到 Windows 上的 Office 容易走版，使用 Markdown 寫的文件不會有這問題。

```zsh
sudo pacman -S typora
```

### [Visual Studio Code](https://code.visualstudio.com/)

一個輕快的編輯器，讓你的開發效率迅速提升。

> 在 AUR 中 VScode 軟體包稱作 code。

```zsh
sudo pacman -S code
```

## 辦公軟體

### WPS Office

作為在 Linux 上的最佳 MS 替代品，**因為 MS 的 Office 不開源**，所以無法在 Linux 使用 MS Office。WPS 在 Linux 不會有廣告，所以放心。

> 你可以使用 `pacman` 安裝 WPS Office，但僅限 64-bit Arch 使用者。

```zsh
yay -S wps-office ttf-wps-fonts # WPS 與 WPS 需要的符號字體
```

WPS 改變界面語言的方法是，隨便開啟 WPS 其中一個軟體，像是 Writer，新增一個空白文件，後在右上角的小框框選界面語言。

<!-- ![01.png](https://i.loli.net/2020/01/05/rGRzOJ4CUIB1pKs.png "WPS 變更界面語言") -->
![01.png](https://imgpoi.com/i/KLJHAB.png "WPS 變更界面語言")

選擇簡體中文，似乎沒有正體中文的選項 :(

<!-- ![02.png](https://i.loli.net/2020/01/05/RwWz7LoGZ8mck5O.png "WPS 變更界面語言選項") -->
![02.png](https://imgpoi.com/i/KLJ3XG.png "WPS 變更界面語言選項")


接著重啟 WPS 就會出現簡體中文的界面，也能正常輸入中文，每次開機打開 WPS 都會出現個錯誤框，按關閉就好，不影響使用。

### LibreOffice

同時支持 Windows、Macintosh 和 Linux 系統。

如果不在乎一定要 MS 的風格，我**強烈建議使用 LibreOffice**，功能齊全，軟體多，提供了六種文檔編輯與數據應用的應用。

```zsh
sudo pacman -S libreoffice-fresh # 嘗新版
sudo pacman -S libreoffice-still # 穩定版
```
LibreOffice 中文界面的語言包

* 簡體中文使用者

```zsh
sudo pacman -S libreoffice-fresh-zh-cn # 嘗新版
sudo pacman -S libreoffice-still-zh-cn # 穩定版
```

* 繁體中文使用者

```zsh
sudo pacman -S libreoffice-fresh-zh-tw # 嘗新版
sudo pacman -S libreoffice-still-zh-tw # 穩定版
```

## 文件管理器

我這裡建議是安裝 Dolphin，重要的是好看。

```zsh
sudo pacman -S dolphin
```

然後因為文件管理器預設是**滑鼠左鍵點一下**就進入資料夾或執行動作，所以需要到**設定 > 工作空間 > 工作空間行為 > 一般行為**中將點擊行為改成按兩下開啟檔案或資料夾，接著應用變更。

<!-- ![03.png](https://i.loli.net/2020/01/05/iOjdaH9pteYnKr5.png "設置滑鼠點擊事件") -->
![03.png](https://imgpoi.com/i/KLJOI9.png "設置滑鼠點擊事件")

## 媒體播放器

### MPV

MPV 算是 Linux 下簡潔的音訊播放器。

```zsh
sudo pacman -S mpv
```

### 網易雲音樂

網易雲還是不錯的音樂播放器。

```zsh
sudo pacman -S netease-cloud-music
```

<!-- ![04.png](https://i.loli.net/2020/01/05/ijml4tEDqdKxQvR.png "網易雲") -->
![04.png](https://imgpoi.com/i/KLS755.png "網易雲")

## 圖形

### 截圖工具

我使用 `flameshot` 習慣了，而且蠻好用。

```zsh
sudo pacman -S flameshot
flameshot gui # 截圖
flameshot gui -d 3000 # 延時 3 秒截圖
```

**Spectacle** 也是不錯的截圖工具，但是功能上沒 **flameshot** 那麼完備。

```zsh
sudo pacman -S spectacle
```

### 圖片檢視器

> 安裝 digikam 後就自動幫你安裝了

```zsh
sudo pacman -S showfoto
```

### 圖片編輯器

遺憾的是目前做好的圖片編輯自依然是 PhotoShop，而且 PS 不開源也不兼容 Linux，所以如果真的想要使用 PS 高級圖片處理就切到 Windows 去吧，Linux 都是開源軟體，沒有軟體能比得上 PS。

```zsh
sudo pacman -S digikam
```

### Gif 圖片

> 註：不推薦用這個錄屏。推薦使用下面的 kazam

Peek 可以錄製螢幕並轉成 Gif。

```zsh
sudo pacman -S peek
```

### 錄屏工具

這個工具使用很方便，推薦。

```
yay -S kazam
```

### 繪圖

**krita** 堪稱 Linux 上的 PS，開源。

```
yay -S krita
```

## 百度網盤

沒錯，你沒看錯，在 Linux 也可以使用百度雲下載東西。

```zsh
sudo pacman -S baidunetdisk-bin
```

## 通訊軟體

### Telegram

強推 Telegram。

> Telegram 需要翻牆。

```zsh
sudo pacman -S telegram-desktop
```

### Discord

自從 zoom 取消免費之後，加上騰訊相關產品無法在 Linux 上運行，然而我們需要通訊會議，這個是最適合的，包括語音和屏幕分享。實在是太好用了。

Discord 網頁版也做得很好，騰訊會議就沒有網頁版。

```zsh
sudo pacman -S discord # 穩定版
sudo pacman -S discord-ptb # 測試版
sudo pacman -S discord-canary # 最新版，我都直接裝最新版
```

### TIM

你更沒聽錯，在 Linux 上真的可以使用 TIM，但是 WeChat 無法使用，只是我平常也不用 WeChat，WeChat 很垃圾。騰訊的通訊軟體都極度不安全。

```zsh
sudo pacman -S deepin.com.qq.office
```

Arch 發行版 KDE Plasma 桌面會無法打開 TIM，解決方法如下：

先下載安裝 `gnome-settings-daemon` 套件

```zsh
sudo pacman -S gnome-settings-daemon
```

進入**設置 > 工作空間 >啟動與關閉 > 自動啟動**中將 `/usr/lib/gsd-xsettings`設為自動啟動。

<!-- ![05.png](https://i.loli.net/2020/01/05/mt72dJ6DW9svijf.png "自動啟動") -->
![05.png](https://imgpoi.com/i/KLS91M.png "自動啟動")

## IDE 

### Intelli IDEA

```zsh
sudo pacman -S intellij-idea-community-edition # 社區免費版
sudo pacman -S intellij-idea-ultimate-edition # 付費專業版
```

安裝 Java 環境。

* Arch Linux官方只支持 OpenJDK 實現。
* 安裝之後，Java 環境需要被 shell（`$PATH` 變量）識別。可以通過命令行用 `source` 處理 `/etc/profile` 或者重新登出登入桌面環境。

```zsh
sudo pacman -S java-runtime-common # JRE
sudo pacman -S java-environment-common # JDK
```

**2020/07/29 更新：安裝 intellij-idea-ultimate-edition，因為一直無法啟動 IDEA，網上搜一下，發現還要裝另一個套件**

原文：[AUR intellij-idea-ultimate-edition 下面的討論區](https://aur.archlinux.org/packages/intellij-idea-ultimate-edition/)

```zsh
sudo pacman -S intellij-idea-ultimate-edition-jre
```

### Pycharm

貌似需要使用 `yay` 直接從 AUR 下載安裝，`pacman` 庫沒有。其實我覺得 Python 直接用 VScode 寫就好了，但有些人不習慣，所以在這裡列出 Pycharm。

```zsh
yay -S pycharm-community-edition # 社區版
yay -S pycharm-professional # 專業版
```

## 解壓

這裡還是要提醒，`*.zip` 才是壓縮檔案，不建議使用 `*.rar`，但是如果有人傳給你 `*.rar`，你也只能將他解壓縮，這裡下載 `unrar`。

```zsh
sudo pacman -S zip unrar
```

## 瀏覽器

這裡我主要**推薦是使用 Firefox**，在 Linux 上，**Firefox 比 Chromium 更省內存**，之前有段期間我一直是使用 Chromium，每次開機沒多久就整個電腦卡死，自從換成了 Firefox 就順暢很多。當然如果你有 Google 帳號的一些使用者存儲或是電腦性能夠好，裝個 Chromium 也沒問題。

> 重要的是 Firefox 的應用商店沒有被牆。

### Chromium

就是 Chrome，然而使用上還是有很多問題。

```zsh
sudo pacman -S chromium
```

通常翻牆需要 **SwitchyOmega** 這個工具，需要從 Chrome 應用商店下載，但是因為 Chrome 應用商店已經被牆了，所以必須用另一種方式開啟 Chromium。

Konsole 輸入指令，使用 Proxy 開啟 Chromium 瀏覽器，進行登入 Google 帳戶和安裝 **SwitchyOmega**。

> 先開啟 Proxy，關於 Proxy 請看下一個內容。

```zsh
chromium --proxy-server="socks5://127.0.0.1:1080"
```
### Firefox

強推。記得從應用商店安裝 **SwitchyOmega**。

```zsh
sudo pacman -S firefox-nightly # 最新版
sudo pacman -S firefox # 穩定版
```

## Proxy

在牆國，為了進行科學上網，建議各位還是租個翻牆比較好。這裡我就不貼出使用細節，畢竟涉及個人隱私。當然如果你喜歡 Baidu 也不是不行，但你要知道你使用 Baidu 是做不出任何科研成果的，Github 的訪問如果不開 Proxy 就是限速卡死。

### Shadowsocks

以下是 GUI 版的客戶端。缺點是無法使用訂閱。

```zsh
sudo pacman -S shadowsocks-qt5
```

<!-- ![06.png](https://i.loli.net/2020/01/05/eCtDYJG9ZdFvxpK.png "Shadowsocks") -->
![06.png](https://imgpoi.com/i/KLSGH2.png "Shadowsocks")

### ShadowsocksR

簡稱 SSR，由於很久沒更新了，容易被牆識別，雖然使用方便，但不建議使用。以下是 GUI 版的客戶端。

```zsh
sudo pacman -S electron-ssr
```

<!-- ![07.png](https://i.loli.net/2020/01/05/Tx1zRJyLhw2Os89.png "ShadowsocksR") -->
![07.png](https://imgpoi.com/i/KLSBVD.png "ShadowsocksR")

### V2ray

算是蠻新的代理器，速度穩定快速，但是很燒流量，你翻牆的流量會被乘 2.5 倍。

```zsh
sudo pacman -S v2ray # 下載安裝 v2ray
v2ray -version # 查看版本
v2ray --config=config.json # 啟動 v2ray
# 如果想開機自啟可以這樣做
systemctl enable v2ray # 開機自啟
systemctl start v2ray
```

### Clash

強推，可以自動偵測是否為大陸網域進行是否使用代理，但貌似只能使用訂閱。沒有 GUI。

下載 clash。

> 2020 / 10 / 20 更新：舊版 clash AUR 上的包出現了使用上的問題，改用 clash-premium-bin。使用指令也做了變更，需要指定訂閱文件。

```zsh
sudo pacman -S clash-premium-bin
```

進入 `~/.config/clash` 下載自己的 `config.yml`。如果 `./config` 裡面 `clash` 沒有就自己新增。

> 這裡需要注意的是如果你的 Konsole 是 ZSH，你使用 Wget 需要將 URL 用雙引號包住。Bash 的話應該是沒關係。

```zsh
cd ~/.config/clash
sudo pacman -S wget
wget -O config.yml "xxxxxxxxxxxxxxx"
```

接著修改 `config.yml` 的 `socks-port` 代理端口為 **1080**，用預設端口也可以。

接下來需要新的的文件是 `Country.mmdb`，這份文件已經被牆國牆了，所以需要手動到網上下載。我姑且將該份文件上傳到[百度網盤](https://pan.baidu.com/s/1zFvABeJvcBa_FIfpQT9S7A)，密碼是 **vsor**，希望別被砍掉。如果被砍掉了，我又在 [Github](https://github.com/HuangNO1/Clash_Country.mmdb) 上傳該份文件。

將 `Country.mmdb` 放入 `~/.config/clash`。如果需要看到隱藏的資料夾可以在檔案管理器檢視的地方選擇顯示隱藏檔案或資料夾。。

再來就是執行 `clash` 了。

```zsh
clash -f .config/clash/config.yaml # konsole 執行 clash
```

可以進入 [Clash Dashboard](http://clash.razord.top/#/proxies) 進行切換節點與測延遲等操作。

## neofetch

可以快速察看電腦狀況。好看。

```zsh
sudo pacman -S neofetch
neofetch # 執行 neofetch
```

<!-- ![08.png](https://i.loli.net/2020/01/05/t2KNz16uDdFWQ95.png) -->
<!-- ![13.png](https://i.loli.net/2020/07/29/GtiJMW4CBKnocz3.png "neofetch") -->
![13.png](https://imgpoi.com/i/KLSEAV.png "neofetch")

## 界面美化

關於這部份我就寫自己推薦的部份，畢竟每個人的審美不同，沒必要照我的來。也可以自行探索，細節也不詳細講。可以在設置中玩玩。KDE Plasma 的使用者可以到線上的 [KDE 商店](https://store.kde.org/)看看，Gnome 則可到 [Gnome 商店](https://www.gnome-look.org/)。

### Latte Dock

像 Mac 風的任務管理器。強推，很好看。

```zsh
sudo pacman -S latte-dock
```

下載完在應用管理器開啟就能跑出來了。

### Theme

我偏向 Mac 風，Mac 風真的好看。

將 [McMojave KDE Theme](https://github.com/vinceliuice/McMojave-kde) 從 Github 下載下來，解壓壓縮包後進入資料夾，執行以下指令：

```zsh
./install.sh
```

#### preview

<!-- ![McMojave_dark.png](https://raw.githubusercontent.com/vinceliuice/McMojave-kde/master/plasma/look-and-feel/com.github.vinceliuice.McMojave/contents/previews/fullscreenpreview.jpg "McMojave Dark Theme") -->
![McMojave_dark.png](https://imgpoi.com/i/KLSVXE.jpg "McMojave Dark Theme")

### Icon

下面是我比較喜歡的 Icon 風格，你都可以裝來玩玩看。

```zsh
yay -S numix-circle-icon-theme-git
yay -S papirus-icon-theme-git # 推薦，太好看了
```

### SDDM

> 2020 /  01 / 02 補充

我在這裡推薦使用 [Suger Candy for SDDM](https://store.kde.org/p/1312658)，幸好也有人放上了 AUR。

官方文檔也在設置檔案的參數說明得很清楚，我就不再這多贅述了。**在 `/usr/share/sddm/themes/Sugar-Candy/` 的 `theme.conf` 進行修改。**

```zsh
sudo pacman -S sddm-theme-sugar-candy-git
```

<!-- ![PartialBlur.png](https://framagit.org/MarianArlt/sddm-sugar-candy/-/raw/master/Previews/PartialBlur.png "Sugar Candy SDDM") -->
![PartialBlur.png](https://imgpoi.com/i/KLSDIB.png "Sugar Candy SDDM")


### GRUB THEME

沒錯！GRUB 也可以改成自己想要的，將 [Flat Design themes for Grub2](https://github.com/vinceliuice/grub2-themes) zip 包從 Github 下載下來，解壓後進入資料夾輸入官網說的安裝教學。**細節修改可以進入 `/usr/share/grub/themes/` 裡面自行修改**。

我裝的主題是 **Tela grub theme**，有修改字體大小和字型，編輯 `/usr/share/grub/themes/Tela/theme.txt`：

```zsh
item_font = "Noto Sans Regular 24"
```

<!-- ![grub-theme-tela.jpg](https://raw.githubusercontent.com/vinceliuice/grub2-themes/master/screenshots/grub-theme-tela.jpg "Tela Grub Theme") -->
![grub-theme-tela.jpg](https://imgpoi.com/i/KLS25G.jpg "Tela Grub Theme")

### 窗口特效

在**設置 > 工作空間 > 工作空間行為 > 桌面效果**中可以選擇特效。

我建議將以下選項勾起來，蠻好玩的。

<!-- ![09.png](https://i.loli.net/2020/01/05/vkrlGz64qosuAbI.png "桌面特效") -->
![09.png](https://imgpoi.com/i/KLSCC9.png "桌面特效")

<!-- ![10.png](https://i.loli.net/2020/01/05/JPbxAknmXy6MipF.png "桌面特效 - 最小化視窗") -->
![10.png](https://imgpoi.com/i/KLSQP5.png "桌面特效 - 最小化視窗")

### 窗口的 MAC 按鈕

將視窗搞的像 MAC 按鈕位置。

先隨意在一個視窗標題欄點擊滑鼠右鍵，**更多工作 > 設定視窗管理員**。

<!-- ![11.png](https://i.loli.net/2020/01/05/GpVSyPCNUQ7DK8B.png "視窗管理員") -->
![11.png](https://imgpoi.com/i/KLRZVM.png "視窗管理員")

調整窗口的標題列按鈕。

<!-- ![12.png](https://i.loli.net/2020/01/05/eD3vLyRuBCqMKaE.png "設定視窗") -->
![12.png](https://imgpoi.com/i/KLRYA2.png "設定視窗")

## Reference

* [WPS Office (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/WPS_Office_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [LibreOffice (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/LibreOffice_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [Localization/Simplified Chinese (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Localization/Simplified_Chinese_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)#Libreoffice)
* [netease-cloud-music - AUR](https://aur.archlinux.org/packages/netease-cloud-music/)
* [2019年wine QQ最完美解决方案（多Linux发行版通过测试并稳定运行）](https://www.lulinux.com/archives/1319)
* [Java (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Java_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [Linux 下好用的四款 ss/ssr 客戶端](https://blog.skihome.xyz/posts/cf71037e/)
* [AUR intellij-idea-ultimate-edition 下面的討論區](https://aur.archlinux.org/packages/intellij-idea-ultimate-edition/)