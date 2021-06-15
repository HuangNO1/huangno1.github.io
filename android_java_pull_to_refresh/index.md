# Android Java - 簡易今日頭條 - Pull To Refresh 刷新新聞內容


## 前言

上次的文章中我寫了關於[圖片緩存與懶加載](https://huangno1.github.io/android_java_image_cache_and_lazy_load/)的部份。這篇文章就簡要說一下怎麼**實現下拉刷新**。

## Display

![Display_pull_to_refresh.gif](./index/Display_pull_to_refresh.gif "下拉刷新展示")

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## 具體實現

刷新的部份我是推薦使用 AndroidX 官方的方法： `Swiperefreshlayout`，具體說明可參考官方的 [Swiperefreshlayout - Android Developers](https://developer.android.com/jetpack/androidx/releases/swiperefreshlayout)，雖然我一開始有考慮過網上一堆酷炫的第三方刷新頭，但是那些東西其實很多都是過時的，並不支持 AndroidX，使用上也有很多問題，或許你覺得 `Swiperefreshlayout` 很丑？但是包括 Bilibili 等手機應用大都是使用這個組件。而我目前使用的是 Github 上別人的開源項目 [tuesda/CircleRefreshLayout - Github](https://github.com/tuesda/CircleRefreshLayout)，因為這項目是已經過時的，所以我自己將該項目下載下來自己修改過時的 API，將其套用在自己的項目上，然而這項目依然有一些問題存在，但作者似乎也沒打算更新？

這裡就介紹如何用 Swiperefreshlayout。也可以看 [Implementing Pull to Refresh Guide - CODEPATH](https://guides.codepath.com/android/implementing-pull-to-refresh-guide)

首先要加上依賴

```
dependencies {
    implementation "androidx.swiperefreshlayout:swiperefreshlayout:1.1.0"
}
```

接著在 xml 中需要刷新渲染的 `RecyclerView` 或是 `ListView` 加上該組件。

```xml
<!-- ... -->
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swiperefresh"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <androidx.recyclerview.widget.RecyclerView
        android:id="@android:id/list"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
<!-- ... -->
```

下拉刷新組件都會有個**監聽刷新動作的方法**讓你使用，你可以在組件的相關說明文檔找到。在你的刷新地方進行刷新監聽。

```java
public class TimelineActivity extends Activity {
    private SwipeRefreshLayout swipeContainer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Only ever call `setContentView` once right at the top
        setContentView(R.layout.activity_main);
        // Lookup the swipe container view
        swipeContainer = (SwipeRefreshLayout) findViewById(R.id.swipeContainer);
        // Setup refresh listener which triggers new data loading
        swipeContainer.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {

                // Your code to refresh the list here.
                // Make sure you call swipeContainer.setRefreshing(false)
                // once the network request has completed successfully.
                refreshData();
            } 

        });

        // Configure the refreshing colors
        swipeContainer.setColorSchemeResources(android.R.color.holo_blue_bright, 
                android.R.color.holo_green_light, 
                android.R.color.holo_orange_light, 
                android.R.color.holo_red_light);
    }
}
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

