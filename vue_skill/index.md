# VUE 技巧與經驗


## 前言

經過許久寫 VueJS 的經驗，實在是有些技巧我想要紀錄下來，畢竟當時我摸索了很久，從一開始的不擅長到後面的熟練，經歷的 Project 很多。希望能幫助新手快速掌握 VueJS。

這文章不會教你 Vue 基礎語法等詳細的基礎部份。所以在看這篇文章時需要一些 Vue 基礎。

如果因為沒有範例觀摩的話，可以看我在 2020/06/30 - 2020/07/17 暑假實訓寫的[個人空間系統 - Blog 前端](https://github.com/2892211452/SXCsuOntOf/tree/master/Code/front-end/blog)。

## Vue-cli 腳手架使用

### 創建應用

> 用了 CDN 引入就不能用 Vue-cli 了，整個的結構差太多，通常 CDN 引入就是 Demo 或是很小的專案某部分用來代替 JQuery 用。

大部分開發還是使用 Vue-cli 比較方便。關於使用 Vue-cli 現在使用 npm 可以自己選擇要裝哪些東西，使用越來越方便，通常我是建議自定義，因為 eslint 的標準太高了，每次打開瀏覽器 Console 就一堆警告。所以在後面的選擇將 **Linter / Formatter** 這一項按空白鍵（Space）去掉。目前我開發項目初始構建只需要下列三個就暫時夠用了：

1. Babel：自由開源的 JavaScript 編譯器、轉譯器。
2. Router：Vue 的路由。
3. Vuex：組件狀態管理。

> 關於怎麼裝 npm 和 vue-cli，我想 npm 就網上下載安裝，vue-cli 就執行 `npm install -g @vue/cli` 指令進行安裝。

```zsh
vue create demo # 創建一個 vue-cli 應用

# 按下 Down 再按 Enter 選擇第二項自定義
Vue CLI v4.4.6
? Please pick a preset: 
  default (babel, eslint) 
❯ Manually select features 

# 用空白鍵選擇下面的三個，並按 Enter

? Please pick a preset: Manually select features
? Check the features needed for your project: 
 ◉ Babel
 ◯ TypeScript
 ◯ Progressive Web App (PWA) Support
❯◉ Router
 ◉ Vuex
 ◯ CSS Pre-processors
 ◯ Linter / Formatter
 ◯ Unit Testing
 ◯ E2E Testing
```

> 如果這裡沒有選擇裝 Router 和 Vuex 的話，沒關係，我這篇文章後面會教這兩個的基本使用也會教怎麼自己導入，畢竟幾個月前是需要自己另外裝的。感覺是被 npm 被 Github 合併之後變這麼方便。

後面的選項如果都沒特別需求就一直按 Enter 就好。

### Project 結構


```bash
.
├── babel.config.js
├── .browserslistrc
├── .git
├── .gitignore
├── node_modules
├── package.json
├── package-lock.json
├── public
│   ├── favicon.ico
│   └── index.html
├── README.md
└── src
    ├── App.vue
    ├── assets
    │   └── logo.png
    ├── components
    │   └── HelloWorld.vue
    ├── main.js
    ├── router
    │   └── index.js
    ├── store
    │   └── index.js
    └── views
        ├── About.vue
        └── Home.vue
```

上面是創建完應用後會出現的 Project 結構。這裡 npm 真的很貼心，連 `.git`、`.gitignore`、`README.md` 都幫你新建好了。

這裡比較需要注意的是 `package.json` 和 src 目錄，`package.json` 可以幫助你查看當前依賴版本和管理依賴，所有安裝依賴都會放到 node_modules 資料夾，所以如果出現依賴問題就將 node_modules 砍了，然後重新執行 `npm install` 指令，如果要升級依賴套件就**執行 `npm update` 就能一次更新 Project 中的所有套件**。如果再有問題，建議直接**將 Error 訊息用 Google 搜索一下，大部分解決辦法都在 [Stack Overflow](https://stackoverflow.com/) 和 Github issues 等地方找到解決辦法**。

### src 目錄

| 檔案或文件  | 用途                            |
| ----------- | ------------------------------- |
| App.vue     | 作為所有 SPA 頁面的起始根頁面   |
| assets/     | 靜態資源 e.g. CSS JS IMG        |
| components/ | 自定義組件                      |
| main.js     | 作為所有 SPA 頁面的全局 JS 文件 |
| router/     | 路由配置文件                    |
| store/      | Vuex 的狀態管理                 |
| views/      | 頁面或子頁面                    |

**src 目錄是我們最主要寫項目時編輯的地方**，目前最新版的 vue-cli 所生成的目錄長這樣（雖然之前不是這樣），總之用途都幫你分類好了。

### 編寫習慣

#### 1 引入依賴

引入依賴的判斷，通常如果只是單一個頁面或有特殊需求的頁面要引入使用一個組件，我會建議直接在這個頁面的 `*.vue` 直接引入註冊組件，如果是像是**很多頁面都要用的組件就需要在 `main.js` 全局引入註冊組件，e.g. UI 庫框架**。

#### 2 Components 與 Views 的區別

通常我很少會去動 Components 這目錄，除非需要我自己寫組件，雖然 Components 和 Views 裡面裝的 `*.vue` 都是組件，但最大的區別是**Components 是不具有配置 router 的一般組件，Views 裡面是有配置 router 的子組件**，所以在頁面跳轉時我們會是跳轉到 Views 目錄下的組件。

#### 3 子頁面

有些人會**使用一般的組件然後用 `v-if` 或 `v-on` 判斷作為子頁面顯示，我是不建議這樣子做**，因為這樣的頁面如果**點了一下瀏覽器刷新頁面，所有頁面當前位置都會被重置**，e.g 如果你有個頁面 Nav 上有購物車和商店，如果你購物車和商店的子頁面是上述所說的沒配置不具備路由屬性，在網址 URL 上相同都是 `https://localhost:8080/`，你刷新頁面整個頁面就會初始化，如果是有配置路由的子頁面會分別像是 `https://localhost:8080/cart` 和 `https://localhost:8080/home`，這樣才能保證你當前檢視的頁面刷新網址後不會改變目前正在檢視子頁面。

#### 4 關於是否需要用到 JQuery 或是其他前端 JS 框架

我一開始也會有這樣的疑惑，明明用了 Vue 會試著想去混著使用 JQuery，但現在我的建議很明確，**沒必要混著用，兩者都是可以用自己的方式實現相關功能，像是 Vue 網上就有豐富的組件庫**，JQuery 勢必是會被淘汰的產物。比如說好了，像是之前我要做一個點擊按鈕頁面滑動到特定 `#id` 元素的效果，而我一開始死命去找 Vue 有沒有相關 JS 代碼實現，然後卻一直找不到，自己用純 Js 實現也報錯，Google 搜到的大多都是 JQuery 實現，後面我發現原來是我沒用好 Keyword 去搜，其實是有相關組件實現的。

#### 5 關於組件之間的傳值

**直接說結論：Vuex 去管理**，網上會看到很多人教 Vue 使用一定會教怎麼父子組件互相傳值，我一開始也是用這方法傳值，但是**當你使用的是子頁面 router 時，恰好這些父子組件傳值根本沒用**，你只能用 query string 傳參，但是這樣只能傳一個參數，所以除非是你要自己寫組件給別人或自己設計組件用，不然是不需要用到父子組件傳值方式，相對的使用 Vuex 才是更為方便的方式。

#### 6 Vuex 使用的場景

目前使用 Vuex 最大需要注意的點是**如果你點擊瀏覽器刷新頁面，所有的 State 都會被初始化**，所以不能只依據 Vuex 去存數據，像是 Jwt token 應該放在 localsStorage 或 Cookie，**每個頁面在初始化時就要異步請求數據**，也就是每刷新一次頁面就會請求一次或多次數據，這是必須的，沒有簡便的方法，Vuex 侷限性也很多，一般我是建議**將請求的 URL 存在 Vuex 的 State**，如果後端改了 URL 前端也好一次搞好所有請求 URL，加上一個請求可能需要在多個子頁面中會使用到，為了增加複用性和方便，HTTP 請求 URL 用 Vuex 引入。

#### 7 請求

我自己寫**前端 HTTP 請求都是寫異步請求**，至於後端要怎樣的請求方式，前端真的無法決定，只是如果是需要測試數據，我建議是**使用 MockJS 作為前端測試數據用**，這樣也不需要前端一直填測試數據，被後端侷限。這篇文章後面我會寫一下 Axios 請求的方式。

#### 8 Static Source

既然我們要寫 CSS Style，那我們就要統一使用 Class 或 Id 去編寫元素樣式，Inline Style 並不好加以管理，也不好發現錯誤，有時摳 CSS 摳不出自己想要的效果會讓我很煩躁。

#### 9 駝峰命名法與註解

這部份應該不用我多說明，除了這些，你的 Code 也需要規範化，變量命名也需要有意義，不是純粹的英文字母。Code 的易讀性真的很重要。

#### 10 CSS Position Fixed

我相信有些頁面經常會用 Fixed 來固定某些元素，然而在這部份，我是建議要盡可能的少使用這方法，因為在排版上，如果沒有指定特定的長寬，會造成走版，

#### 11 export default 與 new Vue

相信一開始都有人有這問題，當然網上搜也是一大把結果，我就在這裡簡略說一下：

**new Vue**：這是應用程序的根 Vue 實例。

```js
new Vue({
    el: '#app',
    data () {
      return {}
    }
})
```

```html
<html>
  ...
  <body>
    <div id="app"></div>
  </body>
</html>
```

**export default**：ES6 語法中的導出，也就是說這是聲明一個之後會被註冊使用的組件，**創建一個本地可註冊的 Vue 組件**。

```js
// my-component.js
export default {
    name: 'my-component',
    data () {
      return {}
    }
}
```

```js
// another-component.js
<template>
  <my-component></my-component>
</template>
<script>
  import myComponent from 'my-component'
  export default {
    components: {
      myComponent
    }
    data () {
      return {}
    }
    ...
  }
</script>
```

#### 12 調試端口 Port

一般預設調適端口是 8080，但有時也不是這樣，不過這部份也沒有什麼好改動的，畢竟後端也不需要知道前端是哪個 URL 發送的請求，除非自己有什麼強迫症非要改調試時的 Websocket 端口，不然沒必要去在意。這裡姑且還是寫一下改動調適端口的寫法。

在 `demo/`（也就是 Project 根目錄）下新建一個 `vue.config.js` 檔案，並寫入下列內容。

```js
// vue.config.js
module.exports = {
  devServer: {
    // 告訴 dev-server 在服務器啟動後打開瀏覽器，將其設置 true 為打開默認瀏覽器
    open: true,
    // 運行的 host 和 port
    host: 'localhost',
    port: 8080,
  }
}
```

#### 推薦的 UI 框架

我不會推薦 Vuetify，拜託不要被他絢麗的外貌所吸引，坑很多的，建議的是 **Ant design、Bootstrap-vue、Buefy**。

### Router

#### Router 配置

**安裝**：

```zsh
npm install vue-router # 安裝 vue-router
```

**配置說明**：

> 如果沒有這些資料夾和檔案就自己新建。

如果你在一開始就有裝 **Router**，那你會在 `src/router/index.js` 發現如下內容，這裡引入 `vue-router`，並使用 `Vue.use(VueRouter)` 註冊該組件，然後聲明一個 `routes` 常量，並將 **views/** 資料夾裡的組件引入到這裡且賦值給 `routes` Array Object。**然後再賦值給一個 VueRouter Object，再導出該 Object，在 `src/main.js` 中引入**。

> 註：引入的組件名稱可以自己定義，因為是 `export default`。ES6 語法中 `import` 和 `export` 可以有多個，但是 `export default` 只能有一個。

```js
// src/router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter) // 註冊陸游組件

// routes 常量
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

// VueRouter Object
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 導出
export default router
```

```js
// src/main.js
import Vue from 'vue'
import App from './App.vue'
import router from './router' // 引入 router
import store from './store'

Vue.config.productionTip = false

new Vue({
  router, // 引入
  store,
  render: h => h(App)
}).$mount('#app')

```

在需要用道路由管理顯示的組件加入 `<router-view/>`，`<router-link></router-link>` 用於路由跳轉規則，就像一開始初始化的 `src/App.vue`：

```html
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

```

#### Router 配置注意點

```js
// 這裡 Home 組件是需要引入的，但是因為上面的例子有寫，這裡為了方便描述就不寫了
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]
```

- 首先就是 `routes` 這常量中的 Object 通常由 **path、name、component** 這些 Key 值所組成，分別代表的是：**路徑、路由名、組件**。如果 `path: '/about'`，在調試時就是 `http://localhost:8080/about`，`name: 'About'` 可以作為前端頁面路由跳轉時使用的判斷值，`component` 代表該路由所代表的組件，就是跳轉到該路由時會顯示的組件。

- `component` 有兩種寫法：第一種是像**上面例子中的 `Home`**，直接賦值引入的組件，這種寫法，**會在載入根頁面全部 JS 渲染完成**。第二種是**上面的 `Home`**，**懶加載，這種寫法可以避免如果頁面應用很大會花很久載入頁面（使用的是匿名函數）**，加載根頁面時會依據當前頁面所需要加載對應的 JS，不是當前頁面需要的不會在此加載。我是**建議後者的寫法**。

- 現在初始化路由時**預設的 Router Mode 是 `history`**，就是沒有錨點的方式，如果想要換回有錨點的可以改成 `hash`，但是我偏好是 `history`，這樣 URL 也比較乾淨。


#### 子路由與重定向

我們可以給每個路由弄子路由，重定向就是**如果跳轉到某個路由會特地跳到另一個路由**，一般用於有多個子路由的對象，或是跳轉到 404 頁面，e.g.

> 註：父路由沒有一定需要有 `component` 的 value 值，也可以沒有。

```js
const routes = [
  {
    path: '/sign',
    name: 'Sign',
    component: () =>
        import ( /* webpackChunkName: "Sign" */ '../views/sign/Sign.vue'),
    // 子路由
    children: [{
            path: '/sign/signIn',
            name: 'SignIn',
            component: () =>
                import ( /* webpackChunkName: "SignIn" */ '../view/sign/SignIn.vue')
        },
        {
            path: '/sign/signUp',
            name: 'SignUp',
            component: () =>
                import ( /* webpackChunkName: "SignUp" */ '../view/sign/SignUp.vue')
        },
        {
            path: '/sign/verifyEmail',
            name: 'VerifyEmail',
            component: () =>
                import ( /* webpackChunkName: "VerifyEmail" */ '.views/sign/verifyEmail.vue')
        },
        {
            path: '/sign/forgotPassword',
            name: 'ForgotPassword',
            component: () =>
                import ( /* webpackChunkName: "ForgotPassword" */ '.views/sign/forgotPassword.vue')
        }
    ],
    //强制重定向
    redirect: '/sign/signIn'
  },
]
```

#### 404

下面的寫法可以匹配 404 路由。

```js
const routes = [
  {
    path: '*',
    name: '404',
    component: () =>
        import ( /* webpackChunkName: "404" */ '../views/error/pageNotFound.vue')
  }
]
```

#### 動態路由

動態路由會攜帶一個參數，可以用來在**初始化渲染組件時發送請求數據**，會攜帶的參數代表的意義可以是 UserID 或是 UserName...等，e.g 像是 Github 在查看別人的空間時 URL 上會有使用者的 UserName，所以會根據那個參數請求數據。

```js
const routes = [
    {
        path: '/:id/admin',
        name: 'admin',
        component: () =>
            import ( /* webpackChunkName: "admin" */ '../views/blog-admin/admin.vue'),
        children: [{
                path: '/:id/admin/posts',
                name: 'posts',
                component: () =>
                    import ( /* webpackChunkName: "posts" */ '../views/blog-admin/posts.vue')
            },
            {
                path: '/:id/admin/charts',
                name: 'charts',
                component: () =>
                    import ( /* webpackChunkName: "charts" */ '../views/blog-admin/charts.vue')
            },
            {
                path: '/:id/admin/collect',
                name: 'collect',
                component: () =>
                    import ( /* webpackChunkName: "collect" */ '../views/blog-admin/collect.vue')
            },
            {
                path: '/:id/admin/account',
                name: 'account',
                component: () =>
                    import ( /* webpackChunkName: "account" */ '../views/blog-admin/account.vue')
            }
        ],
        redirect: '/:id/admin/charts'
    },
]
```

在上面的任意路由組件寫入 `this.$route.params.id`，就會顯示是 `:id` 參數。當然你在寫動態路由的時候可以自己定義參數名，沒有一定要是 `id`。e.g.

```html
<template>
  <div>
    {{ this.$route.params.id }}
  </div>
