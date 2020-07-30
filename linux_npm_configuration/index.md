# Linux 配置 npm

<!--2020/02/06 edited by Huang Po-Hsun-->

## 前言

**npm**（Node Package Manager）是 **node 包管理器**，是 `Node.js` 預設的、以 `JavaScript` 編寫的軟體套件管理系統。相信各位在開發 Vue 或是快應用等方面都會用到 npm，這裡我寫一下關於 npm 在 Linux 上的配置，因為在 Linux 使用 npm，因為在使用 npm 安裝套件時會發生權限不足問題還有下載源速度過慢，我將在這篇文章教大家如何配置 npm。

## 安裝 npm

裝 npm 時，會幫你也裝 `nodeJS`等相關依賴。

```zsh
sudo pacman -S npm
```

## npm 本地化

1. 在家目錄建立資料夾

```zsh
mkdir ~/.npm-global
```

2. 設置 npm 的目標資料夾

```zsh
npm config set prefix '~/.npm-global'
```

3. 加入本地環境變量

如果你有安裝使用 ZSH，**也需要在 `~/.zshrc` 引入環境變量**。

```zsh
vim ~/.profile # 編輯本地環境變量
vim ~/.zshrc
```

添加以下內容，如果沒有 `~/.profile` 就自己新建。

```zsh
export PATH=~/.npm-global/bin:$PATH # 加入的變量
```

4. 重置環境變量

> 輸入以下指令後記得要重新登出登入電腦。

```zsh
source ~/.profile
source ~/.zshrc
```

## 設置國內鏡像

在牆內使用國內鏡像資源會更方便。

1. 淘寶源

```zsh
# 臨時使用
# XXX 為你要安裝的套件代稱
npm --registry https://registry.npm.taobao.org install XXX 
# 永久使用
npm config set registry https://registry.npm.taobao.org
```

2. cnpmjs 源

直接使用 `cnpmjs` 替代 `npm`。

```zsh
# 透過淘寶源安裝 cnpm
npm install -g cnpm --registry=https://registry.npm.taobao.org
```

使用 `cnpm`：

```zsh
cnpm install XXX # XXX 為你要安裝的套件代稱
```

## 結論

蠻簡單的，各位別想太複雜。

## Reference

- [Resolving EACCES permissions errors when installing packages globally - npmjs](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- [npm配置国内镜像资源+淘宝镜像 - CSDN](https://blog.csdn.net/qq_39207948/article/details/79449633)
