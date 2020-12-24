# Markdown 學習筆記 - 基礎語法


## 前言

Markdown 我認為是非常好的語言，我每次寫 Blog 或是寫項目、作筆記，Markdown 是首選，LaTeX 比較適合拿來寫報告或是論文。我就在這篇寫一下 Markdown 基礎語法，也就是平常經常用到的語法，其實當初學 Markdown 只花了一小時，後面慢慢寫多就習慣了。

寫 Markdown 的工具：

我推薦下面幾個：

- [Typora](https://typora.io/)：跨平台的 Markdown 編輯器，簡直是利器。
- [Visual Studio Code](https://code.visualstudio.com/)：使用 VScode 也可以寫 Markdown，安裝 **Markdown All in One** 和 **Markdown Preview Enhanced** 延伸模組，就能夠舒服地寫筆記或文章。
- [HackMD](https://hackmd.io)：線上共筆平台，使用 Markdown，大家在共同寫文檔時可以使用這平台

## 文本編寫標準

中文文案排版指北 [[ 简体中文 ](https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.zh-CN.md)][[ 繁体中文 ](https://github.com/sparanoid/chinese-copywriting-guidelines/blob/master/README.md)]

## 區塊元素

### 標題

h1 - h6，h1 有兩種寫法。第一種是下一行添加 `===`，第二種就是加上 `#`。

```md
h1 標題
===

# h1 標題
## h2 標題
### h3 標題
#### h4 標題
##### h5 標題
###### h6 標題
```

### 註解

跟 HTML 一樣的用法使用 `<!--  -->`。

```md
<!-- 我是註解 -->
```

### 引言

Markdown使用email形式的區塊引言，**使用 `>` 的方式添加引言，`> >` 是二級引言**，引言內也可以使用其他 MD 語法。P.S. 二級引言我平時寫文章或筆記都用不到。

```md
> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
> 
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> > id sem consectetuer libero luctus adipiscing.
> ## This is a header.
> 
> 1. This is the first list item.
> 2. This is the second list item.
```

輸出如下：

因為上面的**二級標題會影響我這篇文章的標題**，我這 Blog 是使用 Markdown 寫的，所以就沒有加到輸出效果。

> This is a blockquote with two paragraphs. Lorem ipsum dolor sit amet,
> consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.
> Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.
> 
> Donec sit amet nisl. Aliquam semper ipsum sit amet velit. Suspendisse
> > id sem consectetuer libero luctus adipiscing.
> 
> 1. This is the first list item.
> 2. This is the second list item.

### 清單 List

#### 無序清單

**使用 `*`、`+`、`-` 皆可輸出無序清單**，但是我比較長使用 `-`，因為 `*` 和 `+` 需要按住 `shift` 鍵。清單可以多層，二層清單是在下一行空兩格繼續寫清單。

```md
* Red
* Green
* Blue

+ Red
+ Green
+ Blue

- Red
- Green
- Blue

<!-- 二層清單 -->
* Nulla volutpat aliquam velit
  * Phasellus iaculis neque
  * Purus sodales ultricies
```

輸出如下：

* Red
* Green
* Blue

+ Red
+ Green
+ Blue

- Red
- Green
- Blue

<!-- 二層清單 -->
* Nulla volutpat aliquam velit
  * Phasellus iaculis neque
  * Purus sodales ultricies

#### 有序清單

使用數字接著一個英文句點：

```md
1. Bird
2. McHale
3. Parish
```

輸出如下：

1. Bird
2. McHale
3. Parish

#### 注意

你在清單標記上使用的數字並不會影響輸出的HTML結果。

e.g.

下面的 Code：

```md
1. Bird
1. McHale
1. Parish
3. Bird
1. McHale
8. Parish
```

輸出：

1. Bird
1. McHale
1. Parish
3. Bird
1. McHale
8. Parish

清單項目可以包含多個段落，每個項目下的段落都必須**縮排 4 個空白或是一個 Tab**：

```md
1.  This is a list item with two paragraphs. Lorem ipsum dolor
    sit amet, consectetuer adipiscing elit. Aliquam hendrerit
    mi posuere lectus.

    Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus. Donec sit amet nisl. Aliquam semper ipsum
    sit amet velit.

2.  Suspendisse id sem consectetuer libero luctus adipiscing.
```

當然，項目清單很可能會不小心產生，像是下面這樣的寫法：

```md
1986. What a great season.
```

換句話說，也就是在行首出現**數字－句點－空白**，要避免這樣的狀況，你可以在句點前面加上反斜線。

```md
1986\. What a great season.
```

### 程式碼區塊

縮排 4 個空白或是 1 個 Tab 就可以簡單達到 Code 區塊。

```md
    print('Hello')
```

輸出如下：

    print('Hello')

但是我不建議這樣的寫法，正確的寫法應該如下：

\`\`\`python<br/>
print('Hello')<br/>
\`\`\`<br/>

輸出結果如下：

```python
print('Hello')
```

**使用 ``` 將 Code 區塊包起來**，並在開頭寫明是哪種語言，以方便語法高亮，行內 Code 區塊使用如下：

```md
我是 `行內 Code` 喔！
```

輸出如下：

我是 `行內 Code` 喔！

### 分隔線

你可以**在一行中用三個或以上的星號、減號、底線來建立一個分隔線**，行內不能有其他東西。你也可以在星號中間插入空白。下面每種寫法都可以建立分隔線：

```md
* * *

***

*****

- - -

---------------------------------------
```

輸出如下：

P.S 這輸出效果有點模糊呀 (;3;)

* * *

***

*****

- - -

---------------------------------------

## 區段元素

### 連結

Markdown支援兩種形式的連結語法：行內和參考兩種形式。

不管是哪一種，連結的文字都是用 [方括號] 來標記。

然而這裡**我就只使用行內的形式**，所以只需要會行內就好，但你如果喜歡參考的形式也是可以。

**行內**

```md
你可以使用 [Google](https://www.google.com) 搜索引擎
```

**參考**

```md
你可以使用 [Google][] 搜索引擎

[Google]: http://google.com/
```

### 強調

斜體與粗體，我都使用 `*` 和 `**`，看個人習慣使用哪個符號。

```md
*single asterisks*

_single underscores_

**double asterisks**

__double underscores__
```

輸出如下：

*single asterisks*

_single underscores_

**double asterisks**

__double underscores__

### 圖片

- 一個驚嘆號 `!`。
- 接著一個方括號，裡面放上圖片的替代文字。
- 接著一個普通括號，裡面放上圖片的網址，最後還**可以用引號包住並加上選擇性的'title'文字**。

```md
![Alt text](/path/to/img.jpg)

![Alt text](/path/to/img.jpg "Optional title")
```

## 跳脫字元

Markdown 可以利用**反斜線來插入一些在語法中有其他意義的符號**，例如：如果你想要用星號加在文字旁邊的方式來做出強調效果（但不用 `<em>` 標籤），你可以在星號的前面加上反斜線：

```md
\*literal asterisks\*
```

Markdown支援在下面這些符號前面加上反斜線來幫助插入普通的符號：

```
\   反斜線
`   反引號
*   星號
_   底線
{}  大括號
[]  方括號
()  括號
#   井字號
+   加號
-   減號
.   英文句點
!   驚嘆號
```

## Table

Markdown 的表格需要注意的是他的對齊方式。第二行可以進行對齊。

- `---`：預設靠左
- `:---`：向左靠齊
- `---:`：向右靠齊
- `:---:`：居中對齊

```md
| 列表1 | 列表2 | 列表 3 | 列表4 |
| --- | :--- | ---: | :---: |
| ... | ... | ... | --- |
| ... | ... | ... | --- |
```

輸出結果：

| 列表1 | 列表2 | 列表 3 | 列表4 |
| --- | :--- | ---: | :---: |
| ... | ... | ... | --- |
| ... | ... | ... | --- |

## Reference

- [Markdown 語法說明](https://markdown.tw/)
