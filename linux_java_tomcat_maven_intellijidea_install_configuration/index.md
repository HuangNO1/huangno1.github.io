# 在 Linux 配置 Java 開發環境到虛擬硬碟 - Java8、Tomcat8、Maven3、IntelliJ IDEA

<!--2020/01/28 edited by Huang Po-Hsun-->

## 前言

我在這篇會分享我是如何在 Arch 上配置 Java 的開發環境。再來我必須說的是，我這個**適用於你的電腦的 Linux SSD (root) 空間不夠的情況**，大部分的人是 Windows 與 Linux 雙系統，像我只能把 SSD 割 30GB 給我 Linux (這是因為我電腦上的 Windows 有被廠商更改過，限制了割出的量)，而虛擬硬碟卻可以割到 100GB 以上，我會教大家如何將 Java 環境裝到 **/home**。如果覺得自己 SSD 夠用，就**直接從 AUR 上 yay 下來，直接略過此次教學 (ﾒ ﾟ皿ﾟ)ﾒ**，畢竟會有人覺得我這樣的做法讓系統管理有點髒。不過關於環境變量的配置可以參考我這篇文章，不管是裝在 SSD 還是 HDD。

## JDK 版本選擇

### JDK 1.xxx 和 JDK xxx.0 比如 jdk 1.8 和 jdk 8

