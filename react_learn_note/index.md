# React 學習筆記 - JSX、組件、渲染、路由、Redux


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

### 語法

JSX 就是一種可以用 JS 寫 HTML 的語法，最後編譯會轉成 HTML，光是可以用 JS 寫網頁就可以使開發上更加靈活。

下面是一個 JS 的普通對象，包括一開始初始化項目的 `App.js` 也是對象。可以改造成下面例子的樣子。

> 對象與組件是不同的東西，組件命名開頭必須是大寫，對象則不用，`element = <h1>你好，世界！</h1>;` 可以想像成是變量與值，`element` 被賦值組件值。

```jsx
import React, { Children } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

const element = <h1>你好，世界！</h1>;
// <App /> 普通對象

let root = document.getElementById("root");

ReactDOM.render(element, root);
```

### 簡單的 Clock 實例

這例子是使用間隔函數不斷重新渲染頁面，但是因為根頁面渲染被限制住了，所以不適合。

> 註：在選取元素 ID 不一定要用 `document.getElementById("root")` 也可以使用 `document.querySelector('#root')` 方式操作 DOM。

```jsx
function clock() {
  let time = new Date().toLocaleTimeString();
  let element = <h1>Current Time: { time }</h1>;
  let root = document.querySelector('#root')
  ReactDOM.render(element, root)
}

clock();

// 間隔函數
setInterval(clock, 1000);
```

下面的例子是上面的改版，是**函數式組件**。

> 註：組件名稱都必須是**開頭大寫**，不然無法被 JSX 語法識別。

```jsx
// react 函數式組件
// 組件開頭必須大寫
function Clock(props) {
  return (
    <h1>Current Time: { props.date.toLocaleTimeString() }</h1>
  );
}

function run() {
  // date 傳參
  ReactDOM.render(
    <Clock date={ new Date() } />,
    document.querySelector('#root')
  )
}

setInterval(run, 1000);
```

### Style

寫 Style 對象時參數是**駝峰命名法**，當然也可以使用像是 `"background-img": "url(https...)"` 的方法表示樣式參數，雖然可以使用原來的命名，但是不建議用這方法，因為 Code 的規範。

因為 `class` 在 JS 中表示類，是 Keyword，所以要**改用 `className` 表示 HTML 元素中的類樣式**，兩者是不同的概念。

在 JSX 語法中要寫註解的話，分成 HTML 使用 `{/* */}` 這方法，因為 `{}` 是放 JS 語法的地方，JS 中就直接 `//`。

```jsx
// 駝峰命名
// style 中如果存在多個單字的屬性組合，第二個單字開始，首字母大寫。
// 可以不首字母大寫，但要換寫法
let exampleStyle = {
  background: "skyblue",
  borderBottom: "1px solid red",
  // 不用首字母大寫的方法 e.g.
  // "background-img": "url(https...)"
}
let element = (
  <div>
    <h1 style={exampleStyle}>Hello World</h1>
  </div>
)

// class 在 Js 中是關鍵字，所以要改成 className
// className 和 style 等屬性不能是 string，必須是對象參數
// 不能有多個 className 或是多個 style，會被自動刪掉剩一個
// className 可以用 string 相加的方式
let classStr = "abc"

let element1 = (
  <div>
    <h1 className={"cba " + classStr}>Hello World</h1>
  </div>
)

// react 中 className array 無法像 Vue 一樣可以自動拆解
// 所以要加上 join 去做間隔
let classArray = ['abc', 'cba'].join(" ");
let elementArrayClass = (
  <div>
    {/* 在 HTML 寫註釋 */}
    <h1 className={classArray}>Hello World</h1>
  </div>
  // 在 JS 寫註釋
)

ReactDOM.render(
  element1,
  document.querySelector('#root')
)
```

### 組件

命名開頭都必須是大寫。

#### 函數式組件

下面是前面簡單 Clock 實例的函數式組件，傳參進行渲染。

- 函數式組件是靜態組件，頂多傳參數。
- 函數式組件 stateless 無生命週期。

```jsx
function Clock(props) {
  return (
    <h1>Current Time: { props.date.toLocaleTimeString() }</h1>
  );
}
```

#### 類組件

下面是最簡單的類組件

- 類組件可以定義方法。
- 類組件 stateful 有生命週期。
- 類組件中可以在包含組件 -> 複合組件。

