# Flask 中使用 JWT


## 前言

因為我寫的上一篇文章是"**Flask 中使用 MySQL**"，文章內容有提及 JWT 的使用，這篇就是寫一下我在 JWT 上的使用。

## Cookie Session

> Cookie 和 LocalStorage 最大的區別是 **Cookie 可以設置時效性**，而LocalStorage 不行。

在 JWT 授權認證技術還沒出來之前，我們是**使用 Cookie 和 Session 來做驗證**，分別是前端（Front End）和後端（Back End）的本地存儲。過程如下：

<!-- ```mermaid -->
{{< mermaid >}}
sequenceDiagram
    participant Front End
    participant Back End
    Front End->>Back End: Login Request
    Note right of Back End: Store SessionID and its value in Session
    Back End->>Front End: Response bring SessionID
    Note left of Front End: Store SessionID In Cookie
    Front End-->Back End: The Request After Login
    Front End->>Back End: The Request Bring Token
    Note right of Back End: Verify that the SessionID's value is valid
    Back End->>Front End: Response
    Front End->>Back End: Sign Out or Delete Account
    Note right of Back End: Remove SessionID from Session
    Back End->>Front End: Response
    Note left of Front End: Remove SessionID from cookie
{{< /mermaid >}}
<!-- ``` -->

## JWT

### 理論部份

因為 Cookie Session 這種方式太過繁瑣，所以出來了 JWT 這樣的技術，原名 (JSON Web Tokens)，就是帶時效的 Token。主要差別是，Server 端不需要存 Session，大致情形如下：

<!-- ```mermaid -->
{{< mermaid >}}
sequenceDiagram
    participant Front End
    participant Back End
    Front End->>Back End: Login Request
    Note right of Back End: Generate Jwt Token
    Back End->>Front End: Response
    Note left of Front End: Store Jwt Token In LocalStorage
    Front End-->Back End: The Request After Login
    Front End->>Back End: The Request Bring Token <br/> In Header's Auth
    Note right of Back End: Verify that the token is valid
    Back End->>Front End: Response
    Front End->>Back End: Sign Out or Delete Account
    Note right of Back End: Add the token to blacklist
    Back End->>Front End: Response
    Note left of Front End: Remove token from localStorage
{{< /mermaid >}}
<!-- ``` -->

JWT 主要分為三段，個別為 header、payload 與 signature，中間以 . 做區隔，每一段都是透過 Base64Url 去編碼，中間的 payload 有時候會加密。

e.g.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJlbWFpbCI6Imhpcm9AZ21haWwuY29tIn0.
WAKjPd_0qcEG3dA9pEwAiw-0ADb8VwqFlSWiIYJTymo
```

#### header

存放 token 型別與加密方式 。
```js
{
  "alg": "HS256", // 加密方式
  "typ": "JWT" // token 型別
}
```

#### payload

存放需要傳遞的訊息。因為只透過編碼轉換「未經過加密」，不建議在裡面放重要資訊。

另外官方有提供一些可以用的屬性大概分為：

- iss: 發行人
- exp: 到期日
- sub: 主題
- aud: 收件人
- nbf: 不接受早於…日期/時間
- iat: 發行時間
- jti: 唯一識別符，JWT 只能使用一次

#### signature

最後的部分，有點像是我們平常買東西條碼上最後的檢查碼，首先會先取得 header 裡的加密方式 SHA256，再透過以下方式產生：

```js
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

secret 則是可以打上自己要打的，最後一樣會轉換成 Base64Url：
再把三段加在一起就算是 JWT 了！

### 使用時機

JWT 的主要目的只是「 確立資料來源以及可信度 」。因此在應用上也會限制較多。以下是較常被使用的時機：

- 跨伺服器下的請求

可以參考運作原理的圖，如果我們同時擁有許多伺服器，可以把身份驗證伺服器獨立出來，登入後使用 JWT 就可以在不同伺服器遊走。

- 一次性、時效短的請求

因為 JWT 不能主動撤銷，一般用於會員身份驗證會不太適合，多用於一次性下載檔案，或是時間限制內更改密碼等等…

- APP 身份驗證

一般 APP 是不存在 Session 的，所以在持續身份驗證上可以使用 JWT，但要確保使用者的執行環境是安全的

