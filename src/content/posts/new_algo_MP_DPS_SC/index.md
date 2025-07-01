---
title: "對黑洞反問題提出基於 DPS 的 MP-DPS-SC 算法"
published: 2025-07-01T21:40:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-01T21:40:28+08:00
draft: false
description: ""
license: ""
tags: ["Blackhole", "PnP", "CV", "Model", "DDPM", "DIFFUSION", "Work"]
category:  Research
image: ./index/compressed/MP-DPS-SC.png
lang: zh-TW
---

## 一、前言

因爲再上一篇文章我提出了關於黑洞反問題工作地拆分，然後基於 DPS 設計了一個 PnP 的算法，但是我的描述不是很清晰，我要在這篇文章中清晰闡述以下觀點：

1. 此 PnP 是得到什麼啓發
2. 現有的黑洞反問題缺陷是什麼
3. 此PnP是爲了解決什麼問題
4. 此PnP的創新點
5. 此PnP的未來改進點

> [!TIP]
> 
> 一定要記住故事性，要講順講通。

## 二、啟發 (Inspiration)

本研究提出的 MP-DPS-SC 算法，其設計靈感來源於對深度生成模型，特別是擴散概率模型 (Diffusion Probabilistic Models, DPMs) 及其在逆問題求解中應用的前沿進展的深刻洞察。我們的啟發主要來自以下幾個關鍵方向：

1.  **Denoising Diffusion Probabilistic Models (DDPMs) 的生成能力與變分推斷框架的啟發**：
    * Ho et al. 的開創性工作，首次證明了基於變分推斷訓練的 DDPMs 能夠生成高質量的圖像樣本，甚至在無條件 CIFAR10 數據集上取得了當時最先進的 FID 分數。其模型在 CIFAR10 上獲得了 9.46 的 Inception score 和 3.17 的 FID 分數，在 256x256 LSUN 數據集上獲得了與 ProgressiveGAN 相似的樣本質Ms 具備作為強大圖像先驗的潛力，能夠學習並表示複雜的數據分佈。

2.  **Plug-and-Play Diffusion Priors (PnPDP) 框架的靈活性與解耦思想的啟發**：
    * PnPDP 方法的核心優勢在於將逆問題推斷目標解耦為**預訓練的擴散模型先驗**和**觀測數據的似然項**。這種解耦特性使得擴散模型無需針對每個具體的逆問題進行重新訓練，極大地提升了算法的通用性和靈活性。這種「即插即用」的理念是我們構建多先驗融合框架的基石，允許我們在不修改 DPM 核心結構的情況下，集成來自不同數據源的先驗知識。

3.  **Diffusion Posterior Sampling (DPS) 在逆問題求解中有效性的啟發**：
    * Chung et al. 提出的 DPS 算法，通過在擴散模型的逆向採樣 SDE 中直接添加一個「似然得分」項 $\nabla_{x_t} \log p_t(y|x_t)$，有效地將觀測數據的約束融入生成過程。DPS 是一種指導式方法，其有效性在圖像修復等多種逆問題中得到了驗證。DPS 的簡潔與高效啟發了我們在 MP-DPS-SC 中採用類似的似然引導機制。

4.  **前沿科學逆問題的獨特挑戰與缺陷的啟發**：
    * [cite_start]傳統 PnPDP 方法主要在自然圖像修復任務上進行評估，如圖像修補、超解析度和去模糊。然而，黑洞成像等物理科學領域的逆問題，其前向模型往往高度非線性、計算昂貴，且可能對輸入存在嚴格的物理或數值穩定性條件。例如，INVERSE-BENCH 基準測試框架中涵蓋的全波形反演 (Full Waveform Inversion, FWI) 和 Navier-Stokes 方程的反演就面臨數值穩定性挑戰，其輸入必須滿足 Courant-Friedrichs-Lewy (CFL) 條件以產生穩定解。Zheng et al. 在 INVERSEBENCH 中明確指出，現有 PnPDP 方法在此類問題上可能表現不佳，甚至出現數值不穩定性，例如 DAPS 和 PnP-DM 在 FWI 和 Navier-Stokes 問題上表現不佳，且對超參數高度敏感，微小的步長調整就可能導致完全失效。這對我們引入穩定性校正機制產生了直接啟發。