</template>
```

#### 路由的方法

**跳轉路由**

```js
this.$router.push('/')
```

**返回上個瀏覽器歷史路由**

```js
this.$router.go(-1)
```

**攜帶 query string 參數的跳轉路由方式**

> query string 只能攜帶一個參數。使用的效果跟前面說的動態路由一樣，是用來放請求參數的。

就下面的例子而言，在有 query string 的組件中顯示 `this.$route.query.blogId` 就會顯示攜帶的參數。

```js
this.$router.push({
  path:
    "/" + username + "/blog/read",
  query: { blogId: blogId },
});
```

```html
<template>
  <div>
    {{ this.$route.query.blogId }}
  </div>
</template>
```

#### 跳轉路由的頁面位置

我在跳轉頁面時會發現，當我按下返回上個歷史頁面，頁面所在的滾輪位置（也就是檢視位置）會不固定，在 Router 的配置文件加入下面的參數能控制跳轉的位置。

```js
const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
    props: true,
    // 這裡可以控制跳轉時的滾動位置
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }

})
```

### Vuex

其實很多人一開始看 Vuex 的官方文檔看不懂，我也不意外，因為太晦澀了，看不懂。但是我在看完某個 B 站上的教學影片後，我開竅了，因為用文字很難描述清楚，建議這影片長度全部看完才能真正理解 Vuex，這裡奉上[影片位置](https://www.bilibili.com/video/BV1Ps411j7nq)。

{{< bilibili BV1Ps411j7nq >}}

### Vue 的 Request

我使用 `axios` 前後端分離跨域請求數據。

**安裝**

```
npm i vue-axios
```

**註冊組件**

```js
//  src/main.js
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
 
