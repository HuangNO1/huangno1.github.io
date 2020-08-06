# React 學習筆記


## 前言

因為我前段時間學了 React，我會在這邊文章紀錄我學到的內容。

## 建立一個 Hello World

在終端機輸入下面的指令，會在該目錄下**生成一個名為 my-app 的 React 應用目錄**。

> 註：npx 是 npm 5.2+ 或更高版本附帶的包運行器工具。

**npx**

```zsh
npx create-react-app my-app
```

**npm**

```
npm init react-app my-app
```

**Yarn**

> Yarn 0.25+ 才能使用 `yarn create <starter-kit-package>`

```
yarn create react-app my-app
```

## Project 結構

```bash
my-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── App.css
    ├── App.js
    ├── App.test.js
    ├── index.css
    ├── index.js
    ├── logo.svg
    ├── serviceWorker.js
    └── setupTests.js
```

這部份跟 Vue-cli 蠻相似的，只是在目錄結構上不如 Vue-cli。

| 檔案或文件  | 用途                            |
| ----------- | ------------------------------- |
| node_modules/ | 依賴   |
| package.json | 包管理文件 |
| public/ | 公共資源目錄 |
| src/     | 源碼 |
| src/index.js     | 根頁面 |

我這裡是建議 `src/` 改成跟 Vue-cli 初始化時相同的結構。可以自己定義想要怎麼樣的結構，所以不一定要像我下面寫的一樣。

```bash
my-app
├── README.md
├── node_modules
├── package.json
├── .gitignore
├── public
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
└── src
    ├── components
    │   └── App
    │       ├── App.css
    │       ├── App.js
    │       └── App.test.js
    ├── index.css
    ├── index.js
    ├── router
    │   └── index.js
    ├── store
    │   └── index.js
    ├── static
    │   ├── css
    │   ├── img
    │   │   └── logo.svg
    │   └── js
    ├── serviceWorker.js
    ├── setupTests.js
    └── views
        ├── Home
        │   ├── Home.css
        │   └── Home.js
        └── About
            ├── About.css
            └── About.js
```

## 指令

下面兩個之一的指令可以運行項目。

```bash
npm start
yarn start
```

下面是打包指令

```bash
npm run build
yarn build
```

## JSX

```js
const element = <h1>你好，世界！</h1>;
```

JSX 就是一種可以用 JS 寫 HTML 的語法，最後編譯會轉成 HTML，光是可以用 JS 寫網頁就可以使開發上更加靈活。

## Reference

- [React](https://zh-hant.reactjs.org/)
- [Create React App - Github](https://github.com/facebook/create-react-app)

