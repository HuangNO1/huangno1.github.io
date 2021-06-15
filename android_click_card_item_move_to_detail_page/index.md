# Android Java - 簡易今日頭條 - 點擊新聞卡片進入新聞詳情頁與 WebView 顯示


## 前言

上一篇我們已經介紹完 [RecyclerView 加載更多的實現](https://huangno1.github.io/android_java_recyclerview_load_more/)，而這篇也是最後一篇，關於**點擊新聞卡片進入新聞詳情頁(Activity)**。

## Display

![Display_click_to_detail_page.gif](index/Display_click_to_detail_page.gif "點擊卡片 Item 進入詳情頁展示")

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## 具體實現

這裡我是在新聞卡片的適配器裡面去做，將 View 設置點擊事件，然後新增一個新聞活動頁面。

### `ui/card/newsCardList/NewsCardAdapter.java`

下面的 Code 中我舉出 `NoImageCardViewHolder` 子類，裡面的構造函數中去做 `itemView` 的點擊事件，點擊事件涉及到了傳參部份，傳參使用 `intent.putExtra()` 方法，然後在 `NewsDetailActivity` 做接收參數。

```java
public class NewsCardAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    private final List<NewsCardItemDataModel> mDataModelList;
    private final Context mContext;
    
    // ...
    
    /**
     * Click the card item and move to NewsDetailActivity
     *
     * @param itemView
     */
    public void onClickListener(@NonNull View itemView) {
        itemView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Activity activity = (Activity) mContext;
                TextView mSourceUrl = itemView.findViewById(R.id.text_view_source_url);
                Intent intent = new Intent(activity, NewsDetailActivity.class);
                intent.putExtra("source_url", mSourceUrl.getText().toString());
                mContext.startActivity(intent);
                activity.overridePendingTransition(R.animator.slide_in_right, R.animator.slide_out_left);
            }
        });
    }
    
    // No image style card view holder
    class NoImageCardViewHolder extends RecyclerView.ViewHolder {
        private final ImageView mAvatarView;
        private final TextView mTitleTextView;
        private final TextView mSubTitleTextView;
        private final TextView mBottomTextView;
        private final TextView mSourceUrlTextView;

        public NoImageCardViewHolder(@NonNull View itemView) {
            super(itemView);
            mAvatarView = itemView.findViewById(R.id.image_view_card_avatar);
            mTitleTextView = itemView.findViewById(R.id.text_view_card_title);
            mSubTitleTextView = itemView.findViewById(R.id.text_view_card_subtitle);
            mBottomTextView = itemView.findViewById(R.id.text_view_card_bottom_text);
            mSourceUrlTextView = itemView.findViewById(R.id.text_view_source_url);
            // set onClick
            onClickListener(itemView);
        }

        public void bindData(NewsCardItemDataModel dataModel, Context context) {
            // ...
        }
    }
    
}
```

### `layout/activity_news_detail.xml`

這個是 `NewsDetailActivity` 的 `xml` Layout 文件。

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".activity.NewsDetailActivity">
    <com.google.android.material.appbar.AppBarLayout
        android:id="@+id/app_bar"
        android:layout_height="40dp"
        android:layout_width="match_parent"
        android:background="@color/tabbed_bg">

        <com.google.android.material.appbar.CollapsingToolbarLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            app:toolbarId="@+id/toolbar"
            app:layout_scrollFlags="scroll|exitUntilCollapsed">

            <androidx.appcompat.widget.Toolbar
                android:id="@+id/tool_bar"
                android:layout_height="40dp"
                android:layout_width="match_parent">

                <androidx.appcompat.widget.LinearLayoutCompat
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content">
                    <Button
                        android:id="@+id/button_back"
                        android:layout_width="25dp"
                        android:layout_height="25dp"
                        android:layout_margin="1dp"
                        android:backgroundTint="@color/white"
                        app:layout_constraintStart_toStartOf="parent"
                        app:layout_constraintBottom_toBottomOf="parent"
                        android:background="@drawable/ic_baseline_arrow_back_ios_24"/>
                </androidx.appcompat.widget.LinearLayoutCompat>

            </androidx.appcompat.widget.Toolbar>
        </com.google.android.material.appbar.CollapsingToolbarLayout>
    </com.google.android.material.appbar.AppBarLayout>
    <com.airbnb.lottie.LottieAnimationView
        android:id="@+id/animation_view_loading"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:scaleX="0.7"
        android:scaleY="0.7"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        app:lottie_autoPlay="true"
        app:lottie_loop="true" />
    <androidx.core.widget.NestedScrollView
        android:id="@+id/nested_scroll_view_web"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="com.google.android.material.appbar.AppBarLayout$ScrollingViewBehavior">

        <FrameLayout
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            tools:context=".ui.page.news_detail.NewsDetailFragment">

            <WebView
                android:id="@+id/web_view"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                app:layout_constraintLeft_toLeftOf="parent"
                app:layout_constraintRight_toRightOf="parent" />

            <ProgressBar
                android:id="@+id/progress_bar_loading"
                style="@style/Widget.AppCompat.ProgressBar.Horizontal"
                android:layout_width="match_parent"
                android:layout_height="2dp"
                app:layout_constraintTop_toTopOf="parent"/>

        </FrameLayout>

    </androidx.core.widget.NestedScrollView>

    <com.google.android.material.floatingactionbutton.FloatingActionButton
        android:id="@+id/fab_scroll_to_top"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_gravity="bottom|end"
        android:layout_marginEnd="10dp"
        android:layout_marginBottom="30dp"
        android:backgroundTint="@color/red_200"
        android:clickable="true"
        android:contentDescription="@string/scrolltotop"
        android:focusable="true"
        android:isScrollContainer="false"
        android:src="@drawable/ic_baseline_keyboard_arrow_up_24"
        android:tint="@color/white"
        app:borderWidth="0dp" />
</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### `activity/NewsDetailActivity.java`

在 `onCreate()` 中用 `Bundle args = getIntent().getExtras();` 獲取傳來的 `source_url`，並設置 `WebView` 顯示該連結。

> 注意：有一些 API 傳回來的新聞詳情連結中已經有包含 `http` 字符，所以這部份要做處理，提前判斷該 URL 是否已經完整。

```java
package com.example.toutiao.activity;

// ...

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.widget.NestedScrollView;

import com.airbnb.lottie.LottieAnimationView;
import com.example.toutiao.R;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

/**
 * A Activity to be showed news detail.
 */

public class NewsDetailActivity extends AppCompatActivity {

    private WebView mNewsDetailWebView;
    private ProgressBar mProgressBar;
    private Button mBackButton;
    private LottieAnimationView mLoadingAnimationView;
    private FloatingActionButton mScrollToTopFAB;
    private NestedScrollView mWebNestedScrollView;

    @RequiresApi(api = Build.VERSION_CODES.M)
    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_news_detail);

        Bundle args = getIntent().getExtras();
        String url = "";
        if (args != null) {
            url = args.getString("source_url");
        }

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(getResources().getColor(R.color.tabbed_bg));

        mLoadingAnimationView = findViewById(R.id.animation_view_loading);
        mLoadingAnimationView.setAnimation("load-animation.json");
        mLoadingAnimationView.setSpeed(1);
        mLoadingAnimationView.playAnimation();

        mNewsDetailWebView = findViewById(R.id.web_view);
        mProgressBar = findViewById(R.id.progress_bar_loading);
        mProgressBar.setMax(100);
        mProgressBar.setProgress(1);
        // avoid the url has "http"
        if (url.contains("http")) {
            setNewsDetailWebView(url);
        } else {
            setNewsDetailWebView("https://m.toutiao.com" + url);
        }


        mBackButton = findViewById(R.id.button_back);
        setBackButtonOnClick();

        mWebNestedScrollView = findViewById(R.id.nested_scroll_view_web);
        mWebNestedScrollView.setOnScrollChangeListener(new View.OnScrollChangeListener() {
            @Override
            public void onScrollChange(View v, int scrollX, int scrollY, int oldScrollX, int oldScrollY) {
                if (scrollY == 0) {
                    // hide FAB when NestedScrollView is at the top
                    mScrollToTopFAB.hide();
                } else {
                    mScrollToTopFAB.show();
                }
            }
        });

        mScrollToTopFAB = findViewById(R.id.fab_scroll_to_top);
        mScrollToTopFAB.hide();
        mScrollToTopFAB.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // scroll to top
                mWebNestedScrollView.smoothScrollTo(0, 0);
            }
        });
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setNewsDetailWebView(String url) {

        // TODO: Make WebView Faster

        mNewsDetailWebView.setWebChromeClient(new WebChromeClient() {
            public void onProgressChanged(WebView view, int progress) {
                mProgressBar.setProgress(progress);
            }
        });

        mNewsDetailWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                mProgressBar.setVisibility(View.VISIBLE);
                return super.shouldOverrideUrlLoading(view, url);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                mLoadingAnimationView.setVisibility(View.GONE);
                mProgressBar.setVisibility(View.GONE);
            }
        });

        mNewsDetailWebView.getSettings().setAppCacheEnabled(true);
        mNewsDetailWebView.getSettings().setLoadsImagesAutomatically(true);
        mNewsDetailWebView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        // hardware acceleration
        mNewsDetailWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        // enabling javascript
        mNewsDetailWebView.getSettings().setJavaScriptEnabled(true);
        // enable Dom storage
        mNewsDetailWebView.getSettings().setDomStorageEnabled(true);

        mNewsDetailWebView.loadUrl(url);
    }

    private void setBackButtonOnClick() {
        mBackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Leave();
            }
        });

    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        if (mNewsDetailWebView.canGoBack()) {
            mNewsDetailWebView.goBack();
        } else {
            Leave();
        }
    }

    /**
     * back to MainActivity
     */
    public void Leave() {
//        mNewsDetailWebView.clearCache(true);
//        mNewsDetailWebView.clearHistory();
//        mNewsDetailWebView.clearFormData();
        finish();
        overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_out_right);
    }
}
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

