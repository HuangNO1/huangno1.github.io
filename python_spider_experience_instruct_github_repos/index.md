# Python 爬蟲實戰教學 - Github 倉庫特徵爬取


## 前言

因為這期學期上半我選了機器學習與數據挖掘，我在課程小組項目中負責了爬蟲這個部份，我會在這篇文章紀錄一下我的過程，並教導大家如何實戰 Python 爬蟲。

## 項目說明

我們這個小組項目的爬取需求是爬取 Github 項目的各個特徵，這篇文章會分兩個部份，**第一個部份是使用 `BeautifulSoup` 爬取原生的 HTML 頁面**，**第二部份是使用 Github API**，其中第二部份包含了每個倉庫的 Commits、pull_request 等月變化量。

> P.S. 其實是我在剛開始寫爬蟲的時候，覺得 GIthub API 回傳的數據特徵有點少，所以就直接爬 Github 原生 HTML 頁面，沒有去爬月變化的數據，結果組長說要我重新去寫爬蟲，要爬月變化數據。

## 開發前準備

### Github 私人 Token

因為我們需要爬取 Github 的網頁和使用 Github API，我們需要申請 Personal token，**避免我們的請求達到 Rate Limit**，Github 有限制一分鐘內的請求次數。

![github_personal_token.png](https://imgpoi.com/i/K863SE.png "Github 私人 token 申請")

### 請求設定

我們請求在請求頁面時需要模仿瀏覽器的請求方式



