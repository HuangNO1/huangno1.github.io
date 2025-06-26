---
title: "LeetCode 題庫 - Add Two Numbers (兩數相加)"
published: 2020-12-23T18:17:28+08:00
# 副標題
subtitle: ""
# 上次修改的時間
lastmod: 2020-12-23T18:17:26+08:00
draft: false
description: ""
license: ""
tags: ["LeetCode", "C"]
category: Algorithm
image: "./index/compressed/leetcode.jpg"
lang: zh-TW
---

## 前言

是個難度適中的題目。

## 題目

[Add Two Numbers (兩數相加)](https://leetcode.com/problems/add-two-numbers/)

## 題目描述

You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

給出兩個**非空**的鏈表用來表示兩個非負的整數。其中，它們各自的位數是按照**逆序**的方式存儲的，並且它們的每個節點只能存儲**一位**數字。

如果，我們將這兩個數相加起來，則會返回一個新的鍊表來表示它們的和。

您可以假設除了數字 0 之外，這兩個數都不會以 0 開頭。

## 測資

Example 1：

```
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.
```

Example 2：

```
Input: l1 = [0], l2 = [0]
Output: [0]
```

Example 3：

```
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]
```

## 限制

Constraints:

- The number of nodes in each linked list is in the range [1, 100].
- 0 <= Node.val <= 9
- It is guaranteed that the list represents a number that does not have leading zeros.


## 解題思路

### 碰壁與問題

- 一開始如果你使用將鏈表的單個數字全部轉換成一個完整數字，然後進行相加，在轉換成一個鏈表，這樣會**造成 Int 溢出**，因為他的節點範圍是 **1 ~ 100**，所以不能用這個方法。
- 如果你是要**新建第三個的鏈表存結果**，然後再將兩者的相加一位一位存到新的鏈表，這樣會很費運行內存，然後考慮的情況變多。
- 在 C 中我們無法提前知道鏈表的長度。
- 必須將時間複雜度控制在 O(N)。

### 解決

將兩個鏈表上一位一位的相加結果都存到第一個鏈表上，這樣子解決了時間與運行記憶體問題，連帶將需要考慮的情也減少，這樣我們只需要**考慮到第一個鏈表的長度不夠，還有相加進位，鏈表的頭節點不為空**。

## 源碼

我使用 C 語言解決了這題。

```c
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     struct ListNode *next;
 * };
 */


struct ListNode* addTwoNumbers(struct ListNode* l1, struct ListNode* l2){
    struct ListNode *p = l1, *q = l2;
    
    int temp = 0; // 進位相加值
    //  b 加到 a 上
    while(p || q)
    {
        if (p && q)
        {
            // p q 都還沒到尾
            temp += p->val + q->val;
            q = q->next;
        }
        else if (p && !q)
        {
            // q 已經到尾
            temp += p->val;
        }
        else if (!p && q)
        {
            // p 已經到尾
            temp += q->val;
            q = q->next;
        }
        // 將結果寫入
        p->val = temp % 10;
        temp -= p->val;
        temp /= 10;
        // 如果還有進位值但 p 已經到尾的情況
        // 如果p 已經到尾部 但是 q 還沒到尾部的情況
        if (!p->next && (temp != 0 || q))
        {
            struct ListNode *s = (struct ListNode *)malloc(sizeof(struct ListNode));
            s->val = 0;
            s->next = NULL;
            p->next = s;
            //printf("temp %d ,p %d\n", temp, p != NULL);
        }
        p = p->next;
    }
    return l1;
}

```

## 結語

解這題的前提是需要理解鏈表的概念，其次我自己在本地寫輸入測資時寫得很麻煩，因為 LeetCode 上的編輯器沒有給 `main` 函數，也無法 Debug（貌似要充錢）。