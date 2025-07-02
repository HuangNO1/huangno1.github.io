---
title: "MoE (Mixture-of-Experts) 在黑洞逆問題上的應用"
published: 2025-07-02T22:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-02T22:00:28+08:00
draft: false
description: ""
license: ""
tags: ["MoE", "blackhole", "PnP", "Prior", "DDPM"]
category:  Research
image: ./index/compressed/Dense_and_Sparse_MoE.png
lang: zh-TW
---

## 一、前言

在此篇文章我想要粗略思考，如果我們使用 [Mixture-of-Experts (MoE)](https://huggingface.co/blog/moe) 去結合 cifar-10 和 TCIR 數據集，該做哪些前置分析，因爲目前還只是想法階段，沒有真實的代碼，最後使用 Gemini 幫我生成了代碼。

## 二、MoE 在 PnP 任務中的應用與模型選擇

使用 MoE 的核心思想是將兩個獨立訓練好的模型（Cifar-10 圖像生成器和颱風圖像生成器）以 PnP 的方式整合，用於生成黑洞圖像。MoE 在這裡可以發揮關鍵作用，它能讓模型在不同領域的知識之間進行動態切換和融合。

### 2.1 MoE 模型的分析與適用性判斷

此次結合任務中，MoE 的核心價值在於其**條件性計算 (Conditional Computation)** 的能力。不同的輸入（來自 Cifar-10 的特徵、來自颱風圖的特徵、甚至是物理觀測值）可以被路由到不同的專家，這些專家可以專精於處理特定領域的資訊。

以下是幾種常見的 MoE 模型類型：

1.  **稀疏 MoE (Sparse MoE)**：
      * **原理：** 這是最經典的 MoE 形式，每個輸入只激活少數 (Top-K) 專家。門控網路決定路由。
      * **優勢：** 計算效率高，可以構建參數極其龐大的模型而不會顯著增加計算量。每個專家可以學習特定領域的知識。
      * **劣勢：** 需要仔細的負載平衡策略，以確保所有專家都被有效利用。
      * **適用性：非常適合的場景。** 可以將 Cifar-10 訓練的知識和 TCIR 訓練的知識視為兩個或多個「專家」。當輸入的是 Cifar-10 相關的潛在特徵時，門控網路可以將其路由到專門處理通用圖像紋理的專家；當輸入是颱風相關的潛在特徵時，路由到處理複雜結構和氣象模式的專家。最終，將這些專家的輸出結合作為生成黑洞圖像的某個中間層或最終層的輸入。這直接體現了 PnP 的思想。
    
2.  **層級 MoE (Hierarchical MoE)**：
      * **原理：** 專家被組織成樹狀或層級結構。門控網路首先選擇一個專家組，然後在該組內進一步選擇子專家。
      * **優勢：** 可以處理更複雜的輸入分佈，實現更細粒度的專家分工。
      * **劣勢：** 訓練和路由邏輯更複雜。
      * **適用性：可以考慮，但可能過於複雜。** 如果 Cifar-10 和 TCIR 數據集的內部結構還有更細微的劃分，例如 Cifar-10 中的動物和交通工具需要不同的專家，或者颱風圖像的強弱需要不同專家，那麼層級 MoE 可能有用。但對於初次嘗試，稀疏 MoE 可能更直接。
    
3.  **條件計算 (Conditional Computing) / Gating Mechanisms (廣義 MoE)**：
      * **原理：** 這是一種更廣泛的概念，MoE 是其子集。它不一定是獨立的專家網路，而是根據輸入動態調整模型的一部分參數或激活路徑。例如，動態係數方法本身就是一種條件計算。
      * **優勢：** 靈活性高，可以實現更平滑的知識融合。
      * **劣勢：** 設計和優化可能需要更多經驗。
      * **適用性：與動態係數方法有重疊。** 可以將 MoE 的概念融入到動態係數的選擇中，例如，門控網路不僅輸出權重，還可能輸出影響動態係數選擇的潛在因子。

### 2.2 結論與推薦

目前推薦從 **稀疏 MoE (Sparse MoE)** 開始著手。它的模型結構相對清晰，且能很好地實現 PnP 的概念：

  * **PnP 體現：** 將 Cifar-10 模型和 TCIR 模型生成的特徵輸入一個 MoE 層。這個 MoE 層包含多個專家，其中一些可以專注於處理 Cifar-10 風格的特徵，另一些專注於 TCIR 風格的特徵。門控網路將根據輸入特徵的「來源」或「特性」來選擇激活的專家。
  * **黑洞圖像生成：** 黑洞物理觀測值可以作為額外的條件輸入給門控網路，或者與 MoE 層的輸出融合，引導生成器合成具有特定物理屬性的黑洞圖像。

可以將 MoE 層放置在生成器模型的**中間層**，例如在幾何建模特徵提取之後、最終圖像渲染之前。或者將整個生成器設計成 MoE 結構，其中每個「專家」是一個小型生成器，負責生成圖像的不同方面或基於不同輸入類型。

## 三、稀疏 MoE 的參數調整策略

> [!TIP]
>
> 有空可以讀這篇：[Sparse Upcycling: Training Mixture-of-Experts from Dense Checkpoints](https://arxiv.org/abs/2212.05055)
>
> ![upcycled_moe.png](https://imgpoi.com/i/FHWV9M.png)

使用稀疏 MoE，以下是一些關鍵參數及其調整建議：

1.  ### 專家數量 (Number of Experts, `num_experts`)

      * **選擇：** 這是最重要的參數。考慮兩個主要數據源 (Cifar-10 和 TCIR)。可以從 $N=2$ (每個數據源一個專家) 開始，然後逐漸增加到 $N=4, 8, 16$ 等。
      * **建議：** 由於有兩個明確的「知識領域」，至少應該有 $N=2$ 個專家。甚至可以有 $N\>2$ 個專家，讓其中一些專家學習 Cifar-10 的細節，另一些學習 TCIR 的紋理，甚至有額外的專家學習兩種數據的通用特徵，或者專門處理黑洞物理觀測值與圖像特徵的映射。

2.  ### 激活的專家數量 (Top-K Experts, `top_k`)

      * **選擇：** 每次前向傳播時，門控網路激活的專家數量。通常 $K=1$ 或 $K=2$。
      * **建議：** 從 $K=1$ 開始，這意味著每個輸入只由一個專家處理，計算效率最高。如果發現 $K=1$ 導致某些信息丟失或融合不夠，可以嘗試 $K=2$，允許兩個專家共同作用。

3.  ### 負載平衡損失權重 (`load_balancing_loss_weight`)

      * **作用：** 這是防止某些專家過於繁忙而其他專家閒置的關鍵。它是一個添加到總損失中的額外項，鼓勵門控網路將輸入均勻地分佈到所有專家。
      * **調整：** 這個權重通常是一個小值，例如 $0.01, 0.1, 0.2$。如果過小，負載不平衡會加劇；如果過大，門控網路可能為了平衡而犧牲模型性能。需要通過實驗來找到最佳值。

4.  ### 專家容量 (Expert Capacity)

      * **作用：** 每個專家在一個批次中可以處理的最大 token除以樣本數。如果超過容量，多餘的 token 將被丟棄或等待下一個批次。這對於提高訓練效率很重要。
      * **調整：** 通常會設置一個合理的比例，例如每個專家容量是 `batch_size / num_experts * capacity_multiplier`。`capacity_multiplier` 通常略大於 1 (例如 1.25)，以應對輕微的路由不平衡。

5.  ### 門控網路設計 (Gate Network Design)

      * **設計：** 門控網路通常是一個小的線性層或多層感知器 (MLP)，輸入是當前層的特徵向量，輸出是每個專家的 logits。
      * **激活函數：** 通常使用 `softmax` 將 logits 轉換為概率分佈。
      * **建議：** 門控網路不宜過於複雜，它只需要足夠的能力來判斷輸入應該由哪個專家處理。

## 四、實作代碼案例 (PyTorch)

> [!TIP]
>
> 以下代碼是由 Gemini 生成，請謹慎參考，並沒有經過實際調整與應用。

這裡是一個簡化的 PyTorch 稀疏 MoE 層的實現，以及如何將其整合到一個生成器模型中。這個例子將聚焦於 MoE 層的結構，並假設有 Cifar-10 和 TCIR 的特徵提取部分，或者它們可以作為獨立的輸入進入 MoE 層。

為了演示 PnP 的思想，我們假設在生成黑洞圖像的過程中，某一層的特徵需要由 MoE 來處理，並根據這些特徵的「性質」來選擇專家。

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

# --- MoE Layer 實作 (基於常見的稀疏 MoE 設計) ---
# 引用來源：靈感來自 Google Switch Transformer 和 Hugging Face Transformers 庫中的 MoE 實現概念
# (註：這不是直接複製任何開源代碼，而是基於這些通用設計原則的簡化實現)
# 具體參考可以看：
# - Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity: https://arxiv.org/abs/2101.03961
# - transformers 庫中的 FlaxMoEBlock: https://github.com/huggingface/transformers/blob/main/src/transformers/models/switch_transformers/modeling_switch_transformers.py

class SparseMoELayer(nn.Module):
    def __init__(self, input_size: int, num_experts: int, expert_hidden_size: int, top_k: int = 2, load_balancing_loss_weight: float = 0.01):
        """
        稀疏混合專家層 (Sparse Mixture-of-Experts Layer)

        Args:
            input_size (int): 輸入特徵的維度。
            num_experts (int): 專家的數量。
            expert_hidden_size (int): 每個專家內部的前饋層隱藏層大小。
            top_k (int): 每個輸入激活的專家數量。
            load_balancing_loss_weight (float): 負載平衡損失的權重。
        """
        super().__init__()
        self.input_size = input_size
        self.num_experts = num_experts
        self.top_k = top_k
        self.load_balancing_loss_weight = load_balancing_loss_weight

        # 確保 top_k 不大於專家數量
        if self.top_k > self.num_experts:
            raise ValueError(f"top_k ({self.top_k}) cannot be greater than num_experts ({self.num_experts})")

        # 門控網路 (Gate Network / Router)
        # 負責將輸入路由到 K 個專家
        self.gate = nn.Linear(input_size, num_experts, bias=False)

        # 專家網路 (Expert Networks)
        # 每個專家是一個簡單的前饋網路 (Feed-forward Network)
        # 在實際應用中，每個專家可以是更複雜的子模塊，例如一個 Transformer Block 或 ResNet Block
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(input_size, expert_hidden_size),
                nn.ReLU(),
                nn.Linear(expert_hidden_size, input_size) # 輸出維度與輸入相同，方便殘差連接
            )
            for _ in range(num_experts)
        ])

        # 用於記錄負載平衡損失，以便在訓練時加入總損失
        self.routing_loss = 0.0

    def forward(self, x: torch.Tensor):
        batch_size, seq_len, _ = x.shape
        x_flat = x.view(-1, self.input_size) # 將 (batch_size, seq_len, input_size) 攤平為 (N, input_size)

        # 1. 門控網路計算每個專家的 logits
        gate_logits = self.gate(x_flat) # (N, num_experts)

        # 2. 選擇 Top-K 專家
        # top_k_logits: (N, top_k), 選擇的 Top-K 專家的 logits
        # top_k_indices: (N, top_k), 選擇的 Top-K 專家的索引
        top_k_logits, top_k_indices = torch.topk(gate_logits, self.top_k, dim=-1)

        # 將 Top-K logits 轉換為 softmax 權重
        # weights: (N, top_k)
        weights = F.softmax(top_k_logits, dim=-1, dtype=torch.float32)

        # 3. 負載平衡損失 (Auxiliary Loss)
        # 這個損失鼓勵門控網路均勻地分配輸入到不同的專家。
        # 它基於兩個因子：
        # - 專家被選擇的頻率 (importance_loss)
        # - 專家被路由的樣本數量 (load_loss)
        # 我們希望這兩個因子之間的乘積盡可能地均勻。

        # Convert indices to one-hot for scatter_add
        # expert_mask: (N, num_experts), 每個位置是 1 如果該專家被選中，否則為 0
        expert_mask = F.one_hot(top_k_indices, num_classes=self.num_experts).sum(dim=1).float()
        
        # gate_logits_normalized: (N, num_experts), 門控網路輸出經過 softmax 歸一化
        # 這裡的 softmax 為了計算專家重要性，是針對所有專家算的，而不是 Top-K 的 softmax
        gate_logits_normalized = F.softmax(gate_logits, dim=-1, dtype=torch.float32)
        
        # importance: (num_experts,), 每個專家被選擇的概率之和 (代表其重要性)
        # 即所有輸入對每個專家的加權和
        importance = gate_logits_normalized.sum(dim=0)
        
        # load: (num_experts,), 每個專家被路由到的實際樣本數量
        # 即 expert_mask 中每個專家被選擇的次數
        load = expert_mask.sum(dim=0)
        
        # 負載平衡損失：重要性 * 負載 (點積)，越接近均勻分佈，該損失越小
        # 通常會用 log(importance) 和 log(load) 的乘積，或者直接使用 variance
        # 這裡採用更常見的 dot product 方式
        
        # Normalization factors
        normalizer = (importance.sum() * load.sum())
        if normalizer == 0: # Avoid division by zero
            load_balancing_loss = 0.0
        else:
            load_balancing_loss = (importance * load).sum() / normalizer
            
        self.routing_loss = load_balancing_loss * self.load_balancing_loss_weight

        # 4. 路由並執行專家計算
        # output: (N, input_size), 最終的輸出，初始為全零
        output = torch.zeros_like(x_flat, device=x.device)

        # 將攤平的 Top-K 索引和權重轉為一維，以便於高效的張量操作
        # (N * top_k,)
        flat_top_k_indices = top_k_indices.view(-1)
        flat_weights = weights.view(-1)

        # 創建一個映射，將 (token_idx, expert_idx) 映射到 expert_idx 內部的 token 索引
        # 這一步通常是 MoE 實現中最複雜的部分，需要處理每個專家內部的批量處理
        # 這裡採用一個相對簡化的方法，遍歷專家，並通過 mask 來選擇數據
        
        # For efficiency, a more advanced MoE might use torch_scatter.scatter or similar ops.
        # But for clarity and basic understanding, iterating experts and masking is fine for now.

        # 遍歷每個專家
        for expert_idx in range(self.num_experts):
            # 找到所有路由到當前專家的 token/樣本的索引
            # current_expert_tokens_mask: (N, top_k), boolean mask
            current_expert_tokens_mask = (top_k_indices == expert_idx)
            
            # current_expert_token_flat_indices: (num_tokens_for_this_expert,), 這些是原始 x_flat 中的索引
            current_expert_token_flat_indices = torch.nonzero(current_expert_tokens_mask, as_tuple=True)[0]

            if current_expert_token_flat_indices.numel() > 0:
                # 獲取路由到當前專家的輸入
                expert_input = x_flat[current_expert_token_flat_indices]
                
                # 計算該專家對這些輸入的輸出
                expert_output = self.experts[expert_idx](expert_input)
                
                # 獲取對應的路由權重
                expert_weights = weights[current_expert_tokens_mask]
                
                # 將專家輸出加權後加到最終輸出中
                # output[current_expert_token_flat_indices] += expert_output * expert_weights.unsqueeze(-1)
                # Note: The above line is problematic if multiple experts contribute to the same token.
                # A more correct way involves `scatter_add` or manually summing contributions.
                # For simplicity here, we assume one expert contribution per token for Top-1,
                # or for Top-K, we combine contributions after all experts have computed.

                # Corrected logic for weighted sum for each token's contribution
                # This requires us to re-map the weights and outputs to the original flat_x indices.
                # Initialize an array to store expert results for the current expert
                weighted_expert_output_for_current_expert = expert_output * expert_weights.unsqueeze(-1)
                
                # Use scatter_add to accumulate results correctly for each token in the batch
                # Create empty tensor for contributions from this expert, same shape as x_flat
                expert_contribution_to_output = torch.zeros_like(x_flat, device=x.device)
                expert_contribution_to_output.index_add_(0, current_expert_token_flat_indices, weighted_expert_output_for_current_expert)
                output += expert_contribution_to_output

        # 將輸出恢復到原始形狀
        output = output.view(batch_size, seq_len, self.input_size)
        
        # 通常 MoE 層會與殘差連接結合，如 Transformer 中的 FFN
        return x + output # 殘差連接

    def get_routing_loss(self):
        return self.routing_loss

