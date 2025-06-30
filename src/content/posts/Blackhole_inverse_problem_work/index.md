---
title: "黑洞逆問題IDEA工作推進"
published: 2025-06-30T16:40:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-06-30T16:40:28+08:00
draft: false
description: ""
license: ""
tags: ["Blackhole", "PnP", "CV", "Model", "DDPM", "DIFFUSION", "Work"]
category:  Research
image: ./index/compressed/blackhole_current_inverse_research.png
lang: zh-TW
---


## 一、前言

此篇文章中，我要先再次確定現階段我們要做的工作推進方向，並在此方向上提出落地想法。所以我會先確定關於現有擴散模型在**黑洞問題上的 Prior 模型工作**，再來需要確定怎麼去落地屬於我們自己的**似然算法**。

## 二、關於數據集影響 Prior 工作

首先需要確定的是**有沒有黑洞數據集並不影響我們在似然後驗的步驟**，黑洞圖片數據集只是影響訓練**擴散模型**。

### 2.1 黑洞照片數據集

如果要生成黑洞圖片數據集：**[GRMHD](https://zhuanlan.zhihu.com/p/633983902) 模擬數據集**是目前黑洞成像研究中用於訓練擴散模型先驗的主要方式。GRMHD 模擬能夠產生大量具有物理合理性的黑洞圖像，這些圖像包含了光子環、陰影等黑洞特有的結構。在這個數據集上訓練的擴散模型可作為一個強大的、特定於黑洞領域的先驗。

> [!TIP]
>
> 目前我們的想法是**利用不相關的數據集去訓練 Prior**，但還是可以要有黑洞圖片數據集做對照組，這樣我們的實驗結果才更有說服力。but這樣不是我們要講的故事
>
> 修正邏輯：目前我們有1000張。我們雖然數據集不夠，訓練出來就能達到5w張的圖片差不多，所以不需要再去生成圖片。

### 2.2 沒有黑洞圖片數據集

沒有大量的圖像數據來訓練先驗。可以：
- 使用一個**通用圖像數據集**（例如 ImageNet、LSUN 等）預訓練的擴散模型作為先驗，然後使用 PnPDP 算法結合物理觀測值來推斷。
- 或者，如果能夠生成少量物理合理的**合成圖像**（即使不是大規模數據集），也可以嘗試在這個少量數據上微調一個通用先驗，或直接作為小規模領域先驗訓練。

> [!NOTE]
> 
> 目前我已經使用 CIFAR-10和 TCIR 颱風數據集已成功訓練出 Prior。

## 三、PnP 框架工作

### 3.1 PnP 工作中可能產生的歧義

「黑洞圖片數據集」和「單純物理觀測值」在 PnPDP 框架中的角色。


可以在 PnP 框架的迭代過程中，通過權重加權、級聯處理或更複雜的集成方式來實現。例如：可以讓一個先驗負責生成圖像的基本結構，另一個更精確的領域先驗負責細節和物理約束。

避免理解混淆，澄清一下「黑洞圖片數據集」和「單純物理觀測值」在 PnPDP 框架中的角色：PnPDP 算法的**後驗步驟**，無論使用 DPS 還是 DiffPIR，都是在**給定物理觀測值 $\mathbf{y}$** 的情況下，利用 **預訓練好的擴散模型先驗 $P(\mathbf{x})$** 和 **前向模型 $G$（從 $\mathbf{x}$ 到 $\mathbf{y}$ 的映射）來求解後驗分佈 $P(\mathbf{x}|\mathbf{y})$**。

- **「黑洞圖片數據集」**：這指的是像 GRMHD 模擬生成的**圖像數據集**。這些數據集是用來**訓練擴散模型先驗**的。一旦擴散模型訓練完成，它就成了一個**生成先驗 $P(\mathbf{x})$**。
- **「單純物理觀測值」**：這指的是 VLBI 獲取的「閉合量 (closure quantities)」這類 **非圖像形式的數據**。這些是逆問題中的**觀測數據 $\mathbf{y}$**。

因此，準確來說：

- **情況一：如果有 GRMHD 生成的黑洞圖片數據集**
  - 使用這些數據集來**訓練**一個擴散模型（作為**先驗**）。
  - 然後，在實際進行黑洞圖像**重建**（從物理觀測值生成圖像）時，使用 **PnPDP 算法（例如 DPS 或 DiffPIR）**。這個 PnPDP 算法會結合這個預訓練的擴散模型先驗和實際的物理觀測值（通過前向模型 $G$）來推斷圖像。
  
- **情況二：如果只有單純物理觀測值**
  - 這意味著沒有大量的圖像數據來訓練先驗。這時，PnPDP 算法的優勢就體現出來了：
    - 使用一個**通用圖像數據集**（例如 ImageNet、LSUN 等）預訓練的擴散模型作為先驗，然後使用 PnPDP 算法結合物理觀測值來推斷。
    - 或者，如果能夠生成少量物理合理的**合成圖像**（即使不是大規模數據集），也可以嘗試在這個少量數據上微調一個通用先驗，或直接作為小規模領域先驗訓練。

所以，並不是說「黑洞圖片數據集」就用 DPS/DiffPIR，而「單純物理觀測值」就必須用 PnPDP。**DPS 和 DiffPIR 都是 PnPDP 框架下的具體算法**，它們都用於處理「單純物理觀測值」這種情況下的逆問題，只不過它們在 PnPDP 框架內實現後驗採樣的方式有所不同。

### 3.2 PnP 算法的理解

#### 3.2.1 DPS 或 PnPDP 這類算法是否基於原有 SDE 進行修改？

DPS (Diffusion Posterior Sampling)、DiffPIR (Denoising Diffusion Models for Plug-and-Play Image Restoration)以及其他許多 PnPDP 算法，是**基於擴散模型的逆向 SDE/ODE 進行修改的**。

根據InverseBench 論文，擴散模型通常被表述為正向擴散和反向去噪過程的隨機微分方程 (SDEs)。擴散模型的訓練目標是學習得分函數 $(\nabla_{\mathbf{x}_t} \log p_t\mathbf{x}_t)$。一旦訓練完成，模型可以通過求解反向 SDE 來生成新樣本。

PnPDP 方法的基本思想就是**修改或利用這個反向 SDE**，來從後驗分佈 $P(\mathbf{x}|\mathbf{y})$ 而不是先驗分佈 $P(\mathbf{x})$ 中生成樣本。後驗分佈根據貝葉斯定理可以表示為 $P(\mathbf{x}|\mathbf{y}) \propto P(\mathbf{x})P(\mathbf{y}|\mathbf{x})$。其中 $P(\mathbf{x})$ 由擴散先驗建模，而 $P(\mathbf{y}|\mathbf{x})$ 則由前向模型 $G$ 計算。

具體來說，**指導式方法 (Guidance-based methods)**（如 DPS）通過在反向 SDE 中**添加一個似然得分項 $\nabla_{\mathbf{x}_t} \log p_t(\mathbf{y}|\mathbf{x}_t)$** 來實現這一點。這個似然得分項與前向模型 $G$ 相關，通過查詢 $G$ 來估計 $p(\mathbf{y}|\mathbf{x}_0)$。

#### 3.2.2 通用後驗算法是什麼？

「後驗」本身是一個分佈，而「算法」是從中推斷或採樣的方法。不過，如果我們將其理解為**從後驗分佈採樣的通用框架**，那麼最常見的是基於**馬爾可夫鏈蒙特卡洛 (MCMC)** 方法的算法，例如：

1.  **Langevin Monte Carlo (LMC)**：這是一種常見的 MCMC 方法，用於從目標分佈中採樣。它利用目標分佈的梯度（得分函數）來引導採樣過程。在擴散模型的背景下，它與得分匹配 (score matching) 方法緊密相關。
2.  **Hamiltonian Monte Carlo (HMC)**：另一種更複雜的 MCMC 方法，利用哈密頓動力學來減少隨機遊走行為，提高採樣效率。

PnPDP（Plug-and-Play Diffusion Priors）方法的通用框架通常涉及在擴散模型的逆向採樣過程中引入一個數據一致性（或似然）項。核心思想是在每一步去噪時，除了考慮擴散先驗的去噪方向，還要引入一個梯度（或修正項）來引導樣本符合觀測數據。

以下是一個**通用PnPDP框架**的偽代碼，它基於逆向SDE/ODE的離散化，並融入了數據一致性項。這個框架是大多數PnPDP算法的基礎，包括DPS和DiffPIR。

```bash
Algorithm: Generic Plug-and-Play Diffusion Prior Inference

// y:觀測, G:前向模型, D_theta:去噪器, sigma_t:噪聲參數, T:總步數, lambda_t:似然權重
Require: y, G, D_theta, sigma_t, T, lambda_t 

// 從標準高斯噪聲初始化 x_T
1: x_T = sample_from_prior_noise()         
// 從總步數 T 倒序迭代到 1 (逆向採樣)
2: for t from T down to 1 do
// 擴散模型預測當前噪聲 epsilon_theta_pred
3:    epsilon_theta_pred = D_theta(x_t, t)
// 從噪聲預測中估計乾淨圖像 x_0_pred_from_prior
4:    x_0_pred_from_prior = (x_t - (1 - alpha_bar_t)**0.5 * epsilon_theta_pred) / (alpha_bar_t**0.5)
// 計算數據一致性損失
5:    loss_data_consistency = L_func(G_func(x_0_pred_from_prior), y) 
// 計算似然項梯度
6:    gradient_likelihood = Compute_Gradient_of_Likelihood(x_0_pred_from_prior, y, G_func, L_func) 
// 將似然梯度引入去噪器的噪聲預測進行修正
7:    epsilon_guided = epsilon_theta_pred - lambda_t * gradient_likelihood
// 使用修正後的噪聲預測執行一步去噪
8:    x_t_minus_1 = D_theta.denoise_step_with_guided_epsilon(x_t, epsilon_guided, t)
// 更新到下一個時間步
9:    x_t = x_t_minus_1
// 結束循環
10: end for                                
// 返回最終估計的乾淨圖像
11: return x_0_pred_from_prior
```

**算法描述：**

此算法描述了 PnPDP 的通用推斷框架，它在預訓練擴散模型的逆向採樣過程中，引入了數據一致性（似然）項來引導圖像重建。

**輸入 (Input):**

- `y`: 觀測數據 (例如，黑洞觀測值)
- `G`: 前向模型，定義了從原始圖像 $x_0$ 到觀測數據 $y$ 的映射，即 $y=G(x_0)$
- `D_theta`: 預訓練的擴散模型去噪器 (Diffusion model denoiser)，通常是一個像 U-Net 的神經網絡，用於估計噪聲 $\epsilon$ 或直接預測乾淨圖像 $x_0$
- `sigma_t`: 擴散過程中的噪聲標準差序列 (或其他擴散參數，例如 $\alpha_t$, $\bar{\alpha}_t$)
- `T`: 總的擴散步數
- `lambda_t`: 數據一致性項的權重或步長，用於調整先驗與似然之間的平衡，可以隨時間步 $t$ 變化

**輸出 (Output):**

- `x_0_hat`: 重建後的圖像 (例如，黑洞圖像)

**算法步驟 (Algorithm Steps):**

1. **初始化 (Initialization):**

   - 從標準高斯噪聲分佈中採樣一個初始噪聲圖像：`x_T = sample_from_prior_noise()` (通常是 $N(0,I)$)

2. **迭代推斷 (Iterative Inference) - 從 `T` 倒數到 `1`:**

   - 對於每個時間步 `t` (從 `T` 到 `1`):

     - **步驟 1: 先驗 (Prior) 部分 - 利用擴散模型去噪**

       - 使用預訓練的擴散模型去噪器 `D_theta` 預測當前時間步的噪聲 `epsilon_theta_pred:epsilon_theta_pred = D_theta(x_t, t)`

       - 從預測的噪聲 `epsilon_theta_pred` 中，根據擴散模型的前向過程公式 $q(x_t|x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t}x_0, (1-\bar{\alpha}_t)I)$，逆推得到一個初步的乾淨圖像估計 `x_0_pred_from_prior`。其中 $\alpha_t = 1 - \beta_t$ 且 $\bar{\alpha}_t = \prod_{s=1}^t \alpha_s$。

         $x_{0,pred\_from\_prior} = \frac{x_t - \sqrt{1-\bar{\alpha}_t}\epsilon_{\theta,pred}}{\sqrt{\bar{\alpha}_t}}$

         (在程式碼實現中，這通常表示為 `x_0_pred_from_prior = (x_t - (1 - alpha_bar_t)**0.5 * epsilon_theta_pred) / (alpha_bar_t**0.5)`)

     - **步驟 2: 似然 (Likelihood) / 數據一致性 (Data Consistency) 部分**

       - 計算當前初步估計的乾淨圖像 `x_0_pred_from_prior` 經過前向模型 $G$ 轉換後，與實際觀測數據 $y$ 之間的損失。此處 $L$ 代表數據一致性損失函數 (例如，對於黑洞問題，可以是 $\chi^2$ 統計量)。

         $loss\_data\_consistency=L(G(x_{0,pred\_from\_prior}),y)$

         (在程式碼實現中，這通常表示為 `loss_data_consistency = L_func(G_func(x_0_pred_from_prior), y)`)

       - 計算似然項關於 `x_0_pred_from_prior` 的梯度。這個梯度引導圖像向符合觀測數據的方向修正。

         $gradient\_likelihood=Compute\_Gradient\_of\_Likelihood(x_{0,pred\_from\_prior},y,G,L)$

         (請注意：`Compute_Gradient_of_Likelihood` 函數的實現取決於前向模型 $G$ 的性質，可能需要自動微分、數值近似或特定求解器。在程式碼中，這可能表示為 `gradient_likelihood = Compute_Gradient_of_Likelihood(x_0_pred_from_prior, y, G_func, L_func)`)

     - **步驟 3: 結合先驗和似然進行更新**

       - 將擴散模型預測的噪聲 `epsilon_theta_pred` 與來自似然項的梯度修正結合起來，得到引導後的噪聲 $\epsilon_{guided}$。`lambda_t` 作為指導強度，權衡兩者的影響。

         $\epsilon_{guided}=\epsilon_{\theta,pred}−\lambda_t\cdot gradient\_likelihood$

         (在程式碼實現中，這通常表示為 `epsilon_guided = epsilon_theta_pred - lambda_t * gradient_likelihood`)

       - 使用修正後的引導噪聲 $\epsilon_{guided}$ 執行擴散模型的一步去噪採樣，從 $x_t$ 迭代到 $x_{t-1}$。此步驟的具體公式依賴於所使用的擴散採樣器（例如 DDPM 或 DDIM）。

         $x_{t−1}=D_\theta.denoise\_step\_with\_guided\_epsilon(x_t,\epsilon_{guided},t)$

         (在程式碼實現中，這通常表示為 `x_t_minus_1 = D_theta.denoise_step_with_guided_epsilon(x_t, epsilon_guided, t)`)

       - 更新當前時間步的圖像狀態：`x_t = x_t_minus_1`。