```jsx
// 類組件 - 可以定義方法
// 有事件或是動態的 使用類組件：e.g. 點擊事件
// 函數式組件是靜態組件，頂多傳參數
// 函數式組件 stateless 無生命週期
// 類組件 stateful 有生命週期
// 類組件中可以在包含組件 -> 複合組件
class HelloWorld extends React.Component {
  render(){
    console.log(this)
    return (
      <div>
        <h1>類組件 Hello World</h1>
        {/* 類組件傳參 */}
        {/* <h2>hello: {this.props.name}</h2> */}
      </div>
    )
  }
}

ReactDOM.render(
  <HelloWorld />,
  document.querySelector('#root')
)
```

**類組件實現簡單 Clock 實例**

- React State 相當於 Vue 的 Data。**
- React 類組件中要修改 State 的話，不能直接修改，要**使用 `this.setState()` 方法進行修改**。
- **`constructor()` 是構造函數，`render()` 是渲染函數**。
- `super()` 是繼承父類的方法，`props` 可以用來傳參。

下面的例子只是簡單實現的 Clock 顯示，這裡只是舉個例子讓你了解怎麼使用類組件。下面例子最尾部的註解是因為一開始我們沒有使用**生命周期函數 `componentDidMount()` 去做時間的更新**，後面因為用到了生命周期函數，所以要將原本的註解掉，算是錯誤示範。

```jsx
// React State 相當於 Vue 的 Data
// 用類組件實現

class ClockClass extends React.Component {
  // 構造函數
  constructor(props) {
    super(props)
    // 狀態 (數據) -> View
    this.state = {
      time: new Date().toLocaleTimeString()
    }
  }

  render() {
    // this.state.time = new Date().toLocaleTimeString();
    return (
      <div>
        <h1>{this.state.time}</h1>
      </div>
    )
  }
  // 生命周期函數
  // 組件渲染完成時調用的函數
  componentDidMount() {
    setInterval(() => {
      // 錯誤的改變方式
      // this.state.time = new Date().toLocaleTimeString();
      // 正確的修改，使用 setState
      // 切勿直接修改 state 數據，直接 state 重新渲染內容，需使用 setState
      // setState 是異步
      // 通過 this.setState 修改完數據後，並不會立即修改 DOM 裡面的內容
      // react 會在這個修改函數內容所有設置改變後，統一對比虛擬 DOM 對象，然後再統一修改，提升性能
      this.setState({
        time: new Date().toLocaleTimeString()
      })
    }, 1000)
  }
}

ReactDOM.render(
  <ClockClass />,
  document.querySelector('#root')
)

// 不推薦的方法，因為跟組件 Dom 渲染綁在一起
// setInterval(() => {
//   ReactDOM.render(
//     <ClockClass />,
//     document.querySelector('#root')
//   )
// }, 1000)
```

**類組件方法綁定**

**類的方法需要進行綁定 `this` 才能進行使用**，也可以使用**箭頭函數**，箭頭函數直接就是指向父類的 `this`。

```jsx
class Tab extends React.Component {
  constructor(props) {
    super(props)

    // 設置狀態和數據
    this.state = {
      isActive: "",
      strClass: ""
    }

    this.clickEvent = this.clickEvent.bind(this)
  }

  clickEvent() {
    console.log("click event")
  }

  render() {
    return (
      <div>
        <button onClick={this.clickEvent}>content 1</button>
        <button>content 2</button>
        <div className="content active">
          <h1>content 1</h1>
        </div>
        <div className="content">
          <h1>content 2</h1>
        </div>
      </div>
    )
  }
}
```

### 組件傳值

#### 父傳子

在 JSX 中，只能父傳子組件數據，單向流動，不能子傳父。

> 注意：**`props` 可以傳遞函數，`props` 可以傳遞父函數的元素**，就可以去修改父元素的 `state`，從而達到**子組件傳遞數據給父元素**。

```jsx
// Props
// 父傳子組件數據，單向流動，不能子傳父
// props 可以設置默認值
// 注意：props 可以傳遞函數，props 可以傳遞父函數的元素，就可以去修改父元素的 state，從而達到傳遞數據給父元素

// 在父元素中使用 state 去控制子元素 props 的從而達到父元素數據傳遞給子元素

class ParentCom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isAction: true
    }

    // 綁定事件
    this.changeShow = this.changeShow.bind(this)
  }

  render() {
    return (
      <div>
        <button onClick={this.changeShow}>控制子元素顯示</button>
        <ChildrenCom isAction={this.state.isAction}/>
      </div>
    )
  }

  changeShow() {
    this.setState({
      isAction: !this.state.isAction
    })
  }
}

class ChildrenCom extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    let strClass = null;
    if(this.props.isAction) {
      strClass = 'active'
    } else {
      strClass = ''
    }

    return (
      <div className={"content " + strClass}>
        <h1>我是子元素</h1>
      </div>
    )
  }
}

ReactDOM.render(
  <ParentCom />,
  document.querySelector('#root')
)
```