Vue.use(VueAxios, axios)
```

我通常使用三種方法請求：

1. Params
2. Form-data
3. 放 Body 的純 Js

> **註：我會為了整齊與易用，會讓請求單獨放在一個獨立的 Function 作為異步請求使用。**

#### Params

```js
import 'axios' from 'axios'

export default {
  // ...
  methods: {
    // ...
    async checkEmail() {
    var params = new URLSearchParams();
    params.append("email", this.email);
    axios
      .post(this.checkSameEmailURL, params)
      .then(response => {
        console.log(response);
        console.log(response.data);
        if (response.data.data === false) {
          return false;
        } else {
          return true;
        }
      })
      .catch(error => {
        console.log(error);
      });
    }
  }
}
```

#### Form-data

這裡要換成這樣的寫法比較方便，這裡設置 `Content-Type` 為 `'multipart/form-data'`（`'form-data'` 也可以）。

```js
import axios from 'axios'

export default {
  // ...
  methods: {
    // ...
    async LoginRequest() {
      let data = new FormData();
      data.append("email", this.email);
      data.append("password", this.password);
      axios
        .post(this.loginURL, data, {
          headers: { "Content-Type": "form-data" },
          transformRequest: [(data, headers) => data], //預設值，不做任何轉換
        })
        .then((response) => {
          console.log(response);
          console.log(response.data);
          this.loginSuccess = response.data.data;
          this.openDialog = false;
          if (this.loginSuccess) {
            this.dialog = true;
          }
        })
        .catch((error) => {
          console.log(error);
          this.openDialog = false;
          if (this.loginSuccess) {
            this.dialog = true;
          }
        });
    }
  }
}
```

#### 純 Js

```js
import axios from 'axios'

