---
title: "MoE PnP架構設計"
published: 2025-07-08T23:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-08T23:00:28+08:00
draft: false
description: ""
license: ""
tags: ["MoE", "router", "blackhole", "PnP", "Prior", "DDPM"]
category:  Research
image: ./index/compressed/V1.png
lang: zh-TW
---
## 一、前言

因為我目前的黑洞逆問題科研工作，主要的思想是想要將很多個Prior先驗（模型），目前我為了怎麼將 MoE 去整合先驗模型進行思考設計，但是也不確定是不是具體我們想要的結果，關於 V3 的設計是針對 MoE 的 Router 層進行微調訓練，需要很多個先驗模型才能知道效果。

這裡的原始項目是參考 [Inverse Bench](https://arxiv.org/abs/2503.11043) 論文開源的項目 [Github repo](https://github.com/devzhk/InverseBench)，進行改進。

## 二、原始的DPS實現代碼

### 2.1 代碼實現

DPS的算法偽代碼：

![dps_pnp_algo.png](https://imgpoi.com/i/8ID4H9.png)

`dps.py`：

```python
import torch
from tqdm import tqdm
from .base import Algo
from utils.scheduler import Scheduler
import numpy as np

class DPS(Algo):
    
    '''
    DPS algorithm implemented in EDM framework.
    '''
    
    def __init__(self, 
                 net,
                 forward_op,
                 diffusion_scheduler_config,
                 guidance_scale,
                 sde=True):
        super(DPS, self).__init__(net, forward_op)
        self.scale = guidance_scale
        self.diffusion_scheduler_config = diffusion_scheduler_config
        self.scheduler = Scheduler(**diffusion_scheduler_config)
        self.sde = sde
        
    def inference(self, observation, num_samples=1, **kwargs):
        device = self.forward_op.device
        if num_samples > 1:
            observation = observation.repeat(num_samples, 1, 1, 1)
        # 初始化 xN
        x_initial = torch.randn(num_samples, self.net.img_channels, self.net.img_resolution, self.net.img_resolution, device=device) * self.scheduler.sigma_max
        x_next = x_initial
        x_next.requires_grad = True

        pbar = tqdm(range(self.scheduler.num_steps))
        
        for i in pbar:
            x_cur = x_next.detach().requires_grad_(True)

            sigma, factor, scaling_factor = self.scheduler.sigma_steps[i], self.scheduler.factor_steps[i], self.scheduler.scaling_factor[i]
            
            # 網絡預測 sθ
            denoised = self.net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
            gradient, loss_scale = self.forward_op.gradient(denoised, observation, return_loss=True)

            ll_grad = torch.autograd.grad(denoised, x_cur, gradient)[0]
            ll_grad = ll_grad * 0.5 / torch.sqrt(loss_scale)

            # 計算 x̂0
            score = (denoised - x_cur / self.scheduler.scaling_steps[i]) / sigma ** 2 / self.scheduler.scaling_steps[i]
            pbar.set_description(f'Iteration {i + 1}/{self.scheduler.num_steps}. Data fitting loss: {torch.sqrt(loss_scale)}')
            
            if self.sde:
                # 採樣噪聲 z
                epsilon = torch.randn_like(x_cur)
                # 採樣 x′_{i-1}
                x_next = x_cur * scaling_factor + factor * score + np.sqrt(factor) * epsilon
            else:
                # 採樣 x′_{i-1}
                x_next = x_cur * scaling_factor + factor * score * 0.5
            # 梯度下降
            x_next -= ll_grad * self.scale
        # 返回 x̂0
        return x_next
```

### 2.2 實驗結果

分別用 Cifar10 和 TCIR（颱風） 數據集訓練出來的 Prior 先驗分別進行驗證：

cifar10: `'psnr': 9.191744312139141`

```bash
Final metric results: {'cp_chi2': 73.6760071182251, 'cp_chi2_std': 135.51811159539577, 'camp_chi2': 799.1351531076431, 'camp_chi2_std': 1740.545352802215, 'psnr': 9.191744312139141, 'psnr_std': 1.4698939952499275, 'blur_psnr (f=10)': 9.191744508743286, 'blur_psnr (f=10)_std': 1.4698940834610004, 'blur_psnr (f=15)': 10.603785195350646, 'blur_psnr (f=15)_std': 1.623055096434544, 'blur_psnr (f=20)': 11.29933590888977, 'blur_psnr (f=20)_std': 1.8209445867400313}...

```

tcir：`'psnr': 8.946716022116307`

```bash
Final metric results: {'cp_chi2': 52.93387850999832, 'cp_chi2_std': 120.19381272641012, 'camp_chi2': 302.9758258509636, 'camp_chi2_std': 1354.8764523472619, 'psnr': 8.946716022116307, 'psnr_std': 1.4229784549637379, 'blur_psnr (f=10)': 8.94671626329422, 'blur_psnr (f=10)_std': 1.4229785366944958, 'blur_psnr (f=15)': 10.188623633384704, 'blur_psnr (f=15)_std': 1.5537114323159416, 'blur_psnr (f=20)': 10.882783169746398, 'blur_psnr (f=20)_std': 1.6727785936316104}...
```

## 三、V1--加入 MoE 架構

### 3.1 流程架構圖

![V1.png](https://imgpoi.com/i/8ID0V5.png)

### 3.2 代碼實現

加入 MoE，並且有路由（沒有額外加入 Attention, LayerNom）

```python
# algo/dps.py (日誌功能內置於MoEPrior的最終版本)

import torch
import torch.nn as nn
import torch.nn.functional as F
from tqdm import tqdm
from .base import Algo
from utils.scheduler import Scheduler
import numpy as np

# ==============================================================================
# 1. MoE 核心組件 (修改點：日誌邏輯內置)
# ==============================================================================

class ExpertPrior(nn.Module):
    def __init__(self, pretrained_net):
        super().__init__()
        self.net = pretrained_net
        for param in self.net.parameters():
            param.requires_grad = False
        self.net.eval()

    def forward(self, x_t_scaled, sigma):
        return self.net(x_t_scaled, sigma)

class Router(nn.Module):
    def __init__(self, input_channels, num_experts, hidden_dim=256):
        super().__init__()
        self.feature_extractor = nn.Sequential(
            nn.Conv2d(input_channels, 32, kernel_size=5, stride=2, padding=2),
            nn.GELU(),
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.GELU(),
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
        )
        self.gate_mlp = nn.Sequential(
            nn.Linear(64 + 1, hidden_dim),
            nn.GELU(),
            nn.Linear(hidden_dim, num_experts)
        )

    def forward(self, x_t, sigma):
        img_features = self.feature_extractor(x_t)
        if sigma.dim() == 0:
            sigma_tensor = sigma.repeat(x_t.size(0))
        else:
            sigma_tensor = sigma
        
        sigma_features = (sigma_tensor.float() / 80.0).view(-1, 1)
        combined_features = torch.cat([img_features, sigma_features], dim=-1)
        logits = self.gate_mlp(combined_features)
        return logits

class MoEPrior(nn.Module):
    def __init__(self, expert_nets: list, top_k: int = 2, log_every_n_steps: int = 100):
        super().__init__()
        assert len(expert_nets) > 0, "專家列表不能為空"
        self.num_experts = len(expert_nets)
        
        self.img_channels = expert_nets[0].img_channels
        self.img_resolution = expert_nets[0].img_resolution
        
        self.experts = nn.ModuleList([ExpertPrior(net) for net in expert_nets])
        self.router = Router(input_channels=self.img_channels, num_experts=self.num_experts)
        self.top_k = min(top_k, self.num_experts)
        
        # --- 修改點 1: 添加內部計步器和日誌頻率 ---
        self.internal_step = 0
        self.log_every_n_steps = log_every_n_steps

    def forward(self, x_t_scaled, sigma):
        # --- 修改點 2: 在forward內部實現日誌打印 ---
        # 每次調用，計步器加一
        self.internal_step += 1
        
        router_logits = self.router(x_t_scaled, sigma)
        top_k_logits, top_k_indices = torch.topk(router_logits, self.top_k, dim=-1)
        gating_weights = F.softmax(top_k_logits, dim=-1)
        
        # 根據頻率決定是否打印日誌
        if self.internal_step % self.log_every_n_steps == 0:
            # 由於tqdm的存在，加一個換行符讓輸出更整潔
            print(f"\n[MoE Log @ Internal Step {self.internal_step}]: Activated experts -> {top_k_indices.tolist()}")

        final_denoised = torch.zeros_like(x_t_scaled)
        
        for i in range(x_t_scaled.size(0)):
            sample_final_output = torch.zeros_like(x_t_scaled[i])
            for k_idx in range(self.top_k):
                expert_index = top_k_indices[i, k_idx]
                weight = gating_weights[i, k_idx]
                
                chosen_expert = self.experts[expert_index]
                
                current_sigma = sigma[i] if sigma.dim() > 0 else sigma
                expert_output = chosen_expert(x_t_scaled[i].unsqueeze(0), current_sigma.unsqueeze(0) if current_sigma.dim() == 0 else current_sigma)
                sample_final_output += weight * expert_output.squeeze(0)
            
            final_denoised[i] = sample_final_output

        # --- 修改點 3: 保持原始的返回簽名 ---
        return final_denoised

# ==============================================================================
# 2. 您原始的 DPS 類 (保持不變)
# ==============================================================================

class DPS(Algo):
    # ... 此處代碼保持不變 ...
    def __init__(self, net, forward_op, diffusion_scheduler_config, guidance_scale, sde=True):
        super(DPS, self).__init__(net, forward_op)
        self.scale = guidance_scale
        self.diffusion_scheduler_config = diffusion_scheduler_config
        self.scheduler = Scheduler(**diffusion_scheduler_config)
        self.sde = sde
    def inference(self, observation, num_samples=1, **kwargs):
        device = self.forward_op.device
        if num_samples > 1:
            observation = observation.repeat(num_samples, 1, 1, 1)
        x_initial = torch.randn(num_samples, self.net.img_channels, self.net.img_resolution, self.net.img_resolution, device=device) * self.scheduler.sigma_max
        x_next = x_initial
        x_next.requires_grad = True
        pbar = tqdm(range(self.scheduler.num_steps))
        for i in pbar:
            x_cur = x_next.detach().requires_grad_(True)
            sigma, factor, scaling_factor = self.scheduler.sigma_steps[i], self.scheduler.factor_steps[i], self.scheduler.scaling_factor[i]
            denoised = self.net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
            gradient, loss_scale = self.forward_op.gradient(denoised, observation, return_loss=True)
            ll_grad = torch.autograd.grad(denoised, x_cur, gradient)[0]
            ll_grad = ll_grad * 0.5 / torch.sqrt(loss_scale)
            score = (denoised - x_cur / self.scheduler.scaling_steps[i]) / sigma ** 2 / self.scheduler.scaling_steps[i]
            pbar.set_description(f'Iteration {i + 1}/{self.scheduler.num_steps}. Data fitting loss: {torch.sqrt(loss_scale)}')
            if self.sde:
                epsilon = torch.randn_like(x_cur)
                x_next = x_cur * scaling_factor + factor * score + np.sqrt(factor) * epsilon
            else:
                x_next = x_cur * scaling_factor + factor * score * 0.5
            x_next -= ll_grad * self.scale
        return x_next

# ==============================================================================
# 3. 為 MoE 修改的新 DPS 類 (恢復簡潔)
# ==============================================================================

class DPS_MoE(Algo):
    def __init__(self, 
                 expert_nets, 
                 forward_op,
                 diffusion_scheduler_config,
                 guidance_scale,
                 sde=True,
                 moe_top_k=2,
                 log_every_n_steps=100): # 仍然可以從配置傳入日誌頻率
        
        super(DPS_MoE, self).__init__(expert_nets[0], forward_op) 
        device = self.forward_op.device
        
        # 將log_every_n_steps傳遞給MoEPrior
        self.moe_prior_net = MoEPrior(
            expert_nets=expert_nets, 
            top_k=moe_top_k, 
            log_every_n_steps=log_every_n_steps
        ).to(device)

        self.scale = guidance_scale
        self.diffusion_scheduler_config = diffusion_scheduler_config
        self.scheduler = Scheduler(**diffusion_scheduler_config)
        self.sde = sde

    def inference(self, observation, num_samples=1, **kwargs):
        device = self.forward_op.device
        if num_samples > 1:
            observation = observation.repeat(num_samples, 1, 1, 1)
        x_initial = torch.randn(num_samples, self.net.img_channels, self.net.img_resolution, self.net.img_resolution, device=device) * self.scheduler.sigma_max
        x_next = x_initial
        x_next.requires_grad = True
        pbar = tqdm(range(self.scheduler.num_steps))
        
        for i in pbar:
            x_cur = x_next.detach().requires_grad_(True)
            sigma, factor, scaling_factor = self.scheduler.sigma_steps[i], self.scheduler.factor_steps[i], self.scheduler.scaling_factor[i]
            
            # --- 修改點 4: 調用方式恢復原樣，日誌在內部處理 ---
            denoised = self.moe_prior_net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
            
            gradient, loss_scale = self.forward_op.gradient(denoised, observation, return_loss=True)
            ll_grad = torch.autograd.grad(denoised, x_cur, gradient)[0]
            ll_grad = ll_grad * 0.5 / torch.sqrt(loss_scale)
            score = (denoised - x_cur / self.scheduler.scaling_steps[i]) / sigma ** 2 / self.scheduler.scaling_steps[i]
            pbar.set_description(f'Iteration {i + 1}/{self.scheduler.num_steps}. Data fitting loss: {torch.sqrt(loss_scale)}')
            
            if self.sde:
                epsilon = torch.randn_like(x_cur)
                x_next = x_cur * scaling_factor + factor * score + np.sqrt(factor) * epsilon
            else:
                x_next = x_cur * scaling_factor + factor * score * 0.5
            
            x_next -= ll_grad * self.scale
        
        return x_next
```

### 3.3 實驗結果

目前 MoE 使用兩個 Prior （DPS、TCIR），Top-K是2，也就是兩個先驗模型都會用到。

結果：`'psnr': 9.097164859027906`

```bash
[2025-07-08 17:53:04,992][utils.helper][INFO] - Final metric results: {'cp_chi2': 65.43580444931985, 'cp_chi2_std': 139.26828480535823, 'camp_chi2': 472.58429634332657, 'camp_chi2_std': 1316.0285415933506, 'psnr': 9.097164859027906, 'psnr_std': 1.3572267099574475, 'blur_psnr (f=10)': 9.097165064811707, 'blur_psnr (f=10)_std': 1.3572268146419655, 'blur_psnr (f=15)': 10.42996124267578, 'blur_psnr (f=15)_std': 1.5274257912230074, 'blur_psnr (f=20)': 11.110666754245758, 'blur_psnr (f=20)_std': 1.7034609014416104}...
```

這結果明顯不如預期，應該是只是設計了 router，沒有額外在 Router 上加上一些層。

## 四、V2--MoE 的 Router 加上 Transformer Encoder

### 4.1 流程架構圖

![V2.png](https://imgpoi.com/i/8IDC8M.png)

### 4.2 代碼實現

路由加上 attention 和 LayerNorm 等：

```python
# algo/dps.py (集成Attention和LayerNorm到Router的最終版本)

import torch
import torch.nn as nn
import torch.nn.functional as F
from tqdm import tqdm
from .base import Algo
from utils.scheduler import Scheduler
import numpy as np

# ==============================================================================
# 1. MoE 核心組件 (ExpertPrior保持不變, Router被修改)
# ==============================================================================

class ExpertPrior(nn.Module):
    """
    一個簡單的包裝器，將預訓練好的先驗模型（如UNet）視為一個專家。
    """
    def __init__(self, pretrained_net):
        super().__init__()
        self.net = pretrained_net
        for param in self.net.parameters():
            param.requires_grad = False
        self.net.eval()

    def forward(self, x_t_scaled, sigma):
        return self.net(x_t_scaled, sigma)

# --- 修改開始: 增強版Router ---
class Router(nn.Module):
    """
    增強版路由器：使用一個小型的Transformer Encoder來增強決策能力。
    """
    def __init__(self, input_channels, num_experts, 
                 feature_dim=128, num_attn_heads=4, num_attn_layers=1):
        super().__init__()
        # 卷積層提取局部特徵，並降維
        # 假設輸入是 64x64, 經過兩次stride=2的卷積後，特徵圖大小變為 16x16
        self.feature_extractor = nn.Sequential(
            nn.Conv2d(input_channels, feature_dim // 2, kernel_size=3, stride=2, padding=1), # 64x64 -> 32x32
            nn.GELU(),
            nn.Conv2d(feature_dim // 2, feature_dim, kernel_size=3, stride=2, padding=1),    # 32x32 -> 16x16
        )
        
        # 16x16 = 256 個空間位置，即序列長度
        num_patches = 16 * 16
        
        # 為空間特徵序列添加可學習的位置編碼
        self.pos_embedding = nn.Parameter(torch.randn(1, num_patches, feature_dim))

        # 使用標準的 Transformer Encoder Layer，它內部已包含Multi-Head Attention和LayerNorm
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=feature_dim, 
            nhead=num_attn_heads, 
            dim_feedforward=feature_dim * 4, # FFN中間層的維度
            dropout=0.1, 
            activation='gelu',
            batch_first=True, # 確保輸入格式是 (Batch, Sequence, Feature)
            norm_first=True   # 使用Pre-LN結構，更穩定
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_attn_layers)
        
        # 最終的門控MLP
        # 輸入維度是 Transformer 處理後的特徵維度 + 1 (用於時間步 sigma)
        self.gate_mlp = nn.Sequential(
            nn.LayerNorm(feature_dim + 1), # 在MLP前也加一個LayerNorm
            nn.Linear(feature_dim + 1, feature_dim),
            nn.GELU(),
            nn.Linear(feature_dim, num_experts)
        )

    def forward(self, x_t, sigma):
        # 1. 提取空間特徵: (B, C, 64, 64) -> (B, D, 16, 16)
        features = self.feature_extractor(x_t)
        
        # 2. 為Transformer準備序列: (B, D, 16, 16) -> (B, 256, D)
        b, d, h, w = features.shape
        features_seq = features.flatten(2).permute(0, 2, 1)
        
        # 3. 添加位置編碼
        features_seq += self.pos_embedding
        
        # 4. 通過Transformer Encoder處理 (內部已包含Attention和LayerNorm)
        attended_features = self.transformer_encoder(features_seq)
        
        # 5. 使用平均池化得到全局表示
        global_feature = attended_features.mean(dim=1) # (B, D)
        
        # 6. 拼接時間並做出最終決策
        if sigma.dim() == 0:
            sigma_tensor = sigma.repeat(b)
        else:
            sigma_tensor = sigma
        
        sigma_features = (sigma_tensor.float() / 80.0).view(-1, 1) # 簡單標準化
        combined_features = torch.cat([global_feature, sigma_features], dim=-1)
        
        logits = self.gate_mlp(combined_features)
        return logits
# --- 修改結束 ---


class MoEPrior(nn.Module):
    def __init__(self, expert_nets: list, top_k: int = 2, log_every_n_steps: int = 100):
        super().__init__()
        assert len(expert_nets) > 0, "專家列表不能為空"
        self.num_experts = len(expert_nets)
        
        self.img_channels = expert_nets[0].img_channels
        self.img_resolution = expert_nets[0].img_resolution
        
        self.experts = nn.ModuleList([ExpertPrior(net) for net in expert_nets])
        
        # --- 修改點：實例化新的Router ---
        self.router = Router(
            input_channels=self.img_channels, 
            num_experts=self.num_experts,
            # 您可以在此處或通過配置文件調整路由器的超參數
            feature_dim=128, 
            num_attn_heads=4,
            num_attn_layers=2
        )
        self.top_k = min(top_k, self.num_experts)
        
        self.internal_step = 0
        self.log_every_n_steps = log_every_n_steps

    def forward(self, x_t_scaled, sigma):
        self.internal_step += 1
        router_logits = self.router(x_t_scaled, sigma)
        
        top_k_logits, top_k_indices = torch.topk(router_logits, self.top_k, dim=-1)
        gating_weights = F.softmax(top_k_logits, dim=-1)
        
        if self.internal_step % self.log_every_n_steps == 0:
            print(f"\n[MoE Log @ Internal Step {self.internal_step}]: Activated experts -> {top_k_indices.tolist()}")

        final_denoised = torch.zeros_like(x_t_scaled)
        
        for i in range(x_t_scaled.size(0)):
            sample_final_output = torch.zeros_like(x_t_scaled[i])
            for k_idx in range(self.top_k):
                expert_index = top_k_indices[i, k_idx]
                weight = gating_weights[i, k_idx]
                chosen_expert = self.experts[expert_index]
                current_sigma = sigma[i] if sigma.dim() > 0 else sigma
                expert_output = chosen_expert(x_t_scaled[i].unsqueeze(0), current_sigma.unsqueeze(0) if current_sigma.dim() == 0 else current_sigma)
                sample_final_output += weight * expert_output.squeeze(0)
            final_denoised[i] = sample_final_output

        return final_denoised


# ==============================================================================
# 其他類（DPS, DPS_MoE）保持不變，此處省略以保持簡潔
# ...
# 您的 DPS 和 DPS_MoE 類代碼放在這裡，無需任何修改
# ==============================================================================
class DPS(Algo):
    def __init__(self, net, forward_op, diffusion_scheduler_config, guidance_scale, sde=True):
        super(DPS, self).__init__(net, forward_op)
        self.scale = guidance_scale
        self.diffusion_scheduler_config = diffusion_scheduler_config
        self.scheduler = Scheduler(**diffusion_scheduler_config)
        self.sde = sde
    def inference(self, observation, num_samples=1, **kwargs):
        device = self.forward_op.device
        if num_samples > 1:
            observation = observation.repeat(num_samples, 1, 1, 1)
        x_initial = torch.randn(num_samples, self.net.img_channels, self.net.img_resolution, self.net.img_resolution, device=device) * self.scheduler.sigma_max
        x_next = x_initial
        x_next.requires_grad = True
        pbar = tqdm(range(self.scheduler.num_steps))
        for i in pbar:
            x_cur = x_next.detach().requires_grad_(True)
            sigma, factor, scaling_factor = self.scheduler.sigma_steps[i], self.scheduler.factor_steps[i], self.scheduler.scaling_factor[i]
            denoised = self.net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
            gradient, loss_scale = self.forward_op.gradient(denoised, observation, return_loss=True)
            ll_grad = torch.autograd.grad(denoised, x_cur, gradient)[0]
            ll_grad = ll_grad * 0.5 / torch.sqrt(loss_scale)
            score = (denoised - x_cur / self.scheduler.scaling_steps[i]) / sigma ** 2 / self.scheduler.scaling_steps[i]
            pbar.set_description(f'Iteration {i + 1}/{self.scheduler.num_steps}. Data fitting loss: {torch.sqrt(loss_scale)}')
            if self.sde:
                epsilon = torch.randn_like(x_cur)
                x_next = x_cur * scaling_factor + factor * score + np.sqrt(factor) * epsilon
            else:
                x_next = x_cur * scaling_factor + factor * score * 0.5
            x_next -= ll_grad * self.scale
        return x_next

class DPS_MoE(Algo):
    def __init__(self, 
                 expert_nets, 
                 forward_op,
                 diffusion_scheduler_config,
                 guidance_scale,
                 sde=True,
                 moe_top_k=2,
                 log_every_n_steps=100):
        super(DPS_MoE, self).__init__(expert_nets[0], forward_op) 
        device = self.forward_op.device
        self.moe_prior_net = MoEPrior(
            expert_nets=expert_nets, 
            top_k=moe_top_k, 
            log_every_n_steps=log_every_n_steps
        ).to(device)
        self.scale = guidance_scale
        self.diffusion_scheduler_config = diffusion_scheduler_config
        self.scheduler = Scheduler(**diffusion_scheduler_config)
        self.sde = sde

    def inference(self, observation, num_samples=1, **kwargs):
        device = self.forward_op.device
        if num_samples > 1:
            observation = observation.repeat(num_samples, 1, 1, 1)
        x_initial = torch.randn(num_samples, self.net.img_channels, self.net.img_resolution, self.net.img_resolution, device=device) * self.scheduler.sigma_max
        x_next = x_initial
        x_next.requires_grad = True
        pbar = tqdm(range(self.scheduler.num_steps))
        for i in pbar:
            x_cur = x_next.detach().requires_grad_(True)
            sigma, factor, scaling_factor = self.scheduler.sigma_steps[i], self.scheduler.factor_steps[i], self.scheduler.scaling_factor[i]
            denoised = self.moe_prior_net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
            gradient, loss_scale = self.forward_op.gradient(denoised, observation, return_loss=True)
            ll_grad = torch.autograd.grad(denoised, x_cur, gradient)[0]
            ll_grad = ll_grad * 0.5 / torch.sqrt(loss_scale)
            score = (denoised - x_cur / self.scheduler.scaling_steps[i]) / sigma ** 2 / self.scheduler.scaling_steps[i]
            pbar.set_description(f'Iteration {i + 1}/{self.scheduler.num_steps}. Data fitting loss: {torch.sqrt(loss_scale)}')
            if self.sde:
                epsilon = torch.randn_like(x_cur)
                x_next = x_cur * scaling_factor + factor * score + np.sqrt(factor) * epsilon
            else:
                x_next = x_cur * scaling_factor + factor * score * 0.5
            x_next -= ll_grad * self.scale
        return x_next
```

### 4.3 實驗結果

目前 MoE 使用兩個 Prior （DPS、TCIR），Top-K是2，也就是兩個先驗模型都會用到。

運行結果：`'psnr': 9.227320871705553`

```bash
[2025-07-09 01:47:47,485][utils.helper][INFO] - Final metric results: {'cp_chi2': 70.84749164938927, 'cp_chi2_std': 182.86828415721504, 'camp_chi2': 266.2178825187683, 'camp_chi2_std': 986.2303840604698, 'psnr': 9.227320871705553, 'psnr_std': 1.3129285786605203, 'blur_psnr (f=10)': 9.227321200370788, 'blur_psnr (f=10)_std': 1.312928712148772, 'blur_psnr (f=15)': 10.530946354866028, 'blur_psnr (f=15)_std': 1.4752522557387036, 'blur_psnr (f=20)': 11.241626224517823, 'blur_psnr (f=20)_std': 1.6327269666531752}...
```

猜想這個transformer encoder layer可能是有用的，結果指標提升了，但是因為還是隨機參數，因此可信度有待商榷

### 4.4 代碼問題

MoE+DPS 代碼的改進建議和注意點，主要從**功能正確性**、**訓練／推理效率**和**可維護性**三個角度來展開。

#### 4.4.1 功能正確性和數值穩定性

1. **Router 輸出的 Logits 與 Softmax**
   - 你先用 `torch.topk(router_logits)` 然後對 `top_k_logits` 做 softmax，這樣相當於在截斷後的子空間裡歸一化，理論上沒問題。但要確保在極端情況下不會出現所有選中 logits 都是非常小的負數，從而導致 softmax 溢出／下溢。
   - **小貼士**：在 `F.softmax(top_k_logits, dim=-1)` 前，可以減去 `top_k_logits.max(dim=-1, keepdim=True)[0]` 進一步穩定數值。
2. **sigma 標準化**
   - 你把 sigma 除以 80 固定標準化，這個常數是否適用於你整個噪聲 schedule？如果 schedule 的最大 sigma 不是 80，那這裡最好動態使用 `scheduler.sigma_max`。
   - 並且注意當 `sigma` 為標量時 `sigma.dim()==0` 分支裡，`current_sigma.unsqueeze(0)` 會報錯——你可以統一先把 `sigma` 處理成 `(B,)` 維度，再進來。
3. **梯度 Flow 的控制**
   - 由於專家網絡被 `eval()` 且 `requires_grad=False`，你在後驗階段不會更新它們。這符合你“先驗凍結”的設計，但注意此時 router 也只接收來自 MoEPrior→forward 的梯度信號。
   - 如果想讓 router 更好地適配後驗（DPS）裡 data consistency 的反饋，可以考慮在 DPS_MoE 的訓練或微調階段，同樣讓 router 參與梯度更新。

#### 4.4.2 推理效率和矢量化

當前 `MoEPrior.forward` 裡你對每個樣本又對每個 Top‑K 專家做 Python 循環，這在 batch 較大時會拖慢推理速度。可以考慮：

```python
# 假設 x_t_scaled: (B, C, H, W)
# top_k_indices: (B, K)
# gating_weights: (B, K)
# experts 輸出 shape 都是 (B, C, H, W)

# 1. 事先對所有 K 個 expert 分別並行推理，得到一個 tensor of shape (K, B, C, H, W)
expert_outputs = []
for expert in selected_experts:  # selected_experts 長度=K
    expert_outputs.append(expert(x_t_scaled, sigma))
# expert_outputs -> list of (B,C,H,W)
stacked = torch.stack(expert_outputs, dim=1)  # (B, K, C, H, W)

# 2. gating_weights: (B, K)  -> (B, K, 1, 1, 1)
weights = gating_weights.view(B, K, 1, 1, 1)

# 3. 加權求和
final = (stacked * weights).sum(dim=1)  # (B, C, H, W)
```

- 這樣可以**避免雙重 Python 循環**，大幅度提升 GPU 並行效率。
- 如果選中的專家對所有 batch 都一樣（即 `top_k_indices` 同一行內都是常量），還能進一步優化；即先 gather 一次 `.index_select(dim=0)`。

#### 4.4.3 Router 模塊的微調

1. **位置編碼**
   - 你用的是可學習的位置編碼 `self.pos_embedding`，它的維度是 `(1,256,feature_dim)`。如果你的圖像分辨率、patch 數發生變化（比如 128×128 → 32×32 → 1024 patches），就要同步改代碼或做插值。
   - **更通用**的做法是用正餘弦位置編碼，或者在 `forward` 時根據當前特徵圖大小動態插值 `pos_embedding`。
2. **Feature Extractor**
   - 你現在只下采兩次，16×16 輸出對 64×64 來說還好，但如果分辨率更大，開更多層或 AMP（混合精度）可能更穩。
   - 也可以把 `feature_extractor` 裡的 Conv→GELU→Conv 換成一個小型 ResBlock，增強表達而不會顯著增加參數。

#### 4.4.4 訓練與日誌

1. **Load‑Balancing Loss**
   - 如前面建議，可以給 router 加一個 auxiliary loss，讓它在整個 batch 裡盡量平均分配給各專家。

   ```python
   importance = router_logits.softmax(dim=-1).mean(dim=0)        # (num_experts,)
   load       = (router_logits.argmax(dim=-1) == torch.arange(num_experts).view(1,-1)).float().mean(dim=0)
   balance_loss = torch.sum(importance * load) * coeff
   total_loss = main_loss + balance_loss
   ```

2. **Log 頻率與可視化**

   - 除了 `print`，你可以在 TensorBoard／Weights & Biases 上畫一張“專家激活頻率”柱狀圖，一圖掌握路由行為。

------

#### 4.4.5 小結

- **功能上**，架構已經很清晰：Router → Top‑K → ExpertPrior → 加權 → DPS Data Consistency。
- **性能上**，重點在於矢量化 expert 調用，以及避免循環裡的張量拷貝。
- **可維護性上**，Router 的位置編碼和 feature extractor 可以做成更通用的模塊，以便不同分辨率和任務復用。

## 五、V3--加入 Router 微調

### 5.1 流程架構圖

<!-- 图片无法顺利上传到图床 -->

![V3.png](https://imgpoi.com/i/8IPLVE.png)


此流程圖中，將整個過程分成兩個階段：Router 微調程和推理過程，兩個過程都會經過完整的 DPS_MoE 算法，但是不同的是 Router 會利用 MoE 模塊生成的 loss 產物進行 backward 糾正，進而訓練出 Router 模型；推理過程則不進行 backward 過程。

### 5.2 代碼實現

進一步改進 `dps_moe.py`：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from tqdm import tqdm
from .base import Algo
from utils.scheduler import Scheduler
import numpy as np

# ==============================================================================
# 1. MoE 核心組件 (全面升級)
# ==============================================================================

class ExpertPrior(nn.Module):
    def __init__(self, pretrained_net):
        super().__init__()
        self.net = pretrained_net
        for param in self.net.parameters():
            param.requires_grad = False
        self.net.eval()

    def forward(self, x_t_scaled, sigma):
        return self.net(x_t_scaled, sigma)

# 新增：一個簡單的殘差塊，用於增強特徵提取器
class ResBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.norm1 = nn.GroupNorm(8, channels) # GroupNorm對batch size不敏感
        self.conv2 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.norm2 = nn.GroupNorm(8, channels)

    def forward(self, x):
        h = F.gelu(self.norm1(self.conv1(x)))
        h = self.norm2(self.conv2(h))
        return F.gelu(x + h)

class Router(nn.Module):
    def __init__(self, input_channels, num_experts, 
                 feature_dim=128, num_attn_heads=4, num_attn_layers=2,
                 sigma_max=80.0): # 新增sigma_max用於標準化
        super().__init__()
        self.sigma_max = sigma_max
        self.feature_dim = feature_dim

        # 增強的Feature Extractor，使用ResBlock
        self.feature_extractor = nn.Sequential(
            nn.Conv2d(input_channels, feature_dim // 2, kernel_size=3, stride=2, padding=1),
            ResBlock(feature_dim // 2),
            nn.Conv2d(feature_dim // 2, feature_dim, kernel_size=3, stride=2, padding=1),
            ResBlock(feature_dim),
        )
        
        self.pos_embedding = nn.Parameter(torch.randn(1, 16 * 16, feature_dim)) # 假設默認16x16

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=feature_dim, nhead=num_attn_heads, dim_feedforward=feature_dim * 4, 
            dropout=0.1, activation='gelu', batch_first=True, norm_first=True
        )
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_attn_layers)
        
        self.gate_mlp = nn.Sequential(
            nn.LayerNorm(feature_dim + 1),
            nn.Linear(feature_dim + 1, feature_dim),
            nn.GELU(),
            nn.Linear(feature_dim, num_experts)
        )

    def forward(self, x_t, sigma):
        features = self.feature_extractor(x_t)
        b, d, h, w = features.shape
        features_seq = features.flatten(2).permute(0, 2, 1)
        
        # 動態插值位置編碼，以適應不同分辨率
        if features_seq.shape[1] != self.pos_embedding.shape[1]:
            pos_embedding_resized = F.interpolate(
                self.pos_embedding.permute(0, 2, 1).view(1, d, 16, 16), # 假設原始是16x16
                size=(h, w), mode='bilinear', align_corners=False
            )
            pos_embedding_resized = pos_embedding_resized.flatten(2).permute(0, 2, 1)
            features_seq += pos_embedding_resized
        else:
            features_seq += self.pos_embedding
        
        attended_features = self.transformer_encoder(features_seq)
        global_feature = attended_features.mean(dim=1)
        
        # 統一處理sigma維度
        if sigma.dim() == 0:
            sigma_tensor = sigma.repeat(b)
        else:
            sigma_tensor = sigma
        
        # 使用動態的sigma_max進行標準化
        sigma_features = (sigma_tensor.float() / self.sigma_max).view(-1, 1)
        combined_features = torch.cat([global_feature, sigma_features], dim=-1)
        
        logits = self.gate_mlp(combined_features)
        return logits

class MoEPrior(nn.Module):
    def __init__(self, expert_nets: list, scheduler, top_k: int = 2, 
                 log_every_n_steps: int = 100, aux_loss_weight: float = 1e-2):
        super().__init__()
        # ... 初始化代碼 ...
        self.num_experts = len(expert_nets)
        self.img_channels = expert_nets[0].img_channels
        self.experts = nn.ModuleList([ExpertPrior(net) for net in expert_nets])
        self.router = Router(input_channels=self.img_channels, num_experts=self.num_experts, sigma_max=scheduler.sigma_max)
        self.top_k = min(top_k, self.num_experts)
        self.aux_loss_weight = aux_loss_weight
        self.internal_step = 0
        self.log_every_n_steps = log_every_n_steps

    def _calculate_aux_loss(self, router_logits):
        # 實現負載平衡損失
        router_probs = F.softmax(router_logits, dim=-1)
        # f_i: 每個專家處理的token比例的期望值 (這裡用概率近似)
        f_i = router_probs.mean(dim=0)
        # P_i: 路由器分配給每個專家的總概率質量
        P_i = router_probs.sum(dim=0) / len(router_logits)
        
        # 論文中的 loss = alpha * N * sum(f_i * P_i)
        loss = self.num_experts * torch.sum(f_i * P_i)
        return loss * self.aux_loss_weight

    def forward(self, x_t_scaled, sigma):
        self.internal_step += 1
        router_logits = self.router(x_t_scaled, sigma)
        
        aux_loss = self._calculate_aux_loss(router_logits) # 計算輔助損失
        
        # 數值穩定的Softmax
        top_k_logits, top_k_indices = torch.topk(router_logits, self.top_k, dim=-1)
        stable_logits = top_k_logits - top_k_logits.max(dim=-1, keepdim=True).values
        gating_weights = F.softmax(stable_logits, dim=-1)
        
        # ... 後續的向量化前向傳播代碼不變 ...
        if self.internal_step % self.log_every_n_steps == 0:
            print(f"\n[MoE Log @ Internal Step {self.internal_step}]: Activated experts -> {top_k_indices.tolist()}")

        final_denoised = torch.zeros_like(x_t_scaled)
        flat_expert_indices = top_k_indices.flatten()
        
        for i in range(self.num_experts):
            mask = (flat_expert_indices == i)
            if not mask.any():
                continue
            
            masked_indices = mask.nonzero(as_tuple=True)[0]
            original_batch_indices = masked_indices // self.top_k
            expert_inputs = x_t_scaled[original_batch_indices]

            if sigma.dim() > 0:
                expert_sigma = sigma[original_batch_indices]
            else:
                expert_sigma = sigma

            expert_output = self.experts[i](expert_inputs, expert_sigma)
            
            expert_weights = gating_weights.flatten()[masked_indices]
            weighted_output = expert_output * expert_weights.view(-1, 1, 1, 1)
            
            final_denoised.index_add_(0, original_batch_indices, weighted_output)

        return final_denoised, aux_loss # 返回預測結果和輔助損失

# ==============================================================================
# 修改 DPS_MoE 以處理輔助損失
# ==============================================================================
class DPS_MoE(Algo):
    def __init__(self, expert_nets, forward_op, diffusion_scheduler_config, guidance_scale, sde=True, moe_top_k=2, log_every_n_steps=100, aux_loss_weight=1e-2):
        super(DPS_MoE, self).__init__(expert_nets[0], forward_op) 
        device = self.forward_op.device
        self.scheduler = Scheduler(**diffusion_scheduler_config) # 先實例化scheduler
        self.moe_prior_net = MoEPrior(
            expert_nets=expert_nets, 
            scheduler=self.scheduler, # 傳入scheduler
            top_k=moe_top_k, 
            log_every_n_steps=log_every_n_steps,
            aux_loss_weight=aux_loss_weight # 傳入輔助損失權重
        ).to(device)
        self.scale = guidance_scale
        self.sde = sde

    def inference(self, observation, num_samples=1, **kwargs):
        # 推理時，我們通常不關心輔助損失，所以可以忽略它
        # ...
        # 修改點：只取denoised結果
        denoised, _ = self.moe_prior_net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
        # ...
        # (完整的inference代碼省略，因為它的邏輯不變，只是接收返回值的方式變了)
        device = self.forward_op.device
        if num_samples > 1:
            observation = observation.repeat(num_samples, 1, 1, 1)
        x_initial = torch.randn(num_samples, self.net.img_channels, self.net.img_resolution, self.net.img_resolution, device=device) * self.scheduler.sigma_max
        x_next = x_initial
        x_next.requires_grad = True
        pbar = tqdm(range(self.scheduler.num_steps))
        for i in pbar:
            x_cur = x_next.detach().requires_grad_(True)
            sigma, factor, scaling_factor = self.scheduler.sigma_steps[i], self.scheduler.factor_steps[i], self.scheduler.scaling_factor[i]
            denoised, _ = self.moe_prior_net(x_cur / self.scheduler.scaling_steps[i], torch.as_tensor(sigma).to(x_cur.device))
            gradient, loss_scale = self.forward_op.gradient(denoised, observation, return_loss=True)
            ll_grad = torch.autograd.grad(denoised, x_cur, gradient)[0]
            ll_grad = ll_grad * 0.5 / torch.sqrt(loss_scale)
            score = (denoised - x_cur / self.scheduler.scaling_steps[i]) / sigma ** 2 / self.scheduler.scaling_steps[i]
            pbar.set_description(f'Iteration {i + 1}/{self.scheduler.num_steps}. Data fitting loss: {torch.sqrt(loss_scale)}')
            if self.sde:
                epsilon = torch.randn_like(x_cur)
                x_next = x_cur * scaling_factor + factor * score + np.sqrt(factor) * epsilon
            else:
                x_next = x_cur * scaling_factor + factor * score * 0.5
            x_next -= ll_grad * self.scale
        return x_next
```

`dps_moe_main.py`：

```python
# dps_moe_main.py (最終整合版)

import os
from omegaconf import OmegaConf, ListConfig
import pickle
import hydra
from hydra.utils import instantiate

import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader
import wandb

from utils.helper import open_url, create_logger
# 確保您的MoE算法類在這個路徑下
from algo.dps import DPS_MoE 

@hydra.main(version_base="1.3", config_path="configs", config_name="config")
def main(config):
    # =================================================================================
    # 1. 初始化環境和配置
    # =================================================================================
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    if config.tf32:
        torch.set_float32_matmul_precision("high")
    torch.manual_seed(config.seed)

    # 根據模式（訓練或推理）設置實驗目錄
    mode = 'train_router' if config.get('train_router', False) else 'inference'
    exp_dir = os.path.join(config.problem.exp_dir, config.algorithm.name, f"{config.exp_name}_{mode}")
    os.makedirs(exp_dir, exist_ok=True)
    
    logger = create_logger(exp_dir)
    OmegaConf.save(config, os.path.join(exp_dir, 'config.yaml'))
    
    if config.wandb:
        wandb.init(project=config.problem.name, group=config.algorithm.name, 
                   config=OmegaConf.to_container(config), name=f"{config.exp_name}_{mode}",
                   reinit=True, settings=wandb.Settings(start_method="fork"))
        config = OmegaConf.create(dict(wandb.config))

    # =================================================================================
    # 2. 數據加載和前向模型
    # =================================================================================
    forward_op = instantiate(config.problem.model, device=device)

    # =================================================================================
    # 3. 加載多個專家先驗模型
    # =================================================================================
    logger.info("--- Loading Expert Priors ---")
    if 'expert_priors' not in config.problem or not isinstance(config.g`et('problem.expert_priors'), ListConfig):
        raise ValueError("Configuration error: `config.problem.expert_priors` must be a list in your problem config.")

    expert_nets = []
    logger.info(f"Loading {len(config.problem.expert_priors)} expert models...")
    for ckpt_path in config.problem.expert_priors:
        logger.info(f"  Loading expert from {ckpt_path}...")
        # 這裡我們實例化一個基礎網絡結構，然後加載權重
        # 請確保 config.pretrain.model 能正確實例化您的專家模型架構
        net = instantiate(config.pretrain.model) 
        ckpt = torch.load(ckpt_path, map_location=device)
        
        # 根據您的checkpoint格式加載權重
        if 'ema' in ckpt:
            net.load_state_dict(ckpt['ema'])
        elif 'net' in ckpt:
            net.load_state_dict(ckpt['net'])
        else:
            net.load_state_dict(ckpt)
        
        net = net.to(device)
        net.eval()
        expert_nets.append(net)
        logger.info(f"  Successfully loaded expert.")
    del ckpt
    logger.info("All expert models loaded.")
    
    # =================================================================================
    # 4. 實例化MoE算法
    # =================================================================================
    logger.info("--- Instantiating MoE Algorithm ---")
    algo = instantiate(config.algorithm.method, 
                       forward_op=forward_op, 
                       expert_nets=expert_nets)
    logger.info(f"Algorithm '{config.algorithm.name}' instantiated successfully.")

    # =================================================================================
    # 5. 根據模式執行不同任務 (訓練或推理)
    # =================================================================================
    
    # ------------------ 訓練路由器模式 ------------------
    if config.get('train_router', False):
        logger.info("--- Starting Router Training ---")
        
        # 準備訓練數據集
        trainset = instantiate(config.problem.data, train=True) # 假設您的Dataset類支持train=True模式
        trainloader = DataLoader(trainset, batch_size=config.train.batch_size, shuffle=True)
        
        # 設置只訓練路由器參數的優化器
        optimizer = torch.optim.Adam(algo.moe_prior_net.router.parameters(), lr=config.train.lr)
        
        # 簡單的訓練循環框架
        for epoch in range(config.train.epochs):
            pbar = tqdm(trainloader)
            for i, data in enumerate(pbar):
                # 準備數據
                if isinstance(data, dict):
                    x_gt = data['target'].to(device)
                else:
                    x_gt = data.to(device)
                
                observation = forward_op(x_gt)
                
                # 執行一次完整的反向過程來得到重建結果
                # 注意：訓練時的num_samples應為1
                recon, aux_loss = algo.inference_for_training(observation) # 假設我們修改了inference來返回aux_loss
                
                # 計算損失
                reconstruction_loss = F.mse_loss(recon, x_gt)
                total_loss = reconstruction_loss + aux_loss
                
                # 更新路由器
                optimizer.zero_grad()
                total_loss.backward()
                optimizer.step()
                
                pbar.set_description(f"Epoch {epoch+1}, Loss: {total_loss.item():.4f}, Recon Loss: {reconstruction_loss.item():.4f}, Aux Loss: {aux_loss.item():.4f}")
            
            # 每個epoch後保存一次路由器的權重
            router_save_path = os.path.join(exp_dir, f'router_epoch_{epoch+1}.pt')
            torch.save(algo.moe_prior_net.router.state_dict(), router_save_path)
            logger.info(f"Saved trained router to {router_save_path}")

    # ------------------ 推理模式 ------------------
    elif config.get('inference', True):
        logger.info("--- Starting Inference ---")
        
        # 加載訓練好的路由器權重 (如果提供)
        if config.get('router_ckpt_path', None):
            logger.info(f"Loading trained router from {config.router_ckpt_path}...")
            algo.moe_prior_net.router.load_state_dict(torch.load(config.router_ckpt_path, map_location=device))

        testset = instantiate(config.problem.data)
        testloader = DataLoader(testset, batch_size=1, shuffle=False)
        evaluator = instantiate(config.problem.evaluator, forward_op=forward_op)
        
        for i, data in enumerate(testloader):
            # ... (此處的推理和評估邏輯與您原始代碼一致) ...
            if isinstance(data, torch.Tensor):
                data = data.to(device)
            elif isinstance(data, dict):
                assert 'target' in data.keys(), "'target' must be in the data dict"
                for key, val in data.items():
                    if isinstance(val, torch.Tensor):
                        data[key] = val.to(device)
            data_id = testset.id_list[i]
            save_path = os.path.join(exp_dir, f'result_{data_id}.pt')

            observation = forward_op(data)
            target = data['target']

            logger.info(f'Running inference on test sample {data_id}...')
            recon = algo.inference(observation, num_samples=config.num_samples)
            
            result_dict = {
                'observation': observation,
                'recon': forward_op.unnormalize(recon).cpu(),
                'target': forward_op.unnormalize(target).cpu(),
            }
            torch.save(result_dict, save_path)

            metric_dict = evaluator(pred=result_dict['recon'], target=result_dict['target'], observation=result_dict['observation'])
            logger.info(f"Metric results for sample {data_id}: {metric_dict}...")

        logger.info("Evaluation completed...")
        metric_state = evaluator.compute()
        logger.info(f"Final aggregated metric results: {metric_state}...")
        if config.wandb:
            wandb.log(metric_state)
            wandb.finish()

if __name__ == "__main__":
    main()
```

`config.yaml`：

```yaml
# configs/config.yaml

# `defaults`列表定義了默認加載的配置組。
# 命令行參數可以輕鬆覆蓋這些默認值。
# 例如，運行時使用 `problem=dps_moe_blackhole` 將會替換掉下面的 `problem: blackhole`。
defaults:
  - _self_
  - algorithm: dps_moe      # 默認使用基礎的dps算法配置
  - problem: dps_moe_blackhole  # 默認使用基礎的blackhole問題配置
  - pretrain: blackhole # 加載預訓練相關的配置

# --- 模式控制 ---
# 設為True以進入訓練路由器模式，False或不設置則為推理模式
finetune_router: True
inference: False

# --- 訓練路由器所需的超參數 ---
train:
  batch_size: 1
  lr: 1e-4
  epochs: 50

# --- 推理時加載已訓練好的路由器權重 ---
# 示例: "exps/inference/dps_moe_blackhole/your_exp_name_train_router/router_epoch_50.pt"
router_ckpt_path: exps/inference/dps_moe_blackhole/your_exp_name_train_router/router_epoch_50.pt

# --- 其他全局配置 ---
tf32: True
num_samples: 1
compile: False
seed: 0
wandb: False
exp_name: default
```

`problem/dps_moe_blackhole.yaml`：

```yaml
name: blackhole

# --- 修改開始 ---

# 將單一的 'prior' 鍵註釋掉或刪除
# prior: checkpoints/blackhole-50k.pt

# 添加一個新的 'expert_priors' 列表
# 您需要將這裡的路徑替換成您真實的、作為專家的多個預訓練模型 checkpoint 路徑
expert_priors:
  - checkpoints/cifar10_100k.pt  # 示例：可能是針對特定物理結構的先驗
  - checkpoints/tcir_100k.pt  # 示例：可能是針對另一種觀測數據特性的先驗
# - checkpoints/prior_model_C.pt  # 示例：一個通用的、魯棒性強的先驗
# ... 您可以根據需要添加更多專家

# --- 修改結束 ---


model:
  _target_: inverse_problems.blackhole.BlackHoleImaging
  # ... 其他配置保持不變 ...
  root: /home/chy/hbx/blackhole/measure
  imsize: 64
  observation_time_ratio: 1.0
  noise_type: 'eht'
  w1: 0
  w2: 1
  w3: 1
  w4: 0.5
  sigma_noise: 0.0
  unnorm_scale: 0.5
  unnorm_shift: 1.0

data:
  _target_: training.dataset.BlackHole
  # ... 其他配置保持不變 ...
  root: /home/chy/hbx/blackhole/test
  resolution: 64
  original_resolution: 64
  random_flip: False
  zoom_in_out: False
  id_list: 0-99

evaluator:
  _target_: eval.BlackHoleEvaluator

exp_dir: exps/inference/dps_moe_blackhole
```

`algorithm/dps_moe.yaml`：

```yaml
# configs/algorithm/dps_moe.yaml

name: DPS_MoE

method:
  # _target_ 指向我們最終版的、整合了所有功能的DPS_MoE類
  _target_: algo.dps_moe.DPS_MoE 

  # 擴散過程的相關配置 (保持不變)
  diffusion_scheduler_config:
    num_steps: 1000
    schedule: 'vp'
    timestep: 'vp'
    scaling: 'vp'
    
  # 數據一致性項的指導強度 (保持不變)
  guidance_scale: 10.0
  
  # 是否使用隨機微分方程 (保持不變)
  sde: True

  # --- MoE 相關的超參數 ---
  # 每次選擇K個專家
  moe_top_k: 2
  
  # 在推理/訓練循環中，每隔多少步打印一次專家選擇日誌
  log_every_n_steps: 100
  
  # 負載平衡輔助損失的權重係數 (alpha)
  # 這是一個非常重要的超參數，用於平衡重建任務和專家負載均衡任務
  # 1e-2 是一個常見且合理的初始值
  aux_loss_weight: 0.01
```

### 5.3 實驗結果

> 因為目前還沒有更多的 Prior 訓練出來，這裡待更新


## 六、結語

決定使用 MoE 去整合先驗模型，是因為我們目前研究進度卡在怎麼將很多先驗融合在一起，而不是單純的模型計算乘以權重相加，然後得到去噪聲參數。但是使用 MoE 的話又有一些問題，按照師兄的說法，我們的研究不考慮參數量過大等的計算效率還有稀疏性，只考慮正確率，我設計的 MoE Top-K 稀疏性不是我們想要的，師兄認為所有的先驗都有用，但是要怎麼取每個先驗的特長也不是很清楚，無法具體化到每個模型龐大的部分參數。所以即使換到使用集成學習（ensemble learing）也可能無法達到我們想要的架構。

所以這部分還是需要師兄去思考怎麼不去用 MoE，去設計MLP層。但既然我都已經設計出來了，並且有時實際代碼落地，每個架構流程合理性非常足，不測試一下就可惜了。
