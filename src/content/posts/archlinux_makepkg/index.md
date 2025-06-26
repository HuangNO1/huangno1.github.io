---
title: "Arch Linux 打包教學"
published: 2020-01-31T11:27:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-03-04T15:58:26+08:00
draft: false
description: ""
tags: ["ArchLinux", "Linux", "PKGBUILD", "Package", "AUR"]
category: ArchLinux 
image: ./index/compressed/archlinux_makepkg.png
lang: zh-TW
---
<!--2020/01/31 edited by Huang Po-Hsun-->

## 前言

這次之所以會有本次教學，是因為我大二上參加 2019 服創比賽，因為快應用開發 IDE 只有 `*.deb` 的 Ubuntu 版本，我當時將 `*.deb` 轉成 `tar.gz` 適用 Arch 發行版的包失敗，當時我是看[這網站](https://linux.cn/article-9769-1.html)使用 **Debtap** 工具，雖然最後成功轉成 `tar.gz`，但是安裝時卻輸出該包的結構損壞，我也有在網上看到有建議 **dkpg**，然而實際上**寫 PKGBUILD 才是最好的方法**，當時是我朋友將[快應用的官方 IDE](https://aur.archlinux.org/packages/quickapp-ide/) 打包到 AUR 上，最後安裝成功，打包中途他也遇到很多坑，最後他寫了一篇 [Arch Linux 打包教學](https://junyussh.github.io/p/arch-linux-package-quick-start/)，但他這篇卻沒有給出實例，讓大多數第一次打包的人看不懂，就跟看官方文檔一樣。網上詳細優質的打包教學少之又少，這次我藉著一個機會體會到打包的過程，為了紀錄這過程，我寫了這篇教學。

> 本次文章參考了 ArchWiki 的 [Creating packages (简体中文)](https://wiki.archlinux.org/index.php/Creating_packages_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)#%E5%AE%9A%E4%B9%89PKGBUILD%E5%8F%98%E9%87%8F)、[PKGBUILD (简体中文)](https://wiki.archlinux.org/index.php/PKGBUILD_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)) 和[書術方隅](https://junyussh.github.io/p/arch-linux-package-quick-start/)。你可以認為我這篇是這三篇的綜合進化版。

## 簡述

創建 PKGBUILD – 一個包創建描述文件，由 **makepkg** 使用來從原始碼創建**二進位制包**。Arch 套裝軟體標準包含當前規則和提高套裝軟體質量的方法。如果已經有了 PKGBUILD 文件，請參考 [makepkg (簡體中文)](https://wiki.archlinux.org/index.php/Makepkg_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))。 

> 打包前一定要先 Google 一下你要打包的軟體包是不是已經有人上傳到 AUR 了。

## 準備工作

### 必需的軟體包

首先，確定你已安裝必須的工具包。安裝 **base-devel** 應該足夠了；它包含 `make` 和 `makepkg` 其它一些從原始碼編譯時所需要的工具。

創建包的一個很重要的工具是 **makepkg**（由 **pacman** 提供），它主要做以下工作：

- 檢查相關依賴是否安裝。
- 從指定的伺服器下載源文件。
- 解壓源文件。
- 編譯軟體並將它安裝於偽 `root` 環境下。
- 刪除二進位制文件和庫文件的符號連接。
- 生成包的 `meta` 文件。
- 將偽 `root` 環境壓縮成一個包文件。
- 將生成的包文件保存到配置的文件夾中（預設為當前工作目錄）。

```zsh
sudo pacman -S base-devel # 安裝 base-devel
```

### 下載與測試安裝 - 觀察紀錄

下載你想打包的軟體的原始碼壓縮包，解壓，按照作者所說的步驟安裝它。記錄下在編譯和安裝軟體過程中需要的所有命令或步驟。你將要**在 PKGBUILD文件中重複這些命令和步驟**。

大多數軟體作者遵循三步走的安裝慣例：

```zsh
./configure
make
make install
```

> 註：這裡的意思是要你將包下載下來按照作者寫的使用說明試安裝這個包，並紀錄這個包的所有安裝指令與步驟。因為我們後面會在寫 PKGBUILD 裡面用到這些。

## 創建PKGBUILD

當你運行 `makepkg` 時，它會在當前工作目錄尋找一個 `PKGBUILD` 文件。如果找到 `PKGBUILD` 文件，它會下載該軟體的原始碼，根據 `PKGBUILD` 文件中的指令編譯它。`PKGBUILD` 中的指令**必須能完全被 Bash 解釋**。成功完成後，最後的二進位制文件和包的元訊息（即包的版本、依賴）被一起打包在 **pkgname.pkg.tar.xz** 文件包中，這個文件包可以使用 `pacman -U <package file>` 來安裝。

要開始製作一個包，你應該先**創建一個空工作目錄**，進入該目錄，創建一個 **PKGBUILD** 文件。

> 註：假設我是在 `~` 新建工作資料夾名為 `work` 作為工作目錄。

```zsh
cd ~ # 進入家目錄
mkdir work # 新增 work 資料夾
cd work/ # 進入 work 資料夾
touch PKGBUILD # 新增 PKGBUILG
```

## 依樣畫葫蘆

### 模板

你可以複製 `PKGBUILD` 模板（位於 `/usr/share/pacman/`）到工作目錄，或者複製一個類似包的 `PKGBUILD` 也可以。如果你只想在別人的基礎上更改一些選項的話，後一種方法比較方便。 

在 `/usr/share/pacman/` 裡面有三份模板：

<!-- ![1.png](https://imgpoi.com/i/KL8JDD.png "查看 PKGBUILD 模板") -->
![1.png](https://imgpoi.com/i/KLRUCB.png "查看 PKGBUILD 模板")

- `PKGBUILD.proto`: 經典原型。
- `PKGBUILD-split.proto`: 分包原型。
- `PKGBUILD-vcs.proto`: 如果你要打包的軟體原始碼上源來自 Git, SVN, Mercurial 這類版本控制系統(Version control systems, VCS)，請參考這份原型作為基礎。

**我是直接將 `PKGBUILD.proto` 的內容複製然後貼到我的 `~/work/PKGBUILD` 裡面，然後參考別人寫的 PKGBUILD。**

### AUR PKGBUILD 範例

AUR 上有很用使用者上傳的包，可以參考他們寫的 `PKGBUILD`，這樣可以省去很多錯誤的寫法。在頁面的右側通常找一找都能找到。我就在這裡舉一些例子。

<!-- ![02.png](https://i.loli.net/2020/02/01/ftIkMibWPLsXDVx.png "AUR 上的 PKGBUILD 範例") -->
![02.png](https://imgpoi.com/i/KLRPPG.png "AUR 上的 PKGBUILD 範例")

#### Upstream 包源是 .tar.xz

- [kate](https://git.archlinux.org/svntogit/packages.git/tree/trunk/PKGBUILD?h=packages/kate)

#### Upstream 包源是 .deb

- [quickapp-ide](https://aur.archlinux.org/cgit/aur.git/tree/PKGBUILD?h=quickapp-ide)

#### Upstream 源是零散文件

- [code](https://git.archlinux.org/svntogit/community.git/tree/trunk/PKGBUILD?h=packages/code)

#### 需要用 wine 模擬的軟體

- [foobar2000](https://aur.archlinux.org/packages/foobar2000/)

## 編寫 PKGBUILD

下面是我 `usr/share/pacman/PKGBUILD.proto` 的內容。

```zsh
# This is an example PKGBUILD file. Use this as a start to creating your own,
# and remove these comments. For more information, see 'man PKGBUILD'.
# NOTE: Please fill out the license field for your package! If it is unknown,
# then please put 'unknown'.

# Maintainer: Your Name <youremail@domain.com>
pkgname=NAME
pkgver=VERSION
pkgrel=1
epoch=
pkgdesc=""
arch=()
url=""
license=('GPL')
groups=()
depends=()
makedepends=()
checkdepends=()
optdepends=()
provides=()
conflicts=()
replaces=()
backup=()
options=()
install=
changelog=
source=("$pkgname-$pkgver.tar.gz"
        "$pkgname-$pkgver.patch")
noextract=()
md5sums=()
validpgpkeys=()

prepare() {
	cd "$pkgname-$pkgver"
	patch -p1 -i "$srcdir/$pkgname-$pkgver.patch"
}

build() {
	cd "$pkgname-$pkgver"
	./configure --prefix=/usr
	make
}

check() {
	cd "$pkgname-$pkgver"
	make -k check
}

package() {
	cd "$pkgname-$pkgver"
	make DESTDIR="$pkgdir/" install
}
```

### PKGBUILD 通常需要修改的屬性變量

> 註：在修改變量時，如果覺得有些變量不知道怎麼填，像是 `depends`，你不知道這軟體需要哪些依賴，這個時候你需要查看一下他們說明文檔，也或者有些軟體包下載下來後
解壓會有相關說明文檔，像我就直接將我下下來的 `*.deb` 解壓，查看裡面的說明文件。

- `pkgname`：**套件的名稱**，由小寫字母、數字和下面字符組成：`@ . _ + -`，不能以符號作為開頭。軟體名稱應要與來源壓縮檔相符。e.g. 檔名叫做 `kate-19.12.1.tar.xz`，則 `pkgname=kate`。
- `pkgver`：**套件版本**，應與上游作者發行版本一致，可包含字母、數字、日期、下劃線，但不可包含連字符號(`-`)，如果有請替換成下劃線。e.g. `pkgver=2.5`、`pkgver=2_5.5`。
- `pkgrel`：釋出號，一個正整數，當同個套件版本的 PKGBUILD 更新，釋出號增加 1，當套件發佈新版本時，釋出號重置 1。
- `pkgdesc`：**套件的描述**，建議少於 80 字符，建議不要使用套件名稱，除非安裝的套件名稱與該應用程式名稱不同。可以填中文。e.g. `pkgdesc="The Open Source build of Visual Studio Code (vscode) editor"`。
- `arch`：**應用程式支援的架構**，Arch 官方僅支援 `x86_64`。
- `url`：套件的上源**發佈網址**。e.g. `url="https://www.quickapp.cn/docCenter/IDEPublicity"`。
- `license`：該軟體、套件採用的發佈**許可證**，在 `[core]` 的 license 包中有常用的許可證，安裝後可在 `/usr/share/licenses/common` 找到這些許可證協議，如果套件使用的許可證是裡面其中一個，這個值應該被設為許可證的目錄名稱，如果套件使用的許可證沒有在裡面，值設為 `custom`。關於 license 詳細寫部份我在後面會補充說明。
- `depends`：套件執行時所需的**依賴列表**，可以用比較運算符來限制依賴版本，如：`depends=('foobar>=1.8.0')`，不需要列出二次依賴，舉例來說，`gtk2` 依賴 `glibc` 和 `glib2`，而 `glib2` 本來就依賴 `glibc`，`glibc` 就不用加入依賴列表。e.g. `depends=(fontconfig libxtst gtk3 python cairo alsa-lib nss gcc-libs libnotify libxss 'glibc>=2.28-4' lsof which)`。
- `outdepends`：不影響軟體主要功能，提供**額外特性的軟體包**，要簡要說明每個包提供的功能。e.g. 

```zsh
  optdepends=(
  'cups: printing support'
  'sane: scanners support'
  'libgphoto2: digital cameras support'
  'alsa-lib: sound support'
  'giflib: GIF images support'
  'libjpeg: JPEG images support'
  'libpng: PNG images support'
  )
```

- `makedepends`：**編譯時所需的依賴**，可以像 `depends` 指定依賴版本，編譯時會將 `depends` 的軟體包預設作為編譯依賴，使用 `makepkg` 構件時 `base-devel` 視為已安裝，`base-devel` 的成員不應該出現在列表中，可用下面指令檢查一個依賴關係是否已存在 `base-devel` 中。

```zsh
  LC_ALL=C pacman -Si $(pactree -rl ''package'') 2>/dev/null | grep -q "^Groups *:.*base-devel"
```

- `source`：構件軟體的**來源**，通常是 `HTTP` 或 `FTP` 網址，可以調用前面的 `pkgname` 和 `pkgver`，就是需要填這軟體的下載源，其中包含了這軟件包的 `license` 檔案源，e.g.
	+ **quickapp-ide** 的下載源是 `"https://statres.quickapp.cn/quickapp/ide/quickapp-ide-1.5.0.deb"`
	+ `license` 檔案在 `https://statres.quickapp.cn/quickapp/quickapp/201809/file/201809171830002525474.docx`

所以我們應該在 `source` 填上：

```zsh
source=(
  "https://statres.quickapp.cn/quickapp/ide/${pkgname}-${pkgver}.deb"
  "https://statres.quickapp.cn/quickapp/quickapp/201809/file/201809171830002525474.docx"
)
```

- `md5sums`/`sha1sums`/`sha256sums`：`source` 所列**檔案校驗和**，不需要自己填寫，用 `updpkgsums` 產生，或是用 `makepkg -g >> PKGBUILD` 產生。這階段還不需要輸入該指令。

### PKGBUILD 變數

`makepkg` 定義了兩個變數，**在寫構建、安裝過程指令中會用到**，在 `packge()` 函數中用的多。

#### srcdir

`makepkg` 會將來源檔案**解壓縮到這個目錄**，或著在此目錄產生指向 PKGBUILD 中 `source` 陣列中的軟連結。

#### pkgdir

`makepkg` 會把此目錄當作**系統根目錄**，將軟體安裝在此目錄下。


### PKGBUILD 通常需要修改的函數

當構建一個軟體包，如果 PKGBUILD 有定義下面五個函數，`makepkg` 將會觸發它們，而 `package()` 是必須被定義的，其他沒定義的函數在構建時將會跳過。

#### prepare()

用來**執行構建來源的指令**，此函數執行在 `build()` 之前，軟體包解壓之後，可以用 `makepkg --noextract` 跳過此函數執行。通常是建立資料夾和解壓下載下來的軟體包。

#### pkgver()

構件 VSC 軟體包時，軟體的版本可能每隔幾小時就更新，這時用 `pkgver()`。

#### build()

這個函數使用通用 Bash 指令**編譯軟體並建立軟體安裝目錄**，在 `build()` 的第一步就是**進入解壓縮原始碼後的目錄**。`makepkg` 會在執行 `build()` 前進入 `$srcdir`，大多情況第一條指令是：

```zsh
cd "$srcdir/$pkgname-$pkgver"
```

接下來編寫編譯要用到的指令，`build()` 會在 `fakeroot` 環境下執行，如果你要打包的軟體使用到了配置指令碼 (configure script)，使用參數 `--prefix=/usr` 是個好習慣，很多軟體在手動編譯安裝的時候會安裝到 `/usr/local`，但所有的 Arch 包應該安裝到 `/usr` 目錄。

```zsh
./configure --prefix=/usr
make
```

#### check()

用來執行 `make check` 或其他例行測試的地方，建議用 `check()` 去**檢查軟體是否正確編譯且能正常執行**。

若使用者不需要這步可以在 `PKGBUILD/makepkg.conf` 加入 `BUILDENV+=('!check')` 禁用，或是在執行 `makepkg` 加上參數 `--nocheck`。

#### package()

最後一步就是把編譯好的檔案放到一個目錄讓 `makepkg` 可以**檢索並打包**，這個目錄通常是 `pkg`，一個 `fakeroot` 環境，`pkg` 目錄複製了軟體安裝根目錄的階層關係，如果你手動放置了一個檔案到根目錄，那你也要把檔案放在 `pkg` 中相同的層級結構中，假設你想要把檔案安裝到 `/usr/bin`，在 `fakeroot` 環境中對應的路徑應該是 `$pkgdir/usr/bin`，極少情況會需要使用者手動去安裝檔案，一般情況使用 `make install` 即可將軟體安裝到正確的路徑，最後一行通常這樣寫：

```zsh
make DESTDIR="$pkgdir/" install
```

`makepkg --repackage` 只執行 `package()`，不執行 `build()`，如果僅修改包的依賴可以用這個指令重新打包以節省時間。

### 補充

#### deb 包

關於 `*.deb` 寫 PKGBUILD 時不需要寫 `check()` 和 `build()`，因為 `*.deb` 本身就是二進制包，所以不需要再編譯成二進制包。

#### license

關於 **license** 我獨立出來補充說明，通常關於該軟體的 license 可以在該 Upstream（包源）找的到，或是下載下來的軟體包說明文件裡有，**如果作者沒有寫 license 就不能隨意上傳 AUR**，然後如果你要上傳的軟體包的 **license** 屬性在 `/usr/share/licenses/common` 可以找到，則將其值設為該值，e.g. 我有一個準備要上傳的包裡面的作者說明的 license 填的是 `GPL`，我就只要在那欄填寫 `GPL`，有多個 license 就填多個，像是 `license=('GPT' 'LGPL' 'FDL')`，然後 **不需要將該 license 下載下來，也就是填寫 `source` 的時候不需要將 license 源填上去**，再次強調不需要下載下來，除非 `/usr/share/licenses/common` 找不到跟該軟體包相符的 license 時候才需要在 `source` 填寫 license 檔案源，並在後面將 license 下載下來，接著 license 那欄寫 `custom`。

```zsh
# 通用許可證
$ ls /usr/share/licenses/common
AGPL    APACHE       CCPL  EPL     FDL1.3  GPL3     LGPL3  MPL2          PSF        W3C
AGPL3   Artistic2.0  CDDL  FDL     GPL     LGPL     LPPL   PerlArtistic  RUBY       ZPL
Apache  Boost        CPL   FDL1.2  GPL2    LGPL2.1  MPL    PHP           Unlicense
```

如果你的 license 需要下載下來，則授權要安裝到 `/usr/share/licenses/pkgname/`，把下面指令寫入 PKGBUILD 的 `package()`：

```zsh
install -Dm 644 LICENSE "$pkgdir/usr/share/licenses/$pkgname/LICENSE"
```

e.g. quickapp-ide 寫的 [PKGBUILD](https://aur.archlinux.org/cgit/aur.git/tree/PKGBUILD?h=quickapp-ide)：

```zsh
package() {
  install -Dm 644 201809171830002525474.docx "$pkgdir/usr/share/licenses/$pkgname/LICENSE.docx"
  cd "$pkgname-$pkgver"
  # install -d opt/quickAppIDE
  # cp  opt/quickAppIDE ${pkgdir}
  # make DESTDIR="$pkgdir/" install
  cp -r ./ ${pkgdir}/
}
```

## md5sums

當我們在 `~/work/PKGBUILD` 寫完我們的 PKGBUILD 後，接下來就是**更新校驗的值**，這時我們又要回到上面看一下 PKGBUILD 有一個參數是 `md5sums`/`sha1sums`/`sha256sums`，這裡就是我們要填上他的時候，在 Konsole 進入 `/work` 目錄下輸入以下指令：

```zsh
makepkg -g >> PKGBUILD
```

接下來你就可以在你寫的 PKGBUILD 文件裡看到文件末以填上 `md5sums` 屬性的內容。

## 構建軟體包

各位最艱辛的寫 PKGBUILD 已經結束了，接下來就是我們的打包時刻了。

### 用 zstd 來取代 xz 算法

系統預設使用的壓縮演算法是 **xz**，速度比較慢，推薦使用 **zstd 算法**，雖然 xz 打包出來的檔案相對小一點，但是**壓縮時間和解壓縮時間都比 zstd 長很多**，官方目前也建議用 zstd 來發佈，如果只是自己電腦安裝的話可以選擇不壓縮直接安裝。

編輯 `/etc/makepkg.conf`，找到最下面的 `PKGEXT` 修改裡面的值。

- 不壓縮

```zsh
PKGEXT='.pkg.tar'
```

- zstd 算法

```zsh
PKGEXT='.pkg.tar.zst'
```

### 構建

第一次構建先直接執行 `makepkg -s`，如果報錯後修改 PKGBUILD，下一次再構建的時候傳入參數 `--repackage` 直接執行打包函數，這樣可以節省一些時間。

> 註：這裡蠻坑的，如果出一個錯造成構建失敗，就要重新來過，要將因構建過程產生的資料夾或文件全砍掉。

```zsh
makepkg --repackage
```

構建完成後如果你是用 **zstd 算法** 你就可以在 `/work` 產生一個包名為`$pkgname-$pkgver.pkg.tar.zst`。

### 測試 PKGBUILD 與上傳至 AUR

關於這部份我就支持一下我參考的[作者的文章](https://junyussh.github.io/p/arch-linux-package-quick-start/#%E6%B8%AC%E8%A9%A6-pkgbuild)，接下來的教學部份請看他後續寫的篇章。我這篇算是補足他前面不完美的部份。

## Reference

- [将 DEB 软件包转换成 Arch Linux 软件包 - Linux 中國](https://linux.cn/article-9769-1.html)
- [Creating packages (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/Creating_packages_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)#%E5%AE%9A%E4%B9%89PKGBUILD%E5%8F%98%E9%87%8F)
- [PKGBUILD (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/PKGBUILD_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
- [Arch Linux 第一次打包就上手 - 書術方隅](https://junyussh.github.io/p/arch-linux-package-quick-start/)
- [makepkg (簡體中文) - ArchWiki](https://wiki.archlinux.org/index.php/Makepkg_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))