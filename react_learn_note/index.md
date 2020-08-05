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
    └── serviceWorker.js
    └── setupTests.js
```



## Reference

- [React](https://zh-hant.reactjs.org/)
- [Create React App - Github](https://github.com/facebook/create-react-app)

