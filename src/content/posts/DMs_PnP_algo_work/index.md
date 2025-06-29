---
title: "重新理解擴散模型/PnP/各類算法區別/工作推進"
published: 2025-06-29T15:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-06-29T15:00:28+08:00
draft: false
description: ""
license: ""
tags: ["PnP", "CV", "Model", "DDPM", "DIFFUSION", "paper"]
category: Paper
image: ./index/compressed/dms_pnp.jpg
lang: zh-TW
---


## 一、前言
因爲我前幾篇記錄並分享了 DPS、DiffPir、PnP-DM 這三種針對後驗的算法，因爲我目前也在做相關的論文工作，這篇文章我會先按照我自己的理解先去總結一下擴散模型（其實我 DDPM 那篇論文並沒有精讀細節，因爲時間不太足夠，後面有時間再針對細節重讀），避免在工作上有歧義，接着給出這些方法之間的區別與改動，再給出現有的工作階段可以怎麼去修正。

> Blind-PnPDM 是我讀錯的論文，一開始看錯了，我以爲是 PnP-DM，讀到一半才知道不對勁，但是既然都讀了還是把事情做了收尾。

## 二、擴散模型（DMs）

### 2.1 擴散模型嚴謹官方定義（比較不好懂）

擴散模型是一類生成式人工智慧演算法，其核心思想是透過模擬物理擴散過程來生成高品質數據（如圖像）。它們分兩個階段運作：一個「正向擴散過程」，在此過程中雜訊逐漸添加到數據中，將其轉化為純粹的雜訊；以及一個「逆向擴散過程」，在此過程中神經網路學習精確地去除這些雜訊，從而重建原始數據。

在正向擴散過程中，微小的 Gaussian 雜訊在多個步驟中逐步添加到數據中，使數據變得越來越嘈雜。逆向過程則訓練一個神經網路來預測並去除每一步的雜訊，有效地「去雜訊」數據以從學習到的數據分佈中生成一個新的樣本。擴散模型在生成高度逼真和多樣化的輸出方面表現出色，其圖像品質和訓練穩定性通常優於生成對抗網路（GANs）。然而，擴散模型的主要缺點是其計算密集度高且採樣時間慢，通常需要數百甚至數千個步驟才能生成高品質圖像。

### 2.2 「即插即用」（PnP）範式：將 DMs 整合為先驗

PnP 方法透過將數據保真項（確保與觀測結果的一致性）與正規化項（引入圖像的先驗知識）解耦來解決逆問題。與明確定義數學先驗不同，PnP 方法「插入」現成的圖像去雜訊器作為隱式先驗。這種模組化特性使得研究人員能夠利用最先進的去雜訊器（包括基於深度學習的去雜訊器，如卷積神經網路去雜訊器），而無需重新訓練整個逆問題求解器。

雖然傳統的 PnP 方法產生點估計，但基於 PnP 的採樣方法越來越受到關注，這些方法可以從後驗分佈中生成多個解決方案，從而提供對不確定性的理解。這正是擴散模型特別相關的地方，因為它們可以作為先驗整合到 PnP 採樣公式中。

## 三、我的理解

### 3.1 擴散模型

擴散模型是對圖像進行正向擴散（加噪音）與逆向擴散（去噪音）的過程，也就是說擴散模型是使用圖片數據集去訓練出一個模型（Pytorch 的 `.pt` 文件），這個訓練出來的模型就是PnP定義下的 Prior（先驗），Prior 模型已經具備了完整的認知：將一張模糊的圖片修復成清晰的圖片。

> 我之前在做 Cifar-10 和 TCIR 數據集的訓練，就是訓練出 Prior。

那此時擴散模型的雛形認知已經形成：一個**「完整的擴散模型」**通常指那個**已經訓練完成、可以獨立生成圖像的 `.pt` 檔案**。這個模型本身主要體現了**「先驗 (Prior)」**，也就是它從大量數據中學到的關於圖像的本質分佈。

### 3.2 PnP

我在一開始理解錯了，以爲PnP是包含先驗的部分，但隨着論文讀多了，其實這裡理解是錯誤的。

**PnP 算法是「使用擴散模型解決逆向問題」這個過程中的核心機制，它負責將已訓練好的「先驗」知識與「觀測數據（似然）」結合，從而實現從「後驗」中採樣。**

換句話說：

- 「使用擴散模型解決逆向問題」：這是一個宏觀的目標和過程。
- 「涉及先驗與後驗的結合」：這是這個宏觀過程的本質。
- PnP 算法：是實現這種結合的具體方法和技術。它們是連結先驗和後驗的「橋樑」或「執行者」。

