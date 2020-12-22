# SSH 免密訪問服務器端


## 前言

有些新手不知道怎麼使用 SSH 連接服務器時不需要輸密碼，特此寫一下。

## SSH

### 前置工作

為了避免麻煩每次用 SSH 連的時候都要輸入 IP，可以在各自域名解析中添加服務器的 IP 給予命名映射。

兩台服務器都編輯 `/etc/hosts` 文件，添加以下內容，假設各自的公網 IP 是 `10.10.15.xx1`、`10.10.15.xx2`。

```sh
10.10.15.xx1 Server1
10.10.15.xx2 Server2
```

這樣子我們在服務器上連接另一個服務器時只需要輸入 `ssh Server1`、`ssh Server2`。

### 生成密鑰

我們假設有兩台服務器需要互相無密連接，這裡需要生成公鑰和私鑰，然後主機使用者之間共享公鑰。

> 如果是自己的本地電腦不需要輸入密碼連上服務器端，作法大同小異，把自己的電腦當作一台服務器即可。

先在本地生成密鑰，兩台服務器上都各自輸入下面指令，過程中如果有需要你輸入什麼，只需要一直輸入 Enter 就好了。

```zsh
ssh-keygen -t rsa # 當前使用者生成密鑰
```

如果你當前是普通使用者就會在 `/home/user/.ssh/` 目錄下找到 `id_rsa.pub` 公鑰。如果是 root 使用者，會在 `/root/.ssh/` 目錄裡找到。

### 互相共享公鑰

我們先將服務器一的公鑰文件傳給服務器二。

```
scp /root/.ssh/id_rsa.pub root@Server2:/root/.ssh/id_rsa.pub.Server1
```

接著在服務器二上面將雙方公鑰合成一個授權驗證文件。

> 註：關於 chmod 的權限設置數字計算，可以參考[菜鳥教學的文章](https://www.runoob.com/linux/linux-comm-chmod.html)。

```zsh
ssh Server2
cd /root/.ssh
# 將自己的公鑰加入
cat id_rsa.pub >> authorized_keys
# 將另一個服務器的公鑰加入
cat id_rsa.pub.Server1 >> authorized_keys
# 給予權限
chmod 644 authorized_keys #(important!!!)
# 將公鑰文件傳回另一個服務器
scp ~/.ssh/authorized_keys root@Server1:/root/.ssh/authorized_keys
```

然後再試試用 SSH 連接就不需要輸入密碼了。
