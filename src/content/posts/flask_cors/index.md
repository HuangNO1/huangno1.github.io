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

Flask 接收跨域請求其實不難，通常只要搭配 `flask-cors` 就能快速完成設定。這篇簡單記錄一下最基本的做法，避免剛接觸 Flask 的人一時找不到方向。

## 安裝

Flask 常見的跨域套件是 `flask-cors`。

```bash
pip install flask_cors
```

## 配置

```py
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# 啟用 CORS，預設會允許所有來源
CORS(app)


@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"})


if __name__ == "__main__":
    app.run(debug=True)
```
