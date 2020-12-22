# 部署 SpringBoot、Flask 與 Vue 前端與雙後端完全分離 Web 項目


## 前言

由於這學期我選修了軟件測試的課程，我們以十人小組為單位，對我在暑假實訓所參與的 **MD-Blog 個人空間系統**項目進行 Web 測試，過程中我將那個項目部署到了**阿里雲的雲服務器**上。這篇文章我紀錄一下我部署 Web 的過程。

## 購買服務器

因為我是用**學生優惠**等方式白嫖到了半年的阿里雲雲服務器，所以這方面其實沒怎麼出錢，幸好在軟件測試項目結題才到期，不過用學生優惠購買最低配的雲服務器，三個月也只需要 28 元人民幣，騰訊雲我因為過不了實名認證就算了（...這裡我要吐嘈一下連雲服務器都要實名認證）。

總之購買好雲服務器後新增好實例，通常我是**建議使用 CentOS7 作為服務器的操作系統**，進入雲服務器的控制台，你會看到**服務器的公網 IP、私網 IP 和密碼**，密碼可以重新修改。

**這裡我們假設我們服務器的公網 IP 是 `1.2.3.4`。**

## 部署項目前的工作

### 安裝環境

在配置之前我們需要**將我們的 JDK、Python、MySQL、Nginx 在服務器端配置完畢**。

#### JDK

**注意：服務器安裝的 JDK 環境必須跟你的打包時使用的 JDK 版本一致，不然在運行後端 JAR 包時會報版本錯誤及不兼容的問題，要選擇 JDK1.8 以上的版本。**

這裡是建議自己在本地下載好 JDK 然後 SCP 上傳至服務器端，選擇 **Linux x64 Compressed Archive** 下載，**不要下錯成 Linux ARM 架構**的（因為我下錯過，沒仔細看名稱），壓縮包名大致為 `jdk-8u271-linux-x64.tar.gz`。

> 在用 SCP 上傳前要先進入服務器新增好資料夾，如果 SCP 上傳時指定到不存在的資料夾時，不會自動幫你新建一個新的資料夾。

```zsh
ssh root@1.2.3.4 # 使用 ssh 連上服務器

cd /home # 進入家目錄
mkdir jdk # 新建 jdk 資料夾
exit # 退出 ssh

# scp 上傳
scp ./jdk-8u271-linux-x64.tar.gz root@1.2.3.4:/home/jdk/jdk1.8.tar.gz
ssh root@1.2.3.4 # 使用 ssh 連上服務器

cd /home/jdk
tar -zxvf jdk1.8.tar.gz # 解壓縮
```

接著你就會看到目錄新增一個 JDK 目錄。下一步我們編輯環境變量：

```zsh
vi /etc/profile
```

加入以下內容：

> 自行修改目錄名，保持目錄名一致正確。

```sh
# jdk
export JAVA_HOME=/home/jdk/jdk1.8.0_271
export JAVA_JRE=/home/jdk/jdk1.8.0_271/jre
```

```zsh
source /etc/profile
java -version # 查看版本
```
#### Python

有些服務器默認只有 Python2，但是我們項目需要用到的是 Python3，我在這裡說一下怎麼讓 CentOS7 系統默認使用 Python3，不管系統是 Ubuntu 還是 CentOS 步驟都一樣，只差在安裝 Python3 的方法，