# --- 模擬生成器模型結構 ---
# 假設這是一個簡化的生成器，包含多個 MoE 層

class BlackHoleGenerator(nn.Module):
    def __init__(self, latent_dim: int, img_size: int, num_experts: int = 4, top_k: int = 2):
        super().__init__()
        self.latent_dim = latent_dim
        self.img_size = img_size

        # 初始轉換層
        self.fc_init = nn.Linear(latent_dim, 4 * 4 * 256)
        
        # Cifar-10 和 TCIR 知識融合的 MoE 層
        # 假設在某個分辨率的特徵層引入 MoE
        self.moe_layer1 = SparseMoELayer(
            input_size=256, # 假設這是特徵圖的 channel 數
            num_experts=num_experts,
            expert_hidden_size=512,
            top_k=top_k
        )
        
        # 考慮在更高層次或不同階段引入 MoE
        self.moe_layer2 = SparseMoELayer(
            input_size=128, # 假設是另一個分辨率的 channel 數
            num_experts=num_experts,
            expert_hidden_size=256,
            top_k=top_k
        )

        # 反卷積層 (或轉置卷積) 逐步上採樣
        self.deconv_blocks = nn.Sequential(
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1), # 4x4 -> 8x8
            nn.ReLU(),
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1),  # 8x8 -> 16x16
            nn.ReLU(),
            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1),   # 16x16 -> 32x32
            nn.ReLU(),
            nn.ConvTranspose2d(32, 3, kernel_size=4, stride=2, padding=1),    # 32x32 -> 64x64 (假設目標圖像尺寸為64x64)
            nn.Tanh() # 輸出圖像通常使用 Tanh 歸一化到 [-1, 1]
        )
        
        # 另一個 MoE 層，可以在deconv blocks之間插入
        # self.moe_layer_mid = SparseMoELayer(...)


    def forward(self, z: torch.Tensor, physics_params: torch.Tensor = None):
        """
        Args:
            z (torch.Tensor): 潛在空間向量，通常是隨機噪音。
            physics_params (torch.Tensor, optional): 黑洞物理觀測值，用於引導生成。
                                                     可以與 z concat 或作為條件輸入給門控網路。
        """
        # 將物理參數整合到潛在空間向量中
        if physics_params is not None:
            # 簡單的拼接，更複雜的可以通過 MLP 映射後再拼接
            # 或者將 physics_params 直接輸入給 MoE 的 gate network 作為額外判斷依據
            z = torch.cat([z, physics_params], dim=-1)
            # 需要調整 fc_init 的輸入維度
            # self.fc_init = nn.Linear(latent_dim + physics_params.shape[-1], ...)
            
        x = self.fc_init(z)
        x = x.view(-1, 256, 4, 4) # Reshape for convolutional layers

        # 將特徵圖攤平並傳入 MoE 層
        # MoE 層需要 (batch_size, seq_len, feature_dim) 的輸入
        # 對於圖像特徵圖，可以將 (C, H, W) 轉換為 (H*W, C)
        
        # 這裡的 x.permute(0, 2, 3, 1) 將 C 移到最後，然後 view(-1, 256)
        # 意味著每個像素點的特徵會被路由
        
        # 如果想讓整個 feature map (4x4) 作為一個整體被路由，需要調整輸入到 MoE 的方式
        # For simplicity, let's process each pixel location's feature as an independent "token"
        
        # First MoE layer
        # (batch_size, 256, 4, 4) -> (batch_size * 4 * 4, 256)
        num_pixels = x.shape[2] * x.shape[3]
        x_moe_in = x.permute(0, 2, 3, 1).reshape(-1, self.moe_layer1.input_size)
        
        moe1_out = self.moe_layer1(x_moe_in.unsqueeze(1)) # MoE expects (B, S, D), so we add S=1
        moe1_out = moe1_out.squeeze(1).view(x.shape[0], x.shape[1], x.shape[2], x.shape[3]) # Reshape back
        
        x = x + moe1_out # Residual connection after MoE layer

        # 上採樣
        x = self.deconv_blocks[0](x) # ConvTranspose2d(256, 128, ...)
        x = self.deconv_blocks[1](x) # ReLU

        # Second MoE layer
        # (batch_size, 128, 8, 8) -> (batch_size * 8 * 8, 128)
        num_pixels = x.shape[2] * x.shape[3]
        x_moe_in_2 = x.permute(0, 2, 3, 1).reshape(-1, self.moe_layer2.input_size)
        
        moe2_out = self.moe_layer2(x_moe_in_2.unsqueeze(1))
        moe2_out = moe2_out.squeeze(1).view(x.shape[0], x.shape[1], x.shape[2], x.shape[3])
        
        x = x + moe2_out

        # 繼續上採樣
        x = self.deconv_blocks[2:](x) # Remaining deconv blocks

        return x

