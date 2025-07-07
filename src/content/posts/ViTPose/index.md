---
title: "ViTPose++: Vision Transformer for Generic Body Pose Estimation"
published: 2025-07-07T11:50:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-07T11:50:28+08:00
draft: false
description: "論文中文--ViTPose++：用於通用人體姿態估計的視覺 Transformer"
license: ""
tags: ["Transformer", "ViTPose++", "MoE", "sparse", "Paper"]
category:  Research
image: ./index/compressed/Figure2.png
lang: zh-TW
---

## 一、前言

論文中文--ViTPose++：用於通用人體姿態估計的視覺 Transformer，[論文原文](https://arxiv.org/abs/2212.04246)，搭配原文食用。

這篇論文的核心故事是關於 **「返璞歸真」** 的力量。在大家普遍認為姿態估計需要精心設計的、複雜的CNN或混合式Transformer架構時，本文作者反其道而行，證明了一個 **樸素、簡潔的視覺Transformer（Vision Transformer, ViT）** 不僅能勝任，甚至能做得更好。在此基礎上，他們進一步提出了一種受MoE啟發的優雅設計（ViTPose++），向著通用的、跨物種的姿態估計基礎模型邁出了堅實的一步。

## 二、研究背景與動機 (Background and Motivation)

在ViTPose出現之前，人體姿態估計領域的主流方法主要有兩類：
1.  **基於CNN的架構：** 以HRNet等為代表，通過設計複雜的多尺度融合網路來保持高解析度特徵，取得了巨大成功，但架構設計複雜，且CNN的歸納偏置（inductive bias）使其擴展性受限。
2.  **混合式Transformer架構：** 認識到Transformer在建模長程依賴上的優勢，許多工作開始嘗試將其引入姿態估計。但這些方法通常比較「擰巴」，它們大多保留了CNN作為特徵提取的骨幹（backbone），然後在其後接入一個精心設計的、結構複雜的Transformer模塊（如TokenPose, TransPose），用來做特徵細化或關係建模。

作者們敏銳地觀察到一個問題：儘管ViT在圖像分類等基礎視覺任務上展示了強大的潛力，但**很少有人去探索一個樸素、簡潔、非層級化的標準ViT，在沒有任何花哨設計的情況下，直接作為姿態估計的骨幹網路，其潛力究竟有多大？**

此外，當時的研究大多只專注於**單一物種**（主要是人類）的姿態估計。如何構建一個**通用的（Generic）**、能夠同時處理人類、動物等多種不同身體結構的姿態估計**基礎模型（Foundation Model）**，是另一個被忽視但極具價值的研究方向。這便是本文的兩大核心動機。

## 三、核心問題 (The Core Problem)

論文旨在解決的核心問題是：
1.  一個僅由**樸素ViT編碼器和輕量級解碼器**組成的極簡模型（ViTPose），能否在性能和效率上超越那些結構複雜的、為姿態估計任務專門設計的CNN或混合式模型？
2.  如何設計一個**單一的、統一的模型（ViTPose++）**，使其能夠高效地處理多個異構的姿態估計任務（如人類、多種動物），並解決多任務學習中常見的**「任務衝突」**問題，最終實現SOTA性能？

## 四、提出的方法與核心設計

論文的貢獻分為兩個層次：首先提出簡單的基線模型 **ViTPose**，然後在其基礎上，為解決多任務問題提出更先進的 **ViTPose++**。

### 4.1 ViTPose：大道至簡

ViTPose的設計理念是**極簡主義**。

![Figure2.png](https://imgpoi.com/i/F1UWA9.png)

> **圖表解讀 (Figure 2a):** 這是ViTPose的整體架構圖，清晰地展示了其簡潔性。
> * **編碼器 (Encoder):** 直接採用一個**樸素、非層級化的標準ViT**作為骨幹網路。輸入圖像被切分成多個塊（Patches），然後送入一系列完全相同的Transformer Block進行特徵提取。
> * **解碼器 (Decoder):** 採用一個極其**輕量級**的解碼器，將ViT輸出的特徵圖上採樣，並回歸出關節點的熱力圖（Heatmaps）。

論文甚至實驗證明（Table 3），解碼器可以被簡化到極致——僅僅是一個雙線性插值上採樣層和一個卷積預測層，性能也幾乎沒有損失。這有力地證明了，**ViTPose的強大性能主要來源於ViT骨幹網路強大的特徵表示能力**，而非複雜的解碼器設計。

![Table3.png](https://imgpoi.com/i/F1UR9M.png)

### 4.2 ViTPose++：面向通用姿態估計的知識分解 (Knowledge Factorization)

當需要用一個模型同時處理多個任務（如人類、貓、狗的姿態估計）時，一個挑戰是不同任務間既有共享知識（如「頭」、「腿」等概念），又有獨特知識（如不同物種的身體結構差異），這容易導致任務間的負遷移或衝突。

ViTPose++巧妙地借鑒了**混合專家（MoE）**的思想，但並未使用傳統的帶路由器的MoE，而是提出了一種更為簡潔、高效的**「知識分解」**方案。

![Figure4.png](https://imgpoi.com/i/F1UAX5.png)

> **圖表解讀 (Figure 4):** 此圖展示了ViTPose++中FFN層的內部結構，這是其核心創新。
> * **觀察：** 作者通過實驗發現（Table 8），在微調ViTPose時，凍結FFN層比凍結MHSA（多頭自注意力）層導致的性能下降要大得多。這啟示他們：**FFN層更多地負責學習任務相關的知識，而MHSA層則更為通用。**
>
>     ![Table8.png](https://imgpoi.com/i/F1UUQ2.png)
>
> * **設計：** 基於此，ViTPose++只對FFN層進行改造。它將每個FFN分解為**共享專家（Shared Expert）**和**任務專屬專家（Task-specific Experts）**。
>
> * **流程：**
>     1. FFN的第一個線性層處理完後的特徵 $F^{FFN}$ 被**複製**。
>     2. 一份送入一個**所有任務共享**的線性層，輸出共享知識特徵 $F^{\text{shared}}$。
>     3. 另一份送入一個**為當前任務專屬**的線性層，輸出任務相關知識特徵 $F^{\text{specific}}$。
>     4. 最後將 $F^{\text{shared}}$ 和 $F^{\text{specific}}$ 沿通道維度拼接（Concatenate），形成該層的最終輸出。

### 4.3 數學公式解析
ViTPose++中FFN層的計算過程如下：
1.  FFN的第一個線性層（所有任務共享）：
    $$
    F^{\text{FFN}} = \text{ReLU}(\text{Linear}(F^{\text{attn}}))
    $$
2.  特徵分解為共享和專屬兩路：
    $$
    F^{\text{shared}} = \text{Linear}_{\text{shared}}(F^{\text{FFN}})
    $$
    $$
    F^{\text{specific}} = \text{Linear}_{\text{specific}}(F^{\text{FFN}})
    $$
3.  最終輸出為拼接結果：
    $$
    F^{\text{out}} = \text{Concat}(F^{\text{shared}}, F^{\text{specific}})
    $$
    一個絕妙之處在於，在**推理階段**，對於某個特定任務，其專屬的$Linear_{specific}$和共享的$Linear_{shared}$可以被**合併成一個單一的線性層**，因此ViTPose++在為單一任務推理時，**不會引入任何額外的參數量和計算成本**，與原始的ViTPose完全一樣快。

## 五、關鍵概念解析

* **樸素視覺Transformer (Plain Vision Transformer):** 指的是最原始的ViT架構，由一系列結構相同的標準Transformer Block堆疊而成，沒有CNN式的層級結構或多尺度設計。
* **知識分解 (Knowledge Factorization):** ViTPose++的核心思想。它是一種簡化的、確定性的MoE實現，將FFN層的參數顯式地分解為「任務無關」（共享）和「任務相關」（專屬）兩部分，從而高效地在多個任務間共享知識並保留各自特性。
* **知識蒸餾令牌 (Knowledge Token):** 一種新穎的知識蒸餾方法。通過在一個強大的教師模型上專門訓練一個可學習的向量（token），然後將這個學得的「知識令牌」拼接到學生模型的輸入中，從而實現高效的知識遷移。

## 六、實驗設計與結果分析

* **效率與性能的帕累托最優：**
    ![Figure1.png](https://imgpoi.com/i/F1UYVG.png)
    
    > **圖表解讀 (Figure 1):** 這張圖極具說服力，它展示了在MS COCO數據集上，不同模型在**精度（AP）**和**速度（Throughput）**上的權衡。ViTPose家族（橙色和紅色大氣泡）明顯地構成了一條新的**帕累托前沿（Pareto Front）**，即在相同的精度下，ViTPose的速度遠超之前的SOTA模型（如HRNet, HRFormer）；在相同的速度下，精度則更高。
    
* **知識分解有效解決任務衝突：**
    
    ![Table10.png](https://imgpoi.com/i/F1UP1D.png)
    
    
    
    ![Table11.png](https://imgpoi.com/i/F1U1HV.png)
    
    > **表格解讀 (Table 10 & 11):** Table 10顯示，如果使用樸素的多任務學習方法（共享整個骨幹網路），當引入與人類姿態差異較大的動物數據集（AP-10K等）後，模型在COCO（人類）上的性能從77.1 AP下降到了76.7 AP，出現了**任務衝突**。而Table 11顯示，採用了知識分解的ViTPose++（PS-FFN），在同樣的多任務數據上訓練後，COCO性能達到了77.0 AP，**成功解決了任務衝突帶來的性能下降**。
    
* **通用姿態估計的SOTA性能：**
    
    ![Table12.png](https://imgpoi.com/i/F1UTVE.png)
    
    > **表格解讀 (Tables 12-20):** 論文在大量數據集上進行了驗證。ViTPose++在包括MS COCO（人類）、OCHuman（遮擋人體）、MPII（人類）、COCO-Wholebody（全身）、AP-10K（動物）、APT-36K（動物）等多個權威Benchmark上，**使用同一個模型，均達到了SOTA（State-of-the-Art）水平**，充分證明了其作為通用姿態估計基礎模型的強大能力。例如，其最大的ViTPose-G模型在COCO test-dev上取得了80.9 AP的單模型最高分。

## 七、論文的核心貢獻與意義

1.  **證偽與證真：** 證偽了「姿態估計必須使用複雜的、為該任務深度訂製的架構」這一普遍認知；證實了 **「一個簡單、通用、可擴展的ViT骨幹網路，是姿態估計的更優選擇」**。
2.  **提出ViTPose++架構：** 提出了一種新穎、高效且無額外推理開銷的**知識分解**方法，巧妙地運用了MoE的思想來解決多任務學習中的核心挑戰，為構建**通用視覺基礎模型**提供了重要的實踐範例。
3.  **樹立了新的行業標竿：** ViTPose系列模型在精度和效率上都設立了新的SOTA，其開源的代碼和模型極大地推動了學術界和工業界的後續研究。

## 八、總結與觀點

ViTPose和ViTPose++是一項優雅、深刻且極具影響力的工作。它完美詮釋了「大道至簡」的哲學。通過回歸到一個樸素但潛力巨大的ViT架構，作者們不僅在單一任務上取得了突破，更重要的是，他們基於對模型內部（FFN vs MHSA）的深刻理解，設計出了ViTPose++這樣一個巧妙的「偽MoE」架構。

ViTPose++的知識分解機制，對於需要處理多個相關但又存在差異的任務場景（比如您的「多先驗反問題」）具有極高的參考價值。它提供了一種輕量級的方式來平衡「共性」與「個性」，既能讓模型從多樣化的數據中學習到通用的表徵（共享專家），又能為每個特定任務保留專屬的建模能力（專屬專家），且實現方式簡單，推理開銷為零。這項工作無疑是朝著更通用、更強大、更高效的AI模型邁出的重要一步。