```zsh
python -V # 先查看 Python 版本
ls -al /usr/bin/python # 查看指向
yum update -y # 先更新環境
yum install python3 # 安裝 python3
python3 # 輸入 python3 驗證已經安裝好

# 會輸出以下信息表示已經安裝 python3 成功
Python 3.6.8 (default, Nov 16 2020, 16:55:22) 
[GCC 4.8.5 20150623 (Red Hat 4.8.5-44)] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

接下來將系統預設的 Python2.7 改成 Python3.6。

```zsh
# 重新命名備份
mv /usr/bin/python /usr/bin/python2.7.5
# 編輯 yum 避免連接指向錯誤
vi /usr/bin/yum
```

把頭部的

```sh
#!/usr/bin/python
```

改成

```sh
#!/usr/bin/python2.7.5
```

保存退出。然後重新建立新的連結：

```zsh
rm -rf /usr/bin/python
rm -rf /usr/bin/py
# 複製並重新命名
mv /usr/bin/python3.6 /usr/bin/python
```

接下來如果輸入 `python` 就會看到預設的 Python 是 3.6.8 版本。

#### MySQL

我比較偏好使用 MariaDB，這是 MySQL 的加強版。主要是 `root` 的密碼可以是空白。

```zsh
# Installing MariaDB Server 10.4
sudo yum install wget
wget https://downloads.mariadb.com/MariaDB/mariadb_repo_setup
chmod +x mariadb_repo_setup
sudo ./mariadb_repo_setup
sudo yum install MariaDB-server
sudo systemctl start mariadb.service
sudo mysql_secure_installation # 會要求你設置 root 密碼
```

在數據庫方面，我們經常遇到的錯誤是會**使用 `root` 去登入數據庫，常常碰到登不進去的問題**，怎麼修改 `root` 密碼也沒辦法。

這裡有個很好的解決方法，就是**新增一個一樣擁有 `root` 權限的使用者，並使用該使用者登入數據庫**就沒問題了。所以我每次都是使用這方法解決，推薦。

進入 MySQL：

```zsh
mysql
```

新增一個使用者為 `admin`，密碼為 `password`，並擁有所有權限：

> 可自行修改，不需要跟我一模一樣。

```sql
MariaDB [(none)]> GRANT ALL ON *.* TO 'admin'@'localhost' IDENTIFIED BY 'password' WITH GRANT OPTION;
```

刷新權限：

```sql
MariaDB [(none)]>FLUSH PRIVILEGES;
```

退出：

```sql
MariaDB [(none)]>exit;
```

#### Nginx

安裝 Nginx：

```zsh
yum install nginx
```

我們確認一下 Nginx 是否能正常運行，Nginx 預設的監聽端口是 80。

```zsh
# 輸入以下指令運行 Nginx
nginx
```

接下來在自己的瀏覽器上輸入 `1.2.3.4` 公網 IP，就會自動跳轉顯示 Nginx 啟動成功畫面。**前提是你已將服務器的 `80` 端口在防火牆打開了。**

```zsh
nginx  # 運行 nginx
nginx -t     # 試配置文件是否有語法錯誤
nginx -s reopen  # 重啟 Nginx
nginx -s reload    # 重新加載 Nginx 配置文件，然後以優雅方式重啟 Nginx
nginx -s stop   # 强制停止 Nginx 服務
nginx -s quit   # 優雅地停止 Nginx 服务（即處理完所有請求後再停止服務） 
```

### 新增項目目錄

我們預先將要部署的項目目錄新建好：

```zsh
cd /home
mkdir sxblog
cd sxblog
mkdir java python sql vue
```

### 開端口

> 我直接將系統的 **firewalld disable 掉**。

因為服務器會有防火牆這些功能，要到**服務器控制台的安全組的安全規則設置或是防火牆**將進方向和出方向需要**用到的後端端口與前端端口都打開**，不然外部訪問不了服務器，阿里雲的服務器有點奇妙的是無法一次將所有的端口打開，騰訊雲卻可以。

我使用的 Port 有 `8090`（SpringBoot）、`5000`（Flask）、`80`（Nginx 前端靜態文件代理）。

## 配置數據庫

將你項目使用的數據庫導出 `*.sql` 文件，並使用 SCP 上傳至雲服務器上。

> 修改一下自己要上傳的數據庫文件名稱，這裡假設我的數據庫文件是 `sxblog.sql`

```zsh
# 用 root 登入服務器端
scp ./sxblog.sql root@1.2.3.4:/home/sxblog/sql/sxblog.sql
```

接著將該數據庫文件導入數據庫系統：

```zsh
# 連上服務器
ssh root@1.2.3.4
# 使用文章上面我新增的使用者
mysql -u admin -p
```

```sql
MariaDB [(none)]>create database sxblog;
MariaDB [(none)]>use sxblog;
MariaDB [(sxblog)]>source /home/sxblog/sql/sxblog.sql;
```

## 後端部署

### Spring Boot打包

#### 修改配置文件

再打包後端 SpringBoot 項目前，你需要先修改自己項目的配制文件。在 SpringBoot 項目目錄中，要**確認依賴是否是固定的版本**，然後確認是否有加入 Maven 依賴：

> 使用 JAR 包啟動 Web 後端應用並不需要在服務器上配置 Tomcat 容器環境，因為 SpringBoot 有內置 Tomcat 運行，但是要**確保你的 JDK 版本是 1.8 以上，還有與服務器上的 JDK 版本一致**。

```xml
<!--將應用打包成可以運行的 JAR 包-->
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin<artifactId>
        </plugin>
    </plugins>
