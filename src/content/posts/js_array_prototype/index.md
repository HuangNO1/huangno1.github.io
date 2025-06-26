---
title: "JS - forEach()、map()、filter()、reduce()、循環遍歷"
published: 2020-08-06T18:49:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-08-06T18:49:26+08:00
draft: false
description: ""
license: ""
tags: ["JS", "前端", "forEach", "map", "filter", "reduce", "循環遍歷", "Array"]
category: Front-end 
image: "./index/compressed/js_array_prototype.png"
lang: zh-TW
---

## 前言

在這篇文章筆記紀錄一下 JS 的 Array 屬性。

## forEach()

**`forEach` 是對每一項的操作，會影響原來的 array**，不會有回傳值，即使強制寫 `return`，也會是空值，例子如下。

```js
// JS forEach 與 map

// forEach 是對每一項的操作，會影響原來的 array
let arr = [1, 2, 3, 4, 5, 6]
// 對數組直接進行循環，相當於 for，沒有返回值
// result 不會有返回值 即使寫了 return 也是 undefined
let result = arr.forEach((item, index, arr) => {
  console.log(item)
  console.log(index)
  console.log(arr)
  return item
})

console.log(result)
```

## map()

**`map` 則是不會影響原來的 array 值，而是生成新的值返回給新的數組**。對 Array 每一項進行加工，加工完成之後返回一個新的數組。

```js
// map 對數組每一項進行加工，加工完成之後返回一個新的數組
arr.map((item, index, arr) => {
  let str = index + item + index
  return str;
})

console.log(arr)
```

## filter()

顧名思義，過濾，**`filter` 將想要的內容進行篩選**，不想要的過濾，最終得到想要的內容。

```js
// filter 過濾，將想要的內容進行篩選，不想要的過濾，最終得到想要的內容

let result2 = arr.filter((item, index) => {
  // 通過返回 true 或是 false 進行選擇
  // true 是要，false 是不要
  if (item % 2 === 0) {
    return true
  } else {
    return false
  }
})

console.log(result2)
```

## reduce()

reduce 是對整個 Array 進行整合，

```js
// reduce 是對整個數組進行整合
// 比如你要做一個將術組裡所有的數字進行相加
// 將數組每一項內容整合後，返回一個內容

let arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9]

let arr4 = arr2.reduce((pre, next, index) => {
  console.log(pre)
  console.log(next)
  console.log(index)
  return pre + next
}, 0)
// 這裡尾部的 0 是初始值，因為弟一個參數 沒有 pre

console.log(arr4)
```

使用箭頭函數進行整合。

```js
const array1 = [1, 2, 3, 4];
const reducer = (accumulator, currentValue) => accumulator + currentValue;

// 1 + 2 + 3 + 4
console.log(array1.reduce(reducer));
// expected output: 10

// 5 + 1 + 2 + 3 + 4
console.log(array1.reduce(reducer, 5));
// expected output: 15
```

## For 循環

- **for...in...主要用於遍歷對象（Object）**，不適用遍歷數組。
- **for...of...可以用來遍歷 Array**，類數組對象，字符串，set/map, generator。

```js
// for...in...主要用於遍歷對象，不適用遍歷數組
// for...of...可以用來遍歷數組，類數組對象，字符串，set/map, generator

// for(key of obj) 裡面的是每一項

let obj = {
  name: "Huang",
  type: "handsome",
  content: "front end"
}

for(key in obj) {
  console.log("key: " + key + ", value: " + obj[key])
}

// 循環每一項
for (let item of arr2) {
  console.log(item)
}
```

## Reference

- [Array.prototype.reduce() - MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)