# --- 訓練與PnP概念整合 ---

# 假設已經有 Cifar-10 和 TCIR 數據集的特徵提取器
# 例如，可以訓練兩個 VAE 或 GANs，然後提取它們的 Encoder 的中間層輸出作為特徵。

# PnP 策略：
# 1. 預訓練兩個模型 (或其特徵提取部分)：一個處理 Cifar-10，一個處理 TCIR。
#    這些模型不直接生成圖像，而是生成用於合成黑洞圖像的「風格」或「內容」特徵。
# 2. 設計一個新的生成器，它包含 MoE 層。
# 3. 訓練這個生成器時，輸入可以是來自 Cifar-10 的潛在向量、來自 TCIR 的潛在向量，以及黑洞物理觀測值。
#    - **Cifar-10 潛在向量**：當生成器接收到從 Cifar-10 數據中學到的潛在表示時，MoE 層的門控網路應該傾向於激活專門處理這種「通用圖像紋理」的專家。
#    - **TCIR 潛在向量**：當接收到從 TCIR 數據中學到的潛在表示時，門控網路應該激活專門處理「複雜結構和紋理」的專家。
#    - **黑洞物理觀測值**：這些觀測值（例如質量、自旋、視界半徑等）可以作為額外的條件輸入，影響 MoE 層的路由決策，或者與 MoE 層的輸出融合，以確保最終生成的圖像符合物理定律。