</build>
```

然後調整項目的配置參數：**將數據庫的連接使用者改成是服務器上數據庫的使用者**（像我前面新鄒的是 `admin`），數據庫密碼也要變，預設的**後端運行端口**只要不跟其他後端衝突就不用改，我這次的 SpringBoot 是 `8090` 端口，所以我在服務器的控制台安全組部份允許 `8090` 端口訪問。

在**有 `pom.xml` 的目錄**下執行 Maven 的指令：

```zsh
maven clean # 清理
maven package # 打包
```

接下來就會看到目錄下出現了一個 **`target` 資料夾**，裡面是打包成 Jar 包的目錄，進入該目錄並在本地運行試試：

```zsh
# 這裡的 xxxx 需要改成你實際打包出來的包名
java -jar xxxx.jar
```

進入瀏覽器輸入運行的 IP 和 Port 就知道有沒有問題，如果運行過程有報錯，可能是打包失敗，需要查看自己的源碼哪裡寫錯了。

#### 部署到服務器

確認都沒問題了之後我們就可以部署到服務器上了。

將整個 `target` 資料夾 SCP 上傳到服務器端。

```zsh
scp -r ./target root@1.2.3.4:/home/sxblog/java/target
```

進入服務器端運行 Jar 包，**使用 `nohup` 讓該進程在我們退出連結後依然能在後台運行，`>temp.txt` 是可以指定我們的日誌輸出文件**。如果沒有 nohup 就安裝一下。

```zsh
ssh root@1.2.3.4
# 進入 target/ 使用 nohup 運行 JAR
nohup java -jar xxxx.jar >temp.txt &
```

### Flask

> 記得如果你項目需要用到一些 Python 的包，需要自己用 pip 下載好，像是 **`flask` 和 `flask_cors`**。

關於 Flask 就相對 SpringBoot 的部署簡單很多，不需要經過打包，只需要確認服務器上有穩定的 Python3 版本。我們先將我們的 Flask 源碼目錄 SCP 上傳到雲服務器：

```zsh
scp -r ./flask root@1.2.3.4:/home/sxblog/python/flask
```

接下來進入服務器，改一下 Flask 的運行 IP 和端口，將運行的改成：


```python
if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)
```

接著後台運行 Flask：

```zsh
nohup python ./flaskApi.py > temp.txt &
```

如果你的 Flask 應用沒有寫 `main` 函數，需要自己在運行指令那裡指定：

```zsh
export FLASK_APP=flaskApi.py
nohup flask run -h 0.0.0.0 -p 5000 > temp.txt &
```

最後還是提醒要去雲服務器控制台將 `5000` 端口打開。

## 前端部署

開始前我要提醒一下，**不要想在服務器上配置 NodeJS 環境，然後將 Vue 源碼放到服務器上使用 npm 去代理運行**，這想法是非常蠢的事，因為這作法會**耗盡服務器的資源**，但沒關係，每個初學者可能會遇到這件事，代表你有去思考如何部署前端。

### 修改請求 IP

**前端向後端請求的 IP 要修改成服務器上的公網 IP**，這裡非常重要，所以自己平時在寫前端時就應該養成**習慣將請求接口全面的管理**，像我就是使用 vueX 去管理，擷取部份如下：

```js
// api.js
const api = {
    state: {
        // spring flask base url
        springBaseURL: "http://127.0.0.1:8090",
        flaskBaseURL: "http://127.0.0.1:5000",
        // account signIn signUp
        signInURL: "/user/signIn",
        signUpURL: "/user/signUp",
        // check the username if it is exist
        usernameVerifyURL: "/user/username_verify",
        verifyEmailURL: "/user/email_verify",
        forgotPasswordURL: "/user/find_passwd",
        // account setting
        getUserDataURL: "/user/get_data",
        updateUserUrl: '/user/change_data',
        updateUsernameURL: "/user/change_data",
        updateEmailURL: "/user/change_data",
        // ...
        // tags
        addNewTagURL: "/insertTag",
        deleteTagURL: "/deleteTag",
        // comment
        getCommentByBlogIdURL: "/getCommentListByBlog",
        addNewCommentURL: "/insertComment",
        // news
        getSchoolNewsURL: "/getNews",
        getGamesNewsURL: "/getEpicFreeGame"
    },
    mutations: {

    },
    actions: {},
    getters: {}
}

