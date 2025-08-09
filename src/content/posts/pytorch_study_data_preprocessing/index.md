---
title: "PyTorch 學習筆記 (一)：從 NumPy 到 Tensor，掌握數據處理基礎"
published: 2025-08-09T11:10:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-08-09T11:50:28+08:00
draft: false
description: "踏入 PyTorch 的第一步！本篇筆記將帶你從最基礎的數據結構開始，理解標量、向量、矩陣與張量的概念，並學會如何使用 PyTorch Tensor 進行基本數據操作與預處理。"
license: ""
tags: ["pytorch", "tensor", "numpy", "data", "preprocessing"]
category: Photography
image: ./index/compressed/cover.png
lang: zh-TW
---

嗨，歡迎來到我的 PyTorch 學習筆記！🚀

在我們一頭栽進神經網路、模型訓練這些酷炫的主題之前，有一個非常重要但常被忽略的基礎——**數據**。所有深度學習模型的核心，都是對數據進行各種數學運算，而承載這些數據的容器，就是我們今天的主角：**張量 (Tensor)**。

如果你曾接觸過 Python 的數據科學庫，你一定對 `NumPy` 不陌生。好消息是，PyTorch 的 Tensor 和 NumPy 的 `ndarray` 非常相似，這將讓你的學習曲線平緩許多。

這篇筆記將會涵蓋：
*   Pandas, NumPy 與 Tensor 之間是什麼關係？
*   什麼是標量、向量、矩陣和張量？
*   如何用 PyTorch 創建和操作 Tensor？
*   為什麼需要數據預處理？

準備好了嗎？讓我們開始吧！

## 核心數據結構：從 NumPy 到 Tensor

在數據科學領域，`NumPy` 的 `ndarray` 是處理數值運算的王者。PyTorch 借鑒了這一點，創造了 `Tensor`，你可以把它想像成是 **能在 GPU 上加速運算的 NumPy `ndarray`**。

### 為什麼不直接用 NumPy？
*   **GPU 加速**：這是 PyTorch Tensor 最大的優勢。神經網路涉及大量的矩陣運算，使用 GPU 可以將訓練速度提升數十倍甚至上百倍。
*   **自動求導**：PyTorch 內建了強大的自動求導引擎 (`torch.autograd`)，這是訓練神經網路的核心。Tensor 可以追蹤其上的所有操作，從而自動計算梯度。

### Tensor vs. NumPy：何時分工合作？

既然 Tensor 這麼強大，為什麼我們還需要 NumPy？

答案在於 **生態系統**。NumPy 是 Python 科學計算的基石，無數強大的函式庫（如 `pandas` 用於數據分析、`scikit-learn` 用於機器學習、`OpenCV` 用於圖像處理）都建立在 NumPy 之上或與其深度整合。

因此，一個最常見且高效的工作流程是：
1.  **使用 Pandas, OpenCV 等工具** 載入和進行初步的數據清理。
2.  **將數據轉換為 NumPy `ndarray`** 進行複雜的數值運算和預處理（例如特徵工程）。
3.  **在最後一步，將準備好的 NumPy 陣列轉換為 `torch.Tensor`**，準備送入 PyTorch 模型進行訓練。

讓我們看看如何創建一個 Tensor，以及它和 NumPy 之間的轉換有多簡單。

```python
import torch
import numpy as np

# 從 NumPy array 創建 Tensor
numpy_array = np.array([1, 2, 3, 4])
torch_tensor = torch.from_numpy(numpy_array)
print(f"NumPy Array: {numpy_array}")
print(f"Torch Tensor: {torch_tensor}")

# 從 Tensor 轉換回 NumPy array
new_numpy_array = torch_tensor.numpy()
print(f"Back to NumPy: {new_numpy_array}")

# 直接從 Python list 創建 Tensor
data = [[1, 2], [3, 4]]
tensor_from_data = torch.tensor(data)
print(f"Tensor from list:\n {tensor_from_data}")
```

### PyTorch Tensor 的常用創建方法

除了從現有數據創建 Tensor，PyTorch 還提供了許多便捷的方法來創建特定類型的 Tensor：

