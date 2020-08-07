# 在 ArchLinux 上搭建 LaTeX 環境並使用 VScode 編寫


## 前言

紀錄一下我在 ArchLinux 上配置 LaTeX 的過程。

## 安裝環境

你可以直接安裝集合包，[texlive-most](https://www.archlinux.org/groups/x86_64/texlive-most/) 包含很多 Tex Live 應用，但是這樣很佔空間，要安裝 2GB 的硬碟空間，所以你也可以選擇自己想要裝的部份，其中 [texlive-core](https://www.archlinux.org/packages/extra/any/texlive-core/) 是必裝的。**[texlive-langchinese](https://www.archlinux.org/packages/extra/any/texlive-langchinese/)** 是中文宏包 CTeX，讓 LaTeX 支持中文。

```zsh
sudo pacman -S texlive-most # 安裝約 12 個包

sudo pacman -S texlive-core # 只裝核心

sudo pacman -S texlive-langchinese # 安裝中文支持
```

## 測試安裝

進入特定資料夾，輸入下面兩行指令測試是否安裝成功，

- `tex '\empty Hello world!\bye'` 會生成 `texput.dvi` 和 `texput.log`。
- `pdftex '\empty Hello world!\bye'` 會生成 `texput.pdf`。

```bash
tex '\empty Hello world!\bye'
pdftex '\empty Hello world!\bye'
```

## VScode 配置

先安裝好 [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) 這擴充套件。

![latex_workshop.png](https://imgpoi.com/i/KL09OV.png "LaTeX Workshop")

**設定**

接著按下 `ctrl` + `,` 進入 VScode 的使用者設置，並點擊右上角的設定文件（JSON），添加下面的設定：

下面設定需要修改的地方是要找到 `xelatex`、`pdflatex`、`bibtex` 裝在哪裡，並替換下面 `latex-workshop.latex.tools` 中每一項的 `command`，輸入以下指令可以找到位置：

```zsh
where xelatex
# 輸出 /usr/bin/xelatex
# 依此類推
```

> 跟在 Windows 上的設定差在 `command`，改成相對應的路徑。

設定 JSON：

```js
{
    // ...
    "latex-workshop.latex.recipes": [
        {
            "name": "xelatex",
            "tools": [
                "xelatex"
            ]
        },
        {
            "name": "pdflatex",
            "tools": [
                "pdflatex"
            ]
        },
        {
            "name": "xelatex->bibtex->xelatex*2",
            "tools": [
                "xelatex",
                "bibtex",
                "xelatex",
                "xelatex"
            ]
        },
        {
            "name": "pdflatex->bibtex->pdflatex*2",
            "tools": [
                "pdflatex",
                "bibtex",
                "pdflatex",
                "pdflatex"
            ]
        }
    ],
    "latex-workshop.latex.tools": [
        {
            "name": "xelatex",
            "command": "/usr/bin/xelatex",
            "args": [
                "-synctex=1",
                "-interaction=nonstopmode",
                "-shell-escape",
                "%DOC%.tex"
            ]
        },
        {
            "name": "pdflatex",
            "command": "/usr/bin/pdflatex",
            "args": [
              "-synctex=1",
              "-interaction=nonstopmode",
              "-file-line-error",
              "%DOC%"
            ]
        },
        {
            "name": "bibtex",
            "command": "/usr/bin/bibtex",
            "args": [
                "%DOCFILE%"
            ]
        }
    ],
}

```

> 這邊主要使用兩個指令：`xelatex` 及 `bibtex`，平常都是使用 `xelatex` 來編譯，只有寫某些文章需要編譯 `reference` 時才會用到 `bibtex`。

> 為了方便何時該用哪種，上述 config 的 recipes 便派上用場，可以看到日常使用的部分我給此 recipe 取名 ”hw”，如果要編論文而需要 reference ，則會採用 ”thesis”，它會依序執行`xelatex` → `bibtex` → `xelatex` → `xelatex`，這是 LaTeX 中為了正確編出 `reference` 的用法。

## Hello World

下面是一個我擷取我之前寫的報告作為簡單例子，有我經常用的設定。

```latex
\documentclass[12pt, a4paper]{report}
\usepackage{ctex} % 中文的宏包
\usepackage{indentfirst}
\usepackage{graphicx} % 插入圖片的宏包
\usepackage{float} % 設置圖片浮動位置的宏包
\usepackage{subfigure} % 插入多圖時用子圖顯示宏包
\usepackage{listings} % 代碼塊宏包
\usepackage{color} % 代碼高亮
\usepackage[colorlinks,linkcolor=blue]{hyperref} % URL 包
\usepackage[pdf]{graphviz}
\usepackage{alphalph}
\renewcommand*{\thesubfigure}{(\arabic{subfigure})}

\definecolor{dkgreen}{rgb}{0,0.6,0}
\definecolor{gray}{rgb}{0.5,0.5,0.5}
\definecolor{mauve}{rgb}{0.58,0,0.82}

\lstset{ %
    %language=Octave,                % the language of the code
    basicstyle=\scriptsize\Hack,           % the size of the fonts that are used for the code
    numbers=none,                   % where to put the line-numbers
    numberstyle=\tiny\color{gray},  % the style that is used for the line-numbers
    stepnumber=2,                   % the step between two line-numbers. If it's 1, each line 
                                    % will be numbered
    numbersep=3pt,                  % how far the line-numbers are from the code
    backgroundcolor=\color{white},      % choose the background color. You must add \usepackage{color}
    showspaces=false,               % show spaces adding particular underscores
    showstringspaces=false,         % underline spaces within strings
    showtabs=false,                 % show tabs within strings adding particular underscores
    frame=single,                   % adds a frame around the code
    rulecolor=\color{black},        % if not set, the frame-color may be changed on line-breaks within not-black text (e.g. commens (green here))
    tabsize=2,                      % sets default tabsize to 2 spaces
    captionpos=b,                   % sets the caption-position to bottom
    breaklines=true,                % sets automatic line breaking
    breakatwhitespace=false,        % sets if automatic breaks should only happen at whitespace
    title=\lstname,                   % show the filename of files included with \lstinputlisting;
                                    % also try caption instead of title
    keywordstyle=\color{blue},          % keyword style
    commentstyle=\color{dkgreen},       % comment style
    stringstyle=\color{mauve},         % string literal style
    escapeinside={\%*}{*},            % if you want to add LaTeX within your code
    morekeywords={*,...}               % if you want to add more keywords to the set
}
\setCJKmainfont{Noto Serif CJK TC} % 主要字體 Noto Serif
\newfontfamily\Hack{Hack} % 代碼字體
\author{Huang Po-Hsun}
\date{\today}
\title{數據庫系統 SSD7 實驗報告}
\begin{document}

\maketitle

\tableofcontents

\part{實驗一、數據庫與表的基本操作}

\section{實驗目的}

\begin{itemize}
    \item 熟练掌握一种DBMS的使用方法，完成数据库的创建、删除和连接；数据表的建立、删除；表结构的修改。
    \item 加深对表的实体完整性、参照完整性和用户自定义完整性的理解。
\end{itemize}

\end{document}
```

## 畫面

這是實際寫 LaTeX 的畫面。

![KL0G2E.png](https://imgpoi.com/i/KL0G2E.png)

## Reference

- [TeX Live (简体中文) - ArchWiki](https://wiki.archlinux.org/index.php/TeX_Live_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
- [LaTeX Workshop – 在VSCode中編輯及編譯LaTeX](https://shaynechen.gitlab.io/vscode-latex/)
