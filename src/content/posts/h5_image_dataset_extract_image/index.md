---
title: "將 h5 格式的圖片 Dataset 解壓出圖片腳本"
published: 2025-07-01T22:00:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2025-07-01T22:00:28+08:00
draft: false
description: ""
license: ""
tags: ["dataset", "h5", "image", "extract"]
category:  Python
image: ./index/compressed/TCIR_dataset.png
lang: zh-TW
---


## 一、前言
因爲之前在處理收集數據集的時候有碰到 `.h5` 格式的文件，一時不知道怎麽解壓出來，最後一開始自己寫的是錯誤的，導致圖片在訓練過程中有問題，後面改用 Gemini 生成的 PY 腳本就好了。特此記錄。

## 二、解壓腳本

> [!TIP]
> 
> 需要注意調整分辨率、目錄路徑，會批量將一個目錄下的所有 `h5` 文件解壓出圖片，並且過濾黑色色素占用 99% 以上的圖片。

```py
import os
import h5py # 用於讀取 .h5 文件
import numpy as np
from PIL import Image # 用於圖像處理和保存
from tqdm import tqdm # 用於顯示進度條
import glob # 用於查找文件

def export_images_from_h5(h5_dir, output_png_dir, target_resolution=(64, 64), 
                          black_pixel_threshold_percentage=99.0): # 新增參數：黑色像素閾值
    """
    從指定目錄下的所有 .h5 文件中提取圖像數據，將其轉換為單通道灰度，
    調整尺寸為目標分辨率，然後保存為 PNG 圖片到一個共同的輸出目錄。
    同時會篩選掉黑色面積佔圖片達 99% 或以上的圖片。

    Args:
        h5_dir (str): 包含 .h5 文件的目錄路徑。
        output_png_dir (str): 圖片導出後保存的目錄路徑。
        target_resolution (tuple): 目標圖片分辨率，格式為 (寬度, 高度)，例如 (64, 64)。
        black_pixel_threshold_percentage (float): 圖片中黑色像素佔比達到或超過此值時，圖片將被跳過。
                                                    值範圍為 0 到 100。
    """
    print(f"--- 開始從 .h5 文件導出圖片 ---")
    print(f"源 .h5 文件目錄: {h5_dir}")
    print(f"圖片導出目錄: {output_png_dir}")
    print(f"目標圖片分辨率: {target_resolution[0]}x{target_resolution[1]} (單通道灰度)")
    print(f"黑色像素篩選閾值: >= {black_pixel_threshold_percentage:.2f}% 的黑色像素將被跳過")


    # 確保輸出目錄存在
    os.makedirs(output_png_dir, exist_ok=True)

    # 查找所有 .h5 文件
    h5_files = sorted(glob.glob(os.path.join(h5_dir, "*.h5")))
    
    if not h5_files:
        print(f"錯誤: 未在 '{h5_dir}' 中找到任何 .h5 文件！請檢查路徑或文件類型。")
        return

    print(f"找到 {len(h5_files)} 個 .h5 文件。")

    global_image_counter = 0 # 用於為所有導出的圖片生成唯一的文件名
    skipped_images_count = 0 # 記錄因黑色面積過大而被跳過的圖片數量

    # 設定黑色像素的閾值 (例如，像素值小於或等於 5 則視為黑色)
    # 您可以根據實際數據的特性調整這個值
    pixel_black_value_threshold = 5 

    for h5_file_path in h5_files:
        h5_filename = os.path.basename(h5_file_path)
        print(f"\n--- 處理文件: {h5_filename} ---")

        try:
            with h5py.File(h5_file_path, 'r') as hf:
                # 假設圖片數據存儲在 'matrix' 鍵下
                if 'matrix' not in hf:
                    print(f"警告: 文件 '{h5_filename}' 中未找到 'matrix' 鍵，跳過此文件。")
                    continue
                
                images_data = hf['matrix'] # HDF5 dataset，通常為 (N, H, W, C)
                num_images_in_h5 = images_data.shape[0]

                print(f"文件 '{h5_filename}' 包含 {num_images_in_h5} 張圖片，原始形狀: {images_data.shape[1:]}")

                # 使用 tqdm 顯示進度
                for i in tqdm(range(num_images_in_h5), desc=f"導出 {h5_filename}"):
                    img_raw = images_data[i] # 獲取單張圖片數據 (H, W, C)

                    # 1. 將圖片數據轉換為 NumPy 陣列 (如果還不是的話)
                    # 並且處理數據類型，通常 PIL 期望 uint8 或 float
                    
                    # 獲取原始通道數
                    original_channels = img_raw.shape[-1] if img_raw.ndim == 3 else 1
                    
                    # 2. 轉換為單通道灰度圖
                    if original_channels >= 1: # 確保至少有一個通道
                        gray_img_np = img_raw[:, :, 0] # 假設第一個通道是適合用於灰度的

                        # 處理數據類型和範圍，以適應 PIL 的 'L' (灰度) 模式
                        if gray_img_np.max() - gray_img_np.min() > 1e-8: # 避免除以零
                            gray_img_np = (gray_img_np - gray_img_np.min()) / \
                                          (gray_img_np.max() - gray_img_np.min()) * 255.0
                        else: # 如果所有像素值都相同
                            gray_img_np = np.zeros_like(gray_img_np) 
                            
                        gray_img_np = np.clip(gray_img_np, 0, 255).astype(np.uint8) # 確保在 0-255 範圍並轉為 uint8
                        
                        # 在調整尺寸和保存之前，檢查黑色面積比例
                        total_pixels = gray_img_np.size
                        black_pixels = np.sum(gray_img_np <= pixel_black_value_threshold)
                        black_pixel_ratio = (black_pixels / total_pixels) * 100

                        if black_pixel_ratio >= black_pixel_threshold_percentage:
                            skipped_images_count += 1
                            tqdm.write(f"跳過圖片: {h5_filename} 索引 {i}，黑色像素佔比 {black_pixel_ratio:.2f}%")
                            continue # 跳過當前圖片，不保存
                        
                        img_pil = Image.fromarray(gray_img_np, 'L') # 'L' 表示 8-bit 灰度圖片
                    else:
                        print(f"\n警告: 圖片 {h5_filename} 索引 {i} 沒有足夠的通道來提取灰度圖，跳過。")
                        continue

                    # 3. 調整圖片尺寸
                    if img_pil.size != target_resolution:
                        img_pil = img_pil.resize(target_resolution, Image.LANCZOS) # 使用 Lanczos 高品質縮放

                    # 4. 保存為 PNG
                    output_filename = f"image_{global_image_counter:08d}.png" # 生成唯一文件名
                    output_file_path = os.path.join(output_png_dir, output_filename)
                    img_pil.save(output_file_path)

                    global_image_counter += 1

        except Exception as e:
            print(f"\n錯誤: 處理文件 '{h5_filename}' 時發生錯誤: {e}")
            continue # 繼續處理下一個 .h5 文件

    print(f"\n--- 所有 .h5 文件處理完成 ---")
    print(f"總共成功導出了 {global_image_counter} 張圖片到 '{output_png_dir}'。")
    print(f"總共跳過了 {skipped_images_count} 張圖片 (因黑色像素過多)。")

if __name__ == "__main__":
    # >>> 請在這裡修改為包含你的 TCIR .h5 文件的目錄路徑 <<<
    # 例如: h5_data_directory = "/home/chy/hbx/InverseBench_original/raw_tcir_h5"
    h5_data_directory = "./" 

    # >>> 請在這裡修改為你希望導出圖片的目標目錄路徑 <<<
    # 例如: exported_png_directory = "/home/hbx/InverseBench_original/processed_tcir_png_64x64"
    exported_png_directory = "./tcir_png_64x64"

    # 目標分辨率，與你的訓練配置 (64x64) 相符
    target_res = (64, 64)

    # 設置黑色像素佔比的閾值 (例如 99%)
    black_pixel_percentage = 99.0

    # 檢查源目錄是否存在
    if not os.path.isdir(h5_data_directory):
        print(f"錯誤: 源目錄 '{h5_data_directory}' 不存在。請檢查路徑是否正確。")
    else:
        export_images_from_h5(h5_data_directory, exported_png_directory, 
                              target_res, black_pixel_threshold_percentage=black_pixel_percentage)

```