```python
import torch

# 創建全零張量
zeros_tensor = torch.zeros(3, 4)
print(f"Zeros tensor (3x4):\n {zeros_tensor}")

# 創建全一張量
ones_tensor = torch.ones(2, 3)
print(f"Ones tensor (2x3):\n {ones_tensor}")

# 創建單位矩陣
eye_tensor = torch.eye(3)
print(f"Identity matrix (3x3):\n {eye_tensor}")

# 創建隨機張量 (0-1 均勻分佈)
rand_tensor = torch.rand(2, 3)
print(f"Random tensor (uniform 0-1):\n {rand_tensor}")

# 創建標準常態分佈隨機張量
randn_tensor = torch.randn(2, 3)
print(f"Random tensor (normal distribution):\n {randn_tensor}")

# 創建等差數列
arange_tensor = torch.arange(0, 10, 2)  # 從0到10，步長為2
print(f"Arange tensor: {arange_tensor}")

# 創建線性等分數列
linspace_tensor = torch.linspace(0, 1, 5)  # 在0到1之間創建5個等間距的數
print(f"Linspace tensor: {linspace_tensor}")

# 創建與現有張量相同形狀的張量
existing_tensor = torch.tensor([[1, 2], [3, 4]])
zeros_like = torch.zeros_like(existing_tensor)
ones_like = torch.ones_like(existing_tensor)
print(f"Zeros like existing tensor:\n {zeros_like}")
print(f"Ones like existing tensor:\n {ones_like}")
```

### NumPy 的常用操作

既然我們經常在 NumPy 和 PyTorch 之間切換，了解 NumPy 的常用操作也很重要：

```python
import numpy as np

# NumPy 的創建方法 (與 PyTorch 非常相似)
np_zeros = np.zeros((3, 4))
np_ones = np.ones((2, 3))
np_eye = np.eye(3)
np_random = np.random.rand(2, 3)
np_randn = np.random.randn(2, 3)
np_arange = np.arange(0, 10, 2)
np_linspace = np.linspace(0, 1, 5)

print(f"NumPy zeros:\n {np_zeros}")
print(f"NumPy arange: {np_arange}")

# NumPy 特有的常用操作
arr = np.array([[1, 2, 3], [4, 5, 6]])

# 形狀操作
print(f"Original shape: {arr.shape}")
reshaped = arr.reshape(3, 2)
print(f"Reshaped (3x2):\n {reshaped}")

# 展平
flattened = arr.flatten()
print(f"Flattened: {flattened}")

# 轉置
transposed = arr.T
print(f"Transposed:\n {transposed}")

# 統計操作
print(f"Sum of all elements: {arr.sum()}")
print(f"Sum along axis 0: {arr.sum(axis=0)}")  # 按列求和
print(f"Sum along axis 1: {arr.sum(axis=1)}")  # 按行求和
print(f"Mean: {arr.mean()}")
print(f"Max: {arr.max()}")
print(f"Min: {arr.min()}")

# 條件操作
condition_result = arr > 3
print(f"Elements > 3:\n {condition_result}")
filtered = arr[arr > 3]
print(f"Filtered values > 3: {filtered}")
```

## 張量的基本概念：標量、向量、矩陣

![tensor.png](https://imgpoi.com/i/ABRGZ2.png)

「張量 (Tensor)」聽起來可能有點嚇人，但其實它只是一個用來表示多維陣列的通用術語。我們可以根據它的「維度 (dimensions)」或「階 (rank)」來理解：

*   **標量 (Scalar)**：一個單獨的數字，例如 `5`。它是一個 **0 維張量**。
*   **向量 (Vector)**：一列數字，例如 `[1, 2, 3]`。它是一個 **1 維張量**。
*   **矩陣 (Matrix)**：一個二維的數字網格，像一個表格。它是一個 **2 維張量**。
*   **張量 (Tensor)**：可以有任意數量的維度。例如，一張彩色圖片可以表示為一個 3 維張量（高度 x 寬度 x 顏色通道）。

```python
# 0D Tensor (Scalar)
scalar = torch.tensor(42)
print(f"Scalar: {scalar}")
print(f"Dimension: {scalar.ndim}")

# 1D Tensor (Vector)
vector = torch.tensor([1, 2, 3])
print(f"Vector: {vector}")
print(f"Dimension: {vector.ndim}")

# 2D Tensor (Matrix)
matrix = torch.tensor([[1, 2], [3, 4]])
print(f"Matrix:\n {matrix}")
print(f"Dimension: {matrix.ndim}")

# 3D Tensor
tensor_3d = torch.randn(2, 3, 4) # 創建一個形狀為 2x3x4 的隨機張量
print(f"3D Tensor shape: {tensor_3d.shape}")
print(f"Dimension: {tensor_3d.ndim}")
```

## 數據操作：Tensor 的基本運算

學會創建 Tensor 後，下一步就是對它進行操作。這和 NumPy 的操作也非常相似。

### 索引與切片 (Indexing & Slicing)
```python
tensor = torch.tensor([[1, 2, 3], [4, 5, 6]])

# 取得第一行
print(f"First row: {tensor[0]}")

# 取得第一列
print(f"First column: {tensor[:, 0]}")

# 取得右下角的數字 6
print(f"Element at (1, 2): {tensor[1, 2]}")
```

### 算術運算

讓我們從數學的角度來理解這些運算是如何進行的。假設我們有兩個 2×2 矩陣：

$$
X = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}, \quad Y = \begin{bmatrix} 5 & 6 \\ 7 & 8 \end{bmatrix}
$$

