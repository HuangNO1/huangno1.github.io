# Archlinux 安裝 Part 4 - 程序員終端標配 oh-my-zsh

<!--2020/01/05 edited by Huang Po-Hsun-->

## 前言

我想我在 Linux 上用最多也最重要的就是終端機 Konsole 了，我們默認的是 **Bash**，然而 `bash` 過於單調，也沒有自動補全，這時我們就需要開源項目 `oh-my-zsh`，在這篇教學我會寫一下，我配置 `oh-my-zsh` 的過程。

## 我的 Konsole

![02.png](https://i.loli.net/2020/01/05/UI42pkdY5OiEoyn.png "我的終端機")

## Konsole 透明度設置

在標題欄點擊滑鼠右鍵。

![01.png](https://i.loli.net/2020/01/05/Yz5RVo4tu1UHFTC.png "設定透明度")

在**外觀與修復**中，可以調整透明度。我調成不透明度 80%。

## 安裝 zsh

```zsh
sudo pacman -S zsh
```

## 查看系統當前使用的 Shell

```zsh
echo $SHELL # 查看指令
```
```zsh
/bin/bash # 輸出結果
```

## 看系統是否裝了 zsh

```zsh
cat /etc/shells # 輸入指令
```
```zsh
# Pathnames of valid login shells.
# See shells(5) for details.

/bin/sh
/bin/bash
/usr/bin/git-shell
/bin/zsh
/usr/bin/zsh
```

## 切換 Shell 為 zsh

> 註：不需要加 `sudo`。

```zsh
chsh -s /bin/zsh # 切換指令
```

```zsh
# 輸出結果
Changing shell for root.
Shell changed.
```

將所有終端機都關掉，或是登入登出一次，再次查看當前的 Shell 應該就是 `zsh` 了。

## 安裝 oh-my-zsh

這裡或許看 [github 官網](https://github.com/ohmyzsh/ohmyzsh)會比較好。三種安裝方式，通常第一種就可以了。

### curl

```zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### wget

```zsh
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### Manual inspection

It's a good idea to inspect the install script from projects you don't yet know. You can do that by downloading the install script first, looking through it so everything looks normal, then running it:

```zsh
curl -Lo install.sh https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh
sh install.sh
```

## 配置主題

我在這裡推薦的是 **`ys`** 主題。

編輯 `~/.zshrc`。

```zsh
vim ~/.zshrc
```

將 `ZSH_THEME` 改成 `ys`。

```vim
ZSH_THEME="ys"
```

## 推薦插件

插件依然需要編輯 `~/.zshrc` ，找到 `plugins=`，然後在裡面寫需要的插件名，有些插件可能還需要安裝。

> 注意：只要改了此文件，重啟終端后有效或使用 `source ~/.zshrc` 更新配置。

### extract

用來解壓縮文件，用起來很爽，根本不需要去記憶各種解壓縮指令，一套 `x filmname` 直接幫你解壓好。

當然，如果你想要用 `tar` 命令，可以使用 `tar -` 加 `tab` 鍵，zsh 會列出參數的含義。

這插件預設安裝就有，不需要額外安裝。

```vim
plugins=(其他的插件 extract)
```

### zsh-autosuggestion

自動補全。可記錄之前輸過的指令。

```zsh
git clone git://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```

```vim
plugins=(其他的插件 zsh-autosuggestion)
```

### zsh-syntax-highlighting

終端字體高亮。

```zsh
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

```vim
plugins=(其他的插件 zsh-syntax-highlighting)
```

### git-open

**git-open** 插件可以在你 Git 項目下**打開遠程倉庫瀏覽項目**。

```zsh
git clone https://github.com/paulirish/git-open.git $ZSH_CUSTOM/plugins/git-open
```

```vim
plugins=(其他的插件 extract)
```

### bat

**bat** 代替 **cat**。
`cat` 某個文件，可以在終端直接輸出文件內容，`bat` 相比 `cat` 增加了行號和顏色高亮。

> P.S. 我好像不怎麼用這個。所以沒裝。
> 2020/07/29 更新：bat 實在是太好看了，大推。

```zsh
sudo pacman -S bat
```

### incr

可以說 `incr.zsh` 這插件是最強的自動補全插件，還能幫你搜索線上的倉庫是否有你所需要的軟體包。建議搭配 `zsh-autosuggestion` 一起使用，我將這兩個插件都裝了。

到[這個網站](http://mimosa-pudica.net/src/incr-0.2.zsh)下載 `incr.zsh` 文件，將此文件放置 `~/.oh-my-zsh/custom/plugins/incr` 資料夾裡，如果沒有資料夾就自己新增。

在 `~/.zshrc` 文末添加一行。

```vim
source ~/.oh-my-zsh/custom/plugins/incr/incr*.zsh
```

## 插件配置

```zsh
vim ~/.zshrc
source ~/.zshrc
```

以下是我的 `~/.zshrc` 設定。

```vim
# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="/home/rem/.oh-my-zsh"

# npm
export PATH=$PATH:~/.npm-global/bin

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="ys"

# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in ~/.oh-my-zsh/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to automatically update without prompting.
 DISABLE_UPDATE_PROMPT="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS=true

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
	git
	extract
	archlinux
    vscode
    z
	colored-man-pages
	zsh-syntax-highlighting
    zsh-autosuggestions
	git-open
)

source $ZSH/oh-my-zsh.sh
source /etc/profile

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"
source ~/.oh-my-zsh/plugins/incr/incr*.zsh
```

## Reference

* [oh-my-zsh,让你的终端从未这么爽过](https://www.jianshu.com/p/d194d29e488c)
* [oh-my-zsh让终端好用到飞起~](https://juejin.im/post/5d773da76fb9a06aff5e9a99)
* [ohmyzsh - github](https://github.com/ohmyzsh/ohmyzsh)
* [zsh+on-my-zsh配置教程指南（程序员必备）【已备份】](https://segmentfault.com/a/1190000013612471)