3. **返回結果 (Return Result):**

   - 返回最後一步得到的 `x_0_pred_from_prior`，作為重建後的最終圖像 `x_0_hat`。

关键修正點 `Compute_Gradient_of_Likelihood`：

這是需要重點關注和修改的部分。對於黑洞成像這樣的前向模型 $G$ 是非線性且可能難以直接求導的情況，如何計算 $L(G(x), y)$ 對 $x$ 的梯度是挑戰。

#### 3.2.3 DPS 與 DiffPir 在通用算法上的改動僞代碼

> [!TIP]
>
> DPS 和 DiffPIR 都屬於 PnPDP 框架，但它們在處理數據一致性項和整合方式上有所不同。

##### 3.2.3.1 DPS (Diffusion Posterior Sampling)

**核心思想**: DPS 是一種指導式 (Guidance-based) 方法。它通過在擴散模型的逆向採樣過程中，直接向得分函數 $\nabla_\mathbf{x_t} log p_t(\mathbf{x}_t)$ 添加一個「似然得分」項 $\nabla_\mathbf{x_t} logp_t(\mathbf{y}∣\mathbf{x}_t)$ 來引導採樣。這個似然得分項通常通過**預測 $x_0$（或一個中間 $x_0$）並計算其與觀測 $\mathbf{y}$ 之間的前向模型的梯度**來近似。

