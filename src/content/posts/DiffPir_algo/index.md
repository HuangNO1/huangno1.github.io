---
title: "Denoising Diffusion Models for Plug-and-Play Image Restoration"
published: 2025-06-27T22:40:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-06-27T22:40:28+08:00
draft: false
description: "中文標題-DiffPIR：基於去噪擴散模型的即插即用影像復原技術"
license: ""
tags: ["DiffPir", "CV", "Model", "DDPM", "DIFFUSION", "paper"]
category:  Paper
image: ./index/compressed/Figure5.png
lang: zh-TW
---

## 一、前言

中文標題 -- DiffPIR：基於去噪擴散模型的即插即用影像復原技術，[論文原文](https://arxiv.org/abs/2305.08995)，搭配原文食用更好，這個論文是在 DPS 之後提出的方法。

另外本人對於 PnP 目前還是一知半解，之前粗讀過 PnPDM（Plug-and-Play Posterior Sampling for Blind Inverse Problems）但是只是看個大概，PnPDM 這篇 Paper 很多數學公式，如果不下功夫精讀，就不太理解細節，也沒有太多想法記錄，所以自然而然忘了，所以在第二章會多描述一些。我後面再重讀 PnPDM 的論文。

## 二、背景概覽

老生常談，如果不是第一次看可以忽略跳到第 3 章節。

### 2.1 影像復原

#### 2.1.1 影像復原定義

什麼是影像復原？**影像復原是指從降級版本中恢復清晰、高品質影像的過程**。影像降級可能表現為多種形式，包括雜訊、模糊、低解析度或部分缺失。這類任務在電腦視覺和影像處理領域中被歸類為「低階視覺任務」。

常見的影像復原任務包括：

- **影像去噪**：從影像中去除不必要的隨機變化或雜訊。
- **影像超解析度（SR）**：將低解析度影像的解析度提升至高解析度。
- **影像去模糊**：逆轉模糊的影響，例如運動模糊或失焦模糊。
- **影像修補**：填補影像中缺失或損壞的區域。

這些任務在實際應用中無處不在，從手機攝影到醫學影像，都對影像品質有著嚴格的要求 。

#### 2.1.2 影像復原任務

**影像復原（Image Restoration, IR）是一項極具挑戰性的任務**，其目標是從模糊、嘈雜或不完整的降級影像中恢復清晰、高品質的原始影像。這本質上是一個「逆問題」，因為多個不同的原始影像可能在降級後產生相同的觀測結果。**傳統的即插即用（Plug-and-Play, PnP）方法因其靈活性和可解釋性**，在解決各類逆問題方面廣受認可。這類方法將複雜的復原問題分解為兩個較簡單的部分：確保復原影像與降級輸入一致（資料項），以及確保其符合自然、高品質影像的特徵（先驗項）。然而，**現有的 PnP 方法大多依賴於「判別式高斯去噪器」**，這些去噪器雖然擅長去除雜訊，但卻無法生成新的、高品質的影像細節。

近年來，擴散模型（Diffusion Models）在影像合成領域取得了革命性的進展，能夠生成令人難以置信的逼真且多樣的影像。它們透過學習逆轉逐步添加雜訊的過程來實現這一點。這種「生成式」能力為影像復原帶來了突破性的潛力。而作者在此篇 Paper 中提出的 **DiffPIR（Denoising Diffusion Models for Plug-and-Play Image Restoration）是一種創新的方法，它巧妙地將 PnP 方法的靈活性與擴散模型強大的生成能力相結合。它在 PnP 框架內使用現成的擴散模型作為「生成式去噪先驗」**。

#### 2.1.3「逆問題」：影像復原為何困難

插件IR方法的主要思想是將以下優化問題的數據術語和以前的術語分開，**公式一**：

$$\hat{\mathbf{x}} = \underset{\mathbf{x}}{\arg \min} \frac{1}{2\sigma_n^2} \| \mathbf{y} - \mathcal{H}(\mathbf{x}) \|^2 + \lambda \mathcal{P}(\mathbf{x}), \quad\quad\quad\quad\quad\quad (1)$$

**影像復原從根本上說是一個「逆問題」**。這意味著我們觀察到一個結果（降級的影像），並試圖推斷其原因（原始、清晰的影像）。降級過程通常可以表示為 $\mathbf{y}=\mathcal{H}(x_0)+n$，其中 $\mathbf{y}$ 是觀測到的降級影像，$x_0$ 是原始的真實影像，$\mathcal{H}$ 是一個已知的降級操作符（例如模糊核或下採樣操作），而 $n$ 則代表雜訊。

> where $\mathbf{y}$ is the measurement of ground truth $x_0$ given the degradation model  $\mathbf{y}=\mathcal{H}(x_0)+n$, $\mathcal{H}$ is a known degradation operator, σn denotes the known standard deviation of i.i.d. Gaussian noise n, and $\lambda \mathcal{P}(\mathbf{\cdot})$ is the prior term with regularization parameter $\lambda$. To be specific, the data term ensures that the solution adheres to the degradation process, while the prior term enforces the solution follows the desired data distribution.

**這個問題之所以困難，是因為降級操作 $\mathcal{H}$ 往往是「多對一」的**，即多個不同的原始影像 $x_0$ 在經過操作符 $\mathcal{H}$ 和雜訊 $n$ 的作用後，可能會產生相同的觀測降級影像 $\mathbf{y}$ 。因此，為了引導復原過程，我們需要額外的資訊或對「自然」影像外觀的假設，以將解決方案限制在視覺上合理的影像空間內。這通常透過引入一個「先驗項」來實現，該先驗項對影像的期望特性施加約束，例如平滑性、清晰度或符合特定資料分佈。

### 2.2 即插即用（Plug-and-Play, PnP）方法

即插即用方法是一種靈活且可解釋的框架，用於解決影像復原中的逆問題。其核心思想是將影像復原的優化問題（如公式 $(1) \hat{\mathbf{x}} = \underset{\mathbf{x}}{\arg \min} \frac{1}{2\sigma_n^2} \| \mathbf{y} - \mathcal{H}(\mathbf{x}) \|^2 + \lambda \mathcal{P}(\mathbf{x})$）分解為兩個獨立的子問題：一個「資料項」和一個「先驗項」。

1. **資料項**：這部分確保復原的影像與觀測到的降級影像保持一致。它關乎對輸入資料的「保真度」，即復原影像在降級後應盡可能接近觀測影像。
2. **先驗項**：這部分則強制復原的影像具有理想的屬性，例如視覺上的自然性、清晰度或平滑度。這通常被稱為「影像先驗」或「正則化」，它引導解決方案走向符合人類視覺感知的影像。

這種解耦通常透過變數分裂演算法實現，例如**交替方向乘子法（Alternating Direction Method of Multipliers, ADMM）**或**半二次分裂法（Half-Quadratic Splitting, HQS）** 。這種「即插即用」的特性極具價值，因為它允許整合任何現成的去噪器。這種模組化意味著去噪技術的進步可以直接惠及影像復原，而無需重新訓練整個系統。這顯著加速了研究和應用，使得專家可以獨立地專注於降級模型（影像如何被破壞）或影像先驗（清晰影像的樣子），從而促進創新。

### 2.3 傳統 PnP 方法的局限性

歷史上，**PnP 方法主要依賴於「判別式高斯去噪器」**。這些去噪器經過訓練以去除特定類型的雜訊（例如高斯雜訊），但它們並非設計用於「生成」新的影像內容，也無法處理資訊大量缺失的複雜不適定問題 。雖然基於深度學習的去噪器（例如基於卷積神經網路的去噪器）改進了性能，但即使是生成對抗網路（GANs）、變分自編碼器（VAEs）和正規化流（Normalizing Flows）等生成模型，當它們被用作 PnP 先驗時，其生成能力也常受到「阻礙」 。

傳統生成模型在 PnP 框架中生成能力受限，這表明它們的訓練目標（例如生成多樣樣本）與 PnP 先驗的特定要求（例如在保持結構的同時有效去除雜訊）之間存在根本性的不匹配。例如，GANs 或 VAEs 通常從隨機潛在空間生成新影像，或從壓縮表示中重建影像。當這些模型被迫在 PnP 框架中扮演去噪角色時，它們內部用於生成多樣性的機制可能會與精確去噪和重建保真度的需求產生衝突。這可能導致妥協，使它們既未能充分利用其生成優勢，也未能作為最佳去噪器發揮作用，從而導致其能力受到限制。這也為擴散模型作為一種本質上是「去噪器」的模型，如何更自然地適應 PnP 框架奠定了基礎。

> Unlike those traditional or convolutional neural network based discriminative Gaussian denoisers, denoisers parameterized by deep generative models are expected to better handle those ill-posed inverse problems due to their ability to model complex distributions. Deep generative models such as Generative Adversarial Networks (GANs) [23,31], Normalizing Flows (NFs) [15] and Variational Autoencoders (VAEs) [33, 44] have been used as denoisers of plug-and-play IR framework [18, 35, 55]. However, these generative models are not designed for denoising tasks and their generative capabilities are hindered when employed as plug-and-play prior.

### 2.4 擴散模型

#### 2.4.1 擴散模型定義

擴散模型是一類**深度生成模型**，在創建高品質、逼真影像方面取得了顯著成功。其核心思想受物理學啟發，特別是擴散的概念（類似於墨水滴在水中擴散的方式）。它們透過定義一個兩階段過程來運作：一個「前向」過程，逐步向資料添加雜訊；以及一個「逆向」過程，學習如何消除這些雜訊，從而有效地從純雜訊中生成資料 。

#### 2.4.2 「前向過程」：逐步添加雜訊

想像從一個完全清晰的影像開始。前向擴散過程會在一系列離散的時間步長中，系統地向這個影像添加少量高斯雜訊。隨著每個時間步的推進，影像會變得越來越嘈雜，直到在最後一個時間步，它與純隨機雜訊無法區分。這個過程通常是固定的，不涉及學習。它是一種將結構化資料轉換為非結構化雜訊的受控方式 。 數學上，前向過程可以由一個伊藤隨機微分方程（Itô SDE）描述： $dx = f(x, t)dt + g(t)dw$

> 其中 $w$ 是標準維納過程，$f(\cdot, t)$ 是漂移係數（drift coefficient），$g(\cdot, t)$ 是擴散係數（diffusion coefficient）。

對於去噪擴散機率模型（Denoising Diffusion Probabilistic Models, DDPM），這個過程的離散形式更為直觀：

#### 2.4.3 「逆向過程」：學習去除雜訊以生成影像

逆向過程的目標是學習如何精確地逆轉前向過程。從純雜訊（前向過程的最終狀態）開始，模型學習逐步去除雜訊，一步一步地重建出清晰的影像 。

這透過訓練一個神經網路（通常是 U-Net 架構）來實現，該網路在每個時間步預測所添加的雜訊，或者等價地，預測「分數函數」（score function）∇xlogpt(x) 。分數函數本質上指明了朝哪個方向移動可以增加資料的機率密度。逆向 SDE 的形式為：

> The diffusion process described in (2) can be reversed in time and has the form of [2]:

$$ dx = [f(x,t) - g^2(t)\nabla_x \log p_t(x)]dt + g(t)dw, \quad\quad\quad\quad\quad\quad (3) $$

> where pt(x) is the marginal probability density at timestep t, and the only unknown part ∇x log pt(x) can be mod elled as so-called score function sθ(x, t) with score matching methods [26, 52]. We utilize the convention of denoting the x at t as xt in subsequent discussions.

其中，未知的部分 ${\nabla}_{x_t} log p_t(x)$ 由一個稱為 $s_θ(x,t)$ 的分數函數模型來近似。對於 DDPM，其離散逆向步驟為（One reverse step of DDPM is）：

$$ x_{t-1} = \frac{1}{\sqrt{\alpha_t}}\left(x_t - \frac{\beta_t}{\sqrt{1-\bar{\alpha}_t}}\epsilon_\theta(x_t, t)\right) + \sqrt{\beta_t}\epsilon_t , \quad\quad\quad\quad\quad\quad (7) $$

這裡， $\epsilon_\theta(x, t)$ 是神經網路預測的雜訊。

> where $\epsilon_\theta(x, t)$ is the function approximator intended to predict the total noise $\epsilon$ between $x_t$ and $x_0$ in 
>
> $\mathbf{x}_t = \sqrt{\bar{\alpha}_t}\mathbf{x}_0 + \sqrt{1 - \bar{\alpha}_t}\boldsymbol{\epsilon}, \quad\quad\quad (6)$.

#### 2.4.4 擴散模型為何是強大的去噪器

**擴散模型逆向過程的本質就是「去噪」**。模型被明確訓練以去除不同程度的雜訊，這使其成為一個天生強大的去噪器 。與 GANs 或 VAEs 主要為生成而訓練不同，擴散模型的訓練目標直接與去噪對齊。這種根本性的設計意味著其內部表示天生就傾向於理解和逆轉損壞，使其成為高效的去噪器，同時也隱含地捕捉了資料的複雜統計特性。

此外，由於它們透過逆轉逐步的雜訊過程來學習底層資料分佈，它們建立了一個強大的「生成先驗」，它們隱含地理解真實影像的樣貌。這使得它們能夠以語義連貫的方式填補缺失資訊或糾正嚴重降級，而不僅僅是平滑雜訊。一個簡單的去噪器可能只會模糊細節以去除雜訊，因為它不「知道」這些細節應該是什麼樣子。而像擴散模型這樣的生成去噪器，已經學習了真實影像的統計特性和常見模式。這使得它不僅能夠去除雜訊，還能夠以與自然影像的整體結構和語義一致的方式重建缺失或損壞的資訊，從而產生更高的感知品質和更逼真的復原效果。

擴散模型生成高品質影像的能力，意味著它們捕捉了對「期望資料分佈」（公式 (1) 中的 $\mathcal{P}(\mathbf{x})$）豐富而複雜的理解。這正是強大影像先驗所需要做到的，使其能夠超越簡單的平滑處理，實際「幻覺」出合理可信的細節。

## 三、DiffPIR：影像復原的新方法

### 3.1 DiffPir 核心思想

DiffPIR 的核心創新在於將傳統的即插即用（PnP）框架與擴散模型強大的生成能力相結合。它認識到擴散模型本質上是「生成式去噪器」，它們不僅能夠去除雜訊，還能理解並生成逼真的影像內容 。

透過在 PnP 的疊代優化過程中，使用預訓練的擴散模型作為「隱式影像先驗」，DiffPIR 旨在克服先前 PnP 方法的局限性（這些方法通常產生模糊的結果，或難以處理嚴重的降級），同時保留 PnP 的靈活性 。

### 3.2 問題解耦：HQS 演算法

DiffPIR 採用半二次分裂法（HQS）來解耦公式 (1) 中的資料項和先驗項。這種解耦使得子問題可以疊代求解，從而促進了擴散採樣框架的利用 。透過引入一個輔助變數 $z$，公式 (1) 可以分解為以下疊代求解的子問題：

$$
\begin{cases}
z_k = \underset{z}{\arg \min} \frac{1}{2(\sqrt{\lambda/\mu})^2} \|z - x_k\|^2 + \mathcal{P}(z) & (10a)\\
x_{k-1} = \underset{x}{\arg \min} \|y - \mathcal{H}(x)\|^2 + \mu\sigma_n^2\|x - z\|^2 & (10b)
\end{cases}
$$

這兩個子問題分別處理：

- **子問題 (10a) / (12a)**：與先驗項相關，本質上是一個高斯去噪問題。這個子問題的目標是找到一個 z 值，它既接近當前疊代的 $x_k$，又符合影像的先驗分佈 $\mathcal{P}(\mathbf{z})$。此處，擴散模型被用作去噪器來解決這個先驗子問題。
- **子問題 (10b) / (12b)**：與資料項相關，實際上是一個近端算子（proximal operator）問題，通常具有閉合形式解。這個子問題確保復原的影像 $x$ 與觀測到的降級影像 $y$ 以及當前疊代的 $z$ 保持一致。

> Since the VP and VE Diffusion Models are actually equivalent to each other [32], from now on we limit our discussion within DDPM without loss of generality. To make the discussion more clear, we rewrite (10) as

$$
\begin{cases}
\mathbf{x}_0^{(t)} = \underset{\mathbf{z}}{\arg \min} \frac{1}{2\sigma_t^2} \|\mathbf{z} - \mathbf{x}_t\|^2 + \mathcal{P}(\mathbf{z}) & (12a) \\
\hat{\mathbf{x}}_0^{(t)} = \underset{\mathbf{x}}{\arg \min} \|\mathbf{y} - \mathcal{H}(\mathbf{x})\|^2 + \rho_t\|\mathbf{x} - \mathbf{x}_0^{(t)}\|^2 & (12b) \\
\mathbf{x}_{t-1} \leftarrow \hat{\mathbf{x}}_0^{(t)}, & (12c)
\end{cases}
$$

> where $ \rho_t = \lambda(\sigma_n / \bar{\sigma}_t)^2 $. Here (12b) is the data subproblem to solve and (12c) is a necessary step to finish our sampling method which will be introduced in 3.3. Additionally, we show in Appendix A.1 that we can also derive one-step reverse diffusion from HQS.

這種解耦的優勢在於，它允許 DiffPIR 獨立處理資料項，從而使其能夠應對各種具有不同降級操作符 $\mathcal{H}$ 的降級模型 。由於擴散模型本身就是生成式去噪器，它們可以作為即插即用去噪先驗來解決先驗項子問題 。

將子問題 (10a) 與擴散過程建立聯繫，可以觀察到其與擴散模型預測清晰影像的步驟相似。具體來說，當我們嘗試從帶有雜訊的 $x_k$ 中恢復無雜訊的 $z_k$ 時，這個過程可以近似表示為 

$$ \mathbf{z}_k \approx \mathbf{x}_k + \frac{1 - \bar{\alpha}_t}{\bar{\alpha}_t} \mathbf{s}_\theta(\mathbf{x}_k), \quad (11) $$

這正是擴散模型中估計原始清晰影像 $\mathbf{x}_0^{(t)}$ 的形式。這表明擴散模型的訓練目標與 PnP 框架中的去噪先驗子問題具有內在的一致性，使得擴散模型成為 PnP 框架中理想的生成式去噪器。

### 3.3 DiffPIR 採樣過程（算法 1）

![algo1.png](https://imgpoi.com/i/FR7W1E.png)

DiffPIR 的採樣方法結合了對清晰影像的估計與對雜訊的校正，並將測量值 $y$ 納入每個逆向擴散步驟中。以下是其詳細的演算法步驟：

1. **初始化**: 從標準高斯雜訊中初始化 $\rho_t$，並預先計算 $\rho_t \lambda \sigma^2_n/\sigma^2_s$。
2. **疊代時間步**: 從 $t=T$ 到 1 進行疊代。
3. **預測清晰影像**: 使用擴散模型作為去噪器，預測當前時間步 $t$ 的估計清晰影像 $\hat{x}_0^{(t)}$。這一步透過公式 $\hat{x}_0^{(t)} = \frac{1}{\sqrt{\alpha_t}}(x_t + (1-\bar{\alpha}_t)s_\theta(x_t, t))$ 實現，其中 $s_\theta(x_t, t)$ 是分數模型（或雜訊預測器）。
4. **解決資料近端問題**: 將測量值 $y$ 納入考量。解決資料近端問題以獲得修正後的清晰影像估計 $\hat{x}_0^{(t)}$。這一步的目標是確保預測的影像與觀測到的降級影像 $y$ 一致，同時也與擴散模型預測的 $\hat{x}_0^{(t)}$ 接近。該子問題表示為 $\hat{x}_{0}=\operatorname{argmin}_{\hat{x}}||y-\mathcal{H}(\hat{x})||^2+||\hat{x}-x_{0}||^2$。
    1. **資料子問題的解析**: 對於超解析度、去模糊和修補等影像復原任務。子問題 (12b) 通常有快速的解析。
        1. **影像修補**: 在無雜訊修補中，降級模型為 $y=M \odot x$ ($M$ 為遮罩)，解析解為 $x_0 = \frac{M \odot y + \rho_t \hat{x}_0}{M+\rho_t}$。
        2. **影像去模糊**: 對於高斯雜訊下的影像去模糊，降級模型為 $y=x \otimes k+n$ ($k$ 為模糊核)，解析解為 $x_{0}=\mathcal{F}^{-1}\left(\frac{1}{\rho_{t}}\left(d-\overline{\mathcal{F}(k)}\odot_{s}\frac{(\mathcal{F}(k)d)\Psi_{s}}{(|\mathcal{F}(k)|^2\Psi_{s}+\rho_{t})}\right)\right)_{s_{1}}$，其中 $\mathcal{F}$ 和 $\mathcal{F}^{-1}$ 分別是快速傅立葉變換及其逆變換。
        3. **單影像超解析度 (SISR)**: 對於雙三次插值 (bicubic) 超解析度、降級模型為 $y=x \downarrow_{sf}^{\text{bicubic}}+n$。雖然有疊代反向投影 (IBP) 解決方案 $x_0=z_0-\gamma (y-z_0 \downarrow_{sf}^{\text{bicubic}})+\text{bicubic}$，但也可以使用近似雙三次核的閉合形式解。$x_{0}=\mathcal{F}^{-1}\left(\frac{1}{\rho_{t}}\left(d-\overline{\mathcal{F}(k)}\odot_{s}\frac{(\mathcal{F}(k)d)\Psi_{s}}{(|\mathcal{F}(k)|^2\Psi_{s}+\rho_{t})}\right)\right)_{s_{1}}$

    2. **近似解**: 如果無法獲得解析解，也可以使用一階近端算子方法近似求解：$\hat{x}^{(t)}_{0}\approx\hat{x}^{(t)}_{0}-\frac{1}{\sigma}\nabla L(y,\hat{x}^{(t)}_{0})+\frac{2}{\lambda}\nabla_{\alpha}L(\text{human}(\mathcal{H})(\hat{x}^{(t)}_{0})-\mathcal{H}(\hat{x}^{(t)}_{0})||^2)$
5. **計算有效雜訊**: 根據修正後的清晰影像估計 $\hat{x}_0^{(t)}$，計算有效的預測雜訊 $\hat{\epsilon} = \frac{1}{\sqrt{1-\bar{\alpha}_t}}(x_t - \sqrt{\bar{\alpha}_t}\hat{x}_0^{(t)})$。
6. **引入隨機雜訊**: 生成標準高斯雜訊 $\epsilon_t \sim \mathcal{N}(0, I)$。
7. **完成一步逆向擴散採樣**: 透過以下公式計算下一個時間步的影像 $x_{t-1}: x_{t-1} = \sqrt{\bar{\alpha}_{t-1}}\hat{x}_0^{(t)} + \sqrt{1-\bar{\alpha}_{t-1}}( \sqrt{1-\zeta}\hat{\epsilon} + \sqrt{\zeta}\epsilon_t )$。這裡，超參數 $\zeta$ 控制了每一步注入的雜訊方差，當 $\zeta=0$ 時，採樣策略變為確定性。
8. **返回結果**: 疊代完成後，返回最終的復原影像 $x_0$。

這個疊代精煉的過程，在每個步驟中結合了擴散模型對影像先驗的理解和對觀測資料的保真度。資料項和先驗項的解耦，使得 DiffPIR 在處理各種降級模型時具有高度的靈活性。無論降級操作符 v 是什麼，資料子問題都可以獨立解決，這使得 DiffPIR 能夠適應廣泛的影像復原任務。

> OS：這段好痛苦阿，(′゜ω。‵)，誰來救救我，原文的這麼難讀懂，給我看矇了。
>
> - $\odot$ 表示哈達瑪積 (Hadamard product)，也稱為逐元素乘積 (element-wise product)。這意味著矩陣 M 和矩陣 x 中對應位置的元素相乘，得到矩陣 y 中對應位置的元素。
> - $\otimes$ (卷積)
>   - 在數學中，$\otimes$ 通常表示張量積 (Tensor Product)。
>   - 然而，在信號處理和影像處理領域，當它用於表示影像與核（kernel）之間的運算時，幾乎總是代表卷積 (Convolution)。
>   - 公式 $y=x \otimes k+n$ (其中 k 是模糊核) 中，$x \otimes k$ 表示原始影像 x 與模糊核 k 進行卷積，產生模糊的影像。這是影像模糊的標準數學模型。
> - $\Psi_{s}$ (頻域加權函數 或 功率譜密度)
>   - 這個符號出現在去模糊的傅立葉逆變換公式的分母中：$(|\mathcal{F}(k)|^2\Psi_{s}+\rho_{t})$。
>   - 在頻域的影像復原（特別是維納濾波器或相關的正規化方法）中，$\Psi_{s}$ 通常表示以下幾種可能：
>     - **信號的功率譜密度 (Power Spectral Density, PSD)**：在維納濾波器中，分母通常會包含模糊核的頻率響應的平方與信噪比相關的項。$\Psi_{s}$ 可能代表原始信號（影像）在頻域的功率譜密度，用於加權不同頻率分量的恢復。
>     - **頻率域的正規化項或加權函數**：它可以用作一個頻率相關的加權因子，用於平衡數據保真項和先驗正規化項之間的關係。
>     - **與信號性質相關的先驗資訊**：例如，如果我們假設原始信號具有某種頻譜特性，Ψs​ 可以體現這種先驗知識。
>   
>   總的來說，$\Psi_s$ 在這個去模糊公式中是一個在**頻域**中起作用的**加權因子或信號屬性參數**，它幫助在恢復模糊影像時，根據頻率特性來平衡對不同頻率分量的處理，尤其是在噪聲和模糊的存在下。具體的精確含義通常需要參考原始論文的定義。

### 3.4 DiffPIR 的主要優勢

#### 3.4.1 生成能力與感知品質

![Figure1.png](https://imgpoi.com/i/FR7YQV.png)

DiffPIR 透過利用擴散模型作為生成式去噪先驗，展現出卓越的生成能力和感知品質。與傳統方法相比，DiffPIR 能夠重建出具有複雜細節的影像，並能生成多樣化且語義一致的重建結果，即使在降級程度很高（例如影像修補中 75% 區域被遮罩）的情況下亦是如此 。這使得 DiffPIR 在處理諸如大面積缺失的影像修補等高度挑戰性的逆問題時，表現尤為出色 。圖 1、圖 5 和圖 11 提供了視覺範例，展示了 DiffPIR 在超解析度、去模糊和修補任務中生成的高品質、多樣化重建影像。

![Figure5.png](https://imgpoi.com/i/FR7RVG.png)

![Figure11.png](https://imgpoi.com/i/FR7C9M.png)

#### 3.4.2 靈活性與泛化能力

由於 DiffPIR 將資料項與先驗項解耦，並允許資料項子問題獨立解決，這使得它能夠處理各種降級模型，無論降級操作符 $\mathcal{H}$ 是什麼 。這種設計賦予了 DiffPIR 極高的靈活性和泛化能力，使其能夠適用於多種影像復原任務，包括超解析度、影像去模糊和影像修補，而無需針對每種任務進行模型架構的重大修改或重新訓練 。

#### 3.4.3 效率

擴散模型雖然生成能力強大，但其推理速度較慢（通常需要約 1000 次 NFEs）是其應用於許多實際場景的障礙 。DiffPIR 在效率方面取得了顯著進展，它能夠在不超過 100 次 NFEs 的情況下實現最先進的性能 。這得益於其整合了類似於去噪擴散隱式模型（DDIM）的加速採樣策略。實驗結果顯示，即使僅使用 20 次 NFEs，DiffPIR 也能展現出令人印象深刻的競爭性 FID 和 LPIPS 分數。

> While the generative ability of diffusion models has been proven to be better than other generative models like GAN and VAE, their slow inference speed (∼ 1000 Neural Function Evaluations (NFEs)) impedes them from being applied in many real-world applications [56]. As suggested in [51], DDPMs can be generalized to DDIMs with non-Markovian diffusion processes while still maintaining the same training objective. The underline reason is that the denoising objective (4) does not depend on any specific forward procedure as long as $p_{0t}(x_t | x_0)$ is fixed. As a result, our sampling sequence (length $T$ ) can be a subset of $[1, ..., N ]$ used in training. To be specific, we adapt the quadratic sequence in DDIM, which has more sampling steps at low-noise regions and provides better reconstructions in our experiment [51].

圖 6 顯示了採樣步數（NFEs）對性能的影響。雖然 PSNR 隨 NFEs 呈對數線性關係，但 LPIPS 分數在 100 到 500 次 NFEs 之間最低。這表明 DiffPIR 可以在少於 100 次 NFEs 的情況下生成詳細影像，因此論文中將預設 NFEs 數量設定為 100 。

![Figure6.png](https://imgpoi.com/i/FR74A9.png)

此外，DiffPIR 還可以透過從部分帶雜訊的影像開始逆向擴散過程（即跳過初始擴散步驟）來進一步減少 NFEs 數量，特別是對於去模糊和超解析度等任務 。圖 7 顯示，即使 $t_{start}=400$ 也能表現良好，這在不損失品質的情況下大幅減少了 NFEs 。

![Figure7.png](https://imgpoi.com/i/FR70X5.png)

#### 3.4.4 最先進的性能

DiffPIR 在多個基準測試中展現了最先進的性能，無論是定量還是定性分析。**定量結果**： 表 1 和表 2 展示了 DiffPIR 在 FFHQ 和 ImageNet 資料集上，針對不同影像復原任務（高斯去模糊、運動去模糊、4 倍超解析度、影像修補）的定量結果。評估指標包括峰值信噪比（PSNR）、Fréchet Inception Distance（FID）和學習感知影像塊相似度（LPIPS）。

**表 1：FFHQ（上）和 ImageNet（下）上的雜訊定量結果**：

![Table1.png](https://imgpoi.com/i/FR7TQ2.png)

>  對於帶有雜訊的測量（$\sigma_n=0.05$），DiffPIR 在 FID 和 LPIPS 方面表現優於所有其他比較方法，並且在 PSNR 方面也取得了競爭性分數 。

**表 2：FFHQ 上的無雜訊定量結果**：

![Table2.png](https://imgpoi.com/i/FRKK1D.png)

> 對於無雜訊測量（$\sigma_n=0.0$），DiffPIR 在 100 次 NFEs 下在 FID 和 LPIPS 方面顯著優於其他比較方法 。儘管 DPIR 在無雜訊任務的 PSNR 方面具有更大優勢，但其生成的影像通常未能呈現高感知品質 。

**定性結果**： 圖 1、圖 3 和圖 4 展示了 DiffPIR 能夠產生高品質的重建影像。與 DDRM 和 DPIR 傾向於生成模糊影像不同，DiffPIR 在重建複雜細節方面表現出色 。此外，與 DPS 相比，DiffPIR 僅需更少的 NFEs 即可獲得忠實的重建 。

![Figure3_and_4.png](https://imgpoi.com/i/FR7AHB.png)

## 四、DiffPir與相關工作的比較

### 4.1 DDRM 

去噪擴散復原模型（DDRM）在結構上與 DiffPIR 相似，兩者都首先預測 $x_0$，然後添加雜訊以進行前向採樣 $x_{t−1}$。然而，DDRM 僅適用於線性操作符 $\mathcal{H}$，並且當快速奇異值分解（SVD）不可行時，其效率無法得到保證 。相比之下，DiffPIR 能夠處理任意降級操作符 $\mathcal{H}$，這得益於其資料項的解耦和對近端算子的靈活處理 。

### 4.2 DPS

擴散後驗採樣（DPS）方法利用拉普拉斯近似來解決後驗採樣的難題，並且可以解決一般的嘈雜逆問題。然而，DPS 在採樣速度上存在問題，並且在採樣步驟較少時，其重建的保真度不夠高 。儘管 DPS 和 DiffPIR 在解決一般逆問題方面有相似的解決方案，但 DPS 在每個逆向擴散步驟之後處理測量值，而 DiffPIR 則基於 DDIM 在逆向擴散步驟中加入測量值，這支持了更快的採樣 。這種處理測量值方式的核心差異，使得 DiffPIR 在保持高品質的同時，顯著提升了採樣效率。

## 五、消融研究（Ablation Study）

### 5.1 採樣步數/NFEs 的影響（Effect of sampling steps）

為了研究採樣步數（或等效地，NFEs 數量）的影響，研究在 ImageNet 驗證集上的 100 張影像上進行了 4 倍雜訊超解析度（$\sigma_n=0.05$）實驗，採樣步數 $T$ 範圍為 。結果如圖 6 所示，PSNR 與 NFEs 數量呈對數線性關係，而 LPIPS 分數在 $T \in [100, 500]$ 時最低 。這表明 DiffPIR 可以在少於 100 次 NFEs 的情況下生成詳細影像。

### 5.2 $t_{start}$ 的影響（Effect of $t_{start}$）

DiffPIR 能夠從部分帶雜訊的影像開始逆向擴散過程，而不是從純高斯雜訊開始，這有助於減少 NFEs 數量，特別是對於去模糊和超解析度等任務 。圖 7 顯示了 $t_{start}$ 對嘈雜高斯去模糊任務中 PSNR 和 LPIPS 的影響。研究發現，即使 $t_{start}=400$，該方法也能表現良好，這在不損失品質的情況下大幅減少了 NFEs 。

### 5.3  $\lambda$ 和 $\zeta$ 的影響

**DiffPIR 有兩個超參數：$\lambda$ 和 $\zeta$**。$\lambda$ 控制條件引導的強度，而 $\zeta$ 控制每個採樣時間步注入的雜訊水平。圖 8 顯示了這些超參數對運動模糊樣本重建影像的影響。觀察結果表明：

- 當引導過強（例如 $\lambda<1.0$）時，雜訊會被放大；而當引導過弱（例如 $\lambda>1000$）時，生成的影像會變得更不具條件性 。
- 當 $\zeta$ 接近 1 時，生成的影像傾向於模糊 。

![Figure8.png](https://imgpoi.com/i/FRKNHV.png)

這些發現為調整超參數以在重建保真度和感知品質之間取得平衡提供了指導。

## 六、論文結論

此 Paper 中介紹了一種基於擴散模型的新型採樣技術，用於即插即用（Plug-and-Play）影像復原，稱為 DiffPIR。具體而言，DiffPIR 採用基於 HQS 的擴散採樣方法，該方法利用現成的擴散模型作為即插即用去噪先驗，並在清晰影像流形中解決資料子問題。廣泛的實驗結果突顯了 DiffPIR 相較於其他競爭方法的卓越靈活性、效率和泛化能力。

DiffPIR 透過巧妙地結合 PnP 框架的模組化優勢與擴散模型固有的強大生成和去噪能力，克服了傳統影像復原方法的局限性。其在減少神經函數評估次數的同時，實現了最先進的感知品質和競爭性的重建保真度，這對於將其應用於實際場景至關重要。DiffPIR 的成功證明了擴散模型在解決複雜逆問題方面的巨大潛力，並為未來影像復原技術的發展開闢了新的途徑。

## 七、想法

### 7.1 進一步深入 DiffPir 與 DFS 之間的區別

DiffPIR 與 DPS：影像復原的兩種不同策略

影像復原就像是從一張模糊或破損的照片中，還原出原始清晰的影像。DiffPIR 和 DPS 都是利用「擴散模型」這種強大的工具來完成這項任務，但它們的方法略有不同。

**擴散模型**就像是一位藝術家，它學會了如何從一堆隨機的雜訊中，一步一步地「畫」出逼真的影像。這個過程本質上就是「去噪」，因為它在學習如何去除雜訊的同時，也學會了真實影像的樣貌。

現在，我們來看看 DiffPIR 和 DPS 如何利用這位「藝術家」：

- **DPS (Diffusion Posterior Sampling)**： 想像 DPS 是一位「事後諸葛」的偵探。它會先讓擴散模型自己去生成一個影像（就像藝術家自由創作），然後再回過頭來，根據你提供的「線索」（也就是降級的模糊或破損影像），對這個生成的影像進行修正。它在擴散模型每完成一步「去噪」後，都會停下來，檢查一下結果是否符合原始的「線索」，然後再進行調整 。這種方式雖然能解決很多問題，但就像偵探需要反覆核對一樣，會比較耗時。
- **DiffPIR (Denoising Diffusion Models for Plug-and-Play Image Restoration)**： DiffPIR 更像是一位「即時指導」的藝術總監。它將影像復原的複雜問題拆解成兩個簡單的部分：一個是「資料一致性」（確保復原的影像與你提供的降級影像相符），另一個是「影像先驗」（確保復原的影像是自然、逼真的）。DiffPIR 在擴散模型「去噪」的每一步中，就直接將「線索」（降級影像的資訊）融入進去，引導擴散模型在生成過程中就朝著正確的方向修正 。這種「邊去噪邊修正」的方式，讓它能更快、更有效率地完成任務。

**DiffPIR 與 DPS 的優劣勢比較**

| 特性                 | DiffPIR                                                      | DPS                                                          |
| -------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **核心思想**         | 將傳統的即插即用 (PnP) 框架與擴散模型結合，在去噪過程中即時融入測量資訊。 | 利用拉普拉斯近似處理後驗採樣，在每個逆向擴散步驟後處理測量值。 |
| **處理測量資訊**     | 在逆向擴散步驟「內部」加入測量值，支援更快的採樣。           | 在每個逆向擴散步驟「之後」處理測量值。                       |
| **速度/效率 (NFEs)** | 效率高，只需少量「神經函數評估」(NFEs) 即可達到最先進的性能（例如，不超過 100 次 NFEs）。 | 採樣速度較慢，需要大量的 NFEs 才能獲得良好性能（例如，實驗中通常需要 1000 次 NFEs）。 |
| **生成能力**         | 繼承擴散模型的強大生成能力，能處理高度不適定的逆問題（例如大面積影像修補），生成高品質、語義一致的細節。 | 也能解決一般嘈雜的逆問題，但其生成能力在少量採樣步驟下可能不夠忠實。 |
| **靈活性**           | 資料項可獨立解決，能處理各種降級模型和任意降級操作符。       | 可以解決一般嘈雜的逆問題。                                   |
| **重建品質**         | 擅長重建複雜細節，生成高品質且多樣化的影像，在感知品質（FID、LPIPS）方面表現卓越。 | 在少量採樣步驟下，重建的忠實度可能不足。                     |
| **主要優勢**         | 效率高、生成能力強、靈活性高、重建品質優異。                 | 能夠解決一般的嘈雜逆問題。                                   |
| **主要劣勢**         | 在超解析度 (SR) 任務中，LPIPS 分數可能因近似雙三次核的誤差而略有例外。 | 採樣速度慢、計算成本高，在少量採樣步驟下重建忠實度不足。     |

### 7.2 DiffPIR 未來可以修正或改進的方向

1. **提升超解析度 (SR) 任務的精確度與核函數處理**：

   論文中明確指出，DiffPIR 在超解析度任務上的 LPIPS 分數（衡量感知品質的指標）表現有例外，這可能歸因於「採樣過程中因近似雙三次核函數 $k$ 的不準確性而引入的累積誤差」。這表示未來研究可以專注於改進超解析度任務中資料子問題的處理方式。例如，可以探索更精確的雙三次核函數近似方法，或者開發新的、更穩健的下採樣模型，甚至考慮讓模型學習這些核函數，以減少誤差累積，進一步提升超解析度影像的感知品質。

2. **進一步加速採樣過程**：

   儘管 DiffPIR 相較於其他基於擴散模型的方法（如 DPS）已經在效率上取得了顯著進展，能夠在少於 100 次「神經函數評估」（NFEs）的情況下達到最先進的性能，但擴散模型普遍仍以推理速度較慢著稱。為了讓 DiffPIR 更適用於即時應用，未來的研究可以探索更先進的加速採樣技術（超越目前已採用的 DDIM 類方法），或開發自適應的採樣策略，以在不犧牲影像品質的前提下，進一步減少所需的 NFEs 數量。

3. **實現超參數的自適應優化**：

   DiffPIR 依賴於兩個關鍵的超參數：$\lambda$（控制條件引導的強度）和 $\zeta$（控制每一步注入的雜訊水平）。論文中的消融研究也顯示了這些超參數對重建影像的影響，需要針對不同任務和雜訊水平進行手動調整。未來可以研究開發自適應的方法，讓模型能夠根據輸入影像的特性或特定的降級任務，自動設定這些超參數，而非依賴人工調校。這將大大提高 DiffPIR 的易用性和在多樣化場景下的穩健性。 

> 嗚嗚嗚，別罵了別罵了，這就去讀 PnP-DM論文。(✘﹏✘ა)

## 八、其它

知乎上也沒有找到比較多的解讀，找到一篇簡略的：[DMs-Inversion(3)[DiffPIR] —— Denoising Diffusion Models for Plug-and-Play Image Restoration - 知乎](https://zhuanlan.zhihu.com/p/9176049507)

