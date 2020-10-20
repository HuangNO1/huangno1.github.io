# Archlinux 安裝 Part 2 - 安裝後工作

<!--2020/01/04 edited by Huang Po-Hsun-->

## 前言

我們已經在 Part 1 將基本的系統裝好了，接下來是安裝完的後續步驟。

## 確認連網

我們在上次的安裝教學 Part 1 已經在尾部補充將 networkmanager 裝上了，所以你不需要像上次教學那麼繁瑣，基本插網線就能連到。

> 註：注意使用 `systemctl` 啟用 **networkmanager** 服務時要注意大小寫，開頭要大寫。

```zsh
systemctl enable NetworkManager # 設定開機自啟
systemctl start NetworkManager # 啟用 Netmanager
ping baidu.com # 確認連網
```

## 添加使用者

在上一期教學我們已經設定了超級使用者，即 Root，但是使用 Root 進行日常操作是不安全的，應創建用戶組進行日常操作，僅在系統管理時使用 Root。

另一方面，我們**無法使用超級使用者進入圖形界面**。

> 註：將以下的所有 `user` 改成自己的使用者名稱。

```zsh
useradd -G wheel user # 新增使用者
passwd user # 設定使用者密碼
chfn user # 添加使用者信息，可暫時不填
mkdir -m 700 /home/user # 創建主目錄
chown user:user /home/user # 修改使用者與使用者群組
```

## sudo 安裝

為了安全，我們可以使用 sudo 進行 root 權限操作，編輯 `/etc/sudoers`。

> 註：這裡不能使用 vim 編輯，會顯示權限不足，是只讀狀態，所以要改用 nano。

```zsh
pacman -S sudo # 安裝 sudo
nano /etc/sudoers # 編輯 /etc/sudoers
```

接著將上一步驟的使用者添加到 sudo。添加  `user ALL = (ALL) ALL` 在 `root` 下面。

> 註：將 `user` 改成上一步驟你新增的使用者名稱。

```vim
root ALL = (ALL) ALL
user ALL = (ALL) ALL # 新增使用者
```

## 添加 ArchLinuxcn 源

> 註：2020/07/29 **關於 GPG 金鑰遇到的問題解決方法，我已經補充到此文末的重要補充**

Archlinuxcn 庫有很多平常實用的工具，但是官方倉庫沒有的東西。

編輯 `/etc/pacman.conf`

```zsh
nano /etc/pacman.conf
```

在文件末添加**清華大學 CN 源**，並**順便將 multilib 註解去除**，因為後續裝一些軟體需要到這個庫。

```vim
# 去掉 multilib 註解
[multilib]
Include = /etc/pacman.d/mirrorlist
# 添加 CN 源
[archlinuxcn]
Server = https://mirrors.ustc.edu.cn/archlinuxcn/$arch
```

archlinuxcn-keyring 套件導入 GPG 金鑰。

```zsh
pacman -Sy archlinuxcn-keyring
```

## 安裝圖形界面

### Xorg

使用 xorg 啟動桌面環境。

```zsh
pacman -S xorg
```

### 圖形界面選擇

我比較推薦 KDE Plasma 或是 Gnome，兩者是最大主流，但因為 KDE 比 Gnome 乾淨，所以我選擇了 KDE Plasma。

#### KDE Plasma

