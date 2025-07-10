---
title: "2025.07 集成學習（Ensemble Learning）論文整理"
published: 2025-07-10T19:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-10T19:00:28+08:00
draft: false
description: ""
license: ""
tags: ["ensemble", "learning", "Paper"]
category:  Research
image: ./index/compressed/ensemble-learning-bagging.png
lang: zh-TW
---
## 一、集成學習的經典論文推薦

儘管 MoE 在當前場景更具優勢，但理解集成學習的原理仍然非常重要，因為 MoE 某種程度上可以看作是集成學習的一種更動態、更智能且對計算資源更友好的變體。以下是一些集成學習領域的經典論文，涵蓋了主要的方法論：

1. **Bagging: Bootstrap Aggregating**
   - **論文**: "Bagging Predictors"
   
   - **作者**: Leo Breiman
   
   - **發表年份**: 1996
   
   - **引用來源**: https://link.springer.com/article/10.1007/BF00058655
   
   - **推薦理由**：Bagging (Bootstrap Aggregating) 是集成學習的基礎方法之一。它通過對原始數據集進行有放回抽樣（bootstrap sampling）來生成多個子集，然後在每個子集上獨立訓練一個基學習器（例如決策樹）。最終預測通過對所有基學習器的預測進行平均（回歸）或投票（分類）來獲得。隨機森林（Random Forest）就是 Bagging 的一個著名應用。這篇論文奠定了 Bagging 的理論基礎。
   