- **優勢**: 相對簡單直觀，概念上直接修改了採樣路徑。

- **挑戰**: 似然得分項的近似可能不夠精確，尤其對於複雜的非線性前向模型。需要對 $\mathbf{x}_t$ 到 $\mathbf{x}_0$ 的映射（稱為 $\mathcal{D}_t$）進行求導。

```bash
Algorithm: Diffusion Posterior Sampling (DPS)
// y:觀測, G:前向模型, D_theta:去噪器, alpha_bar_t_sequence:擴散參數, T:總步數, s:指導強度
Require: y, G, D_theta, alpha_bar_t_sequence, T, s 
// 初始化 x_T 為標準高斯噪聲
1: x_T = sample_from_prior_noise()
// 從總步數 T 倒序迭代到 1
2: for t from T down to 1 do   
// 獲取當前時間步的擴散參數 alpha_bar_t
3:    alpha_bar_t = alpha_bar_t_sequence[t] 
// 擴散模型預測當前噪聲 epsilon_theta_pred
4:    epsilon_theta_pred = D_theta(x_t, t) 
// 從噪聲預測中估計乾淨圖像 x_0_pred
5:    x_0_pred = (x_t - (1 - alpha_bar_t)**0.5 * epsilon_theta_pred) / (alpha_bar_t**0.5) 
// 計算似然損失
6:    loss_likelihood = L_func(G_func(x_0_pred), y)
// 計算似然損失關於 x_0_pred 的梯度
7:    gradient_likelihood_x0 = Compute_Gradient_of_Loss_wrt_x0(loss_likelihood, x_0_pred)
// 將似然梯度投影到 x_t 空間
8:    gradient_likelihood_xt_for_epsilon = (1 - alpha_bar_t) * gradient_likelihood_x0
// 將似然梯度引入去噪器的噪聲預測進行修正
9:    epsilon_guided = epsilon_theta_pred - s * gradient_likelihood_xt_for_epsilon
// 使用修正後的噪聲預測執行一步去噪
10:   x_t_minus_1 = Standard_Diffusion_Denoise_Step(x_t, epsilon_guided, t, alpha_bar_t_sequence)
// 更新到下一個時間步
11:   x_t = x_t_minus_1
// 結束循環
12: end for
// 返回最終估計的乾淨圖像
13: return x_0_pred
```

**算法描述：**

DPS 是一種指導式 (Guidance-based) 的 PnPDP 方法，通過在擴散模型的逆向採樣過程中，直接向得分函數添加一個似然得分項來引導採樣，以符合觀測數據。

**輸入 (Input):**