export default api;
```

於是我只需要修改上面那兩個參數即可，改成 `springBaseURL: "http://1.2.3.4:8090"`、`flaskBaseURL: "http://1.2.3.4:5000"`，至於**為什麼要修改成公網 IP 而不是私網或是 `127.0.0.1`、`0.0.0.0` 之類的**，這是因為你的**前端網頁相當於將靜態文件傳到瀏覽器給使用者瀏覽你的網頁**，與你的服務器是分開的，如果要請求數據就等同於**從外部訪問服務器內部，所以必須使用公網 IP**。

### 前端打包

在前端的項目目錄**執行 `npm run build` 就可以將整個項目打包成靜態文件**，並存於項目目錄的 `./dist` 資料夾。

```zsh
npm run build # 前端打包指令
```

打包結束後將打包好的靜態文件使用 VScode 的一個 [Live Server](https://open-vsx.org/extension/ritwickdey/LiveServer) 的 Plugin，使用該 Live Server 對 dist 根目錄的 `index.html` 進行代理，並在瀏覽器上測試前端是否可以向服務器上的後端進行請求回應，如果沒有問題，就代表 `./dist` 資料夾可以 SCP 上傳至服務器上了。

```zsh
# 上傳至服務器
scp -r ./dist root@1.2.3.4:/home/sxblog/vue/dist
```

### 使用 Nginx 代理

接下來我們要使用 Nginx 對前端靜態文件進行代理，我們先編輯 `/etc/nginx/nginx.conf`

```zsh
vi /etc/nginx/nginx.conf
```

編輯成如下：

> 以下有些參數需要自己修改，像是 `公網 IP`、`靜態文件路徑配置`。

```sh
user  root;  # 用戶
worker_processes auto;
error_log  /www/wwwlogs/nginx_error.log  crit;
pid        /www/server/nginx/logs/nginx.pid;
worker_rlimit_nofile 51200;

events
{
    use epoll;
    worker_connections 51200;
    multi_accept on;
}