所以，**PnP 算法並不是「等於」整個過程**，而是這個過程中最關鍵、最具創新性且負責結合先驗與後驗的部分。它們是讓擴散模型從純粹的生成器，轉變為強大的逆向問題求解器的關鍵。

> 更通俗的說：
> - 擴散模型（作為一個軟體實體 / .pt 文件） = 先驗模型
> - 「使用擴散模型解決逆向問題」這個過程 = 涉及先驗與後驗的結合 = PnP 所做的工作

以下是關於擴散模型、先驗、後驗、似然和 PnP 概念的總結表格：

| 概念                            | 定義                                                         | 角色與關係                                                   |
| ------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **擴散模型** (The Model)        | 一個預訓練的神經網絡 (通常是 U-Net)，學會了從隨機雜訊中逐步去噪，生成高品質、真實的數據。 | 這個模型本身就代表了對數據的**「先驗分佈」P(X)**。它的訓練目標是學習數據的統計特性和結構，使其能夠無條件地生成符合真實世界分佈的樣本。 |
| **先驗** (Prior) P(X)           | 擴散模型透過訓練所學習到的關於「什麼是真實數據」的固有知識和分佈。它是模型獨立生成的基礎。 | 它是擴散模型的核心生成能力，是模型內部「理解」真實世界數據的基礎。在貝葉斯框架中，它是我們在觀察任何新數據前的初始信念。 |
| **似然** (Likelihood) P(Y \| X) | 描述了在給定原始真實數據 X 的情況下，觀察到特定觀測數據 Y 的概率。它定義了數據的退化或測量過程。 | 這是外部任務（例如圖像修復、去模糊）帶來的**約束條件**。它告訴模型，如果最終結果是 X，那麼觀察到 Y 的可能性有多大。在圖像修復中，它通常表示已知區域必須與觀測 Y 匹配。 |
| **後驗** (Posterior) P(X \| Y)  | 在給定觀測數據 Y 的情況下，原始真實數據 X 的可能性分佈。它是結合了先驗和觀測信息後的更新信念。 | 這是我們在解決逆向問題時希望推斷的**目標分佈**。PnP 類的算法就是**旨在從這個後驗分佈中採樣**，尋找既符合擴散模型先驗知識，又滿足觀測條件的解決方案。 |
| **PnP (即插即用) 算法**         | 一系列在**推斷 (Inference) 階段**，通過修改擴散模型逆向採樣過程來引入外部約束的算法。代表有 DPS, DiffPIR, PnPDM 等。 | **PnP 算法是實現「先驗」與「似然」結合的具體機制**。它們不改變預訓練的擴散模型 (先驗) 本身，而是在模型生成數據的每一步中，巧妙地利用似然信息來引導或修正生成方向，從而有效地從後驗分佈中採樣，解決各種逆向問題。它們是讓擴散模型從通用生成器轉變為特定問題求解器的橋樑。 |

> 先驗 + 似然 = 後驗

### 3.3 PnP 怎麼去結合先驗與後驗

首先，再次強調：PnP 算法的核心不是去訓練或修改先驗模型本身，而是在**擴散模型的逆向採樣過程的每一步**中，動態地引入觀測數據的約束。這就像是在一條已經鋪好的路上（先驗），每走一步都根據額外的指示（似然）來調整方向，最終到達目的地（後驗）。

> 也就是説在修復一張圖片時，會一直反覆調用這個 pt 文件，迴圈中，調用 pt，然後需要再對調用結果進行相關處理步驟，直到一個清晰圖片出來才會結束循環，而這些處理步驟中可以穿插改動然後加入自己定義的新步驟，可以理解擴散模型的使用也有一套標準，但是可以按自己的理解去改動這些標準

PnP 算法主要通過兩種廣泛的機制來結合先驗和後驗：

#### 3.3.1 梯度引導 (Gradient Guidance) - 代表：DPS, 部分 PnPDM 變體

這種方法基於貝葉斯定理在「得分函數」（Score Function，即概率分佈的對數梯度）空間的應用。

> **貝葉斯公式**: 後驗分佈可以根據貝葉斯定理表示為：
>
> $p(x|y) \propto p(y|x)p(x)$
>
> 其中：
>
> - $p(x∣y)$ 是後驗分佈：給定觀測 $y$ 後 $x$ 的分佈。
> - $p(y∣x)$ 是**似然函數 (Likelihood Function)**：表示在 $x$ 為真的情況下，觀察到 $y$ 的可能性。它描述了測量過程或數據退化過程。
> - $p(x)$ 是**先驗分佈**：如上所述，由預訓練的擴散模型提供，代表了對真實數據 $x$ 的先驗知識。

