# Mariadb 啟動服務失敗


## 前言

在半年前，因為我的 ArchLinux 發行版系統在某次滾完系統後，我的 Mariadb 數據庫系統崩潰了，無法啟動服務，當時找了一下解決辦法，依然沒解決，網上雖然也有看到有些人也碰到跟我相似的問題，但都沒有具體好的解決辦法，像是
- [[SOLVED] Unable to start mariadb.service](https://bbs.archlinux.org/viewtopic.php?id=249543)
- [What to Do if MariaDB Doesn't Start](https://mariadb.com/kb/en/what-to-do-if-mariadb-doesnt-start/)
- [Failed to start MariaDB database server after upgrade to debian 9](https://unix.stackexchange.com/questions/375471/failed-to-start-mariadb-database-server-after-upgrade-to-debian-9)

今天終於在 ArchLinux-CN Telegram 技術群提問獲得了解決。

## 問題

我的 Linux 在某次更新完系統開機階段就會顯示我的數據庫啟動失敗，開機後我試著登入數據庫卻登入失敗。於是試著啟動 `mariadb.service` 於是出現下面的畫面：

![systemctl_start_mariadb_service_failed.png](https://imgpoi.com/i/K8VT4B.png "mariadb.service 啟動失敗")

於是我接著查看 `mariadb.service` 的  status：

![systemctl_status_mariadb.png](https://imgpoi.com/i/K86KSG.png "檢查 mariadb.service status")

依然沒找到問題所在，於是我進一步查看日誌：

```zsh
$ journalctl -xeu mariadb.service
```

![journalctl_xeu_mariadb.png](https://imgpoi.com/i/K86NF9.png "檢查 mariadb.service 日誌")

看完日誌我依然沒有解決思路，於是我問了一下 TG ArchLinux-CN 群友。

## 解決

群友沒有比較好的解決方法，於是**建議要不要將數據庫文件刪掉，重新新建新的數據庫**，然後我想想數據庫中也沒有比較重要的數據，平常我做完項目也會習慣性將數據庫導出 `*.sql` 文件，所以接受了這個方案。具體操作如下：

```zsh
# 刪除數據庫
sudo rm -rf /var/lib/mysql
# 添加新的數據庫
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
```

然後再次啟動 `mariadb.service` 就正常了。

![solute_question_mariadb_status.png](https://imgpoi.com/i/K86XG5.png "數據庫服務啟動成功")

## 結語

記得平常要養成數據庫備份的工作，不然真的會很慘。

## Reference

- [MariaDB (简体中文) - ArchWiki](https://wiki.archlinux.org/title/MariaDB_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87))