- `y`: 觀測數據
- `G`: 前向模型 $(y=G(x_0))$
- `D_theta`: 預訓練的擴散模型去噪器 (用於預測噪聲 $\epsilon$ 或 $x_0$)
- `alpha_bar_t_sequence`: 預計算的擴散參數序列 (例如，從 βt 計算得到)
- `T`: 總步數
- `s`: 似然指導強度 (guidance scale)，超參數

**輸出 (Output):**

- `x_0_hat`: 重建圖像

**算法步驟 (Algorithm Steps):**

1. **初始化 (Initialization):**

   - `x_T = sample_from_prior_noise()` // 從 N(0,I) 初始化

2. **迭代推斷 (Iterative Inference) - 從 `T` 倒數到 `1`:**

   - `alpha_bar_t = alpha_bar_t_sequence[t]`

   - **步驟 1: 擴散模型預測乾淨圖像 `x_0_pred`**

     - `epsilon_theta_pred = D_theta(x_t, t)`

     - $x_{0,pred} = \frac{x_t - \sqrt{1-\bar{\alpha}_t}\epsilon_{\theta,pred}}{\sqrt{\bar{\alpha}_t}}$

       (在程式碼中：`x_0_pred = (x_t - (1 - alpha_bar_t)**0.5 * epsilon_theta_pred) / (alpha_bar_t**0.5)`)

   - **步驟 2: 計算似然損失及其關於 `x_0_pred` 的梯度**

     - $loss\_likelihood=L(G(x_{0,pred}),y)$

       (在程式碼中：`loss_likelihood = L_func(G_func(x_0_pred), y)`)

     - $gradient\_likelihood\_x0=Compute\_Gradient\_of\_Loss\_wrt\_x0(loss\_likelihood,x_{0,pred})$

       (在程式碼中：`gradient_likelihood_x0 = Compute_Gradient_of_Loss_wrt_x0(loss_likelihood, x_0_pred)`)

   - **步驟 3: 將似然梯度從 $x_0$ 空間投影到 $x_t$ 空間**

     - 這是 DPS 的關鍵步驟，將 $x_0$ 上的修正轉換為對 $x_t$ 的影響。這裡的投影因子 $(1-\bar{\alpha}_t)$ 是一個常見的近似。

       $gradient\_likelihood\_xt\_for\_epsilon=(1-\bar{\alpha}_t)\cdot gradient\_likelihood\_x0$

       (在程式碼中：`gradient_likelihood_xt_for_epsilon = (1 - alpha_bar_t) * gradient_likelihood_x0`)

   - **步驟 4: 修改擴散模型預測的噪聲 $\epsilon_{\theta,pred}$**

     - 將似然指導項加到去噪器預測的噪聲中，引導採樣方向。

       $\epsilon_{guided}=\epsilon_{\theta,pred}−s\cdot gradient\_likelihood\_xt\_for\_epsilon$

       (在程式碼中：`epsilon_guided = epsilon_theta_pred - s * gradient_likelihood_xt_for_epsilon`)

   - **步驟 5: 執行標準的擴散模型一步去噪（DDPM或DDIM採樣步）**

     - 使用修正後的 $\epsilon_{guided}$ 來計算下一步的 $x_{t−1}$。對於 DDPM 採樣器，此步會涉及隨機噪聲 $z$。

       (例如 DDPM 採樣步驟: $x_{t-1} = (1/\sqrt{\alpha_t}) \cdot (x_t - \beta_t / \sqrt{1-\bar{\alpha}_t} \cdot \epsilon_{guided}) + \sqrt{\beta_t} \cdot z$

       `x_t_minus_1 = Standard_Diffusion_Denoise_Step(x_t, epsilon_guided, t, alpha_bar_t_sequence`)

   - 更新當前時間步的圖像狀態：`x_t = x_t_minus_1`。

3. **返回結果 (Return Result):**

   - 返回最後一步的 `x_0_pred`。



##### 3.2.3.2 DiffPIR (Denoising Diffusion Models for Plug-and-Play Image Restoration)

**核心思想**: DiffPIR 屬於**變數分解 (Variable-splitting)** 方法。它將逆問題分解為兩個交替的子問題：

  1. **去噪子問題 (Denoising Subproblem)**：利用預訓練的擴散模型作為去噪器（或去噪先驗）。
  2. **數據一致性子問題 (Data Consistency Subproblem)**：在當前去噪器的輸出附近，找到最接近觀測數據 $y$ 的解。這通常涉及一個最小二乘問題，可以有閉合解，或通過迭代優化求解。

- **優勢**: 將複雜的優化問題分解，每一步子問題可能更容易求解。對於一些線性前向模型，數據一致性子問題有解析解，效率高。

- **挑戰**: 需要在兩個子問題之間合理切換，步長和迭代次數的選擇很關鍵。對於非線性前向模型，數據一致性子問題本身可能仍然複雜。


```
Algorithm: DiffPIR

// y:觀測, G:前向模型, D_theta:去噪器, alpha_t_sequence:擴散參數, T:總步數, lambda_dc:一致性強度
Require: y, G, D_theta, alpha_t_sequence, alpha_bar_t_sequence, T, lambda_dc 
// 初始化 x_T 為標準高斯噪聲
1: x_T = sample_from_prior_noise()         
// 初始化當前處理的噪聲圖像
2: current_x = x_T                         
// 從總步數 T 倒序迭代到 1
3: for t from T down to 1 do              
// 獲取當前時間步的擴散參數 alpha_t
4:    alpha_t = alpha_t_sequence[t]      
// 獲取當前時間步的擴散參數 alpha_bar_t
5:    alpha_bar_t = alpha_bar_t_sequence[t] 
// 擴散模型預測乾淨圖像 (去噪子問題)
6:    x_0_denoised_by_prior = D_theta.predict_x0(current_x, t) 
// 求解數據一致性子問題
7:    x_0_data_consistent = Solve_Data_Consistency_Problem_with_Prior(y, G_func, x_0_denoised_by_prior, lambda_dc) 
// 計算下一步需要添加的噪聲量
8:    noise_for_next_step = (1 - alpha_bar_t_sequence[t-1])**0.5 * torch.randn_like(x_0_data_consistent) 
// 將處理後的 x_0 重新加噪，回到當前擴散步的噪聲水平
9:    current_x = (alpha_bar_t_sequence[t-1])**0.5 * x_0_data_consistent + noise_for_next_step 
// 結束循環
10: end for                               
// 返回最終的數據一致性重建結果
11: return x_0_data_consistent            
```

**算法描述：**