```python
x = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
y = torch.tensor([[5, 6], [7, 8]], dtype=torch.float32)
```

#### 元素對元素相加 (Element-wise Addition)

數學上，元素對元素的加法定義為：
$$
Z = X + Y = \begin{bmatrix} x_{11} + y_{11} & x_{12} + y_{12} \\ x_{21} + y_{21} & x_{22} + y_{22} \end{bmatrix}
$$

對於我們的例子：
$$
Z = \begin{bmatrix} 1+5 & 2+6 \\ 3+7 & 4+8 \end{bmatrix} = \begin{bmatrix} 6 & 8 \\ 10 & 12 \end{bmatrix}
$$

```python
# 元素對元素相加
z1 = x + y
z2 = torch.add(x, y)
print(f"Addition result:\n {z1}")
```

#### 元素對元素相乘 (Element-wise Multiplication / Hadamard Product)

元素對元素的乘法（也稱為哈達瑪積）定義為：
$$
Z = X \odot Y = \begin{bmatrix} x_{11} \times y_{11} & x_{12} \times y_{12} \\ x_{21} \times y_{21} & x_{22} \times y_{22} \end{bmatrix}
$$

對於我們的例子：
$$
Z = \begin{bmatrix} 1 \times 5 & 2 \times 6 \\ 3 \times 7 & 4 \times 8 \end{bmatrix} = \begin{bmatrix} 5 & 12 \\ 21 & 32 \end{bmatrix}
$$

```python
# 元素對元素相乘
z3 = x * y
z4 = torch.multiply(x, y)
print(f"Multiplication result:\n {z3}")
```

#### 矩陣乘法 (Matrix Multiplication)

矩陣乘法的數學定義是：對於 $A_{m \times n}$ 和 $B_{n \times p}$ 兩個矩陣，其乘積 $C = AB$ 是一個 $m \times p$ 的矩陣，其中：
$$
c_{ij} = \sum_{k=1}^{n} a_{ik} \times b_{kj}
$$

對於我們的 2×2 矩陣例子：
$$
Z = X \times Y = \begin{bmatrix} 
\sum_{k} x_{1k} y_{k1} & \sum_{k} x_{1k} y_{k2} \\
\sum_{k} x_{2k} y_{k1} & \sum_{k} x_{2k} y_{k2}
\end{bmatrix}
$$

具體計算：
$$
Z = \begin{bmatrix}
1 \times 5 + 2 \times 7 & 1 \times 6 + 2 \times 8 \\
3 \times 5 + 4 \times 7 & 3 \times 6 + 4 \times 8
\end{bmatrix} = \begin{bmatrix}
19 & 22 \\
43 & 50
\end{bmatrix}
$$

```python
# 矩陣乘法
z5 = x.matmul(y)
z6 = torch.matmul(x, y)
print(f"Matrix multiplication result:\n {z5}")
```

**重要提醒**：矩陣乘法要求第一個矩陣的列數等於第二個矩陣的行數。對於上面的例子，兩個都是 2×2 矩陣，所以可以相乘，結果也是 2×2 矩陣。

