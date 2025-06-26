---
title: "MySQL 的基礎語法使用筆記"
published: 2020-12-24T15:17:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-12-24T15:17:26+08:00
draft: false
description: ""
license: ""
tags: ["MySQL", "Database"]
category:  Database
image: "./index/compressed/mysql_learn_note_basic.png"
lang: zh-TW
---

## 前言

自己經常用資料庫（數據庫），但是語法如果太久沒用都會忘光光，我就在這篇文章當作一個小抄，不然每次碰到 MySQL 語法問題都要 Google 一下語法使用，很麻煩。

## MySQL 使用工具

我自己是比較偏好使用 MariaDB，因人而異，總之我這篇文章就略過什麼 MySQL 安裝過程，這些都是自己探索安裝一下就可以了。

```zsh
# 進入 MySQL 指令
# 登入使用者為 root
mysql -u root -p
```

## 基礎語法

自行修改中文成英文。不要真的輸入中文當資料庫名稱或資料表名稱喔。

| 操作功能 | MySQL 語法格式 | 說明 |
| --- | --- | --- | --- |
| 列出所有資料庫 | show databases; | |
| 建立資料庫 | create database 資料庫名稱; | |
| 刪除資料庫 | drop database 資料庫名稱; | |
| 使用資料庫 | use 資料庫名稱; | |
| 建立資料表 | create table 資料表名稱(<br />sn integer auto_increment primary key,<br />name char(20), <br />mail char(50), <br />home char(50), <br />messages char(50)<br />); | 常用資料庫資料型態<br />1. INT (整數) <br />2. CHAR (1~255字元字串) <br />3. VARCHAR (不超過255字元不定長度字串) <br />4. TEXT (不定長度字串最多65535字元) |
| 列出所有資料表 | show tables; | |
| 列出資料表欄位資訊  | describe 資料表名稱;  | |
| 修改資料表欄位 | alter table 資料表名稱 change column 原來欄位名稱 新欄位名稱資料型態; | |
| 新增資料表欄位  | alter table 資料表名稱 add column 欄位名稱 資料型態; | |
| 刪除資料表欄位 | alter table 資料表名稱 drop column 欄位名稱; | |
| 刪除資料表 | drop table 資料表名稱; | |
| 清空資料表 | truncate table 資料表名稱; | 只清除資料並保留結構、欄位、索引 … |
| 插入欄位資料 | insert into 資料表名稱(欄位1,欄位2,欄位3,欄位4, ...... 欄位N)<br />values('值1','值2','值3','值4', ...... '值N'); | |
| 更新修改欄位資料 | update 資料表名稱 <br />set 欄位1='值1',欄位2='值2',欄位3='值3',... 欄位N='值N' <br />where 條件式 (例如 sn='5' 或 name='塔司尼' ); | |
| 查詢單一欄位資料 | select 欄位名 from 資料表名稱; | |
| 查詢多個欄位資料 | select 欄位名, 欄位名, 欄位名 from 資料表名稱; | |
| 查詢欄位資料的唯一值 | select distinct 欄位名 from 資料表名稱; | 重複值只列一次 |
| 查詢所有欄位資料 | select * from 資料表名稱; | |
| 條件式查詢 | select * from 資料表名稱 where 條件式 (例如 sn='5'); |（=, <, >, !=）|
| 條件式查詢 and | select * from 資料表名稱 where 條件式1 and 條件式2; | |
| 條件式查詢 or |  select * from 資料表名稱 where 條件式1 or 條件式2; | |
| 查詢某一範圍 between | select * from 資料表名稱 where 欄位名 between 值1 and 值2; | |
| 查詢空值欄位的資料 | select * from 資料表名稱 where 欄位名 is null; | 相反： 	not null; |
| 查詢特定筆數資料 | select * from 資料表名稱 limit 8, 10; | 第9筆開始選取10筆 |
| 查詢結果遞增排序 | select * from 資料表名稱 order by 欄位名; | |
| 查詢結果遞減排序 | select * from 資料表名稱 order by 欄位名 desc ; | |
| 查詢比對字串列出單一欄位 | select 欄位名 from 資料表名稱 where 欄位名 like '%字串%'; | |
| 查詢比對字串列出所有欄位 | select * from 資料表名稱 where 欄位名 like '%字串%'; | |
| 刪除條件值資料 | delete from 資料表名稱 where 條件式 (例如 sn='5' 或 id='91001' ); | |
| 刪除條件值資料 | delete from 資料表名稱 where 條件式1 and 條件式2; | |
| 刪除條件值資料 | delete from 資料表名稱 where 條件式1 or 條件式2; | |
| 比對刪除條件值資料 | delete from 資料表名稱 where 欄位名 like '%字串%'; | |

## 匯出資料庫

**mysqldump** 是個匯出 Database (資料庫) 的指令，也是 IT 人員最常用到的 MySQL 資料庫匯出方法之一。

```zsh
mysqldump -u root -p 資料庫名稱 > database_name.sql
```

- --all-databases: 匯出所有資料庫。
- --no-data: 不匯出資料。
- --routine: 匯出 stored routines (預存程序) 和自訂函數。
- --single-transaction: 該選項從伺服器轉儲數據之前發出一個BEGIN SQL- 句。
- --skip-lock-tables: 不鎖定 table (資料表)。
- --trigger: 匯出 trigger (觸發器)。

## 匯入資料庫

匯入 `*.sql` 最簡單的辦法的辦法就是進入 MySQL 建立一個資料庫並使用該資料庫，然後直接加載 `*.sql`。

進入 MySQL：

```zsh
mysql -u root -p
```

建立並加載資料表，加載的資料庫位置是在檔案系統中的絕對位置。

```sql
mysql > create database test;
mysql > use test;
mysql > source /home/user/test.sql;
```

## 新建資料庫使用者

我一般是建議新建一個跟 root 擁有一樣權限的使用者。

```sql
mysql > GRANT ALL ON *.* TO 'admin'@'localhost' IDENTIFIED BY 'password' WITH GRANT OPTION;
mysql > FLUSH PRIVILEGES;
mysql > exit
```

## Reference

- [MySQL 語法匯整 - 凍仁的筆記](http://note.drx.tw/2012/12/mysql-syntax.html)
- [How To Install MariaDB on Ubuntu 18.04 - Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-mariadb-on-ubuntu-18-04)