DiffPIR 屬於變數分解 (Variable-splitting) 方法，它將逆問題分解為兩個交替的子問題：去噪子問題（利用擴散模型）和數據一致性子問題（優化匹配觀測數據）。

**輸入 (Input):**

- `y`: 觀測數據
- `G`: 前向模型 ($y=G(x_0)$)
- `D_theta`: 預訓練的擴散模型去噪器 (輸出去噪後的 $x_0$ 估計)
- `alpha_t_sequence`: 擴散參數 $\alpha_t$ 序列
- `alpha_bar_t_sequence`: 擴散參數 $\bar{\alpha}_t$ 序列
- `T`: 總步數
- `lambda_dc`: 數據一致性正則化強度 (超參數)

**輸出 (Output):**

- `x_0_hat`: 重建圖像

**算法步驟 (Algorithm Steps):**

1. **初始化 (Initialization):**

   - `x_T = sample_from_prior_noise()` // 從 $N(0,I)$ 初始化
   - `current_x = x_T` // DiffPIR 通常維護一個在噪聲空間中的當前狀態

2. **迭代推斷 (Iterative Inference) - 從 `T` 倒數到 `1`:**

   - `alpha_t = alpha_t_sequence[t]`

   - `alpha_bar_t = alpha_bar_t_sequence[t]`

   - **步驟 1: 去噪子問題 (Denoising Subproblem)**

     - 利用擴散模型進行初步去噪：`D_theta(current_x, t)` 返回基於當前噪聲 $x_t$ 的 $x_0$ 估計。

       $x_{0,denoised\_by\_prior}=D_θ.predict\_x0(current\_x,t)$

       (在程式碼中：`x_0_denoised_by_prior = D_theta.predict_x0(current_x, t)`)

   - **步驟 2: 數據一致性子問題 (Data Consistency Subproblem)**

     - 求解一個帶有先驗約束的優化問題。目標是找到一個 $x$，它既接近擴散模型的去噪結果 $(x_{0,denoised\_by\_prior})$，又通過前向模型 $G$ 後能很好地匹配觀測數據 $y$。

     - 優化目標通常為：$\min_{x} ||G(x) - y||^2 + \lambda_{dc} \cdot ||x - x_{0,denoised\_by\_prior}||^2$

     - 由於 $G$ 對於黑洞問題是非線性且可能複雜的，此子問題需要一個求解器。對於非線性 $G$，這可以通過迭代優化 (e.g., L-BFGS, Adam) 實現，也可以是特定設計的快速迭代算法 (如 ADMM)。

       $x_{0,data\_consistent}=Solve\_Data\_Consistency\_Problem\_with\_Prior(y,G,x_{0,denoised\_by\_prior},\lambda_dc)$

       (在程式碼中：`x_0_data_consistent = Solve_Data_Consistency_Problem_with_Prior(y, G_func, x_0_denoised_by_prior, lambda_dc)`)

   - **步驟 3: 更新當前時間步的狀態 (`current_x`)**

     - 將數據一致性處理後的 $x_{0,data\_consistent}$ 重新加噪，回到當前擴散步的噪聲水平。這是為了確保下一步的去噪器 `D_theta` 能夠在正確的噪聲分佈輸入下工作。

     - 根據 DDPM 的前向過程公式：$q(x_t|x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t}x_0, (1-\bar{\alpha}_t)I)$，從 $x_0$ 到 $x_t$ 的過程是加噪。

       $noise\_for\_next\_step=\sqrt{1−\bar{\alpha}_{t−1}}\cdot torch.randn\_like(x_{0,data\_consistent})$

       $current\_x=\sqrt{\bar{\alpha}_{t−1}}\cdot x_{0,data\_consistent}+noise\_for\_next\_step$

       (在程式碼中：`noise_for_next_step = (1 - alpha_bar_t_sequence[t-1])**0.5 * torch.randn_like(x_0_data_consistent)`)

       (在程式碼中：`current_x = (alpha_bar_t_sequence[t-1])**0.5 * x_0_data_consistent + noise_for_next_step`)

3. **返回結果 (Return Result):**

   - 返回最後一步的 `x_0_data_consistent`。

### 3.3 設計屬於我們的 PnP 思路

#### 3.3.1 針對黑洞前向模型的 **`Compute_Gradient_of_Likelihood`** 或 **`Solve_Data_Consistency_Problem`** 進行特化和改進：

- **可微分物理模擬 (Differentiable Physics Simulation)**:
  - **思想**: 將黑洞成像的前向模型 $G$（包括從圖像到可見度再到閉合量的過程）實現為一個**完全可微分的模塊**。這可能需要用深度學習框架（如PyTorch, TensorFlow）重寫物理模型，或者利用像 JAX 這樣的庫進行自動微分。
  - **優勢**: 獲得精確的梯度，避免了近似誤差，可能提高收斂性和圖像質量。
  - **挑戰**: 實現複雜物理模型的可微分性非常困難，特別是 VLBI 數據中的非線性閉合量和非加性噪聲。
- **基於優化或數值梯度的似然修正**：
  - **思想**: 如果 $G$ 無法完全可微分，或者計算成本過高，可以使用**數值方法**（如有限差分）來近似似然梯度。
  - **改進點**:
    - **自適應步長差分**：根據當前 $x_t$ 或 $x_0$ 預測值的特性，動態調整差分計算中的步長，以平衡精度和穩定性。
    - **隨機近似梯度 (Stochastic Gradient Approximation)**：特別對於非常高的維度，每次迭代都計算完整梯度可能太慢。可以考慮使用蒙特卡洛方法或類似於零階優化 (zeroth-order optimization) 的技術來隨機近似梯度。
    - **迭代優化器集成**：在 DiffPIR 的數據一致性子問題中，您可以使用專為黑洞問題優化的迭代算法（如傳統的 CLEAN 或基於稀疏正則化的優化器），作為求解 `Solve_Data_Consistency_Problem` 的內部循環。
- **非加性噪聲的處理**：
  - **思想**: 黑洞觀測值中的非加性噪聲（來自增益和相位誤差）使得傳統的 $L2$ 損失不再是最佳選擇。
  - **改進點**:
    - **貝葉斯似然建模**：更精確地建模 $P(\mathbf{y}∣\mathbf{x})$，考慮到這些噪聲特性。例如，不是簡單的 $||\mathbf{G}(\mathbf{x})-\mathbf{y}||^2$，而是基於泊松分佈、伽馬分佈或其他更適合非加性噪聲的概率模型來構建似然函數。
    - **變分推斷似然**：將噪聲參數也視為潛在變量，並在似然項中進行變分推斷。