> 參考自[這網站](https://www.itread01.com/content/1548891008.html)的介紹。

Sun 公司看別人的語言更新都更新到 xxx 了，自己的 Java 版本還是 1 點幾，讓人感覺很落後，所以在 `jdk 1.6` 的時候對外發布稱之為 `jdk 6.0` ，讓人感覺更先進點。在寫 Java 的人眼裡都是叫 `1.6` 的，基本沒人說 `6.0.`。

### 推薦的 JDK 版本

> 參考自[這篇文章](https://zhuanlan.zhihu.com/p/51228073)。

我推薦的是 **JDK 1.8** 版本，也就是 **Java 8**，因為它足夠穩定，對一些套件的依賴與支持完整高，也是目前新手入門最好的 JDK 版本。至於 1.8 以前的版本都不推薦因為過於老舊，目前 JDK 1.8 以後的版本不怎麼穩定，但如果想要嘗試新的開源項目可以嘗試最版本。

## 下載 JDK 1.8

至 Oracle Java 下載處下載你要的 JDK 包，[JDK 1.8](https://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html)。

> 註：下載需要註冊 Oracle 帳號，這裡要感謝網上的有些善心人士提供共享帳號。
> 
> Oracle 帳號：2696671285@qq.com
> 
> Oracle 密碼：Oracle123
> 
> [帳號來源](https://www.cnblogs.com/AlanLee/p/8615307.html)

像我是下載這個。

![jdk.png](https://i.loli.net/2020/01/28/uK7lF3CDyJbormz.png "JDK 1.8")

下載下來 `*.tar.gz` 後將其解壓，將資料夾放入 `~/.local/usr/lib/jvm/` 路徑裡，如果沒有路徑資料夾就自己創建。

## 下載 Tomcat 8

Tomcat 這裡我目前也比較推薦 Tomcat 8，目前 Tomcat 最新版出到 9，但是我實際做項目的時候發現 Tomcat 9 對於代碼的規範要求很多，不按照 Tomcat 9 的規範走會有很多警告，也影響開發時的觀感。

下載 [Tomcat 8](https://tomcat.apache.org/download-80.cgi)

![tomcat.png](https://i.loli.net/2020/01/28/REZIPY6QolVgM4k.png "Tomcat 8")

解壓後將資料夾放入 `~/.local/opt/tomcat/`。如果沒有路徑資料夾就自己創建。

## 下載 Maven 3

[Maven 3](https://maven.apache.org/download.cgi)

![maven.png](https://i.loli.net/2020/01/28/krLAJHxRKjfE24t.png "Maven 3")

解壓後將資料夾放入 `~/.local/opt/maven/`。如果沒有路徑資料夾就自己創建。

## 編輯 Tomcat

> 假設你的 JDK 版本是 `jdk1.8.0_241`。Tomcat 是 `apache-tomcat-8.5.47`。Maven 是 `apache-maven-3.6.2`。如果你的版本跟我不一致，就自行修改版本號。

編輯 `~/.local/opt/tomcat/apache-tomcat-8.5.47/bin/startup.sh`，於文件末添加 JDK、JRE 配置內容：


```sh
#java8
export JAVA_HOME=~/.local/usr/lib/jvm/jdk1.8.0_241
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH

#tomcat8
export TOMCAT_HOME=~/.local/opt/tomcat/apache-tomcat-8.5.47
```

## 編輯 .profile

在 `~/.profile` 添加以下內容，編輯完後執行 `source ~/.profile` 重新加載環境變量，使配置生效。然後登出登入一次電腦。

```sh
#java8
export JAVA_HOME=~/.local/usr/lib/jvm/jdk1.8.0_241
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH

#tomcat8
export CATALINA_HOME=~/.local/opt/tomcat

export CLASSPATH=.:$JAVA_HOME/lib:$CATALINA_HOME/lib

export PATH=$PATH:$CATALINA_HOME/bin

export CLASSPATH=$CLASSPATH:%JAVA_HOME/lib/tools.jar

export TOMCAT_HOME=~/.local/opt/tomcat/apache-tomcat-8.5.47
    
export CATALINA_HOME=$TOMCAT_HOME

export PATH=$PATH:TOMCAT_HOME/bin

#maven3
MAVEN_HOME=~/.local/opt/maven/apache-maven-3.6.2
    
export MAVEN_HOME

export PATH=${PATH}:${MAVEN_HOME}/bin
```

## 測試是否配置成功

### JDK

在 Konsole 輸入 `java -version` 就會顯示 Java 版本。

![java_version.png](https://i.loli.net/2020/01/28/UMf34WKV7a8pHux.png "Java 版本")

### Tomcat

於 `~/.local/opt/tomcat/apache-tomcat-8.5.47` 目錄下打開 Konsole，啟動 Tomcat。

```zsh
./startup.sh
```

![tomcat_startup.png](https://imgpoi.com/i/KL8KL9.png "Tomcat 運行")

接著打開瀏覽器輸入 `http://127.0.0.1:8080/`或`http://localhost:8080/` 會出現以下畫面，此時代表已經配置成功。

![tomcat_test.png](https://i.loli.net/2020/01/28/oyHYZEkUzM4IBCw.png "Tomcat 運行結果")

接下來輸入 `./shutdown.sh` 中止 Tomcat。

![tomcat_shutdown.png](https://imgpoi.com/i/KL8N95.png "中止 Tomcat")

### Maven

在 Konsole 輸入 `mvn -v` 就會顯示你的 Maven 版本。

![maven_version.png](https://imgpoi.com/i/KL8LTM.png "Maven 版本")

## IntelliJ IDEA 透過國內阿里云鏡像加速建立 Maven 項目

關於如何使用 IntelliJ IDEA 建立 Tomcat 項目等我就不在這裡細說了，這些基礎的知識你們可以參考網上其它教學。

### 添加國內鏡像

編輯 `~/.local/opt/maven/apache-maven-3.6.2/conf/` 目錄下的 **settings.xml**，於文末添加以下內容。

```xml
<mirror>
        <id>nexus-aliyun</id>
        <mirrorOf>*</mirrorOf>
        <name>Nexus aliyun</name>
        <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
```

### IntelliJ IDEA 創建 Maven 項目

IntelliJ IDEA 創建 Maven 項目，如果是一般的 Maven 項目就在 `Create fome archetype` 選擇 **maven-archetype-quickstart**，如果是 Web 項目就選擇 **maven-archetype-webapp**。我這裡就演示建立 Web 項目。

**建立項目**

![IDEA_maven_create.png](https://i.loli.net/2020/01/28/fKXysDSFx4RVgmb.png "新建 Maven 項目")

**項目目錄位置**

![IDEA_maven_location.png](https://imgpoi.com/i/KL8F32.png "設置 Project 位置")

**添加屬性**

創建 Maven 項目時手動添加一個 `archetypeCatalog` 配置，其值設為 `internal`。

![IDEA_maven_property.png](https://i.loli.net/2020/01/28/HPamGC5LQ6d4TtN.png "添加屬性")

Finish 後就建立好了一個 Maven Web 項目。

## 添加 Tomcat Server

在右上角的 **add configuration** 添加 Tomcat Server。

![IDEA_tomcat_config.png](https://i.loli.net/2020/01/28/Hm89UXOCorVBWSn.png "添加 Tomcat Server 設置")

## Reference

- [ubuntu16.04安装及配置tomcat,IDEA集成tomcat及部署web项目，IDEA通过阿里云镜像加速maven项目创建](https://blog.csdn.net/MR_Peach07/article/details/69666177)
- [java 版本區別，java SE是什麼，下載JDK時各個名稱的含義](https://www.itread01.com/content/1548891008.html)
- [jdk版本的选择（推荐1.8）- 知乎](https://zhuanlan.zhihu.com/p/51228073)
- [Oracle官网登录下载资源账号密码共享 - AlanLee 博客園](https://www.cnblogs.com/AlanLee/p/8615307.html)
- [Tomcat ( 三 )：測試 Tomcat](https://blog.xuite.net/linbty/worldknowledge/61415866-Tomcat+%28+%E4%B8%89+%29%EF%BC%9A%E6%B8%AC%E8%A9%A6+Tomcat)