http
{
    include mime.types;
    # include luawaf.conf;
    include proxy.conf;
    default_type  application/octet-stream;
    server_names_hash_bucket_size 512;
    client_header_buffer_size 32k;
    large_client_header_buffers 4 32k;
    client_max_body_size 50m;
    sendfile   on;
    tcp_nopush on;
    keepalive_timeout 60;
    tcp_nodelay on;
    fastcgi_connect_timeout 300;
    fastcgi_send_timeout 300;
    fastcgi_read_timeout 300;
    fastcgi_buffer_size 64k;
    fastcgi_buffers 4 64k;
    fastcgi_busy_buffers_size 128k;
    fastcgi_temp_file_write_size 256k;
    fastcgi_intercept_errors on;
    gzip on;
    gzip_min_length  1k;
    gzip_buffers     4 16k;
    gzip_http_version 1.1;
    gzip_comp_level 2;
    gzip_types     text/plain application/javascriptapplication/x-javascript text/javascript text/cssapplication/xml;
    gzip_vary on;
    gzip_proxied   expired no-cache no-store private auth;
    gzip_disable   "MSIE [1-6]\.";
    limit_conn_zone $binary_remote_addr zone=perip:10m;
            limit_conn_zone $server_name zone=perserver:10m;
    server_tokens off;

    # 訪問日誌配置在這

    # 自定義名為 main 的日誌格式

    log_format main '$remote_addr - $remote_user [$time_local] "$request"'
    '$status $body_bytes_sent "$http_referer" '
    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /www/wwwlogs/access.log main;  # 這裡是具體路徑

    # 這裡是我們需要注意的東西，也是配置主要需要修改的東西
    server {
        # 修改此處，ip 要是公網 ip
        # 我們訪問 119.29.143.49：80
        listen       80;               # 端口
        server_name  119.29.143.49;    # 服務器名， 要代理的服務器的名字

        # 此處修改靜態文件路徑
        # 存放静態資源的文件路徑
        root /home/sxblog/vue/dist;
        
        # ngix的配置文件
        include /www/nginx/conf/*.conf;

        location / {
        }

        error_page 404 /404.html;
            location = /40x.html {
        }

        error_page 500 502 503 504 /50x.html;
            location = /50x.html {
        }

        # 如果 vue-router 是 history 模式，加上下面這段
        # vue-router 配置
        location / {
            try_files $uri $uri/ @router;
            index index.html;
        }
        location @router {
            rewrite ^.*$ /index.html last;
        }
    }
    include /www/server/panel/vhost/nginx/*.conf;
}
```

值得注意的是這配置文件尾部是 vue-router 的配置：

```sh
# vue-router 配置
location / {
    try_files $uri $uri/ @router;
    index index.html;
}
location @router {
    rewrite ^.*$ /index.html last;
}
```

這是因為 **Vue-router 默認的模式是 `hash`**，而我在寫前端時**設定的模式是 `history` 模式**，如果沒加上上面那段，刷新頁面就會跳轉到 404，因為會包含到 `#`。

最後運行：

```zsh
nohup nginx &
```

**這樣就搭建好一個 Web 項目了。 (〃∀〃)**

## 結語

各位記得要實際去操作才能有經驗上的成長，如果只是看看我的這篇文章就以為自己懂了如何部署，這樣是根本不會部署的，所謂實踐出真知，就是這樣的道理。

## Reference

- [SpringBoot 项目部署到服务器的两种方式 - CSDN](https://blog.csdn.net/CSDN2497242041/article/details/106911182)
- [Linux Centos7 升级python2至python3 - 知乎](https://zhuanlan.zhihu.com/p/33660059)
- [How to Install Python 3 on CentOS 7](https://www.liquidweb.com/kb/how-to-install-python-3-on-centos-7/)
- [指定端口启动Flask - CSDN](https://blog.csdn.net/muskjp/article/details/106814855?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromBaidu-1.not_use_machine_learn_pai&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromBaidu-1.not_use_machine_learn_pai)
- [Nginx命令大全 - CSDN](https://blog.csdn.net/spark_csdn/article/details/80836374)
- [手把手教 Nginx 部署 Vue 项目 - 掘金](https://juejin.cn/post/6844904096973979662)
- [简单前后端分离项目部署 - HackMD](https://hackmd.io/RC7R3BMjTBCWhlMwx1aLzA)

