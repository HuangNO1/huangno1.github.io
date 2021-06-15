# Android Java - 簡易今日頭條 - Load More 加載更多新聞內容


## 前言

上一篇我們說到了[下拉刷新的實現](https://huangno1.github.io/android_java_pull_to_refresh/)，這篇我接著講如何**實現上拉加載更多**。

## Display

![Display_load_more.gif](./index/Display_load_more.gif "加載更多展示")

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## 具體實現

這裡需要使用 `RecyclerView` 的監聽滾動方法，當無法在往下滾動的時候，就調用加載更多的方法。

以下是 `RecyclerView` 設置滾動監聽的參考案例：

這裡使用了 `addOnScrollListener` 方法做滾動監聽，接著在 `onScrolled` 方法中做處理，`!recyclerView.canScrollVertically(1)` 代表 `recyclerView` 已經無法繼續往下滾了。

```java
// cardList
mCardListRecyclerView = view.findViewById(R.id.recycler_view_card_list);
mCardListRecyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
    @Override
    public void onScrollStateChanged(@NonNull @NotNull RecyclerView recyclerView, int newState) {
        super.onScrollStateChanged(recyclerView, newState);
    }

    @Override
    public void onScrolled(@NonNull @NotNull RecyclerView recyclerView, int dx, int dy) {
        super.onScrolled(recyclerView, dx, dy);
        if (!recyclerView.canScrollVertically(1)) { // 1 for down
            loadMoreNews();
        }
    }
});
```

這裡比較需要注意的地方是如果需要在加載更多後的 `mCardListAdapter` 要**使用 `notifyDataSetChanged()` 方法更新頁面的 Item 渲染**。

```java
mCardListAdapter.setDataModelList(tempCardDataModelList);
Log.v("after load more", "card list size: " + mCardListAdapter.getItemCount());
mIsLoadMore = false;
mCardListAdapter.notifyDataSetChanged();
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

