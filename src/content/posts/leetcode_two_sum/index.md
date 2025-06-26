---
title: "LeetCode 題庫 - Two Sum (兩數之和)"
published: 2020-12-23T4:17:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-12-23T4:17:26+08:00
draft: false
description: ""
license: ""
tags: ["LeetCode", "C"]
category: Algorithm
image: "./index/compressed/leetcode.jpg"
lang: zh-TW
---

## 前言

最近刷到的簡單題庫題。

## 題目

[Two Sum (兩數之和)](https://leetcode.com/problems/two-sum/)

## 題目描述

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

給定一個整數數組 nums 和一個目標值 target，請你在該數組中找出和為目標值的那 兩個 整數，並返回他們的數組下標。

你可以假設每種輸入只會對應一個答案。但是，數組中同一個元素不能使用兩遍。

## 測資

Example 1：

```
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Output: Because nums[0] + nums[1] == 9, we return [0, 1].
```

Example 2：

```
Input: nums = [3,2,4], target = 6
Output: [1,2]
```

Example 3：

```
Input: nums = [3,3], target = 6
Output: [0,1]
```

## 限制

- 2 <= nums.length <= 103
- -109 <= nums[i] <= 109
- -109 <= target <= 109
- Only one valid answer exists.

## 解題思路

就使用暴力解就行了，遍歷整個陣列。

## 源碼

我使用 C 語言寫的。裡面比較需要注意的是要自己聲明新的返回指針，returnSize 只需要保持 2 就好。

```c
/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize){
    int flag = 0; // 判斷是否配對成功
    int *returnN = (int *)malloc(sizeof(int)*2);
    for(int i = 0; i < numsSize; i++)
    {
        for(int j = i + 1; j < numsSize; j++)
        {
            if(nums[i] + nums[j] == target)
            {
                returnN[0] = i;
                returnN[1] = j;
                flag = 1;
                break;
            }
        }
        if(flag == 1)
        {
            break;
        }
    }
    *returnSize = 2;
    //printf("%d %d", returnSize[0], returnSize[1]);
    return returnN;
}
```

## 結語

送分題。