- **擴散模型提供什麼？(先驗部分)**

  - 預訓練的擴散模型學習的是如何預測噪聲，這本質上等同於學習**無條件數據分佈的得分函數** ${\nabla}_{X} log P(X)$。這個得分函數指明瞭如何從當前帶噪的 $X_t$ 中去噪，以朝著更高概率的真實數據 $X_0$ 移動。

- **似然提供什麼？(觀測約束部分)**
  - 對於逆向問題，我們有一個**似然函數** $P(Y∣X)$，它衡量了在給定真實數據 $X$ 的情況下，觀察到 $Y$ 的概率。我們可以計算這個似然函數對 $X$ 的梯度 ${\nabla}_{X} log P(Y|X)$。這個梯度指明瞭如何改變 $X$ 才能讓它更符合觀測 $Y$。
  
- **PnP 如何結合？(後驗採樣)**

  - 根據貝葉斯定理，後驗分佈的得分可以寫成：
    $${\nabla}_{X} log P(X|Y) = {\nabla}_{X} log P(X) + {\nabla}_{X} log P(Y|X)$$

  - DPS 等 PnP 算法就是在擴散模型的**每一步去噪中**，將模型預測的噪聲（對應 ${\nabla}_{X} log P(X)$）與從似然函數計算出的梯度（對應 ${\nabla}_{X} log P(Y|X)$）**疊加起來**。

  - 這使得每一步的去噪方向不僅考慮到模型學到的「普遍的真實數據形態」，也同時考慮到「如何讓當前生成結果符合給定的觀測 $Y$」。

  - **通俗理解**：擴散模型告訴你「這樣畫更像一幅畫」，而似然梯度告訴你「這樣畫才能符合你已有的鉛筆線」。PnP 就是把這兩種建議加起來，讓畫既自然又符合要求。


#### 3.3.2 數據一致性投影 (Data Consistency Projection) - 代表：DiffPIR

這種方法相對更直觀，它在去噪的每一步中強制執行觀測的一致性。

- **擴散模型提供什麼？(先驗部分)**
  - 模型仍然按照其學習到的先驗知識進行去噪，生成一個初步的、更清晰的圖像估計。
- **似然提供什麼？(觀測約束部分)**
  - 似然函數在這裡體現為一個**硬性約束**：圖像的某些區域（例如，圖像修復中未被遮擋的部分）是已知且不可改變的。
- **PnP 如何結合？(後驗採樣)**
  - DiffPIR 在擴散模型完成**每一步去噪後**，會執行一個**「投影」操作**。這個操作會將當前生成結果中**對應於觀測 Y 的已知區域的像素值，直接替換為觀測 Y 的原始值**。而缺失或未知區域則保留擴散模型生成的內容。
  - **通俗理解**：你先按照你的風格畫了一部分畫。PnP（DiffPIR）則是在你畫完後，拿著原始的、未被破壞的圖片，把你畫的已知區域直接「貼」上原始圖片的樣子，確保萬無一失。這樣，畫的已知部分與原始圖片完全吻合，而其他缺失部分則由你的繪畫風格（先驗）補齊。

#### 3.3.3 廣義引導 (General Guidance) - 代表：PnPDM (更廣義的框架)

PnPDM 是一個框架，**它可以包含上述兩種機制**，但更強調其**靈活性和可擴展性**。它可能引入獨立的「控制器」或「引導網絡」，這些網絡可以學習如何將擴散模型與各種非傳統約束（例如，文本、語義標籤、甚至是其他圖像的風格）結合。其結合方式可能還是基於梯度的，但似然的定義可以更抽象或更複雜。

**總結來說：**
PnP 算法之所以能夠結合先驗和後驗，是因為它們在擴散模型**多步迭代的逆向採樣過程**中：

1. **不斷地查詢先驗模型**：讓模型基於其學到的知識去預測噪聲，推進去噪過程。
2. **不斷地引入似然信息**：
   - 可以是通過**計算似然的梯度**，將其添加到去噪方向中（如 DPS）。
   - 可以是通過**強制性的像素替換或投影**，確保生成結果與已知觀測一致（如 DiffPIR）。
   - 也可以是**更通用的條件引導**（如 PnPDM）。

這個**「查詢先驗 + 引入似然」的循環**，使得最終的生成結果既符合擴散模型學到的真實數據特性（先驗），又嚴格遵循了我們給定的觀測條件（似然），從而有效地從後驗分佈中採樣出解決方案。