#### 子傳父

調用父元素的函數從而操作子元素的數據，從而實現 子 -> 父。

```jsx
// 子傳父
// 調用父元素的函數從而操作子元素的數據，從而實現 子 -> 父

class ParentCom2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      childData: null
    }
  }

  render() {
    return (
      <div>
        <h1>子傳父的數據：{this.state.childData}</h1>
        {/* 傳遞函式給子組件 */}
        <ChildrenCom2 setChildData={this.setChildData}/>
      </div>
    )
  }

  setChildData = (data) => {
    this.setState({
      childData: data
    })
  }
}

class ChildrenCom2 extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      msg: "hello"
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.sendData}>傳遞 hello 給父元素</button>
        {/* 更簡單的方法 */}
        <button onClick={ () => {this.props.setChildData('直接傳')}}>傳遞 hello 給父元素</button>
      </div>
    )
  }
  // 搞成箭頭函數
  sendData = () => {
    console.log(this.state.msg)
    // 用 props 拿到父組件的函數
    // 將子元素數據傳遞給父元素
    this.props.setChildData(this.state.msg)
  }
}

ReactDOM.render(
  <ParentCom2 />,
  document.querySelector('#root')
)
```

### Event 事件綁定

`onClick` 用來綁定事件，在綁定的時候不能像 Vue 中 `@click="..."` 一樣使用 String，要使用 `{}` 傳入一個函數。下面的事件使用的箭頭函數，這樣就不需要在構造函數寫綁定。

```jsx
// React event
// 綁定事件使用駝峰命名法
// {} 傳入一個函數，不是 String

// 原生 js 阻止默認行為時，可以直接返回 return false
// react 中，阻止默認必須使用 e.preventDefault();
class ClickCom extends React.Component {
  render() {
    return (
      <div>
        <form action="https://www.google.com" target="_blank">
          <button onClick={this.preventEvent}>submit</button>
        </form>
        {/* es6 箭頭函數 */}
        <button
          onClick={(e) => {
            this.preventEvent1("msg: 123", e);
          }}
        >
          submit
        </button>
        {/* 不使用 es6 箭頭函數傳遞多個參數的方式 */}
        <button
          onClick={function (e) {
            this.preventEvent1("msg: 123", e);
          }.bind(this)}
        >
          submit
        </button>
      </div>
    );
  }

  preventEvent = (e) => {
    console.log(e.preventDefault);
    e.preventDefault();
    // js 原生寫法
    // return false
  };

  preventEvent1 = (msg, e) => {
    console.log(msg);
    // js 原生寫法
    // return false
  };
}

ReactDOM.render(<ClickCom />, document.querySelector("#root"));
```

### 條件渲染

下面是簡單的條件渲染，情況二因為可以是三元運算式，直接透過運算賦值給一個變量成一個 JSX 對象，所以在這裡沒有寫，以下面情況一的例子就是 `let element = this.state.isLogin ? <UserGreet/> : <UserLogin/>` 然後 `return element`，差別不大。

```jsx
// React 條件渲染

// 1. 直接通過條件運算返回要渲染的 JSX 對象
// 2. 通過條件運算得出 JSX 對象，將對象渲染到模板

// 情況一
function UserGreet(params) {
  return (<h1>welcome to sign in</h1>)
}

function UserLogin(params) {
  return (<h1>請先登入</h1>)
}

class ParentCom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isLogin: false
    }
  }

  render() {
    if(this.state.isLogin) {
      return (<UserGreet/>)
    } else {
      return (<UserLogin/>)
    }
  }
}

ReactDOM.render(<ParentCom />, document.querySelector("#root"));

// 情況二
// 自己類推
```

### List 渲染（循環渲染）

下面是簡單的 List 渲染例子：

`arrayHTML` 是 JSX 對象 Array。但是這個例子因為使用上不夠優雅靈活，所以不適合，應該要使用像是傳參動態渲染的方法。

