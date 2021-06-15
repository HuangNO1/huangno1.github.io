# Android Java - 簡易今日頭條 - 圖片緩存與懶加載


## 前言

上次的文章中我寫了關於[新聞數據請求渲染](https://huangno1.github.io/android_java_recycler_view_different_cards/)的部份。這篇文章就簡要說一下怎麼做到圖片緩存與懶加載。

## Display

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## 具體實現

圖片的緩存最直接的方法就是將圖片下載到本地緩存，然後顯示到圖片，然而網上有一個 API 是 [ square/picasso - Github](https://github.com/square/picasso)，實現原理可以看 [Picasso从使用到原理详解 - JasonWang's Blog](http://sniffer.site/2017/04/20/Picasso%E4%BB%8E%E4%BD%BF%E7%94%A8%E5%88%B0%E5%8E%9F%E7%90%86%E8%AF%A6%E8%A7%A3/)，這篇文章講的很好。**Picasso 可以將我們的圖片進行二級緩存**，並檢查內存是否有這張圖片，如果有就無需下載，沒有就進行 OkHttp 在線程池的子線程請求（也就是異步請求回調函數使用的線程）。

我是將圖片緩存寫到了 `ui/card/newsCardList/NewsCardItemDataModel.java` 中的 `RecyclerView.ViewHolder` 子類中 `bindData()`，這裡就只寫一下簡單的使用方式。

```java
Picasso.get().load(dataModel.getAvatar()).into(mAvatarView);
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