## 四、DPS / DiffPir / PnPDM 區別（微觀上改動）

### 4.1 擴散模型標準逆向採樣流程（未經修改的基線）

**所有的這些算法（DPS、DiffPIR、PnPDM）都是在一個已經預訓練好的擴散模型（一個 PyTorch 模型檔案，代表了「先驗」）的基礎上進行操作。**

它們的「改動」並非針對模型本身的權重進行重新訓練，而是針對這個模型**在推斷（生成或修復圖像）時的「逆向採樣步驟」進行的算法級別的修改**。這些修改發生在每一步去噪的過程中。

> 我理解這意思就是**擴散模型的逆向採樣迴圈**中插入自己的「改動」的。

首先，了解一個已經訓練好的擴散模型，在沒有任何額外約束條件下，是如何從雜訊中生成圖像的。

這是一個從時間步 $T$ (純雜訊) 迭代到 0 (清晰圖像) 的過程。對於每一個時間步 $t$ (從 $T$ 遞減到 1)：

1.  **輸入當前帶噪圖像 $X_t$**: 模型接收當前時間步的帶噪圖像。

2.  **模型預測噪聲**: 將 $X_t$ 和當前時間步 $t$ 輸入到預訓練的擴散模型 (通常是一個 U-Net)。模型會輸出一個預測的噪聲 $\epsilon_{pred}$，這個 $\epsilon_{pred}$ 是模型認為應該從 $X_t$ 中減去的噪聲，才能得到更清晰的圖像。

3.  **計算去噪後的 $X_{t-1}$**: 根據特定的擴散排程 (DDPM、DDIM 等) 的數學公式，使用 $X_t$ 和 $\epsilon_{pred}$ 來計算出下一步的圖像 $X_{t-1}$。這個 $X_{t-1}$ 比 $X_t$ 稍微清晰一些。

4.  **重複**: 將 $X_{t-1}$ 作為下一個時間步的 $X_t$ (當前帶噪圖像)，重複步驟 2 和 3，直到到達 $X_0$ (最終清晰圖像)。

### 4.2 三種算法如何「改動」這個流程

這三種算法的區別，就體現在它們在上述標準流程中，**在步驟 2 和步驟 3 之間（或緊隨步驟 3 後）插入了什麼額外的操作**，以便將外部約束條件（例如圖像修復中的已知區域）考慮進來。

#### 4.2.1 DPS (Diffusion Posterior Sampling) 的改動步驟

DPS 的核心是在每一步去噪時，除了模型預測的噪音外，還加入一個來自似然函數的「梯度引導」。

對於每一個時間步 $t$ (從 $T$ 遞減到 1)：

1.  **輸入當前帶噪圖像 $X_t$ 和有缺失的觀測圖像 $Y$ (帶掩碼)**。

2.  **模型預測噪聲**: 將 $X_t$ 和 $t$ 輸入預訓練的擴散模型，得到預測的噪聲 $\epsilon_{pred}$。

3.  **(新步驟) 預測噪聲計算估計的「潛在清晰圖像」$X_{0}^{est}$**: 根據擴散模型的數學關係，從 $X_t$ 和 $\epsilon_{pred}$ 推導出模型在當前時間步估計的最終清晰圖像 $X_{0}^{est}$。

4.  **(新步驟) 定義似然損失 $L$**: 定義一個損失函數 $L(X_{0}^{est}, Y)$，它衡量 $X_{0}^{est}$ 的已知區域與實際觀測 $Y$ 在已知區域的匹配程度。
    * 例如，對於圖像修復，如果 $M$ 是掩碼（已知區域為1，缺失區域為0），則 $L = ||M \odot (X_{0}^{est} - Y)||^2$。

5.  **(新步驟) 計算似然梯度 $\nabla_{X_t}L$**: 計算這個似然損失 $L$ 對當前帶噪圖像 $X_t$ 的梯度。這個梯度指明如何微調 $X_t$ 才能讓 $X_{0}^{est}$ 更好地匹配觀測 $Y$。

6.  **(新步驟) 調整預測噪聲或去噪方向**:
    * 將這個似然梯度 (可能乘以一個引導強度參數 $s$) 融入到原始的 $\epsilon_{pred}$ 中。形成一個引導後的噪聲預測 $\epsilon_{guided}$。
    * 例如，$\epsilon_{guided} = \epsilon_{pred} - s \cdot (\text{從 } \nabla_{X_t}L \text{ 反推回的噪音貢獻})$。