```jsx
// List 渲染

let array = ["banana", "apple", "peach"];

let arrayHTML = [<li>banana</li>, <li>apple</li>, <li>peach</li>]

class Welcome extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <ul>
          {array}
          {arrayHTML}
        </ul>
      </div>
    )
  }
}

ReactDOM.render(<Welcome />, document.querySelector("#root"));
```

下面是更進的改造版，將一部份作為函式數組件，傳入參數可以進行渲染，相當於模板。

```jsx
// 作為模板
function ListItem(props) {
  return (
    <li key={props.index}>
      <h3>
        {props.index} : {props.data.title}
      </h3>
      <p>{props.data.content}</p>
    </li>
  );
}

// 有動態事件的方式
class ListItem2 extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li
        key={this.props.index}
        onClick={(event) => {
          this.clickEvent(this.props.index, this.props.data.title, event);
        }}
      >
        <h3>
          {this.props.index} : {this.props.data.title}
        </h3>
        <p>{this.props.data.content}</p>
      </li>
    );
  }

  clickEvent = (index, title, event) => {
    alert(index + " - " + title);
  };
}

class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
          title: "NO1 111",
          content: "11111",
        },
        {
          title: "NO2 222",
          content: "222",
        },
        {
          title: "NO3 333",
          content: "333",
        },
      ],
    };
  }

  render() {
    // 最原始方法
    // let listArr = [];
    // for(let i = 0; i < this.state.list.length; i++) {
    //   let item = (
    //     <ul>
    //       <li><h3>{this.state.list[i].title}</h3></li>
    //       <li><h5>{this.state.list[i].content}</h5></li>
    //     </ul>
    //   )

    //   listArr.push(item);
    // }

    // 使用數組 map 方法，對每一項數據進行 JSX 的形式進行加工，
    // 最終得到 1 個每一項都是 JSX 對象的數組，將數組渲染到模板。
    // Key 需要放入每一項中
    let listArr = this.state.list.map((item, index) => {
      return (
        // <li key={index}>
        //   <h3>{index} : { item.title }</h3>
        //   <p>{ item.content }</p>
        // </li>
        // <ListItem data={item} index={index} key={index} />

        <ListItem2 data={item} index={index} key={index} />
      );
    });

    return (
      <div>
        {/* 最原始方式 */}
        {/* {listArr} */}
        <ul>{listArr}</ul>
      </div>
    );
  }
}

ReactDOM.render(<Welcome />, document.querySelector("#root"));
```

### 組件生命週期

組件從實例化到最終從頁面銷毀，整個過程就是生命週期，在這生命週期中，我們有許多可以調用的方法，俗稱鉤子函數。


**三個狀態**

1. Mounting 將組件插入到 DOM 中
2. Updating 將數據更新到 DOM 中
3. UnMounting 將組件移除 DOM

**生命周其中的鉤子函數（方法、事件）**

- **ComponentWillMount：組件將要渲染（已過時，不能用）**
- ComponentDidMount：組件渲染完畢
- **ComponentWillReceiveProps：組件將要接受 props 數據（已過時，不能用）**
- ShouldComponentUpdate：組件接收到新的 state 或是 props，判斷是否更新，返回布爾值
- **ComponentWillUpdate：組件將要更新（已過時，不能用）**
- ComponentDidUpdate：組件已經更新完畢
- ComponentWillUnMount：組件將要卸載

```jsx
// 可以解構
// 這樣就不用每次都寫 react.Component
import { Component } from 'react'

class ComLife extends Component {
  constructor(props) {
    super(props) // 調用繼承 Component 的 構造函數
    this.state = {
      msg: "hello world msg"
    }
    console.log("constructor 構造函數")
  }

  componentWillMount() {
    // 已過時
    // 通常用來 ajax 請求
    // 添加動畫前的類
    console.log("ComponentWillMount  組件將要渲染")
  }

  componentDidMount() {
    // 用來渲染動畫
    console.log("ComponentDidMount   組件渲染完畢")
  }

  componentWillReceiveProps() {
    // 已過時
    // 用來查看 props 內容是什麼
    console.log("ComponentWillReceiveProps  組件將要接受 props 數據")
  }

  componentWillUpdate() {
    // 已過時
    console.log("ComponentWillUpdate   組件將要更新")
  }

  componentDidUpdate() {
    console.log("ComponentDidUpdate   組件已經更新完畢")
  }

  componentWillUnmount() {
    console.log("ComponentWillUnMount   組件將要卸載")
  }

  render() {
    console.log("render 渲染函數")
    return (
      <div>
        <h1>hello</h1>
      </div>
    )
  }
}
```