# 訓練步驟示意：
# criterion = nn.MSELoss() # 或其他適合圖像生成的損失，例如 perceptual loss, GAN loss

# optimizer = torch.optim.Adam(model.parameters(), lr=0.0001)

# for epoch in range(num_epochs):
#     for batch_idx, (cifar_features, tcir_features, physics_data) in enumerate(dataloader):
#         optimizer.zero_grad()
        
#         # 假設我們將 cifar_features 和 tcir_features 混合輸入
#         # 可以交替輸入，或者 batch 中同時包含兩種類型
#         # 這裡為了簡化，假設一個 batch 混合了兩種類型的潛在特徵
#         
#         # 將兩種特徵合併作為潛在輸入 (需要自行設計如何將兩者融合成 latent_dim)
#         # 這裡只是示意，實際可能需要更複雜的融合策略
#         combined_latent = torch.cat([cifar_features, tcir_features], dim=1) 
        
#         # 加上物理參數作為條件
#         # 將 physics_data 調整到合適的維度
#         generated_images = model(combined_latent, physics_params=physics_data)
        
#         # 計算生成圖像與目標圖像的損失 (需要定義目標圖像，這可能是難點)
#         # 如果是無監督生成，可能需要對抗損失 (GAN loss) 或基於物理一致性的損失
#         
#         # 如果是 GAN 框架，則需要 Discriminator 和 Generator 的交替訓練
#         # 例如：
#         # 1. 訓練 Discriminator
#         # D_loss = D(generated_images) + D(real_black_hole_images)
#         # D_loss.backward()
#         # D_optimizer.step()
        
