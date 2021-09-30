# Ubuntu 中 Python2 升級到 Python3 & pip 安裝使用


## 前言

上一篇文章是寫到我在上海實習時在熟悉機器的網路配置，然而這是又到了我配置 Python 環境的踩坑之路。

## 根據 apt-get 中的 Python3 版本更新

這機器上的 Ubuntu，因為用 apt-get 更新後的 Python3 版本只有到 `3.5`。

我輸入 `sudo apt install python3.6` 顯示沒有這個包，然後輸入 `sudo add-apt-repository ppa:deadsnakes/ppa` 添加列表也顯示沒這語法。

```zsh
sudo apt update
sudo apt install python3 # 安裝下來預設是 3.5，沒有更高版本
```

現在終端機輸入 `python -V` 還會是 `python2.7`，這時我們需要重新建立軟連接，在 `/usr/bin/` 中會發現我們新安裝的 `python3.5` 二進制文件。

```zsh
sudo cp /usr/bin/python /usr/bin/python_bak # 備份舊的
sudo rm /usr/bin/python # 移除
sudo ln -s /usr/bin/python3.5 /usr/bin/python # 建立新的軟連結
```
接下來輸入 `python -V` 就是 `pyhton3.5` 的版本了。

## 安裝更高的 Python3 版本

> f"{X.x}" 這樣的 f string 語法是 Python3.6 以上才有的。所以才想要裝更高的版本。

因為我想要在這個機器上安裝更高的 Python 版本，我要裝 Python 3.9.7。

由於要自己下載 Python，未編譯的包，然而有牆的限制，所以我建議先在自己的電腦上將 Python 3.9 的壓縮包（`Python-3.9.7.tar.xz`）下載下來，然後 SCP 傳到機器上。

```zsh
# 上傳到機器
scp Python-3.9.7.tar.xz root@192.168.3.127:/home/Python-3.9.7.tar.xz
```

SSH 連上機器後，進入機器解壓縮。

```zsh
ssh root@192.168.3.127
cd /home
tar xvf Python-3.9.7.tar.xz # 解壓縮
cd Python-3.9.7
```

安裝相關插件補丁：

> **一定要安裝這些補丁**，不然編譯安裝 Pyhton 時會報錯。

```zsh
sudo apt-get install build-essential libsqlite3-dev sqlite3 bzip2 libbz2-dev \
zlib1g-dev libssl-dev openssl libgdbm-dev libgdbm-compat-dev liblzma-dev libreadline-dev \
libncursesw5-dev libffi-dev uuid-dev
```

接著進入 Python3.9.7 目錄，設定安裝目錄：

我是直接輸入 `./configure`。

```zsh
# 預設安裝位置
./configure
# 指定安裝位置
./configure --prefix=/usr/local
# 運行多個測試來優化 Python 二進制文件，會使構建變慢
./configure --enable-optimizations
```

編譯構建：

```zsh
# 構建
sudo make
# 開四個線程去編譯
sudo make -j 4
```

接著安裝，安裝的過程會比較慢，至少我等了很久：

> 我一不小心就都運行了@@，安裝了兩次，總之最後有產生 `python3.9` 在 `/usr/local/bin`

```zsh
# 直接覆蓋 python3
sudo make install
# 會產生新的版本
sudo make altinstall
```

由於我安裝的 Python 二進制文件在 `/usr/local/bin/pyhton3.9`，建立新的軟連結要注意文件安裝在哪裡。

```
sudo cp /usr/bin/python /usr/bin/python_bak # 備份舊的
sudo rm /usr/bin/python # 移除
sudo ln -s /usr/local/bin/python3.9 /usr/bin/python # 建立新的軟連結
```

接下來輸入 `python -V`，就是 `python3.9.7` 了。

## 安裝 pip

不知道為什麼 `pip3` 不能 `-i` 使用國內鏡像，還有安裝包上的限制，`pip3` 就很多指令顯示無效，所以我還是想要直接使用 `pip`

```zsh
sudo apt-get install software-properties-common
sudo apt-get update
sudo apt-get install python-pip
```

這樣 pip 就裝好了。

如果需要設置國內鏡像源建議設置**阿里云**的。

- 清华：https://pypi.tuna.tsinghua.edu.cn/simple
- 阿里云：http://mirrors.aliyun.com/pypi/simple/
- 中国科技大学 https://pypi.mirrors.ustc.edu.cn/simple/
- 华中理工大学：http://pypi.hustunique.com/
- 山东理工大学：http://pypi.sdutlinux.org/
- 豆瓣：http://pypi.douban.com/simple/

```zsh
# 臨時使用鏡像安裝某個包
pip install -i http://mirrors.aliyun.com/pypi/simple/ flask
```

如果想要永久使用就在 `~/.pip/pip.conf` 填入以下內容，沒有可以自己創建。

```zsh
[global]
index-url = http://mirrors.aliyun.com/pypi/simple/
[install]
trusted-host=mirrors.aliyun.com
```

## 其它可能遇到的問題

### 安裝套件時報錯

如果你們出現下面的類似錯誤：`ImportError: No module named '_ctypes'`，那代表你們沒有安裝 `libffi-devel` 這個套件。

```zsh
Traceback (most recent call last):
   File "<stdin>", line 1, in <module>
   File "/usr/local/lib/python3.4/multiprocessing/context.py", line 132, in Value
      from .sharedctypes import Value
   File "/usr/local/lib/python3.4/multiprocessing/sharedctypes.py", line 10, in <
module>
   import ctypes
   File "/usr/local/lib/python3.4/ctypes/__init__.py", line 7, in <module>
      from _ctypes import Union, Structure, Array
ImportError: No module named '_ctypes'
```

重新安裝好套件後，再重新裝一次 Python 就好了。

```zsh
sudo apt-get install libffi-dev # 安裝套件
sudo make install # 安裝 python
```

## Reference

- [ubuntu 如何升级python 2.7 到 3.5 - 簡書](https://www.jianshu.com/p/2262cbe52b3c)
- [How do I install Python 3.6 using apt-get? - ask ubuntu](https://askubuntu.com/questions/865554/how-do-i-install-python-3-6-using-apt-get)
- [How to Install Python 3.9 on Ubuntu 20.04 - Linuxize](https://linuxize.com/post/how-to-install-python-3-9-on-ubuntu-20-04/)
- [altinstall error - ask ubuntu](https://askubuntu.com/questions/1047445/altinstall-error)
- [ubuntu 18.04 安装python3.9.4 + pip21.1.1 - CSDN](https://blog.csdn.net/zyklbr/article/details/116355040)
- ["E: Unable to locate package python-pip" on Ubuntu 18.04 [duplicate] - stack overflow](https://stackoverflow.com/questions/55422929/e-unable-to-locate-package-python-pip-on-ubuntu-18-04)
- [Python3: ImportError: No module named '_ctypes' when using Value from module multiprocessing - stack overflow](https://stackoverflow.com/questions/27022373/python3-importerror-no-module-named-ctypes-when-using-value-from-module-mul)
- [python学习笔记 pip安装加速&&python淘宝镜像安装包 - CSDN](https://blog.csdn.net/a12355556/article/details/108307340)