綜上所述，MP-DPS-SC 算法的啟發，是融合了 DPMs 作為強大生成先驗的能力、PnPDP 框架的靈活性、DPS 算法高效似然引導的機制，以及對複雜科學逆問題中數值穩定性挑戰的深刻認識，旨在構建一個更通用、更魯棒的黑洞成像解決方案。

## 二、黑洞成像逆問題的前沿缺陷

黑洞成像作為前沿天文物理研究的關鍵領域，利用甚長基線干涉測量 (VLBI) 技術獲取觀測數據。然而，其逆問題面臨多重挑戰，即使是現有領先方法也存在顯著缺陷：

- **複雜的觀測數據形式**：與傳統圖像恢復直接處理像素級圖像不同，黑洞成像的原始觀測是傅立葉空間中的「可見度」(visibilities) 。為減輕儀器和大氣效應，實際推斷中常使用經過非線性轉換的「閉合量」(closure quantities)，如閉合相位和對數閉合振幅。這種非線性轉換使得前向模型 G 高度非凸，導致逆問題極其複雜。
- **稀疏與不適定性**：VLBI 數據在傅立葉空間採樣極為稀疏，且僅覆蓋低空間頻率。這導致逆問題是高度不適定的 (ill-posed) ，存在多個圖像解可以與相同的觀測數據匹配。傳統正則化方法（如 eht-imaging 和 SMILI）因其簡單的正則項，難以恢復超出觀測固有解析度的精細細節。
- **非加性噪聲**：由於閉合量的使用，黑洞成像的測量噪聲是非加性的，這與許多 PnPDP 方法假設的加性高斯噪聲模型存在顯著差異，增加了似然建模的難度。
- **多模態後驗分佈**：稀疏的觀測和非凸的前向模型共同導致黑洞成像的後驗分佈是多模態的。這意味著存在多個物理合理但圖像內容可能截然不同的解。現有方法可能傾向於收斂到單一局部最優解，而無法全面探索所有可能性。
- **數值穩定性問題 (特定缺陷)**：這是我們 MP-DPS-SC 算法主要針對的缺陷之一。在許多科學逆問題中，包括某些黑洞成像的前向模型實現（特別是涉及到偏微分方程 PDE 數值求解時），模擬過程對輸入的物理屬性有嚴格的數值穩定性要求（例如，聲波方程中的 Courant-Friedrichs-Lewy, CFL 條件）。如果生成的中間圖像偏離了這些穩定性區域，前向模型計算可能會崩潰，導致結果發散或無意義。現有的 PnPDP 算法，特別是那些內部使用 Langevin Monte Carlo (LMC) 的方法，由於引入額外高斯噪聲，更容易在這些對穩定性敏感的問題上表現不佳。

## 三、MP-DPS-SC 旨在解決的問題

MP-DPS-SC 算法旨在解決這些缺陷，特別是：

1. **提升生成圖像的物理合理性與細節**：通過結合多個領域先驗（通用與天文相關），為黑洞圖像提供更豐富、更精準的生成知識，超越單一先驗或簡單正則化的限制。
2. **增強算法的數值穩定性與魯棒性**：顯式地將數值穩定性約束納入似然引導機制中，避免在迭代過程中產生導致前向模型崩潰的非物理或不穩定中間圖像。
3. **更好地處理領域差距**：通過通用先驗和領域相關先驗的協同作用，使算法在黑洞圖像數據極其稀缺的情況下，依然能有效利用來自其他領域的知識。

## 四、MP-DPS-SC 的創新點 (Innovations)