<!-- ![01.png](https://i.loli.net/2020/01/05/GMmSkxldPv4s9tT.png "KDE Plasma") -->
![01.png](https://imgpoi.com/i/KLJF1D.png "KDE Plasma")

有三種選擇的安裝包，我建議是 安裝第二種完整版，因為完整版就像 Google 一整套全家統，一個套件更新，其他依賴套件一起更新。

* 基本包

```zsh
pacman -S plasma
```

* 完整包

```zsh
pacman -S plasma-meta # 推薦
```

* 最簡安裝包（僅有桌面軟體）

```zsh
pacman -S plasma-desktop
```

#### Gnome

<!-- ![02.png](https://i.loli.net/2020/01/05/PjDCeAH1p2yiIkn.png "Gnome") -->
![02.png](https://imgpoi.com/i/KLJJHV.png "Gnome")

Gnome 桌面只要安裝 gnome 包即可，還有一個 gnome-extra 包可以提供額外的常用軟體和幾個遊戲，你可以安裝時選擇你要的軟體，沒必要全選，當然也可以不装這个包。

**私人強烈建議不安裝 gnome-extra 這個包，太多垃圾了，我後面刪得很累**

> 註：在輸入 pacman 下載安裝指令時套件之間的空格不影響其指令執行。

```zsh
pacman -S gnome # 推薦
pacman -S gnome gnome-extra # 不推薦
```

### 啟動器

> 安裝啟動器後先別急進入圖形界面，如果你是雙顯卡會有顯卡衝突。

#### KDE Plasma

使用 SDDM 登入啟動器

```zsh
pacman -S sddm
```

#### Gnome

使用 GDM 登入啟動器

```zsh
pacman -S gdm
```

### 顯卡衝突

相信如果你的筆電是**雙顯卡**，那很有可能遇到雙顯卡衝突，像我的是 **Intel 和 nvidia 衝突**，一般我會建議使用 Intel 內顯去驅動圖形界面。當然因為我的筆記型電腦是聯想 Y7000，所以對於顯卡的處理很麻煩。

#### 一般處理方法

安裝 `optimus-manager`，幫你自動產生 `xorg.conf`。

```zsh
pacman -S optimus-manager # 安裝 optimus-manager
systemctl enable --now optimus-manager
# 二選一
optimus-manager --switch intel # 切換到內顯
optimus-manager --switch nvidia # 切 N 卡
```

如果你需要**重新選擇圖形界面的驅動方式**，也就是選擇以哪個顯卡驅動，**要刪除 `/etc/X11/xorg.conf`**，再重新設定。

```zsh
rm /etc/X11/xorg.conf # 刪除 /etc/X11/xorg.conf
systemctl enable --now optimus-manager
# 二選一
optimus-manager --switch intel # 切換到內顯
optimus-manager --switch nvidia # 切 N 卡
```

重啟電腦後使用啟動器進入圖形界面如果沒有問題就可以啟用自動啟動圖形界面。

1. KDE Plasma

```zsh
systemctl start sddm # 啟用圖形界面
systemctl enable sddm # 開機自啟
```

2. Gnome

```zsh
systemctl start gdm # 啟用圖形界面
systemctl enable gdm # 開機自啟
```

#### 聯想 Y7000 的方法

因為 `optimus-manager` 無法解決**聯想 Y7000 的顯卡衝突**，關於這裡的解決方法我是詢問 Telegram [#archlinux-cn](https://t.me/archlinuxcn_group) 群中的 **@HiyoriCao** 大佬才得以解決。我因為不能使用獨顯進入圖形界面，所以就一直是用一個模式（核顯）。

首先 yay 大佬的包 -- [**arch-prime-git**](https://aur.archlinux.org/packages/arch-prime-git/)

> 註：yay 可以直接從 AUR 倉庫上下載用戶上傳的最新軟件包。
> 
> 註：Arch 使用者軟體倉庫 (AUR) 是由社群推動的使用者軟體庫。它包含了軟體包描述單 (PKGBUILD)，可以用 makepkg 從原始碼編譯軟體包，並透過 Pacman 安裝。 透過 AUR 可以在社群間分享、組織新進軟體包，熱門的軟體包有機會被收錄進 community[broken link: invalid section] 軟體庫。這份文件將解釋如何存取、使用 AUR。 

```zsh
pacman -S yay # 下載安裝 yay
pacman -S base-devel # 下載安裝 base-devel 編譯工具包
yay -S arch-prime-git # 下載 arch-prime-git
```

如果有 Nvidia 卡，要先安裝 `nvidia` 套件，然後重起電腦，讓 arch-prime-git 能偵測到顯卡（Nvidia）。

```zsh
pacman -S nvidia # 安裝 N 卡套件
```

先初始化 arch-prime-git。

> 註：這個指令貌似要在一般使用者中執行，不能是 Root 使用者（超級使用者），如果在 Root 使用者下無法執行 init，就輸入 `exit` 指令登出，重新以一般使用者登入。

```zsh
prime-select init
```

這軟件包提供**三種模式**：

1. 只用核顯

```zsh
prime-select set intel
```

2. 只用獨顯

```zsh
prime-select set nvidia
```

3. 動態切換

> 註：在設置環境變量的時候不能添加到 `./profile`，因為這樣會設成全局變量，失去了動態切換的意義，在 Linux 上很少程序需要用到獨顯，除非是遊戲或是 Tenserflow 使用獨顯訓練。

```zsh
prime-select set prime

# 跑在核顯上
glxinfo | grep vendor

# 跑在獨顯上
export NV_PRIME_RENDER_OFFLOAD=1 # 設置環境變量
GLX_VENDOR_LIBRARY_NAME=nvidia glxinfo | grep vendor
```

接著試著重啟電腦進入圖形界面，如果沒問題就啟用自啟圖形界面。

## 中文字體

進入 Plasma，預設會是英文，我推薦使用 Google 的開源字體 `Noto Sans CJK`，渲染出來的字體很好看。

```zsh
pacman -S noto-fonts-cjk
```

進入 Plasma 後可以在設置中調整字體了，登出再登入就可以看到中文字體。

## 中文輸入法

我這裡選擇 `Fcitx`。這裡我參考了 @cheergo （Chun Yu）寫的文章內容。

> 註：Fcitx (Flexible Input Method Framework) ── 即小企鵝輸入法，它是一個以 GPL 方式發布的輸入法平台，可以通過安裝引擎支持多種輸入法，支持簡入繁出，是在 Linux 操作系統中常用的中文輸入法。它的優點是，短小精悍、跟程序的兼容性比較好。
> 
> 註：Linux KDE 上切換輸入法的快捷建是 `Ctrl` + `Space`。

```zsh
pacman -S fcitx fcitx-im
```

安裝新酷音輸入法。

```zsh
pacman -S fcitx-chewing
```

輸入法設定介面。

```zsh
pacman -S kcm-fcitx # KDE
pacman -S fcitx-configtool # GNOME
```

編輯 `/etc/profile`，開頭加入三行。

```zsh
vim /etc/profile
```

```vim
export XMODIFIERS="@im=fcitx"
export GTK_IM_MODULE="fcitx"
export QT_IM_MODULE="fcitx"
```

## NTFS-3G

為了能掛載病讀取外部磁碟（e.g. HDD、SSD），需要安裝 `ntfs-3g`。

**如果你使用的文件系統是 Btrfs 或是 XFS 就不需要下載這東西。**

```zsh
pacman -S ntfs-3g
```

## Konsole

進入圖形界面後需要安裝 Konsole 以便輸入指令。

```zsh
pacman -S konsole
```

## 重要補充

### 聯想 Y7000 的連網問題

聯想筆電通常在連無線網路上有一個坑 - **Networkmanager 無法啟用無線網卡**，算是...聯想筆電的特色，這裡我感謝 Telegram [#archlinux-cn](https://t.me/archlinuxcn_group) 群中的 **@Asterism** 大佬幫助我解決問題。

許多筆記本電腦都有一個硬體按鈕（或開關）來關閉無線網卡，但是，網卡也可能被內核阻止。 可以由 **Rfkill** 處理。通常來說你需要**禁用 ideapod_laptop**。

先輸入 `rfkill list` 查看關於筆電的硬件開關。

> [關於 Rfkill](https://wiki.archlinux.org/index.php/Network_configuration/Wireless#Rfkill_caveat)

<!-- ![03.png](https://i.loli.net/2020/01/15/WLsrNmj6I41ZGyf.png "硬件狀態")  -->
![03.png](https://imgpoi.com/i/KLJ6VE.png "硬件狀態") 

這張圖片是我已經處理過的狀態，關於 **Wireless LAN** 的軟體與硬體禁止皆為 NO，但如果是還沒處理之前我的 **Soft blocked**（軟卡禁止）為 `no`、**Hard blocked**（硬卡禁止）為 `yes`。

> 註：`modprobe` 是內核模塊，想了解更多可以參考 [Kernel module (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Kernel_module_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))

```zsh
sudo modprobe -r ideapad_laptop # 禁用 ideapod_laptop
sudo tee /etc/modprobe.d/ideapad.conf <<< "blacklist ideapad_laptop" # 永久生效
```

接著再次輸入 `rfkill list` 查看狀態，如果發現 `Wireless LAN` 的 `Soft blocked` 和 `Hard blocked` 都是 `no`就行了，無線網路也能連結了。

### pacman 中 archlinux-cn 無法更新下載

如果你有在更新或下載時，顯示 GPG 失效或錯誤等訊息，可以嘗試用以下方法解決。我也都是靠這方法解決大部份問題。做完以下步驟後用 pacman 同步一下資料庫，然後再試著下載看看。

```zsh
rm -rf /etc/pacman.d/gnupg
pacman-key --init
pacman-key --populate archlinux
pacman-key --populate archlinuxcn
```

## Reference

* [General recommendations (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/General_recommendations_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [Users and groups (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Users_and_groups_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [Arch Linux下载与安装配置 - 天祺圍棋](https://www.tianqiweiqi.com/arch-linux-down-install.html)
* [NVIDIA Optimus (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/NVIDIA_Optimus_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [在Arch Linux上使用aurman、yay、pakku、aurutils来替代Yaourt - ywnz](https://ywnz.com/linuxjc/2677.html)
* [Arch User Repository (正體中文) - ArchWiki](https://wiki.archlinux.org/index.php/Arch_User_Repository_(%E6%AD%A3%E9%AB%94%E4%B8%AD%E6%96%87))
* [Archlinux nvidia-prime like package](https://gitlab.com/NickCao/ArchPrime/blob/master/README.md)
* [arch-prime-git - AUR](https://aur.archlinux.org/packages/arch-prime-git/)
* [Fcitx (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Fcitx_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [NTFS-3G (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/NTFS-3G_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
* [gnome_vs_kde](https://www.slant.co/versus/12539/12540/~gnome_vs_kde)
* [Redirect to:Network configuration/Wireless#Rfkill caveat - ArchWiki](https://wiki.archlinux.org/index.php/Network_configuration/Wireless#Rfkill_caveat)
* [Kernel module (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Kernel_module_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