### 插槽

組件中寫入內容，這些內容可以被識別和控制。React 需要自己開發支持插槽功能。

原理：組件中寫入的 HTML，可以傳入到 props 中。

> 註：這裡的 data-{ name } 是 HTML 中自定義屬性。e.g. 下面例子中的 `data-position` 和 `data-index`。

```jsx
// 組件中寫入內容，這些內容可以被識別和控制。React 需要自己開發支持插槽功能
// 原理：組件中寫入的 HTML，可以傳入到 props 中

class ParentCom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      arr: [1, 2, 3],
    };
  }

  render() {
    console.log(this.props);
    return (
      <div>
        <h1>組件插槽</h1>
        {this.props.children}
        <ChildCom>
          <h1 data-position="header">這是放置到頭部的內容</h1>
          <h1 data-position="main">這是放置到主要的內容</h1>
          <h1 data-position="footer">這是放置到尾部的內容</h1>
        </ChildCom>
      </div>
    );
  }
}

class ChildCom extends React.Component {
  render() {
    let headerCom, mainCom, footerCom;
    this.props.children.forEach((item, index) => {
      if (item.props["data-position"] === "header") {
        headerCom = item;
      } else if (item.props["data-position"] === "main") {
        mainCom = item;
      } else {
        footerCom = item;
      }
    });
    return (
      <div>
        <div className="header">{headerCom}</div>
        <div className="main">{mainCom}</div>
        <div className="footer">{footerCom}</div>
      </div>
    );
  }
}

class RootCom extends React.Component {
  render() {
    return (
      <ParentCom>
        {/* 插槽 */}
        {/* 添加 data 屬性可以傳參，data- 後面接想要取的屬性名 */}
        <h2 data-name="a" data-index={this.state.arr[0]}>
          子組件一
        </h2>
        <h2 data-name="b" data-index={this.state.arr[1]}>
          子組件二
        </h2>
        <h2 data-name="c" data-index={this.state.arr[2]}>
          子組件三
        </h2>
      </ParentCom>
    );
  }
}

ReactDOM.render(<RootCom />, document.querySelector("#root"));
```

## React Router 路由

根據不同的路徑，顯示不同的組件(內容)，React 使用庫 react-router-dom。

### 安裝

```bash
npm install react-router-dom
```

### 使用

**ReactRouter 三大組件**

Router：所有路由組件的根組件(底層組件)，包裏路由規則的最外層容器
Route：路由規則匹配組件，顯示當前規則對應的組件
Link：路由跳轉組件

> 注意：如果要精準匹配，那麼可以在 route 上設置 exact 屬性。精準匹配的意思就是完整路徑包含父路徑。

Hash 與 History 模式，Hash 就是有 '#' 符號，我們使用 History。

**引入**

```jsx
// hash 模式
// as 是取別名
// import { HashRouter as router, Link, Route } from 'react-router-dom'

// History 模式 / 後端匹配使用
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
```

**基本使用**

- `<Link></Link>` 相當於 Vue 中的 `<route-link></route-link>`，用於路由跳轉。
- `<Router></Router>` 路由配置，可以設置基本路徑（Base Path），裡面包 `<Route></Route>`，`<Route></Route>`是路由，`component` 指定路由對應的組件。
- `<Link replace></Link>` 的 `replace` 屬性可以進行路由的取代替換，取代當前瀏覽器路由地址並跳轉。
- **動態路由：`<Route path="/news/:id" component={News}></Route>`**。