#### 3.3.2 結合多個先驗的策略：

- **動態先驗融合**：
  - **思想**: 不僅是簡單的加權，而是在 PnP 迭代的不同階段或根據當前重建圖像的質量，動態調整通用先驗和領域特定先驗的影響力。
  - **改進點**:
    - **信心分數 (Confidence Score)**：訓練一個小型網絡來預測當前圖像與哪個先驗的「風格」更匹配，或者哪個先驗在此時更「可靠」，然後動態調整它們的權重。
    - **級聯/多階段PnP**：設計一個分階段的生成過程。例如，在粗略階段使用通用先驗進行快速收斂，在精細階段切換到 GRMHD 先驗以捕捉黑洞的細節。

#### 3.3.3 處理多模態後驗：

- **多軌跡採樣 (Multi-trajectory Sampling)**：
  - **思想**: 運行多個並行的 PnPDP 採樣軌跡，每個軌跡從不同的隨機初始化開始，或在中間步驟引入隨機分岔，以探索後驗分佈的不同模式。
  - **改進點**:
    - **有效的粒子管理**：參考 SMC (Sequential Monte Carlo) 方法中的粒子濾波技術，管理和重採樣這些軌跡，確保它們能有效探索多模態空間。
    - **模式聚類與選擇**：在生成結束後，對多個結果進行聚類，識別不同的模式，並提供多個有物理意義的重建結果。

#### 3.3.4 針對穩定性條件的集成：

- **引入約束或正則化**：
  - **思想**: 針對黑洞成像中潛在的數值穩定性問題（例如，如果將 PDE 求解器作為前向模型的一部分），在損失函數中加入懲罰項，或在優化過程中強制執行某些約束（如 CFL 條件）。
  - **改進點**:
    - **可微分約束層**：設計一個可微分層，檢查中間圖像是否滿足物理約束，並提供反向梯度來引導採樣避免不穩定區域。
    - **基於預測的穩定性判斷**：訓練一個小型預測網絡，判斷當前 $x_t$ 如果通過前向模型是否會導致不穩定，並在此時調整 PnPDP 的步長或策略。

### 3.4 設計PnP雛形

> [!TIP]
>
> 目前我覺得可以去需要針對黑洞數值穩定性去修改 PnP 後驗。


#### 3.4.1 訓練 Prior (先驗)

- **Prior 1: 通用圖像先驗 (CIFAR10)**

  - **數據集**: CIFAR10 (或其他大型通用圖像數據集，如 ImageNet, LSUN 2)。

  - **目標**: 訓練一個 Denoising Diffusion Probabilistic Model (DDPM)來學習通用自然圖像的低級別特徵（如邊緣、紋理）和一般結構 4。這類模型已被證明能生成高質量樣本。

  - **模型架構**: 類似於 Ho et al.中使用的 U-Net 6，並結合 Transformer 的位置嵌入和自注意力機制。

  - **訓練目標**: 採用 DDPM 的簡化訓練目標$L_{simple}(\theta) := \mathbb{E}_{t, x_0, \epsilon} \left[ \left\| \epsilon - \epsilon_\theta(\sqrt{\bar{\alpha}_t} x_0 + \sqrt{1 - \bar{\alpha}_t} \epsilon, t) \right\|^2 \right]$。

- **Prior 2: 領域相關先驗 (TCIR 颱風衛星圖片)**

  - **數據集**: TCIR (已擁有此颱風衛星圖片數據集)。
  - **目標**: 訓練另一個 DDPM 來學習衛星圖片特有的結構和模式，例如雲層的形態、氣旋的螺旋結構等。儘管不是直接的黑洞圖像，但它比 CIFAR10 更接近高空或天文視角的圖像數據，有助於過渡。
  - **模型架構**: 同 Prior 1，或根據 TCIR 數據特性進行調整。
  - **訓練目標**: 同 Prior 1。

#### 3.4.2 PnP 後驗設計：結合多先驗與數值穩定性修正

我們將在 PnP 框架的迭代採樣過程中，引入兩種主要修改：

- **多先驗融合策略 (Multi-Prior Fusion Strategy)**:
  - **思想**: 在去噪步驟中，動態地結合兩個預訓練先驗（CIFAR10 先驗的去噪器 $D\_theta,CIFAR$ 和 TCIR 先亞的去噪器 $D\_theta,TCIR$）的輸出。
  - **方法**: 可以採用加權平均的方式融合兩個去噪器的噪聲預測 $epsilon\_textpred$。權重可以固定，也可以根據時間步 t 或當前圖像的特徵動態調整。例如，在去噪早期（大 $t$），通用先驗可能更有用；在去噪後期（小 t），領域相關先驗可能更重要。

- **黑洞數值穩定性修正 (Numerical Stability Correction for Black Hole)**:
  - **問題**: 黑洞成像的前向模型 $G$（特別是當它涉及複雜物理模擬或 PDE 求解時，如在InverseBench: Benchmarking Plug-and-Play Diffusion Priors for Inverse Problems in Physical Sciences 論文中提及的「Full Waveform Inversion」和「Navier-Stokes equation」中所述）可能對輸入有嚴格的數值穩定性條件（例如 CFL 條件）。如果傳遞給 $G$ 的圖像 $x_0$ 不符合這些條件，前向模擬可能會失敗或產生無意義的結果。傳統 PnPDP 方法可能未考慮這些穩定性條件。

  - **解決方法**:
    1. **穩定性預測模塊 (Stability Prediction Module)**: 引入一個輕量級的模塊，該模塊能夠在將 $x_{0,pred}$ 傳遞給前向模型 $G$ 之前，**預測**其是否會導致數值不穩定。這個模塊可以是一個簡單的檢查器（如果穩定性條件可明確表達，如 CFL 條件），或者是一個在穩定/不穩定數據上訓練的分類器。
    
    2. **梯度修正與懲罰 (Gradient Correction and Penalty)**:
       - **懲罰項**: 在似然損失 $L(G(x_{0,pred}),y)$ 中，添加一個**穩定性懲罰項** $L\_stability(x_{0,pred})$。當 $x_{0,pred}$ 不滿足穩定性條件時，這個懲罰項會急劇增大，從而在梯度下降時引導 $x_{0,pred}$ 遠離不穩定區域。
       
       - **引導策略調整**: 如果預測到不穩定，可以調整似然梯度 $gradient\_likelihood$ 的方向或強度，使其優先將 $x_0$ 推向穩定區域，或者降低當前步的學習率/指導強度，避免模型崩潰。
       
       - **回退機制**: 如果在某一步驟中，即使經過修正仍然產生了不穩定的 $x_0$，可以考慮回退到上一步的 $x_t$ 或 $x_0$，並以更小的學習率或不同的隨機噪聲重新嘗試。
       
    3. **可微分物理約化 (Differentiable Physics Regularization)**: 若可能，將黑洞物理特性（如亮度分佈、光子環尺寸比例）納入可微分正則化項，直接約束 $x_0$ 的物理合理性，這有助於隱式地提升數值穩定性。