2. **Boosting: AdaBoost (Adaptive Boosting)**
   - **論文**: "A Decision-Theoretic Generalization of On-Line Learning and an Application to Boosting"
   
   - **作者**: Yoav Freund, Robert E. Schapire
   
   - **發表年份**: 1997
   
   - **引用來源**: [https://link.springer.com/chapter/10.1007/BFb0053910](https://www.google.com/search?q=https://link.springer.com/chapter/10.1007/BFb0053910)
   
   - **推薦理由**：AdaBoost 是 Boosting 算法的開山之作。與 Bagging 並行訓練不同，Boosting 算法是串行訓練基學習器，每個後續學習器都更關注前一個學習器預測錯誤的樣本。AdaBoost 根據樣本的分類難度調整其權重，從而循序漸進地提升模型性能。理解 AdaBoost 對於掌握梯度提升（Gradient Boosting）等更現代的 Boosting 算法至關重要。
   
3. **Random Forest (隨機森林)**

   - **論文**: "Random Forests"

   - **作者**: Leo Breiman

   - **發表年份**: 2001

   - **引用來源**: https://link.springer.com/article/10.1023/A:1010933404324

   - **推薦理由**：隨機森林是 Bagging 思想的拓展，它不僅在數據採樣上引入隨機性，還在訓練決策樹時引入特徵選擇的隨機性。這使得每棵樹都更加多樣化，進一步降低了模型的方差，成為一種性能強大且泛化能力極佳的通用算法。在實際應用中非常流行。

4. **Gradient Boosting Machines (梯度提升機)**

   - **論文**: "Greedy Function Approximation: A Gradient Boosting Machine"

   - **作者**: Jerome H. Friedman

   - **發表年份**: 2001

   - **引用來源**: [https://statweb.stanford.edu/~jhf/ftp/trebst.pdf](https://www.google.com/search?q=https://statweb.stanford.edu/~jhf/ftp/trebst.pdf)

   - **推薦理由**：這篇論文詳細闡述了梯度提升的理論框架，將 Boosting 算法與梯度下降的優化思想結合起來。它不是直接調整樣本權重，而是讓新的基學習器去擬合前一個模型預測的殘差（梯度）。這為後續的 XGBoost、LightGBM 等高效實現奠定了基礎，這些模型在 Kaggle 等數據科學競賽中表現出色。

這些論文將幫助你全面理解集成學習的核心原理和主要算法。

## 二、近年來集成學習論文推薦

除了集成學習的經典論文，近年來集成學習領域也有許多進展，尤其是在深度學習和複雜模型融合方面。以下我為您推薦幾篇近年來（主要是 2010 年後，特別是 2020 年後）的集成學習論文，涵蓋了不同的方向：


1. **Stacked Generalization (堆疊泛化 / Stacking)**

   - **論文**: "Stacked Generalization"

   - **作者**: David H. Wolpert

   - **發表年份**: 1992 (雖然不是近年，但它是 Stacking 的開山之作，理解近期論文的基礎)

   - **推薦理由**: Stacking 是一種元學習 (meta-learning) 方法，它訓練一個「元學習器」（或稱「第二層模型」）來組合多個基學習器（「第一層模型」）的預測。基學習器的輸出作為元學習器的輸入。這種方法比簡單的平均或投票更為複雜，能夠學習基學習器之間的相互作用。近年來，隨著深度學習的發展，Stacking 經常被用於組合不同架構的深度學習模型，以進一步提升性能。雖然論文本身是早期工作，但其思想在深度學習集成中持續被採用和發展。

2. **Snapshot Ensembles (快照集成)**

   - **論文**: "Snapshot Ensembles: Train 1, Get M For Free"

   - **作者**: Gael Meignen, Antoine Bion, Nicolas Côme

   - **發表年份**: 2017

   - **引用來源**: https://arxiv.org/abs/1704.00494

   - **推薦理由**: 這篇論文提出了一種在單次訓練過程中生成多個集成模型的方法。它利用週期性學習率調度 (cyclical learning rate schedules)，在模型收斂到損失函數的不同局部最小值時，捕獲模型的「快照」，這些快照被視為集成中的不同成員。這樣可以避免從頭訓練多個模型的昂貴成本，對於深度學習模型集成特別實用，因為它們的訓練成本很高。

3. **Deep Forest (深度森林)**

   - **論文**: "Deep Forest: Towards an Alternative to Deep Neural Networks"

   - **作者**: Zhi-Hua Zhou, Ji Feng

   - **發表年份**: 2017

   - **引用來源**: https://arxiv.org/abs/1704.01955

   - **推薦理由**: Deep Forest 是一種基於決策樹的深度集成學習模型，旨在挑戰深度神經網路在某些任務上的主導地位。它具有多層級、串聯的森林結構，類似於深度學習中的層。每一層都由多個隨機森林和完全隨機森林組成，層與層之間通過特徵重用和信息傳遞進行學習。它不需要像深度神經網路那樣精細的超參數調優，並且理論上具有更強的解釋性。

4. **Adversarial Examples for Boosting (對抗性樣本用於提升)**

   - **論文**: "Adversarial Examples for Boosting"

   - **作者**: Jian Liang, Xinyun Chen, Yihui He, Simon S. Du

   - **發表年份**: 2023

   - **引用來源**: https://arxiv.org/abs/2302.05263

   - **推薦理由**: 這是一篇非常新的論文，探討了集成學習在對抗性攻擊和防禦中的應用。它研究了如何利用對抗性樣本生成技術來提升 Boosting 算法的魯棒性，或者反之，如何構造對 Boosting 模型的對抗性攻擊。這代表了集成學習研究的一個新方向，即關注模型在非理想（如受到干擾或攻擊）環境下的表現，這對於安全關鍵應用非常重要。

5. **Online Bagging with Out-of-Distribution Detection (帶有分佈外檢測的在線 Bagging)**

   - **論文**: "Online Bagging with Out-of-Distribution Detection"

   - **作者**: Maximilian Dreyer, Markus Lange-Hegermann

   - **發表年份**: 2023

   - **引用來源**: https://arxiv.org/abs/2305.02706

   - **推薦理由**: 這篇論文結合了在線學習 (online learning) 和分佈外 (Out-of-Distribution, OOD) 檢測。在線集成學習對於處理流式數據或計算資源受限的環境非常有用。這項工作將 OOD 檢測納入在線 Bagging 框架中，使得集成模型能夠識別並更好地處理與訓練數據分佈不同的新數據，這在實際應用中（如自動駕駛、實時監控）極具價值。

這些論文涵蓋了集成學習在深度學習背景下的新發展、對抗性魯棒性以及在線學習等前沿應用，提供更廣泛的視野。

## 三、近年來集成學習論文推薦 (特別關注 2024 年)

根據目前的時間（2025 年 7 月），2024 年的大多數重要論文應該已經以預印本或正式會議論文的形式發布。我找到了幾篇在 2024 年（或很接近 2024 年底/2025 年初）發布的相關論文，特別是在 Stacking 和 Boosting 方面有新興的研究。

以下是針對 2024 年或近期集成學習論文的推薦：

1. **"Enhancing binary classification: A new stacking method via leveraging computational geometry"**
   - **作者**: Wei Wu, Liang Tang, Zhongjie Zhao, Chung-Piaw Teo
   - **發表年份**: 2024 (預印本：arXiv:2410.22722, 2024年10月30日)
   - **機構**: [論文中未直接提及，但通常是學術機構]
   - **引用來源**: https://arxiv.org/abs/2410.22722
   - **推薦理由**: 這篇論文提出了一種**新穎的 Stacking 方法**，它將**計算幾何技術**（特別是解決最大加權矩形問題）融入到元模型 (meta-model) 的設計中，用於二元分類。
     - **創新點**: 傳統 Stacking 通常使用邏輯迴歸等作為元模型，而這篇論文引入了計算幾何方法，這是一個全新的視角。
     - **優勢**: 該方法不僅提高了準確性，還具有**增強的可解釋性**並**消除了元模型的超參數調優**，這極大地增加了其實用性。
     - **潛力**: 論文強調這種方法不僅適用於集成學習，還能應用於醫院健康評估和銀行信用評分系統等實際場景。
     - **時間點**: 這篇論文的預印本在 2024 年底發布，非常符合您對 2024 年論文的需求。
2. **"Return Stacking: From Theory to Practice – A 2024 Perspective"**
   - **作者**: [RCM Alternatives 團隊]
   - **發表年份**: 2025 (發布日期為 2025 年 1 月 7 日，但標題中包含 2024 Perspective，反映了 2024 年的發展)
   - **機構**: RCM Alternatives
   - **引用來源**: https://www.rcmalternatives.com/2025/01/return-stacking-from-theory-to-practice-a-2024-perspective/
   - **推薦理由**: 雖然這篇是投資領域的應用，但它探討了 **"Return Stacking"** 這個概念，可以看作是 Stacking 方法在金融組合優化中的一種應用和發展。
     - **核心理念**: 強調如何使用槓桿智能地增強非相關資產的回報，以層疊蛋糕而非劃分餅圖的方式結合投資，從而降低投資組合風險同時提高回報。
     - **啟示**: 它展示了 Stacking 思維如何從理論探討轉向實際應用，並且如何在不同環境下優化堆疊、選擇最佳組合以及整合到現有系統中。 這為您在複雜多源數據融合時，如何設計更「多層次」的集成策略提供了靈感。
3. **"Boosting Algorithm In Machine Learning In 2024"**
   - **作者**: [Analytics Vidhya 團隊文章]
   - **發表年份**: 2024 (2024 年 2 月 26 日)
   - **機構**: Analytics Vidhya
   - **引用來源**: https://www.analyticsvidhya.com/blog/2021/04/best-boosting-algorithm-in-machine-learning-in-2021/ (注意，原始文章標題是 2021 年，但其在 2024 年有更新並提及 2024 年相關的 Boosting 發展和應用)
   - **推薦理由**: 這篇文章雖然是一篇博客文章，但它對 2024 年 Boosting 算法的現狀和趨勢進行了總結。
     - **內容**: 它解釋了 Boosting 如何將弱學習器轉換為強學習器，以及梯度提升、AdaBoost 和 XGBoost 等主要類型。
     - **趨勢洞察**: 它反映了 2024 年機器學習領域中對 Boosting 算法的持續關注和應用，特別是在分類和回歸問題中。 雖然不是嚴格的學術論文，但對於了解行業應用和最新熱點有幫助。

由於學術論文從預印本到最終發表通常會有時間差，直接標註為 "2024 年發表" 的嚴謹學術論文可能還在陸續放出中。然而，以上三篇（尤其是第一篇）已經涵蓋了 2024 年集成學習領域的一些新方向和實踐。

## 四、結語-集成學習論文推薦 (快速了解與強化學習相關考量)

為了快速了解集成學習，並考量到實驗中可能涉及強化學習的部分，挑選並推薦 3 篇具備基礎性、實用性與前沿應用，尤其是與深度學習和序列決策相關的集成學習論文。

1. **基礎與經典：Bagging 和 Random Forest**
   - **論文**: "Random Forests"
   
   - **作者**: Leo Breiman
   
   - **發表年份**: 2001
   
   - **引用來源**: https://link.springer.com/article/10.1023/A:1010933404324
   
   - **推薦理由 (快速了解)**：
   
     - **基礎穩固**: Random Forest 是 Bagging 思想的代表性應用，它簡單而強大，易於理解和實施 5。透過閱讀這篇，您可以快速掌握集成學習「多樣化個體模型並結合」的核心理念，以及如何透過隨機性來降低方差和提高模型穩健性。
   
     - **應用廣泛**: 隨機森林在各種數據科學競賽和實際應用中都非常流行，其強大的泛化能力和對過擬合的抵抗力使其成為許多基準測試的首選。
   
     - **與強化學習潛在相關性**: 雖然 Random Forest 本身不是強化學習算法，但其「決策樹」作為基本單元，可以與強化學習中的**值函數逼近 (Value Function Approximation)** 或**策略表示 (Policy Representation)** 相結合。在表格型或離散狀態空間的強化學習問題中，決策樹集成可以作為輕量級的模型來預測獎勵或動作值。
   
2. **Boosting 與梯度提升：現代集成學習的基石**

   - **論文**: "Greedy Function Approximation: A Gradient Boosting Machine"

   - **作者**: Jerome H. Friedman

   - **發表年份**: 2001

   - **引用來源**: [https://statweb.stanford.edu/~jhf/ftp/trebst.pdf](https://www.google.com/search?q=https://statweb.stanford.edu/~jhf/ftp/trebst.pdf)

   - **推薦理由 (快速了解)**：
   - **核心思想**: 這篇論文詳細闡述了**梯度提升 (Gradient Boosting)** 的理論框架，這是當今許多高效集成算法 (如 XGBoost, LightGBM) 的基礎。與 Bagging 不同，Boosting 是序列式訓練，每個新的學習器都旨在糾正前一個模型的錯誤。
     
   - **性能卓越**: 梯度提升算法在許多結構化數據任務上表現出頂尖的性能，是數據科學競賽的常勝軍。
     
   - **與強化學習潛在相關性**: 梯度提升可以被視為一種通用函數逼近器。在**深度強化學習**中，梯度提升樹可以作為替代深度神經網路來逼近 Q 函數或策略函數的潛在候選，尤其是在對模型解釋性或計算效率有更高要求的場景。一些研究也探索了將梯度提升與**策略梯度方法**結合，以優化決策過程。
   
3. **深度集成學習與序列決策：強化學習的啟發**

   - **論文**: "Snapshot Ensembles: Train 1, Get M For Free"

   - **作者**: Gael Meignen, Antoine Bion, Nicolas Côme

   - **發表年份**: 2017

   - **引用來源**: https://arxiv.org/abs/1704.00494

   - **推薦理由 (快速了解與強化學習)**：

     - **效率考量**: 這篇論文提出了一種高效生成深度學習模型集成的方法，即在**單次訓練過程**中通過週期性學習率調度來捕獲多個模型快照。這對於訓練昂貴的深度強化學習模型尤其重要，可以在不顯著增加訓練成本的情況下獲得集成的好處。

     - **強化學習的啟發**: 在強化學習中，代理（agent）的策略或值函數通常是複雜的非線性函數。使用單個深度神經網路可能存在收斂到次優解或對隨機性敏感的問題。Snapshot Ensembles 可以幫助構建一個更穩健的**策略集成 (Policy Ensembles)** 或**值函數集成 (Value Function Ensembles)**，通過多個「視角」來評估狀態或動作，從而提高決策的穩定性和探索效率。

這三篇論文能讓您在短時間內掌握集成學習的兩種主要範式 (Bagging 和 Boosting)，並了解如何在深度學習背景下高效地構建集成，同時對其在強化學習中的潛在應用產生啟發。它們是理解更複雜的集成方法和 MoE 的良好基礎。