```jsx
function Home(params) {
  return (
    <div>
      <h1>admin首頁</h1>
    </div>
  );
}

function Me(params) {
  console.log(params);
  return (
    <div>
      <h1>admin個人頁面</h1>
    </div>
  );
}

function Product(params) {
  return (
    <div>
      <h1>admin產品頁面</h1>
    </div>
  );
}

function News(params) {
  console.log(params)
  return (
    <div>
      新聞頁
      新聞 id: {params.match.params.id}
    </div>
  )
}

class App extends React.Component {
  render() {
    // 這裡的 search 是 query string
    // 可以傳 state
    let meObj = {
      pathname: "/me", // 路徑
      search: "?username=admin", // get 請求參數
      hash: "#abc", // 設置 hash 錨值
      state: { msg: "helloWorld" }, // 傳入組件的數據
    };
    return (
      <div id="app">
        {/* 全局 */}
        <div>所有頁面都顯示的內容</div>
        {/* Router 可以在一個組件中寫多個 */}
        {/* <Router>
          <Route path="/" exact component={() => (<div>首頁</div>)}></Route>
          <Route path="/me" component={() => (<div>me</div>)}></Route>
          <Route path="/product" component={() => (<div>product</div>)}></Route>
        </Router> */}

        {/* Router 設置基礎路徑 basename */}
        <Router basename="/admin">
          <div className="nav">
            <Link to="/">首頁</Link>
            <Link to="/product">產品</Link>
            {/* Link 可以設置 to 屬性進行頁面跳轉，to 屬性可以直接寫路徑的字符串，也可以通過 1 個對象，進行路進的配置 */}
            {/* replace 屬性 將新地址制換成歷史訪問紀錄的原地址 */}
            <Link to={meObj} replace>個人中心</Link>
            {/* 動態路由 */}
            <Link to="/news/456789">news</Link>
          </div>
          <Route path="/" exact component={Home}></Route>
          <Route path="/product" exact component={Product}></Route>
          <Route path="/me" exact component={Me}></Route>
          {/* 動態路由 */}
          <Route path="/news/:id" component={News}></Route>
        </Router>
      </div>
    );
  }
}

export default App;
```

**重定向組件與 Switch 組件**

重定向組件：如果訪問某個組件時，如果有重定向組件，那麼就會修改頁面路徑，使得頁面內容顯示為所定向路徑的內容。

Switch 組件：讓 Switch 組件內容的 Route 只匹配一個，只要匹配到了，剩餘的規則就不再匹配。

> 建議配置路由時要**使用 Switch 組件**，這樣路由的配置邏輯比較謹慎。

```jsx
// 重定向組件
// 如果訪問某個組件時，如果有重定向組件，那麼就會修改頁面路徑，使得頁面內容顯示為所定向路徑的內容

// Switch 組件
// 讓 Switch 組件內容的 Route 只匹配一個，只要匹配到了，剩餘的規則就不再匹配

import { Redirect, Switch } from "react-router-dom";

function LoginInfo(params) {
  // params.loginSuccess = 'success'
  // params.loginSuccess = 'fail
  if (params.location.state.loginState === "success") {
    return (
      // 重定向組件
      <Redirect to="/admin"></Redirect>
    );
  } else {
    return <Redirect to="/login"></Redirect>;
  }
}

let formCom = () => {
  let pathObj = {
    pathname: "/loginInfo",
    state: {
      loginState: "success",
    },
  };
  return (
    <div>
      <h1>表單驗證</h1>
      <Link to={pathObj}>登入後表單驗證</Link>
    </div>
  );
};

class ChildCom extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <button onClick={this.clickEvent}>跳轉到首頁</button>
      </div>
    );
  }

  clickEvent = () => {
    console.log(this.props);
    // 可以傳值
    // this.props.history.push("/", {msg: "這是由 ChildCom 發給首頁的數據"})
    // this.props.history.replace("/", {msg: "這是由 ChildCom 發給首頁的數據"})

    // 前進
    this.props.history.go(1);
    this.props.history.goForward();
    // 後退
    this.props.history.go(-1);
    this.props.history.goBack();
  };
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route
              path="/"
              exact
              component={(props) => {
                console.log(props);
                return <h1>首頁</h1>;
              }}
            ></Route>
            <Route path="/form" exact component={formCom}></Route>
            <Route
              path="/login"
              exact
              component={() => <h1>登入頁</h1>}
            ></Route>
            <Route path="/loginInfo" exact component={LoginInfo}></Route>
            <Route path="/admin" exact component={() => <h1>Admin</h1>}></Route>

            {/* Router 會全部匹配，所以如果有兩個相同的 path 會兩個都匹配 */}
            {/* 所以需要用到 Switch 去匹配，匹配到一個成功就不會繼續匹配 */}
            <Route path="/abc" exact component={() => <h1>abc1</h1>}></Route>
            <Route path="/abc" exact component={() => <h1>abc2</h1>}></Route>
            <Route path="/child" exact component={ChildCom}></Route>
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
```

## 狀態管理