### 廣播機制 (Broadcasting)

到目前為止，我們討論的運算都是在相同形狀的張量之間進行的。但在實際應用中，我們經常需要在不同形狀的張量間進行運算。這時候，**廣播機制 (Broadcasting)** 就派上用場了。

廣播允許 PyTorch (和 NumPy) 自動擴展較小的張量，使其能夠與較大的張量進行元素對元素的運算，而不需要顯式地複製數據。

#### 廣播的基本規則

廣播遵循以下規則：
1. 從最後一個維度開始比較兩個張量的形狀
2. 如果兩個維度相等，或其中一個為 1，則該維度兼容
3. 如果其中一個張量在某個維度上缺失，則視為大小為 1

讓我們通過一些例子來理解：

```python
# 標量與張量的廣播
tensor = torch.tensor([[1, 2, 3], [4, 5, 6]])  # 形狀 (2, 3)
scalar = 10

# 標量會自動廣播到與張量相同的形狀
result = tensor + scalar
print(f"Original tensor:\n {tensor}")
print(f"Result (tensor + scalar):\n {result}")
# 相當於 tensor + [[10, 10, 10], [10, 10, 10]]
```

```python
# 向量與矩陣的廣播
matrix = torch.tensor([[1, 2, 3], [4, 5, 6]])  # 形狀 (2, 3)
vector = torch.tensor([10, 20, 30])            # 形狀 (3,)

# vector 會自動廣播成 (2, 3) 的形狀
result = matrix + vector
print(f"Matrix:\n {matrix}")
print(f"Vector: {vector}")
print(f"Result (matrix + vector):\n {result}")
# 相當於 matrix + [[10, 20, 30], [10, 20, 30]]
```

```python
# 更複雜的廣播例子
a = torch.tensor([[1], [2], [3]])  # 形狀 (3, 1)
b = torch.tensor([10, 20])         # 形狀 (2,)

# 廣播後的結果形狀為 (3, 2)
result = a + b
print(f"Tensor a (3, 1):\n {a}")
print(f"Tensor b (2,): {b}")
print(f"Result shape: {result.shape}")
print(f"Result:\n {result}")
# a 廣播為 [[1, 1], [2, 2], [3, 3]]
# b 廣播為 [[10, 20], [10, 20], [10, 20]]
```

#### 廣播的實際應用

在數據預處理中，廣播機制非常有用，例如：

```python
# 數據標準化 (Normalization)
data = torch.randn(100, 5)  # 100 個樣本，每個有 5 個特徵

# 計算每個特徵的平均值和標準差
mean = data.mean(dim=0, keepdim=True)  # 形狀 (1, 5)
std = data.std(dim=0, keepdim=True)    # 形狀 (1, 5)

# 透過廣播進行標準化
normalized_data = (data - mean) / std
print(f"Original data shape: {data.shape}")
print(f"Mean shape: {mean.shape}")
print(f"Normalized data shape: {normalized_data.shape}")
```

**廣播的優勢**：
- **記憶體效率**：不需要實際複製數據
- **計算效率**：充分利用底層優化的向量化運算
- **代碼簡潔**：讓數學表達式更直觀

## 數據預處理入門

在真實世界的專案中，原始數據很少是乾淨且能直接餵給模型的。它們通常充滿了缺失值、非數值型的文字，以及各種需要清理的格式問題。我們需要進行「預處理」，將這些髒數據 (dirty data) 清理、轉換成模型能夠理解的純數值格式。

`pandas` 是這個階段最強大的工具。讓我們來看一個更真實的例子。

### 模擬一個真實場景

假設我們有一個 `housing.csv` 檔案，內容如下：

```csv
SquareFeet,Bedrooms,City,Price
1500,3,Taipei,5000000
2000,,New York,8000000
,2,Tokyo,6500000
1800,3,NaN,5800000
2200,4,Taipei,7200000
```

這個數據有幾個問題：
1.  `Bedrooms` 欄位有缺失值 (第二行)。
2.  `SquareFeet` 欄位有缺失值 (第三行)。
3.  `City` 欄位是文字，且也有缺失值 (`NaN`，第四行)。

我們的目標是將這些數據轉換成一個純數值的 PyTorch Tensor。

### 步驟 1：使用 Pandas 載入與清理