MP-DPS-SC 在 PnPDP 框架基礎上，提出以下核心創新點：

1. **多層次擴散先驗融合 (Multi-Layer Diffusion Prior Fusion)**：
   - 突破單一擴散先驗的限制，提出結合兩個（或更多）來自不同數據分佈的預訓練擴散模型。
   - 例如，一個在 CIFAR10 等通用圖像數據集上訓練的**通用先驗**，捕捉圖像的基本視覺語義和低級別特徵。
   - 另一個在 TCIR 颱風衛星圖片數據集（或更理想的 GRMHD 模擬黑洞圖像數據集）上訓練的**領域相關先驗**，捕捉天文或黑洞圖像特有的宏觀結構和物理模式。
   - 通過可變權重融合（如時間步 t 相關的權重函數 `w_cifar(t)` 和 `w_tcir(t)`）來整合兩個先驗的去噪預測。這種動態權重設計允許在去噪的不同階段（從粗到細）靈活地調用不同先驗的優勢，例如早期通用先驗可能引導大尺度結構，後期領域先驗則精修特定紋理。
2. **黑洞前向模型數值穩定性校正機制 (Numerical Stability Correction for Black Hole Forward Models)**：
   - 針對黑洞成像中前向模型可能對輸入圖像存在嚴格數值穩定性條件的挑戰，引入了一種新穎的穩定性懲罰機制。
   - 通過 `Is_Stable(x_0_pred)` 函數在每次迭代中**預測**當前估計的乾淨圖像 $x_{0,pred}$ 是否會導致前向模型不穩定。
   - 在似然損失中**顯式添加 `stability_penalty` 項**：當 $x_{0,pred}$ 接近或進入不穩定區域時，懲罰項會急劇增大，迫使梯度下降引導 $x_0$ 遠離這些區域。
   - **自適應指導強度**：在檢測到潛在不穩定時，算法可以動態降低數據一致性指導強度 `current_guidance_strength`，從而使 DPM 先驗在穩定性方面發揮更大作用，避免急劇的更新導致不穩定。這增加了算法在處理複雜物理約束時的魯棒性。
3. **優化指導與物理合理性 (Optimized Guidance for Physical Plausibility)**：
   - 通過將穩定性懲罰直接融入似然損失的梯度計算，MP-DPS-SC 能夠在不修改擴散模型本身的情況下，間接地將物理世界的數值穩定性約束納入生成過程。這使得生成的圖像不僅視覺真實，更具備物理合理性。
   - 相較於傳統方法，PnPDP 避免了對整個生成網絡的端到端訓練來適應每個新問題，保持了靈活性。MP-DPS-SC 進一步提升了這種靈活性，使其能適應對穩定性敏感的前向模型。

## 五、未來改進空間 (Future Work and Improvements)

儘管 MP-DPS-SC 提出了有前景的解決方案，但其仍有廣闊的未來改進空間：

1. **更精確的穩定性量化與集成**：
   - **可微分穩定性檢查**：如果 `Is_Stable(x_0)` 和 `Compute_Instability_Measure(x_0)` 可以被實現為可微分模塊，則穩定性懲罰的梯度將更精確，並能更有效地引導採樣。這可能需要開發新的可微分物理模擬技術。
   - **軟約束與硬約束的平衡**：探索在 PnP 框架中集成硬性物理約束（如總流量守恆、非負性）的方法，而不僅僅是軟懲罰項，以確保更高層次的物理合理性。

2. **更智能的多先驗融合策略**：
   
   - **學習式權重**：目前權重函數 `w_cifar(t)` 和 `w_tcir(t)` 可能是預設的（例如線性衰減），未來可以探索通過元學習 (meta-learning) 或強化學習 (reinforcement learning) 的方式，讓模型自動學習在不同時間步或不同圖像特徵下，如何最優地融合不同先驗的貢獻。
   - **上下文感知融合**：根據輸入數據的稀疏性、噪聲水平或當前重建的品質等上下文信息，動態調整先驗的影響。
   