解決 React 數據管理（狀態管理），用於中大型項目，數據量龐大，組件之間數據交互較多的情況下使用。

> 如果你不知道是否需要使用 Redux ，那麼你就不需要用他。Redux 是個給 JavaScript 應用程式所使用的可預測 state 容器，Redux 跟 React 並沒有關係，你可以用 React、Angular、Ember、jQuery 或甚至原生 JavaScript 來撰寫 Redux 應用程式。

**功能**

- 解決組件的數據通信
- 解決數據和交互較多的應用

### redux

**安裝**

```bash
npm install --save redux
```

**工具**

- store: 數據倉庫，保存數據的地方
- State: state 是一個對象，這個對象包含整個應用所需要的數據
- Action: 一個動作，觸發數據改變的方法
- Dispatch: 將動作觸發成方法
- Reducer: 是一個函數，通過獲取動作，改變數據，生成一個新的狀態，從而改變頁面

**使用**

```jsx
import { createStore } from "redux";

// 用於通過動作，創建新的 state
// reduce 有兩個作用，一個釋初始化數據，第二個是通過獲取動作，改變數據
const reducer = function (state = { num: 0 }, action) {
  switch (action.type) {
    case "add":
      state.num++;
      break;
    case "decrement":
      state.num--;
      break;
    default:
      break;
  }
  return { ...state }; // 相當於對象的 COPY
};

// 創建倉庫
const store = createStore(reducer);

function add() {
  // 通過倉庫的方法 dispatch 進數據修改
  // dispatch 觸發 reducer
  store.dispatch({ type: "add" });
  console.log(store.getState());
}

function decrement() {
  store.dispatch({ type: "decrement" });
  console.log(store.getState());
}

const Counter = function () {
  let state = store.getState();
  return (
    <div>
      <h1>計數數量：{state.num}</h1>

      <button onClick={add}>+1</button>
      <button onClick={decrement}>-1</button>
    </div>
  );
};

ReactDOM.render(<Counter />, document.querySelector("#root"));

// 監聽數據變化，重新渲染
// 當數據改變時觸發
store.subscribe(() => {
  ReactDOM.render(<Counter />, document.querySelector("#root"));
});
```

### react-redux

react-redux 是 redux 的擴展套件，用來綁定 redux。

**安裝**

```bash
npm install --save react-redux
```

**工具**

- Provider：自動將 store 裡的 state 和組件進行關聯
- connect：將數據倉庫的 state 和修改 state 的方法映射到組件上，形成新的組件

**使用**

```jsx
import { createStore } from "redux";
import { Provider, connect } from 'react-redux'

class Counter extends React.Component {
  render() {
    // 計數，通過 store 的 state 傳給 props，直接通過 props 就可以將 state 的數據獲取
    const value = this.props.value;
    // 將修改數據的事件或者方法傳入到 props
    const onAddClick = this.props.onAddClick;
    // 等同於 VueX 的 mapMutation mapState

    return (
      <div>
        <h1>計數數量：{value}</h1>

       <button onClick={onAddClick}>+1</button>
      </div>
    )
  }
}

// 動作
const addAction = {
  type: 'add'
}

const reducer = function (state = { num: 0 }, action) {
  switch (action.type) {
    case "add":
      state.num++;
      break;
    case "decrement":
      state.num--;
      break;
    default:
      break;
  }
  return { ...state }; // 相當於對象的 COPY
};

const store = createStore(reducer);

// 將 state 映射到 props 函數
function mapStateToProps(state) {
  return {
    value: state.num
  }
}

// 將修改 state 數據的方法，映射到 props，默認會傳入 store 裡的 dispatch 方法
function mapDispatchToProps(dispatch) {
  return {
    onAddClick: () => {
      dispatch(addAction)
    }
  }
}

// 將上面的這兩個方法，將數據倉庫的 state 和修改 state 的方法映射到組件上，形成新的組件

const NewApp = connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter)

// Provider 組件：自動將 store 裡的 state 和組件進行關聯

ReactDOM.render(
  <Provider store={store}>
    <NewApp></NewApp>
  </Provider>,
  document.querySelector("#root")
)
```

## Reference

- [2020最新前端_React实战教学【老陈打码】- BiliBili](https://www.bilibili.com/video/BV1T7411W72T)
- [React](https://zh-hant.reactjs.org/)
- [Create React App - Github](https://github.com/facebook/create-react-app)
- [Redux](https://chentsulin.github.io/redux/index.html)
