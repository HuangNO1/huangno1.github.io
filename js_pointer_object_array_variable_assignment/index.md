# JS - Object Array 賦值問題


## 關於我遇到的問題

這是我在寫小 DEMO 發現的，關於 JS 的賦值問題，這裡涉及到了 Pointer。

下面是我用簡單的 Code 描述我遇到的問題，`object` 是一個 Object Array，然後傳入函數進行局域變量賦值。

```js
let object = [
    {
        name: "John",
        age: 18
    },
    {
        name: "Amy",
        age: 20
    },
]

function Test(object) {
    let newOne = object;
    for (let i = 0; i < newOne.length; i++) {
        newOne[i].name = "Rose";
    }
}

Test(object)
console.log(object)
```

結果輸出如下：

```js
// object
[
    {
        name: "Rose",
        age: 18
    },
    {
        name: "Rose",
        age: 20
    },
]
```

從這個輸出結果來看，我們可以判定，這個函式**修改 `newOne` 這個局部變量時，也修改到了 `object`**。

我網上爬了文，大致知道這是 JS 的一個像是語法 Bug 的問題，**賦值給 `newOne` 時其實是給了指針位置，所以導致修改 `newOne` 時也修改到了 `object`**。

所以要改寫成下面的寫法：

利用聲明一個臨時局部變量然後賦值，再 Push 進 Array。

```js
let object = [
    {
        name: "John",
        age: 18
    },
    {
        name: "Amy",
        age: 20
    },
]

function Test(object) {
    let newOne = [];
    for (let i = 0; i < object.length; i++) {
        let temp = {
            name: "Rose",
            age: object[i].age
        }
        newOne.push(temp);
    }
}

Test(object)
console.log(object)
```

輸出結果：

```js
// object
[
    {
        name: "John",
        age: 18
    },
    {
        name: "Amy",
        age: 20
    },
]
```
