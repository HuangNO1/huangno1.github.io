---
title: "Flask 跨域設置"
published: 2020-08-05T20:49:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-08-05T20:49:26+08:00
draft: false
description: ""
license: ""
tags: ["Python", "Flask", "CORS", "跨域", "Web"]
category: Python 
image: ./index/compressed/flask_cors.png
lang: zh-TW
---

## 前言

關於 Flask 跨域接收請求的設置真的蠻好配置的，我想並不難，但我還是稍微寫一下，避免新手不知道怎麼做。

## 安裝

跨域有 **flask_cors** 這個工具。

```bash
pip install flask_cors
```

## 配置

```py
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# enable CORS
CORS(app)

if __name__ == "__main__":
    app.run(debug=True)
```