#### 3.4.3 修改後的 PnP 後驗偽代碼

我們將基於 DPS 的框架進行修改，因為它直接操作得分函數，方便引入額外指導。

新算法: Multi-Prior Guided DPS with Stability Correction (MP-DPS-SC)


```bash
Algorithm: Multi-Prior Guided DPS with Stability Correction (MP-DPS-SC)

 // y:觀測數據, G:前向模型, D_theta_CIFAR:CIFAR去噪器, D_theta_TCIR:TCIR去噪器, alpha_bar_t_sequence:擴散參數序列, T:總步數, s:指導強度, w_cifar_func:CIFAR權重函數, w_tcir_func:TCIR權重函數, lambda_stability:穩定性懲罰強度, Is_Stable_func:穩定性判斷函數
Require: y, G, D_theta_CIFAR, D_theta_TCIR, alpha_bar_t_sequence, T, s, w_cifar_func, w_tcir_func, lambda_stability, Is_Stable_func

// 初始化 x_T 為標準高斯噪聲分布 N(0, I)
1: x_T = sample_from_prior_noise()         
// 從總步數 T 倒序迭代到 1 (逆向採樣過程)
2: for t = T down to 1 do 
// 獲取當前時間步的累積擴散參數 alpha_bar_t               
3:    alpha_bar_t = alpha_bar_t_sequence[t] 
// CIFAR10 先驗擴散模型預測噪聲 epsilon_theta
4:    epsilon_theta_cifar = D_theta_CIFAR(x_t, t)
// TCIR 先驗擴散模型預測噪聲 epsilon_theta
5:    epsilon_theta_tcir = D_theta_TCIR(x_t, t)
// 根據權重函數融合兩個先驗的噪聲預測 
6:    epsilon_theta_fused = w_cifar_func(t) * epsilon_theta_cifar + w_tcir_func(t) * epsilon_theta_tcir
// 從融合後的噪聲預測中估計乾淨圖像 x_0_pred
7:    x_0_pred = (x_t - (1 - alpha_bar_t)**0.5 * epsilon_theta_fused) / (alpha_bar_t**0.5) 
// 初始化穩定性懲罰項為0
8:    stability_penalty = 0
// 初始化當前數據一致性指導強度                
9:    current_guidance_strength = s
// 檢查當前估計的 x_0_pred 是否滿足前向模型 G 的穩定性條件       
10:   if not Is_Stable_func(x_0_pred) then
// 如果不穩定，計算基於不穩定程度的懲罰值  
11:      stability_penalty = lambda_stability * Compute_Instability_Measure(x_0_pred)
 // 可選步驟：在不穩定情況下降低數據一致性指導強度，以促進穩定性或避免發散 
12:      current_guidance_strength = s * 0.5
13:   end if
// 計算總似然損失，包含原始數據一致性項和穩定性懲罰項
14:   loss_likelihood = L_func(G_func(x_0_pred), y) + stability_penalty
// 計算總似然損失關於 x_0_pred 的梯度 
15:   gradient_likelihood_x0 = Compute_Gradient_of_Loss_wrt_x0(loss_likelihood, x_0_pred)
// 將 x_0 空間的似然梯度投影到 x_t 空間，以便修正 epsilon 
16:   gradient_likelihood_xt_for_epsilon = (1 - alpha_bar_t) * gradient_likelihood_x0
// 將投影後的似然梯度引入融合的噪聲預測，得到引導後的噪聲 epsilon_guided 
17:   epsilon_guided = epsilon_theta_fused - current_guidance_strength * gradient_likelihood_xt_for_epsilon
// 使用引導後的噪聲 epsilon_guided 執行標準擴散模型的一步去噪，得到 x_(t-1) 
18:   x_t_minus_1 = Standard_Diffusion_Denoise_Step(x_t, epsilon_guided, t, alpha_bar_t_sequence)
// 將當前時間步的圖像狀態更新為 x_(t-1) 
19:   x_t = x_t_minus_1
// 結束逆向採樣循環                    
20: end for                                
// 返回最終估計的乾淨圖像 x_0_pred
21: return x_0_pred                       
```


**算法描述：**

此算法融合了來自 CIFAR10 和 TCIR 數據集的兩個擴散模型先驗，並在逆向採樣過程中加入了針對黑洞前向模型數值穩定性的修正，以從物理觀測值生成黑洞圖像。

**輸入 (Input):**

- `y`: 黑洞的物理觀測值 (例如 VLBI 閉合量)
- `G`: 黑洞前向模型，定義了從圖像 $x_0$ 到觀測數據 $y$ 的映射 $(y=G(x_0))$
- `D_theta_CIFAR`: 預訓練的 CIFAR10 擴散模型去噪器
- `D_theta_TCIR`: 預訓練的 TCIR 擴散模型去噪器
- `alpha_bar_t_sequence`: 預計算的擴散參數序列 $\bar{\alpha}_t$
- `T`: 總的擴散步數
- `s`: 似然指導強度 (超參數)
- `w_cifar(t)`: CIFAR10 先驗的權重函數 (可隨 $t$ 變化，例如 $w\_cifar(t)=t/T$)
- `w_tcir(t)`: TCIR 先驗的權重函數 (可隨 $t$ 變化，例如 $w\_tcir(t)=1−t/T$)
- `lambda_stability`: 穩定性懲罰項的強度 (超參數)
- `Is_Stable(x_0)`: 判斷 $x_0$ 是否滿足前向模型穩定性條件的函數 (返回布林值)

**輸出 (Output):**

- `x_0_hat`: 重建後的黑洞圖像

**算法步驟 (Algorithm Steps):**

1. **初始化 (Initialization):**

   - `x_T = sample_from_prior_noise()` // 從 $N(0,I)$ 初始化 $x_T$

