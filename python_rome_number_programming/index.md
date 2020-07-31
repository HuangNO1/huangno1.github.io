# Python 解決羅馬數字轉換 NPSC 模擬試題


## 前言

因為我家人正在學習寫 Python，我教導他去刷題庫，結果在[高中生解題系統](https://zerojudge.tw/)要解某個基礎題庫的題目時卡住了，我只好幫他解一下題目。

## 題目

這是高中生解題系統基礎題庫裡的 [a013 題目](https://zerojudge.tw/ShowProblem?problemid=a013)

### 內容

如果生活在數世紀之前的古羅馬，你應該用過 V 來表示五。V 和 5 這兩個符號都可以用來表示數目五。用來表示數目的符號稱作數字。而羅馬人用來表示數目的符號就是羅馬數字。

以下是七個基本的羅馬數字︰

| 羅馬數字 | 數目 |
| --- | --- |
| I | 1 |
| V | 5 |
| X | 10 |
| L | 50 |
| C | 100 |
| D | 500 |
| M | 1,000 |

所有其他的數目都是由這些數字組合而成。數目都是由左寫到右，通常值是等於組成的羅馬數字加起來。

例如十七可以表示為

```
X + V + I + I = XVII
10 + 5 + 1 + 1 = 17
```

表示羅馬數字可以使用減法來取代加法的規則。例如四可以不用四個一相加來表示 IIII，而採用五減一來表示 IV。利用這類規則，羅馬人能夠減化許多數目的表示方式，例如 IX 取代 VIIII 表示 9，及 CD 取代 CCCC 表示 400。

今日我們並不確定羅馬符號的起源為何。例如符號 V 的起源主要有兩個理論。有些學者認為五最早是用握拳、拇指在外的手勢來表示。最後以象形文字書寫而簡化為 V。

另一個理論認為 X 源自在 10 條線加上交叉線。因此五可以表示為 X 的一半，或是 V。

羅馬數字可以很容易地用來相加或相減，但算起乘除法就相當不順手。這就是為什麼現在羅馬數字並不常用的原因了。
問題

然而，羅馬數字還是經常用於書本章節及頁碼的編號。在這一題工作是讀入兩個正整數，然後輸出兩個數字差的絕對值。所有的數字都必須以羅馬數字來表示。而連續四個相同符號出現時，必須用減法規則來化簡之。

### 問題

然而，羅馬數字還是經常用於書本章節及頁碼的編號。在這一題工作是讀入兩個正整數，然後輸出兩個數字差的絕對值。所有的數字都必須以羅馬數字來表示。而連續四個相同符號出現時，必須用減法規則來化簡之。

### 輸入說明

每個輸入檔中會有一個或以上的測試資料。每一行由兩個數字組成一筆測試資料，且所有數字將會小於4,000。檔案最後會以符號 # 表示結束。

### 輸出說明

每筆測試資料的答案必須輸出到檔案中，並且換行。如果答案為零，則須輸出字串 ZERO。

### 測資資訊

記憶體限制： 512 MB
公開 測資點#0 (100%): 1.0s , <1K

### 範例輸入輸出

**Input**

```
I I
MM II
#
```

**Output**

```
ZERO
MCMXCVIII
```

## 題目理解

首先我們仔細觀察輸出說明，雖然說要輸出到檔案，其實只要用 `print()` 輸出就好，然後根據測資，我們可以確定輸入輸出之間的 Code 是要我們寫**羅馬數字相減後得到之差的絕對值**，考我們**羅馬數字與十進制數字之間的轉換**，難度也沒用到什麼演算法，但是如果不熟悉就會出現邏輯錯誤。這題主要是可慮到細節的注意。

## 程序設計思路

1. 在轉換的過程要**特別處理位數數字是 4 和 9 的位數**，然後十進制轉換成羅馬數字時**每個位數有不同的轉換標準**，所以要另外聲明一個變量紀錄當前處理的位數。
2. 當我們直觀將羅馬數字轉換成我們平常用的十進制數時，我們會從羅馬數字的**尾部開始做計算轉換相加**，所以我們在寫羅馬數字轉換成十進制數時，要先將**羅馬數字字符串反轉（Reverse）**。
3. Python 中 String 沒有 `reverse()` 方法，所以需要使用 `string[::-1]` 的方式轉換。
4. **測資數字不超過 4000**，所以不用考慮千位數上的 4 和 9。
5. 羅馬數字轉成十進制數時為了 4 和 9 需要知道下一個字母是否比自己小，**Python 對 Array 的 Index 會有 `string index out of range` 的問題**，所以在處理前要用 If 判斷是否當前位數是否是字符串最後一個字符。
6. 十進制數轉成羅馬數字時，需要注意一下**如果位數數字是 0 的話就不做處理**。

## Functions

- number_translate_rome(number)：十進制數轉成羅馬數字
- rome_translate_number(rome)：羅馬數字轉成十進制
- subtract(rome_list)：絕對值相減計算
- main：主函式

## 流程

1. 在 Main 函式中輸入一個字符串，並使用 String 中的 `split()` 方法進行分割出兩個羅馬數字，這裡需要使用 While 迴圈，並判斷如果輸入的字符串是 `#` 就中止循環。
2. 兩個羅馬數字轉成 List 類型後傳入 `subtract()` 進行相減。
3. 將兩數字利用 `rome_translate_number()` 都轉成十進制，相減取絕對值，將絕對值傳入 `number_translate_rome()` 轉成數字。
4. 將計算結果傳回 Main 函式並輸出。

## 源碼

> 我這裡都有寫好註解喔 Σ(*ﾟдﾟﾉ)ﾉ

```python
# 題源：
# https://zerojudge.tw/ShowProblem?problemid=a013
# 羅馬數字

# 羅馬數字代表的意思
I = 1
V = 5
X = 10
L = 50
C = 100
D = 500
M = 1000

# 數字轉羅馬
# 注意 4 和 9 要特別處理


def number_translate_rome(number):
    # 如果相減是 0
    if number == 0:
        return "ZERO"

    # 轉換的結果
    rome = ""
    # 紀錄正在處理的位數
    times = 0
    while number > 0:
        # 取最小位
        temp = int(number % 10)
        number = int(number - temp)
        # 當前位數 +1
        times += 1
        # 不同位有不同的處理方法

        # 個位數
        if times == 1:
            if temp != 0:
                # 1 - 4
                if (temp / 5) < 1:
                    # 4
                    if temp == 4:
                        rome = "IV" + rome
                    # 1 - 3
                    else:
                        for i in range(int(temp)):
                            rome = "I" + rome
                # 5 - 9
                else:
                    # 9
                    if temp == 9:
                        rome = "IX" + rome
                    # 5 - 8
                    else:
                        x = "V"
                        for i in range(int(temp % 5)):
                            x += "I"
                        rome = x + rome
        # 十位數
        elif times == 2:
            if temp != 0:
                # 10 - 40
                if (temp / 5) < 1:
                    # 40
                    if temp == 4:
                        rome = "XL" + rome
                    # 10 - 30
                    else:
                        for i in range(int(temp)):
                            rome = "X" + rome
                # 50 - 90
                else:
                    # 90
                    if temp == 9:
                        rome = "XC" + rome
                    # 50 - 80
                    else:
                        x = "L"
                        for i in range(int(temp % 5)):
                            x += "X"
                        rome = x + rome
        # 百位數
        elif times == 3:
            if temp != 0:
                # 100 - 400
                if (temp / 5) < 1:
                    # 400 CD
                    if temp == 4:
                        rome = "CD" + rome
                    # 100 - 300
                    else:
                        for i in range(int(temp)):
                            rome = "C" + rome
                # 500 - 900
                else:
                    # 900 CM
                    if temp == 9:
                        rome = "CM" + rome
                    # 500 - 800
                    else:
                        x = "D"
                        for i in range(int(temp % 5)):
                            x += "C"
                        rome = x + rome
        # 千位數
        elif times == 4:
            if temp != 0:
                # 測資不超過 4000
                for i in range(int(temp)):
                    rome = "M" + rome
        else:
            pass

        number /= 10

    return rome


# 羅馬轉數字
# 考慮到 4 和 9 的減位
# 注意 要先將字符串反轉 羅馬數字要從尾部開始計算
def rome_translate_number(rome):
    # 轉換結果
    number = 0
    # print(rome)
    # 反轉 string
    rome = rome[::-1]
    
    # 用 for 迴圈
    i = 0
    while i < len(rome):
        if rome[i] == "I":
            number += 1
        elif rome[i] == "V":
            # 避免 string index out of range
            if i != len(rome) - 1:
                # 4 IV
                if rome[i + 1] == "I":
                    number += 4
                    # 將 I 也納入這次計算字符，跳過下一個字符的檢測
                    i += 1
                else:
                    number += 5
            else:
                number += 5
        elif rome[i] == "X":
            # 避免 string index out of range
            if i != len(rome) - 1:
                # 9 IX
                if rome[i + 1] == "I":
                    number += 9
                    # 將 I 也納入這次計算字符，跳過下一個字符的檢測
                    i += 1
                else:
                    number += 10
            else:
                number += 10
        elif rome[i] == "L":
            # 避免 string index out of range
            if i != len(rome) - 1:
                # 40 XL
                if rome[i + 1] == "X":
                    number += 40
                    # 將 X 也納入這次計算字符，跳過下一個字符的檢測
                    i += 1
                else:
                    number += 50
            else:
                number += 50
        elif rome[i] == "C":
            # 避免 string index out of range
            if i != len(rome) - 1:
                # 90 XC
                if rome[i + 1] == "X":
                    number += 90
                    # 將 X 也納入這次計算字符，跳過下一個字符的檢測
                    i += 1
                else:
                    number += 100
            else:
                number += 100
        elif rome[i] == "D":
            # 避免 string index out of range
            if i != len(rome) - 1:
                # 400 CD
                if rome[i + 1] == "C":
                    number += 400
                    # 將 C 也納入這次計算字符，跳過下一個字符的檢測
                    i += 1
                else:
                    number += 500
            else:
                number += 500
        elif rome[i] == "M":
            # 避免 string index out of range
            if i != len(rome) - 1:
                # 900 CM
                if rome[i + 1] == "C":
                    number += 900
                    # 將 C 也納入這次計算字符，跳過下一個字符的檢測
                    i += 1
                else:
                    # print(rome[i + 1])
                    number += 1000
            else:
                number += 1000
        else:
            pass

        # 下一個
        i += 1

    # print(number)
    return number


# 相減運算
def subtract(rome_list):
    rome_list[0] = rome_translate_number(rome_list[0])
    rome_list[1] = rome_translate_number(rome_list[1])

    # print("rome_list : %d, %d" % (rome_list[0], rome_list[1]))

    # 數字相減
    num_result = rome_list[0] - \
        rome_list[1] if rome_list[0] > rome_list[1] else rome_list[1] - rome_list[0]

    # print("num_result: %d" % num_result)

    return number_translate_rome(num_result)


if __name__ == '__main__':
    while True:
        rome = input()

        # 結束
        if rome == "#":
            break

        # string 分割
        rome_list = rome.split()
        # print("rome1 %s , rome2 %s" % (rome_list[0], rome_list[1]))
        result = subtract(rome_list)
        # print("end result: %s" % result)
        print("%s" % result)
```

## 運行結果

![1.png](https://imgpoi.com/i/KL4KW2.png "運行結果")

## 結論

其實我在高中剛接觸 Code 時，也寫過這題，當時怎麼寫就是寫不出來，明明測資輸入輸出都是正確的，我那時的邏輯思路沒有現在那麼好，現在因為接觸大量的 Code，所以寫 Code 都會具有強烈邏輯性和很多註解。祝各位也能順利解決這題，沒有你想像中的難。

## Reference

- [高中生解題系統 a013 題目](https://zerojudge.tw/ShowProblem?problemid=a013)