3. **多模態後驗探索與量化**：
   
   - 黑洞成像的後驗分佈是多模態的，MP-DPS-SC 雖有助於穩定收斂，但可能仍傾向於找到單一模式。未來的研究應探索明確的策略來捕捉和呈現多個物理合理的圖像解，例如：
     - **基於粒子濾波 (Particle Filtering)** 的 PnPDP 變體，維持多個採樣軌跡以探索不同模式。
     - **後驗模式識別與聚類**：對生成的圖像集進行分析，自動識別並呈現不同的模式，並提供其與觀測數據的擬合度指標。
   - **不確定性量化**：除了點估計，提供生成的黑洞圖像中每個像素或區域的不確定性量化，這對於科學解釋至關重要。
   
4. **計算效率的提升**：
   - 當前 PnPDP 方法的計算效率普遍低於傳統基線方法。對於黑洞成像這樣的前向模型可能計算昂貴的問題，優化 

     `Compute_Gradient_of_Loss_wrt_x0` 或 `Solve_Data_Consistency_Problem_with_Prior` 的效率至關重要。

   - 探索更高效的逆向採樣器（如 DDIM、Consistency Models），或減少總採樣步數的策略。

5. **魯棒性與泛化能力**：
   
   - **前向模型失配 (Forward Model Mismatch)**：真實世界的前向模型總是不完美的。研究 MP-DPS-SC 在前向模型存在誤差或不確定性時的魯棒性。
   - **先驗失配 (Prior Mismatch)**：雖然使用了多先驗，但當真實解與所有訓練先驗的分佈都存在顯著差異時，算法的表現仍是挑戰。


## 六、Algorithm: Multi-Prior Guided DPS with Stability Correction (MP-DPS-SC)

```math
\begin{align*}
& \textbf{Algorithm: Multi-Prior Guided DPS with Stability Correction (MP-DPS-SC)} \\
& \text{Require: } y, \mathcal{A}, \epsilon_{\theta}^{\text{CIFAR}}, \epsilon_{\theta}^{\text{TCIR}}, \{\alpha_t, \bar{\alpha}_t\}_{t=1}^T, s, w_{\text{cifar}}, w_{\text{tcir}}, \lambda_{\text{stab}}, \text{Is\_Stable} \\
\hline
1: & \quad x_T \sim \mathcal{N}(0, \mathbf{I}) \\
2: & \quad \text{for } t = T \text{ to } 1 \text{ do} \\
3: & \qquad \hat{\epsilon} \leftarrow w_{\text{cifar}}(t) \epsilon_{\theta}^{\text{CIFAR}}(x_t, t) + w_{\text{tcir}}(t) \epsilon_{\theta}^{\text{TCIR}}(x_t, t) \qquad \text{// Fuse noise from multiple priors} \\
4: & \qquad \hat{x}_0 \leftarrow \frac{1}{\sqrt{\bar{\alpha}_t}}(x_t - \sqrt{1-\bar{\alpha}_t}\hat{\epsilon}) \\
5: & \qquad z \sim \mathcal{N}(0, \mathbf{I}) \\
6: & \qquad x'_{t-1} \leftarrow \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1-\bar{\alpha}_t}\hat{x}_0 + \frac{\sqrt{\alpha_t}(1-\bar{\alpha}_{t-1})}{1-\bar{\alpha}_t}x_t + \tilde{\sigma}_t z \qquad \text{// Standard reverse step $q(x_{t-1}|x_t, \hat{x}_0)$} \\
7: & \qquad x_{t-1} \leftarrow x'_{t-1} - s_t \cdot \nabla_{x_t} (\|y - \mathcal{A}(\hat{x}_0)\|^2 + \mathcal{L}_{\text{stab}}) \qquad \text{// Apply guidance with stability correction} \\
8: & \quad \text{end for} \\
9: & \quad \text{return } \hat{x}_0
\end{align*}
```