export default {
  // ...
  methods: {
    // ...
    async RegisterRequest() {
      axios({
        method: "post",
        url: this.registerURL,
        headers: {},
        data: {
          username: this.name,
          password: this.password,
          email: this.email,
          phone: this.phone,
        },
      })
        .then((response) => {
          console.log(response.data);
          this.registerSuccess = response.data.data;
          this.openDialog = false;
          this.dialog = true;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  }
}
```

#### Header 帶 Token 的請求

下面的例子中，在 **`header` 添加 `Authorization` 參數**，這裡要注意的是 **`header` 與 `data` 的參數位置，不管 `data` 裡面有沒有內容，即使是空的也要添加上去**。

```js
import axios from 'axios'

export default {
  // ...
  methods: {
    // ...
    async getAllChannels() {
      // 初始化
      this.showChannels = [];
      let jwt_token = Vue.localStorage.get("jwt_token");
      let UserID = Vue.localStorage.get("user_id");
      let data = new FormData();
      data.append("id", UserID);
      axios
        .post(this.requestGetAllChannelsURL, data, {
          headers: {
            "Content-Type": "form-data",
            Authorization: `Bearer ${jwt_token}`,
          },
          transformRequest: [(headers) => data], //預設值，不做任何轉換
        })
        .then((response) => {
          console.log(response.data);
          if (response.data.data === undefined) {
            // token 失效
            // 移除 token 和 id
            Vue.localStorage.remove("jwt_token");
            Vue.localStorage.remove("user_id");
            // 重新登入
            document.location.href = "/";
          } else if (response.data.data) {
            // 有找到數據
            this.showChannels = response.data.channels;
            // 推入 VueX
            this.$store.commit(UPDATE_ALL_CHANNELS, response.data.channels);
            console.log(this.showChannels);
            console.log(response.data.channels);
            // 請求 channel 的 message 並存入 VueX
            for (let i = 0; i < this.showChannels.length; i++) {
              this.getAllMessage(this.showChannels[i].id);
            }
          } else {
            // 沒找到數據
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  }
}
```

### 部署

關於部署，最後 Project 根目錄執行 `npm run build`，就能夠編譯生成最後的成品，就是 `dist/` 目錄的生成，將 `dist/` 目錄提出來部署到 Github Pages、Herokuv 或 Docker。

[部署 - Vue CLI](https://cli.vuejs.org/zh/guide/deployment.html#%E9%80%9A%E7%94%A8%E6%8C%87%E5%8D%97)

## 關於 NuxtJS

NuxtJS 是 Vue-cli 的簡化集合版，也就是如果你很懶，你可以用 NuxtJS，但是運行起來的速度可想而知，真的很慢。如果想要在開發調試時好一些，建議就用 Vue-cli。

## 關於用 Vue 寫桌面應用和 Android 端

Vue 寫桌面應用是 Electron-vue，寫 Android 是 Vue Native。然而，**不要嘗試使用任何 HTML 語言寫桌面應用和 Android 端，因為真的不如原生性能好**，現在大前端（使用一種技術實現多種平台的前端）還不夠成熟，我想起我之前調試 Electron-vue 的恐懼，不知道多少次記憶體佔滿，強制關機 (´;ω;`)

## Reference

- [Vue Router](https://router.vuejs.org/zh/installation.html)
- [vue的export default 還是沒能理解它是什麼 - IT 邦幫忙](https://ithelp.ithome.com.tw/questions/10196840)
- [Vue 'export default' vs 'new Vue' - stack overflow](https://stackoverflow.com/questions/48727863/vue-export-default-vs-new-vue)
- [Vue状态管理-Vuex简要教程 - BiliBili](https://www.bilibili.com/video/BV1Ps411j7nq)
- [vue-axios - npm](https://www.npmjs.com/package/vue-axios)
- [部署 - Vue CLI](https://cli.vuejs.org/zh/guide/deployment.html#%E9%80%9A%E7%94%A8%E6%8C%87%E5%8D%97)