7.  **計算去噪後的 $X_{t-1}$**: 使用 $X_t$ 和這個引導後的 $\epsilon_{guided}$ 來計算出下一步的圖像 $X_{t-1}$。

8.  **重複**: 將 $X_{t-1}$ 作為下一個時間步的 $X_t$，重複步驟 2-7，直到到達 $X_0$ (最終清晰修復圖像)。



#### 4.2.2 DiffPIR (Diffusion Models for Plug-and-Play Image Restoration) 的改動步驟

DiffPIR 的核心是在每一步去噪後，強制將已知區域的像素替換回原始值。

對於每一個時間步 $t$ (從 $T$ 遞減到 1)：

1.  **輸入當前帶噪圖像 $X_t$ 和有缺失的觀測圖像 $Y$ (帶掩碼)**。

2.  **模型預測噪聲 $\epsilon_{pred}$**: 將 $X_t$ 和 $t$ 輸入預訓練的擴散模型，得到預測的噪聲 $\epsilon_{pred}$。

3.  **計算去噪後的「標準」$X_{t-1}^{std}$**: 使用 $X_t$ 和 $\epsilon_{pred}$ 來計算出下一步的圖像 $X_{t-1}^{std}$。

4.  **(新步驟) 應用數據一致性投影**:
    * **定義掩碼 $M$**: $M$ 為1的區域是已知區域 (未被遮擋)，$M$ 為0的區域是缺失區域。
    * **創建修改後的 $X_{t-1}^{mod}$**:
        * **對於已知區域 ($M=1$)**: $X_{t-1}^{mod} = Y$ (直接使用原始觀測圖像 $Y$ 的像素值)。
        * **對於缺失區域 ($M=0$)**: $X_{t-1}^{mod} = X_{t-1}^{std}$ (使用模型去噪的結果)。
    * **這可以用數學表示為**: $X_{t-1}^{mod} = M \odot Y + (1-M) \odot X_{t-1}^{std}$。

5.  **設定 $X_{t-1}$**: 將 $X_{t-1}^{mod}$ 作為當前時間步的最終結果 $X_{t-1}$。

6.  **重複**: 將 $X_{t-1}$ 作為下一個時間步的 $X_t$，重複步驟 2-5，直到到達 $X_0$ (最終清晰修復圖像)。



#### 4.2.3 PnPDM (Plug-and-Play Diffusion Models) 的改動步驟

PnPDM 是一個框架，其具體操作更通用，但通常也涉及對去噪方向的修改，只是這個修改來源更靈活。

對於每一個時間步 $t$ (從 $T$ 遞減到 1)：

1.  **輸入當前帶噪圖像 $X_t$ 和約束條件 $C$ (例如有缺失的圖像 $Y$、或一個文本提示)**。

2.  **模型預測噪聲 $\epsilon_{pred}$**: 將 $X_t$ 和 $t$ 輸入預訓練的擴散模型，得到預測的噪聲 $\epsilon_{pred}$。

3.  **(新步驟) 根據約束條件 $C$ 計算一個「引導項」**:
    * 這一步是 PnPDM 最靈活的部分。它可能是一個：
        * 基於 $X_{0}^{est}$ 和 $C$ 的損失函數的梯度 (類似 DPS，但 $C$ 更通用)。
        * 一個額外訓練的「引導網絡」，它接收 $X_t$ 和 $C$ 作為輸入，輸出一個引導方向或調整項。
        * 一個基於某些特定屬性 (如清晰度、特定物體存在與否) 的度量，並計算其梯度。
    * 假設這個引導項為 $G_{term}$。

4.  **(新步驟) 結合模型預測和引導項**:
    * 將 $G_{term}$ (可能乘以一個引導強度 $s$) 融入到原始的 $\epsilon_{pred}$ 中。形成一個引導後的噪聲預測 $\epsilon_{guided}$。
    * 例如，$\epsilon_{guided} = \epsilon_{pred} - s \cdot G_{term}$ (具體公式會因 PnPDM 的變體而異)。

5.  **計算去噪後的 $X_{t-1}$**: 使用 $X_t$ 和這個引導後的 $\epsilon_{guided}$ 來計算出下一步的圖像 $X_{t-1}$。

6.  **重複**: 將 $X_{t-1}$ 作為下一個時間步的 $X_t$，重複步驟 2-5，直到到達 $X_0$ (最終清晰修復圖像)。

### 4.3 圖解

以下是我自己繪製的圖片：

