# Flask 中使用 MySQL


## 前言

我一開始學 Flask 時是看 Flask 的官方教學學的，不得不說[ Flask 官方文檔](https://flask.palletsprojects.com/en/1.1.x/)寫得很好。因為 **Flask 官方教學是使用 Sqlite 做為數據庫**，但是我想要使用 MySQL，在自己網上搜索，加上自己的鑽研手做，這裡紀錄我摸索的結果。因為我偏好使用原生 SQL 語法，所以下面的數據庫操作都是原生語句，例子是我之前做的某個項目裡面拿出來的。

## 安裝

```zsh
pip install mysql-connector-python
```

## 引入、連接數據庫

因為是 MySQL，所以自己要在自己的電腦本地數據庫寫好要用的數據庫。下面的連接參數要自己改。

```py
import mysql.connector
from mysql.connector import Error

# 連接 MySQL 資料庫
connection = mysql.connector.connect(
    host='localhost',          # 主機名稱
    database='myTelegram',  # 資料庫名稱
    user='Rem',        # 帳號
    password='')  # 密碼

cursor = connection.cursor(buffered=True)
cursor.execute("SELECT DATABASE();")
record = cursor.fetchone()
```

## CRUD

CRUD 就是 Create（新增）、Read（讀取）、Update（更新）、Delete（刪除），數據庫基本操作。

### Create 新增

以註冊帳戶並驗證完 Email Captcha 後，將帳戶資料增入 Database 為例子。這裡的設計概念是註冊後不會將帳戶資料寫入數據庫，註冊完會將暫時的帳戶資料存到數據庫，註冊的下一步是驗證 Email，驗證完發送到 Email 的 Captcha 就可以存入數據庫。關於發送 Email，我會另外寫一篇文章。

> 註：因為 Flask 可以寫 Restful，所以會出現判斷請求方法是不是 POST 或是 GET，增加複用性。

```py
from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
# 引入 string
import string

app = Flask(__name__)
# enable CORS
CORS(app)

# 註冊 email 驗證後的緩存
registerTempData = {
    "id": "",
    "username": "",
    "email": "",
    "phone": "",
    "password": "",
}

# 全局驗證碼
captcha = 0

# 驗證 註冊的 Email
@app.route("/user/validateEmail", methods=['GET', 'POST'])
def user_register_email_validate():
    if request.method == 'POST':
        response_object = {'status': 'success'}
        response_object['code'] = 200
        requestCaptcha = request.form.get('captcha')
        print("requestCaptcha: " + str(requestCaptcha))
        print("captcha: " + str(captcha))
        # 如果驗證碼相同
        if str(requestCaptcha) == str(captcha):
            global registerTempData
            # 新增資料
            sql = "INSERT INTO user (id, username, email, phone, password) VALUES (%s, %s, %s, %s, %s);"
            # 將緩存的註冊資料加入
            new_data = (registerTempData["id"], registerTempData["username"],
                        registerTempData["email"], registerTempData["phone"], registerTempData["password"])
            print(new_data)
            cursor = connection.cursor()
            cursor.execute(sql, new_data)

            # 確認資料有存入資料庫
            connection.commit()
            response_object['message'] = 'Your account is activated!'
            response_object['data'] = True

            # 初始化
            registerTempData = {
                "id": "",
                "username": "",
                "email": "",
                "phone": "",
                "password": "",
            }
        else:
            response_object['message'] = 'The captcha is not true!'
            response_object['data'] = False

        return jsonify(response_object)
```

上面的 Code 需要注意的地方是**全局變量如果要在局部函數中使用，就需要使用 `global` 聲明全局變量**，像上面例子的 `global registerTempData`

## Read 讀取

### 普通查詢

就是 "**查**"，這裡以返回某帳戶資訊為例：

> **下面的 `@jwt_optional` 是關於 JWT 的使用**，因為不在這文章的討論範疇，所以不會細講。

```py
# 返回用戶資訊
@app.route("/user/getDetail", methods=['GET', 'POST'])
@jwt_optional
def user_getDetail():
    if request.method == 'POST':
        response_object = {'status': 'success'}
        response_object['code'] = 200
        requestId = request.form.get('id')
        sqlSearchResult = []

        # 驗證 jwt_token
        current_user = get_jwt_identity()

        # 驗證失敗 回傳失敗
        if not current_user:
            response_object['message'] = 'anonymous user'
            response_object['data'] = False

            return jsonify(response_object)

        # 用 id 查詢用戶資訊
        cursor.execute(
            "SELECT id, username, email, phone, password FROM user WHERE id = %s;", (requestId,))
        for (id, username, email, phone, password) in cursor:
            sqlSearchResult.append({
                "id": id,
                "username": username,
                "email": email,
                "phone": phone,
                "password": password
            })

        print(sqlSearchResult)

        # 如果有資料
        if cursor.rowcount > 0:
            response_object['message'] = 'Searching is Success. Have Data'
            response_object['data'] = True
            # 將搜到的數據添入 response_object
            response_object.update({
                'userData': {
                    'id': sqlSearchResult[0]['id'],
                    'username': sqlSearchResult[0]['username'],
                    'email': sqlSearchResult[0]['email'],
                    'phone': sqlSearchResult[0]['phone'],
                    'password': sqlSearchResult[0]['password']
                }
            })

        # 如果沒有資料
        else:
            response_object['message'] = 'There is not this account in the database.'
            response_object['data'] = False

        return jsonify(response_object)
```

### 模糊搜索

糊糊搜索最關鍵的地方就是如何將 Keyword 加入 SQL 語句，下面是個實際例子：

```py
# 模糊搜索 所有 channelType 是 group 的群 
@app.route("/user/channels/searchChannels", methods=['GET', 'POST'])
@jwt_optional
def user_channels_search_channels():
    if request.method == 'POST':
        response_object = {'status': 'success'}
        response_object['code'] = 200
        requestKeyword = request.form.get('keyword')

        sqlSearchResult = []

        # 驗證 jwt_token
        current_user = get_jwt_identity()

        # 驗證失敗 回傳失敗
        if not current_user:
            response_object['message'] = 'anonymous user'
            response_object['data'] = False

            return jsonify(response_object)

        # 用 keyword 模糊查詢 所有 channel (channelType = group)
        cursor.execute(
            "SELECT id, channelType, adminId, channelName FROM channel WHERE channelType = 'group' \
             AND (id LIKE CONCAT('%', %s, '%') OR adminId LIKE CONCAT('%', %s, '%') OR \
              channelName LIKE CONCAT('%', %s, '%')) GROUP BY id;",
               (requestKeyword, requestKeyword, requestKeyword))
        for (id, channelType, adminId, channelName) in cursor:
            sqlSearchResult.append({
                "id": id,
                "channelType": channelType,
                "adminId": adminId,
                "channelName": channelName,
            })
        # 如果有 資料
        if cursor.rowcount > 0:
            response_object['message'] = 'Get the channel List success.'
            response_object['data'] = True
            # 將資料添加到 response_object
            response_object.update({
                'searchResult': sqlSearchResult
            })
        # 沒有 message
        else:
            response_object['message'] = 'There is no data.'
            response_object['data'] = False

        return jsonify(response_object)
```

## Update 更新

以些改某個帳戶資料為例

```py
# 修改更新用戶 phone 資料
# 這裡前端要先判斷輸入的新 Phone 是否跟原本的一樣，如果相同就不准請求
@app.route("/user/update/phone", methods=['GET', 'POST'])
@jwt_optional
def user_update_phone():
    if request.method == 'POST':
        response_object = {'status': 'success'}
        response_object['code'] = 200
        # 請求資料
        requestId = request.form.get('id')
        requestPhone = request.form.get('phone')

        # 驗證 jwt_token
        current_user = get_jwt_identity()

        # 驗證失敗 回傳失敗
        if not current_user:
            response_object['message'] = 'anonymous user'
            response_object['data'] = False

            return jsonify(response_object)

        # 用 id 查詢用戶的 phone
        cursor.execute(
            "SELECT id, phone FROM user WHERE id = %s;", (requestId,))

        # 有找到資料
        if cursor.rowcount > 0:
            # 更新資料
            sql = "UPDATE user SET phone = %s WHERE id = %s;"
            cursor.execute(sql, (requestPhone, requestId))

            # 確認資料有存入資料庫
            connection.commit()
            response_object['message'] = 'Update phone success.'
            response_object['data'] = True
        # 沒有找到資料
        else:
            response_object['message'] = 'Update phone fail.'
            response_object['data'] = False

        return jsonify(response_object)
```

## Delete 刪除

以刪除某帳戶為例：

```py
# 刪除帳戶
@app.route("/user/delete", methods=['GET', 'POST'])
@jwt_optional
def user_delete_account():
    if request.method == 'POST':
        response_object = {'status': 'success'}
        response_object['code'] = 200
        # 請求資料
        requestId = request.form.get('id')
        requestPassword = request.form.get('password')

        sqlSearchResult = []

        # 驗證 jwt_token
        current_user = get_jwt_identity()

        # 驗證失敗 回傳失敗
        if not current_user:
            response_object['message'] = 'anonymous user'
            response_object['data'] = False

            return jsonify(response_object)

        # 用請求 id 查詢該 id 是否存在
        cursor.execute(
            "SELECT id, username FROM user WHERE id = %s;", (requestId,))

        # 如果沒找到該 id
        if cursor.rowcount < 1:
            response_object['message'] = 'This account is not exist.'
            response_object['data'] = False

            return jsonify(response_object)

        # 先判斷 requestPassword 是否跟原來的密碼相符
        cursor.execute(
            "SELECT id, password FROM user WHERE id = %s;", (requestId,))
        for (id, password) in cursor:
            sqlSearchResult.append({
                "id": id,
                "password": password
            })

        # md5 加密轉換
        transferPassword = hashlib.md5(requestPassword.encode())

        # 如果密碼相等
        if transferPassword.hexdigest() == sqlSearchResult[0]['password']:
            # 更新資料
            # 刪除用戶的基本資料
            sql = "DELETE FROM user WHERE id = %s;"
            cursor.execute(sql, (requestId,))

            # 確認資料有存入資料庫
            connection.commit()

            # 刪除用戶的好友資料
            # 用 id 查詢用戶的朋友 id 統計好友數
            cursor.execute(
                "SELECT id, friendId FROM friend WHERE id = %s;", (requestId,))
            # 有好友
            if cursor.rowcount > 0:
                # 循環刪除
                for i in range(0, cursor.rowcount * 2):
                    sql = "DELETE FROM friend WHERE id = %s or friendId = %s;"
                    cursor.execute(sql, (requestId, requestId))

                    # 確認資料有存入資料庫
                    connection.commit()

            # token 加入黑名單
            jti = get_raw_jwt()['jti']
            blacklist.add(jti)
            response_object['message'] = 'Delete the account success.'
            response_object['data'] = True
        else:
            response_object['message'] = 'Delete the account fail. The password is not true.'
            response_object['data'] = False

        return jsonify(response_object)
```

## Reference

- [Python 使用 MySQL Connector 操作 MySQL/MariaDB 資料庫教學與範例](https://officeguide.cc/python-mysql-mariadb-database-connector-tutorial-examples/)