### 實作部份

#### 安裝

```bash
pip install flask-jwt-extended
```

#### 引入與基本使用

> 為了快速了解怎麼用，例子中只會顯示重要核心代碼。

**注意點：**

- `@jwt_required` 裝飾器是用來判斷請求 Header 是否帶有 Token。
- 下面例子的 `/login` 使用 `create_access_token()` 生成 Token。
- `/protected` 是獲取放在 請求 Header 的 Token 判是否正確，相對的，可以看 `/user/update/phone`。
- 前端請求需要**在 Header 添加 `Authorization: Bearer <access_token>`**，關於 Axios 怎麼在請求 Header 添加 Token 我之前有在 **[Vue 技巧與經驗](https://huangno1.github.io/vue_skill/#header-%E5%B8%B6-token-%E7%9A%84%E8%AB%8B%E6%B1%82)** 這篇文章的請求部份寫到。
- 生成 Token 的依據（identity）不能是密碼，可以是 UserName 或是 UserID。
- 一般 Token 的時效是 15 分鐘左右，如果想要延長可以設置。
- **`get_jwt_identity()` 獲取之前 Token 生成依據的內容。**

```py
from flask import Flask, jsonify, request
# 引入 JWT
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)

# ...

# Provide a method to create access tokens. The create_access_token()
# function is used to actually generate the token, and you can return
# it to the caller however you choose.
# 用戶登入
@app.route('/user/login', methods=['GET', 'POST'])
def user_login():
    if request.method == 'POST':
        response_object = {'status': 'success'}
        response_object['code'] = 200
        requestEmail = request.form.get('email')
        requestPassword = request.form.get('password')
        sqlSearchResult = []
        # 查詢資料庫
        cursor.execute(
            "SELECT id, username, email, password FROM user WHERE email = %s;", (requestEmail,))

        for (id, username, email, password) in cursor:
            sqlSearchResult.append({
                "id": id,
                "username": username,
                "email": email,
                "password": password
            })
        # md5 加密轉換
        transferPassword = hashlib.md5(requestPassword.encode())
        print(transferPassword.hexdigest())
        print(sqlSearchResult)
        # 如果沒有資料
        if cursor.rowcount < 1:
            response_object['message'] = 'This Account not exist.'
            response_object['data'] = False
        # 如果有資料
        else:
            # 如果密碼正確
            if str(transferPassword.hexdigest()) == str(sqlSearchResult[0]['password']):
                print('password: ' + password + ', resultPWD: ' +
                      sqlSearchResult[0]['password'])
                response_object['message'] = 'Sign in success.'
                response_object['data'] = True
                response_object['user_id'] = sqlSearchResult[0]['id']
                # Identity can be any data that is json serializable
                # 產生 jwt_token, 並將 token 的 expires 取消
                response_object['jwt_token'] = create_access_token(
                    identity=sqlSearchResult[0]['id'],  expires_delta=False)
            else:
                response_object['message'] = 'Password is not true.'
                response_object['data'] = False

        return jsonify(response_object)

# Protect a view with jwt_required, which requires a valid access token
# in the request to access.
@app.route('/protected', methods=['GET'])
@jwt_required
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


# 修改更新用戶 phone 資料
# 這裡前端要先判斷輸入的新 Phone 是否跟原本的一樣，如果相同就不准請求
@app.route("/user/update/phone", methods=['GET', 'POST'])
@jwt_required
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

if __name__ == '__main__':
    app.run()
```

### 部份保護 route

`@jwt_required` 裝飾器是該 route 接收到的請求 Header 必須要有 JWT Token，`jwt_optional()` 裝飾器，可以使需要保護的數據與不被保護的數據同時在 route 中使用（官方說法），但跟 `@jwt_required` 裝飾器一樣是 Token 如果失效會回傳失效訊息。

```py
from flask import Flask, jsonify, request
from flask_jwt_extended import (
    JWTManager, jwt_optional, create_access_token,
    get_jwt_identity
)

app = Flask(__name__)

# Setup the Flask-JWT-Extended extension
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
jwt = JWTManager(app)


@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if not username:
        return jsonify({"msg": "Missing username parameter"}), 400
    if not password:
        return jsonify({"msg": "Missing password parameter"}), 400

    if username != 'test' or password != 'test':
        return jsonify({"msg": "Bad username or password"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200


@app.route('/partially-protected', methods=['GET'])
@jwt_optional
def partially_protected():
    # If no JWT is sent in with the request, get_jwt_identity()
    # will return None
    current_user = get_jwt_identity()
    if current_user:
        return jsonify(logged_in_as=current_user), 200
    else:
        return jsonify(logged_in_as='anonymous user'), 200


if __name__ == '__main__':
    app.run()
```

### 黑名單（Black List）

應用場景是當我們之前的 Token 錯誤或失效（如果有設置自動登入，一般 Token 會設置 7 天有效），或是登出、重新登入、登入等，都需要將舊的 Token 加入黑名單。

```py
from flask import Flask, request, jsonify

from flask_jwt_extended import (
    JWTManager, jwt_required, get_jwt_identity,
    create_access_token, create_refresh_token,
    jwt_refresh_token_required, get_raw_jwt
)


# Setup flask
app = Flask(__name__)

# Enable blacklisting and specify what kind of tokens to check
# against the blacklist
app.config['JWT_SECRET_KEY'] = 'super-secret'  # Change this!
app.config['JWT_BLACKLIST_ENABLED'] = True
app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
jwt = JWTManager(app)

# A storage engine to save revoked tokens. In production if
# speed is the primary concern, redis is a good bet. If data
# persistence is more important for you, postgres is another
# great option. In this example, we will be using an in memory
# store, just to show you how this might work. For more
# complete examples, check out these:
# https://github.com/vimalloc/flask-jwt-extended/blob/master/examples/redis_blacklist.py
# https://github.com/vimalloc/flask-jwt-extended/tree/master/examples/database_blacklist
blacklist = set()


# For this example, we are just checking if the tokens jti
# (unique identifier) is in the blacklist set. This could
# be made more complex, for example storing all tokens
# into the blacklist with a revoked status when created,
# and returning the revoked status in this call. This
# would allow you to have a list of all created tokens,
# and to consider tokens that aren't in the blacklist
# (aka tokens you didn't create) as revoked. These are
# just two options, and this can be tailored to whatever
# your application needs.
@jwt.token_in_blacklist_loader
def check_if_token_in_blacklist(decrypted_token):
    jti = decrypted_token['jti']
    return jti in blacklist


# Standard login endpoint
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if username != 'test' or password != 'test':
        return jsonify({"msg": "Bad username or password"}), 401

    ret = {
        'access_token': create_access_token(identity=username),
        'refresh_token': create_refresh_token(identity=username)
    }
    return jsonify(ret), 200


# Standard refresh endpoint. A blacklisted refresh token
# will not be able to access this endpoint
@app.route('/refresh', methods=['POST'])
@jwt_refresh_token_required
def refresh():
    current_user = get_jwt_identity()
    ret = {
        'access_token': create_access_token(identity=current_user)
    }
    return jsonify(ret), 200


# Endpoint for revoking the current users access token
@app.route('/logout', methods=['DELETE'])
@jwt_required
def logout():
    jti = get_raw_jwt()['jti']
    blacklist.add(jti)
    return jsonify({"msg": "Successfully logged out"}), 200


# Endpoint for revoking the current users refresh token
@app.route('/logout2', methods=['DELETE'])
@jwt_refresh_token_required
def logout2():
    jti = get_raw_jwt()['jti']
    blacklist.add(jti)
    return jsonify({"msg": "Successfully logged out"}), 200


# This will now prevent users with blacklisted tokens from
# accessing this endpoint
@app.route('/protected', methods=['GET'])
@jwt_required
def protected():
    return jsonify({'hello': 'world'})

if __name__ == '__main__':
    app.run()
```

## Reference

- [Flask-JWT-Extended’s Documentation](https://flask-jwt-extended.readthedocs.io/en/latest/)
- [淺談 Session 與 JWT 差異](https://medium.com/@jedy05097952/%E6%B7%BA%E8%AB%87-session-%E8%88%87-jwt-%E5%B7%AE%E7%95%B0-8d00b2396115)