2. **迭代推斷 (Iterative Inference) - 從 `T` 倒數到 `1`:**

   - 對於每個時間步 `t` (從 `T` 到 `1`):

     - `alpha_bar_t = alpha_bar_t_sequence[t]`

     - **步驟 1: 多先驗去噪預測 (Multi-Prior Denoising Prediction)**

       - `epsilon_theta_cifar = D_theta_CIFAR(x_t, t)` // CIFAR10 先驗預測噪聲

       - `epsilon_theta_tcir = D_theta_TCIR(x_t, t)` // TCIR 先驗預測噪聲

       - `epsilon_theta_fused = w_cifar(t) * epsilon_theta_cifar + w_tcir(t) * epsilon_theta_tcir` // 融合兩個先驗的噪聲預測

       - 從融合後的噪聲預測中估計乾淨圖像 $x_0$:

         $x_{0,pred} = \frac{x_t - \sqrt{1-\bar{\alpha}_t}\epsilon_\theta}{\sqrt{\bar{\alpha}_t}}$

     - **步驟 2: 似然損失與穩定性修正 (Likelihood Loss with Stability Correction)**

       - `stability_penalty = 0` // 初始化穩定性懲罰

       - `current_guidance_strength = s` // 初始化當前指導強度

       - **如果** `not Is_Stable(x_0_pred)`: // 檢查 $x_0$ 預測是否穩定

         - `stability_penalty = lambda_stability * Compute_Instability_Measure(x_0_pred)` // 計算不穩定性懲罰，例如基於偏離穩定區域的程度
         - `current_guidance_strength = s * 0.5` // 可選: 降低指導強度以避免不穩定，或回退重試

       - 計算似然損失 (可選地包含穩定性懲罰):

         $loss\_likelihood=L(G(x_{0,pred}),y)+stability\_penalty$

       - 計算似然損失關於 $x_{0,pred}$ 的梯度:

         $gradient\_likelihood\_x0=Compute\_Gradient\_of\_Loss\_wrt\_x0(loss\_likelihood,x_{0,pred})$

     - **步驟 3: 投影梯度與修正噪聲 (Project Gradient and Correct Epsilon)**

       - 將似然梯度從 $x_0$ 空間投影到 $x_t$ 空間:

         $gradient\_likelihood\_xt\_for\_epsilon=(1−\bar{\alpha}_t) \cdot gradient\_likelihood\_x0$

       - 將似然指導項加到融合後的噪聲預測中:

         $\epsilon_{guided}=\epsilon_{\theta,fused}−current\_guidance\_strength \cdot gradient\_likelihood\_xt\_for\_epsilon$

     - **步驟 4: 執行一步去噪 (Perform One Denoising Step)**

       - 使用修正後的 $\epsilon_{guided}$ 計算下一步的 $x_{t−1}$:

         `x_t_minus_1 = Standard_Diffusion_Denoise_Step(x_t, epsilon_guided, t, alpha_bar_t_sequence`)

       - 更新當前時間步的圖像狀態：`x_t = x_t_minus_1`。

3. **返回結果 (Return Result):**

   - 返回最後一步得到的 `x_0_pred` (或 `x_0_pred_from_prior`)，作為重建後的最終圖像 `x_0_hat`。

### 3.5 暫定設計的 PnP 對照圖

![blackhole_PNP_compare.jpg](./index/compressed/blackhole_PNP_compare.jpg)


**創新點**

1. **融合了 DPS 框架**：該算法基於 DPS (Diffusion Posterior Sampling) 的核心思想，即通過修改擴散模型的逆向採樣過程，引入來自數據似然的梯度指導，來解決逆問題。

2. **使用了兩個先驗 (Multi-Prior Guided)**：這是重要的創新點之一。它不再依賴單一先驗，而是結合了來自 CIFAR10 的**通用圖像先驗**和來自 TCIR（颱風衛星圖片數據集）的**領域相關先驗**。這種多先驗融合的策略旨在利用不同先驗的優勢：通用先驗提供基礎的圖像結構，而領域相關先驗則提供更接近目標數據（黑洞圖像）的紋理和模式，這對於處理領域差距問題特別有用。

3. **加入了懲罰機制穩定黑洞物理觀測值 (Stability Correction)**：這是針對黑洞成像特定挑戰的關鍵創新。它通過在似然損失中引入一個**穩定性懲罰項**，並可能調整指導強度，來確保在迭代過程中生成的中間圖像符合前向模型（特別是涉及複雜物理模擬或 PDE 求解器時）的數值穩定性條件。這直接解決了傳統 PnPDP 方法在處理對輸入有嚴格穩定性要求的問題時可能出現的性能下降和數值不穩定性問題。

其他潛在或隱含的創新點：

1. **動態先驗融合權重 (Dynamic Prior Fusion Weights)**：在偽代碼中，`w_cifar_func(t)` 和 `w_tcir_func(t)` 允許先驗的貢獻權重隨著擴散時間步 `t` 而變化。這可以根據經驗或理論設計，例如在去噪早期（`t` 較大，圖像非常模糊）通用先驗可能佔主導，而在後期（`t` 較小，圖像接近清晰）領域相關先驗和數據一致性可能更重要。這比簡單的固定權重融合更具靈活性和潛力。

2. **不穩定性度量函數 (Compute_Instability_Measure)**：懲罰機制的有效性依賴於一個能準確量化「不穩定性」的函數。如何定義和實現 `Compute_Instability_Measure(x_0)` 是另一個創新點。它可以是基於物理定律的直接檢查（如 CFL 條件的違反程度），也可以是訓練一個輔助模型來預測不穩定性。

3. **針對黑洞問題的 PnPDP 應用**：雖然 PnPDP 框架本身不是新概念，但將其成功應用於**黑洞成像這種具有高度非線性、非加性噪聲和多模態後驗**的複雜科學逆問題，本身就是一項重要的創新和挑戰。傳統的圖像恢復任務（去模糊、去噪、超解析度）與這些科學問題存在顯著的結構性差異。MP-DPS-SC 在此類問題上的有效性將證明 PnPDP 的通用性和強大潛力。

4. **探索多模態後驗的潛力**：雖然偽代碼本身沒有直接包含多模態採樣的機制（如粒子濾波），但通過在似然中加入穩定性懲罰，並通過多先驗引導，可能間接影響模型探索不同解決方案模式的能力。黑洞成像因其稀疏和非凸的測量特性而表現出多模態行為。未來的創新點可以進一步明確地設計算法來捕捉和呈現這些不同的物理合理模式。