#         # 2. 訓練 Generator
#         # G_loss = G(combined_latent, physics_data) + model.moe_layer1.get_routing_loss() + model.moe_layer2.get_routing_loss()
#         # G_loss.backward()
#         # G_optimizer.step()
        
#         # 別忘了將 MoE 的負載平衡損失加入總損失
#         total_loss = your_generation_loss + model.moe_layer1.get_routing_loss() + model.moe_layer2.get_routing_loss()
        
#         total_loss.backward()
#         optimizer.step()

```
**注意事項與進階思考**

* **物理觀測值的整合：** 如何將質量、自旋、視界半徑等物理參數有效融入模型至關重要。可以將它們作為額外的條件輸入到門控網路，讓門控網路根據物理參數來選擇專家；或者將它們編碼後與 MoE 層的輸出特徵拼接，再傳遞給後續的生成器層。
* **PnP 的實現細節：** PnP 不僅僅是把兩個模型的特徵送入 MoE。更進階的 PnP 可能意味著：
    * **凍結部分專家：** 可以預訓練一些專家來專門處理 Cifar-10 知識，另一些處理 TCIR 知識，然後在訓練生成黑洞圖像時，只微調門控網路和少量額外層，保持預訓練專家的參數不變。
    * **混合專家類型：** 某些專家可以是為通用圖像紋理訓練的，某些則是專門為結構信息訓練的。
* **計算資源：** 即使是稀疏 MoE，如果專家數量很多，模型的總參數量依然龐大，對 GPU 記憶體的要求仍然很高。請確保有足夠的計算資源。
* **擴展性：** 如果未來有更多類型的圖像數據需要融入，MoE 架構可以很方便地添加新的專家，而無需重新訓練整個模型。

這個任務的複雜度很高，建議分階段實施：

1.  先獨立訓練好 Cifar-10 和 TCIR 的特徵提取器（例如 VAE 的 Encoder 或自編碼器）。
2.  實現並調試 MoE 層，確保其負載平衡功能正常。
3.  將 MoE 層整合到一個簡化的圖像生成器中，並嘗試從隨機噪音生成圖像。
4.  逐步引入 Cifar-10 和 TCIR 的特徵，以及黑洞物理觀測值，並設計合適的損失函數來引導生成。

## Reference

- [LLM MOE的进化之路，从普通简化 MOE，到 sparse moe，再到 deepseek 使用的 share_expert sparse moe](https://yuanchaofa.com/llms-zero-to-hero/the-way-of-moe-model-evolution.html)
- [Mixture of experts 專家混合 - wikipedia](https://en.wikipedia.org/wiki/Mixture_of_experts)
- [Hierarchical Mixture of Experts: Generalizable Learning for High-Level Synthesis - arxiv](https://arxiv.org/abs/2410.19225)
- [Mixture of Experts - medium](https://medium.com/@yacinebouaouni07/mixture-of-experts-26243919d145)
- [[論文介紹] Sparse Upcycling](https://datasciocean.tech/paper-intro/sparse-upcycling/)
- [MoE 系列超详细解读 (一)：Soft MoE：一种完全可微的稀疏 Transformer](https://zhuanlan.zhihu.com/p/650894166)
- [深度学习之图像分类（二十八）-- Sparse-MLP(MoE)网络详解 - CSDN](https://blog.csdn.net/baidu_36913330/article/details/120826340)