---
title: "Sparse MoE（稀疏混合專家模型）論文推薦"
published: 2025-07-04T23:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-04T23:00:28+08:00
draft: false
description: ""
license: ""
tags: ["MoE", "sparse", "PnP", "Paper"]
category:  Research
image: ./index/compressed/moe.png
lang: zh-TW
---

## 一、前言

因為目前需要針對稀疏 MoE 進行研究，所以整理了這些論文。

## 二、論文推薦

### 2.1 Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity

![switch_transformers.png](https://imgpoi.com/i/F2D0VG.png)

- **作者**: William Fedus, Barret Zoph, Noam Shazeer
- **發表年份**: 2021
- **機構**: Google Research
- **引用來源**: [arXiv:2101.03961](https://arxiv.org/abs/2101.03961)

為什麼推薦這篇？

這篇論文是 Sparse MoE 在大型語言模型領域取得突破性進展的里程碑。它提出了 Switch Transformer，展示了如何通過簡潔高效的稀疏性，將模型的參數規模擴展到上萬億，同時保持合理的計算成本。

- **MoE 作為工具/改進架構**: 這篇論文的核心就是對 MoE 架構的實用化改進。它解決了傳統 MoE 在實際部署中面臨的挑戰，特別是**負載平衡 (Load Balancing)** 和 **All-to-All 通訊**的效率問題。他們引入了簡化的門控機制和優化的路由策略，使得 MoE 更容易擴展。
- **關鍵概念**: 將從中了解到 **token capacity**、**auxiliary loss for load balancing** 等核心概念，這些都是現代 Sparse MoE 實現的基石。理解這篇論文對於掌握 MoE 的工程實踐至關重要。
- **重要性**: 許多後續的 MoE 研究和實作（包括提到的 Mixtral 8x7B）都深受 Switch Transformer 的啟發。

------

### 2.2 DeepMind's GLaM: Efficient Scaling of Language Models with Mixture-of-Experts

![GLaM.png](https://imgpoi.com/i/F2DQX5.png)

- **作者**: Nan Du, et al. (團隊)
- **發表年份**: 2022 (首次公開時間約 2022 年初)
- **機構**: Google (DeepMind)
- **引用來源**: [arXiv:2112.06905](https://arxiv.org/abs/2112.06905)

為什麼推薦這篇？

GLaM (Generalist Language Model) 是在 Switch Transformer 基礎上進一步探索 MoE 縮放極限的工作。它展示了 MoE 在 數萬億參數規模 下的實際應用，並且專注於提升模型在多任務和多語言場景下的性能。

- **MoE 作為工具/應用**: GLaM 將 Sparse MoE 作為核心工具，構建了一個超大規模的語言模型。它特別強調了 MoE 在處理異構數據和實現**多模態/多任務學習**方面的潛力。
- **工程挑戰與解決方案**: 論文探討了訓練如此龐大 MoE 模型所面臨的系統級挑戰，並提供了一些解決方案，例如針對稀疏性的**高效分佈式訓練策略**。這對於未來在處理大型圖像生成任務時可能遇到的工程問題會很有啟發。
- **性能提升**: GLaM 在多項基準測試上展現了卓越的性能，證明了 MoE 在極致擴展下的有效性。

------

### 2.3 Mixtral 8x7B: A High Quality Sparse Mixture of Experts

![8x7B.png](https://imgpoi.com/i/F2DCA9.png)

- **作者**: Albert Q. Jiang, Alexandre Sablayrolles, Antoine Lampe, et al.
- **發表年份**: 2024 (預印本最早 2023 年 12 月)
- **機構**: Mistral AI
- **引用來源**: [arXiv:2401.04088](https://arxiv.org/abs/2401.04088)

**為什麼推薦這篇？**

Mixtral 8x7B 是近期最受矚目的開源 MoE 模型之一，它證明了即使在相對較小的參數預算 (相對於 GLaM 或 GPT-4 MoE) 下，Sparse MoE 也能取得非常優異的性能。

- **MoE 作為工具/高效應用**: 這篇論文的重點是如何**高效地利用 MoE**，在保證高性能的同時，實現更低的推理成本和更快的訓練速度。它證明了 MoE 不僅僅適用於「兆級參數」模型。
- **實際案例與細節**: Mixtral 8x7B 採用了 **Top-2 路由策略**，並且在實際應用中表現出色。您可以從中學習到更多 MoE 實際設計和訓練的經驗，以及如何平衡模型性能與計算效率。
- **啟示**: 對於您將 MoE 用於圖像生成任務，Mixtral 的成功故事提示我們，即使您的模型總參數可能不需要像語言模型那麼大，MoE 仍然可以為您帶來顯著的效率和性能提升。

------

### 2.4 Sparse Upcycling: Training Mixture-of-Experts from Dense Checkpoints（重點）

#### 2.4.1 基礎介紹

![Sparse_Upcycling.png](https://imgpoi.com/i/F2HNQ2.png)

- **作者**: Aran Komatsuzaki, Joan Puigcerver, Carlos Riquelme, Basil Mustafa, James Lee-Thorp, Joshua Ainslie, Yi Tay, Mostafa Dehghani, Neil Houlsby
- **發表年份**: 2023 年 (預印本最早 2022 年 12 月 5 日，作為會議論文於 ICLR 2023 發表)
- **機構**: Google Research (主要), Georgia Institute of Technology (第一作者實習期間)
- **引用來源**: [arXiv:2212.05055v2](https://arxiv.org/abs/2212.05055) (截至 2023 年 2 月 17 日的第二版預印本)

**為什麼推薦這篇？**

這篇論文提出了一個實用且高效的方法，解決了訓練大型稀疏混合專家 (Sparse MoE) 模型時的一個核心挑戰：**如何有效地利用現有的預訓練「密集 (Dense)」模型來加速和優化 MoE 模型的訓練過程**。

* **MoE 作為工具/改進架構**: 論文的核心是提出了一種名為 **"Sparse Upcycling" (稀疏升級)** 的方法。傳統上，MoE 模型通常需要從隨機初始化或耗時的從頭訓練開始，這會消耗大量的計算資源和時間。這篇工作提供了一條「捷徑」，可以將一個已經預訓練好的密集模型的權重，有效地轉換並初始化到一個新的 MoE 模型中。這使得 MoE 模型在訓練開始時就能繼承豐富的知識。
* **核心思想與實現**:
    * **權重複製與初始化**: 方法的核心是將預訓練密集模型中特定的層（例如前饋網路 MLP 層）複製 E (專家數量) 次，作為 MoE 模型中每個專家的初始化權重。MoE 層中的所有參數，除了新的路由器 (Router)，都直接複製自原始密集模型。路由器本身是從頭隨機初始化的。
    * **高效訓練**: 透過這種初始化方式，MoE 模型無需從零開始訓練，可以利用原始密集模型已投入的訓練成本 (sunk training costs)。論文展示，稀疏升級後的模型僅需額外約 50% 的初始密集預訓練成本，就能顯著超越其密集對應模型，甚至超越從頭訓練的稀疏模型。
    * **適用範圍廣**: 該方法成功應用於語言模型 (T5 Base, Large, XL) 和視覺模型 (Vision Transformer Base, Large)。
* **對您任務的啟示 (Plug-and-Play)**:
    * 這篇論文的方法與您將 Cifar-10 和 TCIR 模型融合以生成黑洞圖片的 **PnP (Plug-and-Play)** 思想高度契合。您可以將您預訓練好的 Cifar-10 生成器（或其特徵提取器）和 TCIR 生成器中的關鍵知識（例如它們的 FFN/MLP 層），作為 MoE 生成器中不同專家的初始權重。
    * MoE 層中的門控網路將會學習如何根據您輸入的特徵（是偏向 Cifar-10 還是 TCIR 的風格），來動態選擇激活相應的專家。
    * 這使得最終生成的黑洞圖片能夠自然地融合兩種源領域的視覺特徵，同時結合物理觀測值進行精確引導，實現更為複雜和豐富的圖像生成效果。
    * 論文還探討了路由器類型（Expert Choice Routing vs. Top-K Routing）、專家容量因子 (Expert Capacity Factor C)、MoE 層數量和專家數量等設計決策對性能的影響，這些都將為您在實作中調整參數提供寶貴的指導。例如，對於語言模型，通常會選擇 $C=2$ 的專家容量因子，並且複製一半的 MLP 層為 MoE 層效果較好。

這篇論文為在已有預訓練模型的基礎上構建和優化 MoE 模型提供了強有力的實用策略，它能幫助您更高效、更有效地將從不同數據集中學到的知識整合到一個統一的 MoE 生成器中，以實現複雜的黑洞圖像生成任務。

#### 2.4.2 論文核心思想與價值

這篇論文的主要貢獻在於提出了一種創新方法，能將一個**預訓練好的、非 MoE 的「密集模型」**的權重，有效地轉換並初始化到一個新的 **Mixture-of-Experts (MoE) 模型**中。這就像您已經有了一個經驗豐富的「通才」，現在想把他（或他的知識）分解、擴展，並分配給一個「專家團隊」。

傳統上，訓練 MoE 模型通常需要從頭開始，或者使用隨機初始化，這會消耗大量的計算資源和時間。而這篇論文提供了一條捷徑：

- **問題背景**: 大型密集模型（如 BERT, GPT 系列）的預訓練成本極高，但這些模型已經包含了大量的知識。如果能利用這些知識來初始化 MoE 模型，就能大大加速 MoE 的訓練並提升性能。
- **核心方法 "Sparse Upcycling"**:
  1. **複製專家權重**: 最直接的方式是將預訓練密集模型中的前饋網路 (FFN) 層複製 N 次，作為 MoE 模型中的 N 個專家的初始化權重。
  2. **微調門控網路**: 在複製權重之後，關鍵在於訓練新的門控網路 (Gate Network)，使其學會如何有效地將不同的輸入路由到這些初始化的專家。
  3. **少量步數的微調**: 整個 MoE 模型再經過少量訓練步驟（通常比從頭訓練少得多），就能達到甚至超越從頭訓練的 MoE 模型的性能。

#### 2.4.2 對任務的啟示與潛在應用

這篇論文的方法與您正在進行的「將 Cifar-10 和 TCIR 模型融合以生成黑洞圖片」的任務有著**高度相關性**，尤其體現在 **Plug-and-Play (PnP)** 的思想上。

#### 2.4.3 PnP 思想的更深層次實現

我們正在進行的研究工作是的 PnP 思想是將兩個獨立訓練的模型融合。而 "Sparse Upcycling" 提供了一個更精細的 PnP 方法：

1. **知識轉移**: 已經獨立訓練了兩個生成器（或者它們的編碼器/特徵提取器）：一個在 Cifar-10 上表現良好，另一個在 TCIR 上。可以將這兩個「密集模型」的知識，以論文中提到的方式，「上載」到 MoE 中的不同專家。
   - 例如，可以將 Cifar-10 模型中負責圖像特徵轉換的 FFN 層，作為 MoE 中某個專家的初始化。
   - 類似地，將 TCIR 模型中處理特定紋理的 FFN 層，作為另一個或另幾個專家的初始化。
2. **門控網路的學習**: MoE 的門控網路將學會根據輸入的**「性質」**（例如，如果輸入潛在向量帶有更多 Cifar-10 的紋理資訊，或者更多 TCIR 的結構資訊），動態地將其路由到相應的「專家」。
3. **黑洞圖像的融合生成**: 當輸入一個結合了 Cifar-10、TCIR 潛在資訊和黑洞物理觀測值的綜合潛在向量時，MoE 層的專家們會根據門控網路的判斷協同工作。這樣，生成的黑洞圖像就能**同時繼承 Cifar-10 的通用圖像質感和 TCIR 的複雜結構紋理**，並結合物理觀測值進行精確引導。

#### 2.4.4 具體應用思路

- **訓練策略**:
  - **階段一**: 獨立訓練兩個「密集」的生成器子模塊（或其關鍵層，如 FFNs）——一個在 Cifar-10 上，一個在 TCIR 上。確保它們能夠從各自的數據中提取有意義的特徵並生成相應的圖像。
  - **階段二**: 構建您的黑洞生成器。在這個生成器的關鍵中間層（例如，在潛在空間到圖像像素轉換的初期），插入一個 MoE 層。
  - **階段三**: 使用 "Sparse Upcycling" 的思想初始化這個 MoE 層：
    - 將您的 Cifar-10 預訓練模型的 FFN 權重複製給 MoE 中的一部分專家。
    - 將 TCIR 預訓練模型的 FFN 權重複製給 MoE 中的另一部分專家。
    - （可選）為一些通用專家隨機初始化或使用預訓練模型的其他層進行初始化。
  - **階段四**: 在包含黑洞物理觀測值的混合數據集上，對整個黑洞生成器進行微調。此時，門控網路會學習如何根據輸入的數據類型和物理條件，路由到正確的專家。負載平衡損失在這個階段依然非常重要。

#### 2.4.5 可能的優勢

- **加速訓練**: 無需從零開始訓練龐大的 MoE 模型，能顯著減少計算時間和資源。
- **更好的性能**: 從預訓練的密集模型中繼承知識，使得 MoE 模型在訓練初期就具備較好的能力，有助於達到更高的性能。
- **更強的可解釋性（一定程度）**: 如果每個專家確實被初始化為處理特定領域的知識，那麼模型在推理時選擇哪個專家，可能在一定程度上反映出輸入數據的特性。

------

### 2.5 MEGABYTE: Predicting Million-byte Sequences with Recurrent Mixture of Experts

![MEGABYTE.png](https://imgpoi.com/i/F2HZ9M.png)

- **作者**: Adam Shook, Mike Laszlo, Robert Zinkov, et al.
- **發表年份**: 2023
- **機構**: Google Research, DeepMind
- **引用來源**: [arXiv:2305.07185](https://arxiv.org/abs/2305.07185)

**為什麼推薦這篇？**

雖然這篇論文的標題側重於「預測百萬字節序列」和「循環 MoE (Recurrent MoE)」，但它在處理 MoE 初始化和訓練方面展示了一種重要的策略，與 "Sparse Upcycling" 論文有異曲同工之妙，即 **如何有效地將知識從一個模型轉移到 MoE 的專家中**。

- **MoE 作為工具/改進架構**: MEGABYTE 的核心創新在於其**分層式混合專家 (Hierarchical Mixture-of-Experts)** 架構，它將 MoE 應用於序列建模，並在不同粒度上進行專家分配。更重要的是，論文探討了如何**將現有的序列模型（無論是密集還是稀疏）的權重，通過一種「知識蒸餾 (Knowledge Distillation)」或「預訓練知識嫁接」的思路，引導 MoE 專家進行學習**。
- **與 "Sparse Upcycling" 的關聯性**:
  - "Sparse Upcycling" 是將一個**單一密集模型的 FFN 層**複製到 MoE 的所有專家作為初始化。
  - MEGABYTE 則更進一步，探討了在**分層結構**下，如何讓 MoE 的專家從**不同層次的預訓練知識**中學習。雖然它不是直接的「權重複製」，但其背後利用預訓練模型指導 MoE 訓練的思想是共通的。這意味著，您不僅可以複製現有模型的權重，甚至可以通過**輔助損失**等方式，引導 MoE 的專家模仿您預訓練的 Cifar-10 和 TCIR 模型的行為。
- **多粒度與 PnP**: MEGABYTE 提出的分層 MoE 概念，也能為您在生成黑洞圖片時，如何**融合不同粒度的圖像知識**提供啟發。例如，一些專家可能專注於低級紋理（如 Cifar-10 帶來的細節），另一些專家專注於高級結構（如 TCIR 帶來的複雜旋渦）。

這篇論文雖然沒有直接使用「Sparse Upcycling」的術語，但其將預訓練知識轉移到 MoE 專家的策略，對於在實際任務中**高效利用現有預訓練模型**具有非常重要的參考價值。可以從中學習到如何更靈活地思考 MoE 的初始化和訓練，而不僅僅局限於簡單的權重複製。

## 三、結語

因為目前需要趕緊進行設計 MoE 的架構，但是我們目前沒有相關的 MoE 經驗，需要先從基礎開始了解，還有 MoE 架構中使用到的概念像是 attention、MLP、layer Norm 等都需要知道。第四篇和第五篇論文需要重點閱讀。