首先，我們用 `pandas` 讀取數據，並處理最明顯的問題。

```python
import pandas as pd
import numpy as np
import torch

# 模擬讀取 CSV
from io import StringIO

csv_data = """SquareFeet,Bedrooms,City,Price
1500,3,Taipei,5000000
2000,,New York,8000000
,2,Tokyo,6500000
1800,3,,5800000
2200,4,Taipei,7200000
"""

df = pd.read_csv(StringIO(csv_data))
print("原始 DataFrame:")
print(df)
print("\n數據資訊:")
df.info()
```
`df.info()` 的輸出會告訴我們 `SquareFeet`、`Bedrooms` 和 `City` 都有缺失值。

### 步驟 2：填充數值型缺失值

對於數值型的缺失值，一個常見的策略是用該欄位的平均數或中位數來填充。這裡我們使用平均數。

```python
# 填充 SquareFeet 的缺失值
mean_sqft = df['SquareFeet'].mean()
df['SquareFeet'].fillna(mean_sqft, inplace=True)

# 填充 Bedrooms 的缺失值
mean_bedrooms = df['Bedrooms'].mean()
df['Bedrooms'].fillna(mean_bedrooms, inplace=True)

print("\n填充數值缺失值後的 DataFrame:")
print(df)
```

### 步驟 3：處理分類特徵 (One-Hot Encoding)

模型無法理解 "Taipei" 或 "New York" 這樣的文字。我們需要將它們轉換成數字。最好的方法是 **獨熱編碼 (One-Hot Encoding)**。

它會為每個城市創建一個新的欄位，如果該行數據對應這個城市，則該欄位值為 1，否則為 0。

```python
# 首先，填充分類特徵的缺失值，例如用 'Unknown'
df['City'].fillna('Unknown', inplace=True)

# 使用 pandas 的 get_dummies 進行 One-Hot Encoding
city_dummies = pd.get_dummies(df['City'], prefix='City')
print("\nOne-Hot Encoding 結果:")
print(city_dummies)

# 將 one-hot 編碼後的新欄位加回原 DataFrame，並刪除原始的 City 欄位
df = pd.concat([df, city_dummies], axis=1)
df.drop('City', axis=1, inplace=True)

print("\n處理完所有特徵後的 DataFrame:")
print(df)
```

### 步驟 4：轉換為 PyTorch Tensor

現在，我們的 DataFrame 已經是純數值、沒有缺失值的乾淨數據了。最後一步就是將它轉換為 PyTorch Tensor。通常我們會把特徵 (X) 和目標 (y，我們要預測的 `Price`) 分開。

```python
# 分離特徵 (X) 和目標 (y)
features = df.drop('Price', axis=1)
target = df['Price']

# 將 pandas DataFrame 轉換為 NumPy array
X_np = features.values.astype(np.float32)
y_np = target.values.astype(np.float32)

# 將 NumPy array 轉換為 PyTorch Tensor
X_tensor = torch.from_numpy(X_np)
y_tensor = torch.from_numpy(y_np)

# y_tensor 通常需要調整形狀以符合模型輸入
y_tensor = y_tensor.view(-1, 1)

print("\n最終的特徵 Tensor (X):")
print(X_tensor)
print(f"Shape: {X_tensor.shape}")

print("\n最終的目標 Tensor (y):")
print(y_tensor)
print(f"Shape: {y_tensor.shape}")
```

這個過程展示了從一個混亂的真實數據集到一個乾淨、可用於模型訓練的 Tensor 的完整流程。這只是預處理的開始，更複雜的場景可能還需要數據標準化、歸一化等操作。

## 總結

恭喜你！你已經完成了 PyTorch 學習的第一步。今天我們了解了：
*   Tensor 是 PyTorch 的核心，它就像是能在 GPU 上跑的 NumPy。
*   標量、向量、矩陣都是不同維度的張量。
*   Tensor 的基本操作（創建、索引、運算）和 NumPy 非常相似。
*   如何透過 `pandas` 處理一個帶有缺失值和文字的真實數據集，並將其轉換為模型可用的 Tensor。

掌握了數據的表示與預處理，我們就為接下來學習自動求導和搭建神經網路打下了堅實的基礎。下一篇筆記，我們將會探索 PyTorch 的心臟——`autograd`！