![dms_pnp.jpg](https://imgpoi.com/i/FVCB85.jpg)

## 五、各類算法的應用場景與優劣

###  5.1 應用場景

這四種方法雖然都利用了擴散模型，但它們在解決逆問題的特定方面、擴散模型的作用以及處理數據一致性和雜訊的方式上存在顯著差異。

> 這裡額外加上了 Blind-PnPDM

- **問題範圍：**
  - **PnPDM**：主要針對**已知測量算子**的一般逆問題（包括線性與非線性），旨在提供原則性的後驗採樣。
  - **Blind-PnPDM**：主要針對**盲逆問題**，其中原始圖像和測量算子（例如模糊核）都是未知的。這是其決定性特徵，解決了比標準圖像復原更複雜的場景。
  - **DiffPir**：專注於一般的**圖像復原任務**（例如超解析度、去模糊、圖像修復），其中正向降級模型通常是**已知**的。其創新在於它如何利用擴散模型來處理這種已知算子設置。
  - **DPS**：專門處理**嘈雜和潛在非線性逆問題**。雖然算子通常是**已知**的，但它可能很複雜且非線性，並且明確假設測量結果是嘈雜的。
- **擴散模型的作用：**
  - **PnPDM**：將單個擴散模型作為**原則性先驗**，透過將逆問題簡化為高斯去雜訊問題的後驗採樣來實現。它強調避免近似，以獲得更準確的後驗分佈。
  - **Blind-PnPDM**：採用**兩個獨立的擴散模型**作為先驗：一個用於目標圖像 ($D_\alpha$)，另一個用於未知測量算子參數 ($D_\beta$)。這種雙重先驗方法是其盲問題設置所獨有的 。
  - **DiffPir**：將單個擴散模型整合為傳統 PnP 最佳化框架中的**生成式去雜訊先驗**，旨在利用擴散模型的生成能力實現高品質復原。
  - **DPS**：使用單個擴散模型來學習數據先驗（分數函數），並修改其**後驗採樣過程**，透過引入近似的似然梯度來引導生成以實現數據一致性，尤其是在嘈雜和非線性設置中。
- **數據一致性/似然處理：**
  - **PnPDM**：透過**Split Gibbs Sampler (SGS)** 框架實現數據一致性，在似然步驟和先驗步驟之間交替。
  - **Blind-PnPDM**：透過**Split Gibbs Sampler (SGS)** 框架實現數據一致性。這涉及在「似然步驟」中引入輔助變量 $(z,v)$，這些變量與測量和先前估計一致，然後在「先驗步驟」中由擴散模型「去雜訊」。
  - **DiffPir**：將擴散模型作為去雜訊器整合到 PnP 最佳化循環中，通常使用半二次分裂（HQS）等方法在去雜訊和數據保真強制之間交替。
  - **DPS**：透過將近似的似然梯度 (${\nabla}_{x_t} log p_t(y|x_t)$) 整合到採樣過程中，直接**修改逆向擴散 SDE**。關鍵是，它**避免了嚴格的投影步驟**，這在嘈雜環境中可能會產生問題。
- **雜訊處理：**
  - **PnPDM**：雜訊作為後驗採樣的整體部分隱式處理，透過將逆問題簡化為高斯去雜訊問題來處理。
  - **Blind-PnPDM**：雜訊作為圖像和未知算子後驗採樣的整體部分隱式處理。交替去雜訊步驟有助於減輕雜訊。
  - **DiffPir**：雜訊作為復原過程的一部分隱式處理，旨在實現高重建保真度和感知品質。
  - **DPS**：**明確設計**用於嘈雜測量，整合了各種雜訊統計（Gaussian、Poisson），並採用了一種避免雜訊放大的方法，從而在嘈雜場景中產生更穩健的結果。

### 5.2 優勢與劣勢

| 特徵/方面               | PnPDM (原則性機率成像)                                       | Blind-PnPDM (用於盲逆問題的即插即用後驗採樣)                 | DiffPir (用於即插即用圖像復原的去雜訊擴散模型)               | DPS (用於一般嘈雜逆問題的擴散後驗採樣)                       |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **主要問題類型**        | 一般逆問題 (算子已知，線性/非線性)                           | 盲逆問題 (圖像和算子未知)                                    | 一般圖像復原 (算子已知)                                      | 嘈雜和非線性逆問題 (算子已知，但複雜/嘈雜)                   |
| **測量算子知識**        | 已知                                                         | 未知 (在推理過程中估計)                                      | 已知                                                         | 已知 (可以是線性或非線性)                                    |
| **核心演算法方法**      | MCMC (Split Gibbs Sampler) 將逆問題簡化為高斯去雜訊後驗採樣  | 交替 Gibbs 採樣與 Split Gibbs Sampler (SGS)                  | 將 DM 整合到傳統 PnP 最佳化中 (例如 HQS)                     | 帶有近似似然梯度的修改逆向擴散 SDE                           |
| **數據一致性/似然處理** | 透過 SGS 框架中的似然步驟和先驗步驟                          | 透過輔助變量進行變量分裂 (似然步驟)，然後是 DM (先驗步驟)    | 交替 DM 去雜訊與數據保真最佳化                               | 直接修改 SDE 與近似似然梯度；避免嚴格投影                    |
| **雜訊處理**            | 透過將逆問題簡化為高斯去雜訊問題來處理                       | 透過圖像和算子的後驗採樣隱式處理                             | 作為復原過程的一部分隱式處理                                 | 明確設計用於嘈雜測量 (Gaussian, Poisson)；避免雜訊放大       |
| **主要優勢**            | - 原則性採樣： 避免近似，提供更準確的後驗分佈。<br> - 廣泛適用性： 適用於多種線性與非線性逆問題 (包括黑洞成像)。<br/> - 不確定性量化： 提供後驗分佈樣本。 - 與 EDM 兼容： 可利用各種預訓練 DM。 | - 解決盲問題： 獨特地處理未知降級過程。<br/> - 高重建品質： 圖像和算子估計均達到最先進水平。 <br/>- 靈活的 PnP 整合： 利用現有 DM 處理兩個領域。 | - 高效： 以顯著更少的 NFE (<100) 實現 SOTA。<br/> - 繼承生成能力： 產生高感知品質和自然外觀結果。<br/> - 靈活的 PnP： 與傳統 PnP 最佳化方法兼容。 | - 對雜訊穩健： 設計用於處理嘈雜測量而不放大雜訊。<br/> - 處理非線性： 適用於複雜的非線性正向模型。<br/> - 通用性： 適用於各種科學/醫學成像任務。<br/> - 避免 SVD： 完全在圖像域中操作，避免昂貴的計算。<br/> - 不確定性感知： 提供來自後驗分佈的樣本。 |
| **主要限制**            | - 由於 MCMC 採樣，計算可能密集。<br/> - 論文主要關注已知算子問題。 | - 需要為算子參數訓練 DM (如果不是通用的)。<br/> - 由於聯合估計的雙 DM 採樣，計算可能密集。<br/> - 聯合後驗採樣的複雜性。 | - 主要用於已知降級模型；不適用於盲問題。<br/> - 可能不如 DPS 對高度多樣化或複雜雜訊類型那麼穩健。<br/> - 與非 DM 方法相比，仍需要中等數量的 NFE。 | - 似然項的近似可能在某些情況下引入不準確性。<br/> - 計算可能仍然密集 (DM 固有，儘管已努力提高效率)。<br/>- 對於算子未知的盲逆問題可能不如 Blind-PnPDM 有效。 |


PnPDM、Blind-PnPDM、DiffPir 和 DPS 這四種方法各自在圖像復原領域做出了獨特的貢獻，共同推動了擴散模型在解決多樣化逆問題方面的應用。

- **PnPDM** 在**已知測量算子**的情況下，透過將逆問題簡化為高斯去雜訊問題的後驗採樣，提供了一種**原則性的**貝葉斯成像方法。它強調避免近似，以確保從真實後驗分佈中進行準確採樣，並在多種線性與非線性問題上展現出卓越性能。
- **Blind-PnPDM** 作為**盲逆問題**領域的開創性 PnP 採樣方法脫穎而出。它創新性地使用了**兩個擴散模型**——一個用於圖像，一個用於未知測量算子——使其能夠聯合推斷出清晰圖像和降級過程，這對於系統知識不完整的現實世界場景至關重要。
- **DiffPir** 解決了基於擴散模型的圖像復原中**計算效率**的實際挑戰。透過將擴散模型無縫整合為傳統 PnP 框架中的**生成式去雜訊先驗**，它以顯著減少的神經函數評估次數（少於 100 次）實現了最先進的結果，使得高品質的生成式復原更具可及性。
- **DPS** 透過為**嘈雜和非線性環境**提供一個強大而通用的框架，推動了擴散模型在逆問題中的界限。其關鍵創新在於近似難以處理的似然項，並且最重要的是，**避免了可能放大雜訊的嚴格投影步驟**，從而在具有挑戰性的現實世界數據環境中提供更可靠和視覺上更一致的重建。

每種方法都開闢了獨特的利基市場：PnPDM 適用於已知算子的原則性後驗採樣，Blind-PnPDM 是處理未知降級情況的首選，DiffPir 適用於已知算子的高效高品質復原，而 DPS 則為本質上嘈雜和複雜的物理系統提供穩健的解決方案。

## 六、我們可以做的改進工作

### 6.1 現有算法共同需要的研究方向

PnPDM、DiffPir 和 DPS 中所見的進步共同突顯了擴散模型在解決各種逆問題方面的巨大潛力。**未來的研究很可能將重點放在結合這些方法的優勢上——例如在保持高效率和雜訊穩健性的同時實現盲能力——進一步提高採樣速度，減少計算資源需求，並將其適用性擴展到更廣泛、更複雜的科學和工程挑戰。這一趨勢預示著基於擴散模型的求解器將越來越通用、穩健和實用，能夠適應現實世界數據的不確定性和複雜性。**

### 6.2 待確定修改方向

#### 6.2.1 先前的工作總結

因爲之前的實驗工作是將一個模型分別使用兩個不同的初始方式生成兩個模型，然後互相去影響來嘗試看看效果，但是這樣的縫合方法並不是那麼理想（不穩定），但是穩定的結果反而有好一點點。

#### 6.2.2 我的思考

目前從師兄那我理解到的是：目前我們的工作根基可以是 DPS 算法。我目前對這方面的實驗工作成本不太清楚，如果想改進這個算法，我覺得也是從缺陷下手的話，而不是隨機選另一個模型縫合，我建議是可以嘗試在 DPS 算法上做以下工作：

##### 6.2.2.1 採樣器提升採樣速度

目前採樣速度是明顯缺陷，想改變這個缺陷，**是否可以加入 DDIM 等採樣器**，加速器本质上是为无条件生成设计了更高效的 SDE/ODE 离散化方案。要将它们与 DPS 结合，关键在于将 DPS 计算出的结合了似然梯度的“修正分数函数”或“修正噪声预测”作为输入，传递给这些加速采样器的迭代更新公式。这意味着在 DDIM 的预测 $x_0$ 或者 DPM-Solver 的下一步 $x_{t−1}$ 计算中，需要将 DPS 特有的似然梯度贡献考虑进去 。

**挑战：确保加速采样器在引入似然梯度后仍能保持稳定性和收敛性，以及在低NFE下重建质量不显著下降。可能需要针对特定采样器调整似然梯度项的权重或形式。**

> 在擴散模型和逆問題的背景下，NFE 代表「函數評估次數」（Number of Function Evaluations）。這是一個用來衡量不同方法計算效率的指標。通常來說，NFE 值越低，表示該方法在計算上越高效。
> 
> 在報告中，NFE 與「時鐘時間 (秒)」一起呈現，以全面比較各種方法的計算效率，包括 DDRM、DPS、PnP-SGS、DPnP 和 PnP-DM。例如，在超解析度問題中，DDRM 的 NFE 為 20，而 PnP-DM 的 NFE 為 3032。
> 
> 值得注意的是，儘管 PnP-DM 的 NFE 相對較高（在某些情況下約為 DPS 的 3 倍），但其運行時間卻與 DPS 相當（約為 DPS 的 1.5 倍）。這主要是因為 PnP-DM 透過在每次迭代中調整起始雜訊水平來避免運行完整的擴散過程，並且使用了耦合參數的退火排程，從而有效降低了實際運行時間。此外，PnP-DM 中每個先驗步驟的函數評估次數不一定為 100，因為隨著演算法運行，耦合參數 'p' 會減小，導致後期迭代中的步驟數遠少於 100。

##### 6.2.2.2 改進近似項

在DPS中有可能有以下部分這個部分：

- **仅依赖后验均值：** 目前的近似只考虑了后验均值 $\hat{x}_0$，而忽略了后验分布 $p(x_0∣x_t)$ 的其他统计信息（可能是方差？）。

**挑战： 估计高维分布的协方差通常计算成本很高，或者需要更复杂的神经网络结构。如何将其高效且稳定地融入到DPS的迭代过程中是一个挑战。**

#### 6.2.2.3 優化超參數

步長 $\zeta_i$ 在 DPS 算法中是很重要的超參數，论文通过消融实验表明 $\zeta$ 的选择对结果影响很大，并给出了一个经验范围 $[0.1, 1.0]$。然而，这种经验性设定可能不适用于所有任务或噪声水平。

我們是否可以在擴散過程中結合当前图像的噪声水平、与数据流形的距离、重建误差等动态调整 $\zeta_i$？

