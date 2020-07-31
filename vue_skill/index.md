# VUE 技巧與經驗


## 前言

經過許久寫 VueJS 的經驗，實在是有些技巧我想要紀錄下來，畢竟當時我摸索了很久，從一開始的不擅長到後面的熟練，經歷的 Project 很多。希望能幫助新手快速掌握 VueJS。

這文章不會教你 Vue 基礎語法等詳細的基礎部份。所以在看這篇文章時需要一些 Vue 基礎。

## Vue-cli 腳手架使用

### 創建應用

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

| 檔案或文件 | 用途 |
| --- | --- |
| App.vue | 作為所有 SPA 頁面的起始根頁面 |
| assets/ | 靜態資源 e.g. CSS JS IMG |
| components/ | 自定義組件 |
| main.js | 作為所有 SPA 頁面的全局 JS 文件 |
| router/ | 路由配置文件 |
| store/ | Vuex 的狀態管理 |
| views/ | 頁面或子頁面 |

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

我自己寫**前端 HTTP 請求都是寫異步請求**，至於後端要怎樣的請求方式，前端真的無法決定，只是如果是需要測試數據，我建議是**使用 MockJS 作為前端測試數據用**，這樣也不需要前端一直填測試數據，被後端侷限。

#### 8 Static Source

既然我們要寫 CSS Style，那我們就要統一使用 Class 或 Id 去編寫元素樣式，Inline Style 並不好加以管理，也不好發現錯誤，

## Reference

