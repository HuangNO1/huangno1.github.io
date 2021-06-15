# Android Java - 簡易今日頭條 - Tabs 頻道頁面切換


## 前言

上一篇文章我寫了關於[底部導覽頁的切換](https://huangno1.github.io/android_java_btn_nav/)，這次換到關於簡易今日頭條中的 **Tab Channel 切換**。

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## Display

## 具體實現

這裡我一開始使用的是**舊的 API 方法(`ViewPagerFragment`、`PagerAdapter`)**，如果你使用的是：

- `androidx.viewpager.widget.ViewPager`
- `androidx.fragment.app.FragmentPagerAdapter`

你會得到一個提示是這**兩個 API 是已經棄用(`deprecated`)**的，尤其是在寫 **`FragmentPagerAdapter`** 類的時候，Android Studio 會在父類類名上刪除線(Strikethrough)，所以我們需要切換到新的 API：

- `androidx.viewpager2.widget.ViewPager2`
- `androidx.viewpager2.adapter.FragmentStateAdapter`

那我們來開始看具體寫法，可以參考官方文檔[Create swipe views with tabs using ViewPager2 - Android developers](https://developer.android.com/guide/navigation/navigation-swipe-view-2)。

> 註：由於這個的 tabbed 項目需求的頁面是相同的，都是展示新聞卡片，**所以我們就只需要設計一個 Fragment 類**，但是如果我們需要每個新聞頻道 Tab 頁面有不同的設計，就需要設計多個 Fragment 類。

### `layout/fragment_home.xml`

我需要在 Home Fragment 展示我的 Tabs，然後在 **NewsChannelFragment** 顯示各頁面內容，這裡我們有 `TabLayout` 和最新的 `ViewPager2`。

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <com.google.android.material.appbar.AppBarLayout
        android:id="@+id/app_bar"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:theme="@style/Theme.PopupOverlay"
        android:background="@color/tabbed_bg">

        <androidx.appcompat.widget.Toolbar
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            android:layout_marginEnd="10dp"
            app:layout_scrollFlags="scroll|enterAlways">

            <com.example.toutiao.ui.searchBar.SearchView
                android:id="@+id/search_view_news"
                android:layout_width="match_parent"
                android:layout_height="match_parent"
                android:clickable="true"
                android:focusable="true"
                android:layout_marginEnd="30dp" />

            <Button
                android:layout_width="30dp"
                android:layout_height="30dp"
                android:layout_gravity="right|center_vertical"
                android:background="@drawable/ic_baseline_add_circle_24"
                android:backgroundTint="@color/white"
                android:clickable="true"
                android:focusable="true"
                tools:ignore="RtlHardcoded" />

        </androidx.appcompat.widget.Toolbar>
        <com.google.android.material.tabs.TabLayout
            android:id="@+id/tabs_channel"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            app:tabIndicatorColor="#FFFFFF"
            app:tabMode="scrollable"
            app:tabRippleColor="#00FFFFFF"
            app:tabSelectedTextColor="@color/white"
            app:tabTextColor="#D1D1D1">

        </com.google.android.material.tabs.TabLayout>
    </com.google.android.material.appbar.AppBarLayout>

    <androidx.viewpager2.widget.ViewPager2
        android:id="@+id/view_pager_channel"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior"/>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        tools:context=".ui.home.HomeFragment"/>

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### `layout/fragment_news_channel.xml`

這裡就沒有比較需要注意的東西。

```xml
<?xml version="1.0" encoding="utf-8"?>

<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/fragment_news_channel"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    tools:context=".ui.page.newsChannel.NewsChannelFragment">

	<!-- ... -->

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### `ui/page/newsChannel/newsChannelFragment.java`

我在 `ui/page/newsChannel` 目錄下加了三個文件，分別是 `newsChannelFragment.java`、`PageViewModel.java`、`SectionsPagerAdapter.java`。代表我們需要的 Fragment 頻道展示頁面、Fragment 的 ViewModel、ViewPager 的適配器。

這裡的注意點是在 `public static NewsChannelFragment newInstance(String category, int index)` 方法中返回一個自己的 Fragment 實例對象，還有 `onCreate` 中的傳參數獲取。

```java
package com.example.toutiao.ui.page.newsChannel;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link NewsChannelFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class NewsChannelFragment extends Fragment {
    private String mCategory;
    private int mIndex;

    public NewsChannelFragment() {
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     */
    public static NewsChannelFragment newInstance(String category, int index) {
        NewsChannelFragment fragment = new NewsChannelFragment();
        Bundle bundle = new Bundle();
        bundle.putString("category", category);
        bundle.putInt("index", index);
        fragment.setArguments(bundle);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mPageViewModel = new ViewModelProvider(this).get(PageViewModel.class);
        if (getArguments() != null) {
            mCategory = getArguments().getString("category");
            mIndex = getArguments().getInt("index");
        }
        mPageViewModel.setCategory(mCategory);
        mPageViewModel.setIndex(mIndex);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_news_channel, container, false);
        // ...
        return view;
    }
}
```

### `ui/page/newsChannel/PageViewModel.java`

```java
package com.example.toutiao.ui.page.newsChannel;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

/**
 * A [ViewModel] for NewsChannelFragment
 */

public class PageViewModel extends ViewModel {
    private final MutableLiveData<Integer> mIndex = new MutableLiveData<>();
    private final MutableLiveData<String> mCategory = new MutableLiveData<>();

    public MutableLiveData<String> getCategory() {
        return mCategory;
    }

    public void setCategory(String category) {
        mCategory.setValue(category);
    }

    public MutableLiveData<Integer> getIndex() {
        return mIndex;
    }

    public void setIndex(int index) {
        mIndex.setValue(index);
    }
}
```

### `ui/page/newsChannel/SectionsPagerAdapter.java`

這裡使用的是最新的 API：`FragmentStateAdapter`。成員變量 `mArrayList` 是我們的 `Fragment` 數組，我們渲染多少頻道就有多大。`addFragment` 方法添加新的 `fragment`。

```java
package com.example.toutiao.ui.page.newsChannel;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.lifecycle.Lifecycle;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;

/**
 * A [FragmentStateAdapter] that returns a fragment corresponding to
 * one of the sections/tabs/pages.
 */
public class SectionsPagerAdapter extends FragmentStateAdapter {

    private final ArrayList<Fragment> mArrayList = new ArrayList<>();

    public SectionsPagerAdapter(@NonNull FragmentManager fragmentManager, @NonNull Lifecycle lifecycle) {
        super(fragmentManager, lifecycle);
    }

    public void addFragment(Fragment fragment) {
        mArrayList.add(fragment);
    }

    @NonNull
    @NotNull
    @Override
    public Fragment createFragment(int position) {
        // return your fragment that corresponds to this 'position'
        return mArrayList.get(position);
    }

    @Override
    public int getItemCount() {
        // Show total pages.
        return mArrayList.size();
    }
}
```

### `ui/home/HomeFragment.java`

這是最關鍵的文件，關於設定 `TabLayout`和 `ViewPager2`。

```java
package com.example.toutiao.ui.home;

// ...

import androidx.annotation.StringRes;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import com.example.toutiao.R;
import com.example.toutiao.activity.SearchActivity;
import com.example.toutiao.ui.page.newsChannel.NewsChannelFragment;
import com.example.toutiao.ui.page.newsChannel.SectionsPagerAdapter;
import com.example.toutiao.ui.searchBar.SearchView;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link com.example.toutiao.ui.home.HomeFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class HomeFragment extends Fragment {
    private SectionsPagerAdapter mSectionsPagerAdapter;
    @StringRes
    private static final int[] TAB_TITLES = new int[]{
            R.string.title__all__,
            R.string.title_news_tech,
//        R.string.title_news_image,
            R.string.title_news_hot,
            R.string.title_news_entertainment,
            R.string.title_news_game,
            R.string.title_news_sports,
            R.string.title_news_finance,
            R.string.title_digital,
    };
    private ViewPager2 mViewPagerChannel;
    private SearchView mNewsSearchView;
    private TabLayout mTabsChannel;

//    // TODO: Rename parameter arguments, choose names that match
//
//    // TODO: Rename and change types of parameters

    public HomeFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment AccountFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static HomeFragment newInstance() {
        HomeFragment fragment = new HomeFragment();
        Bundle args = new Bundle();
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // setting status bar's color
        Window mWindow = getActivity().getWindow();
        mWindow.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        mWindow.setStatusBarColor(getResources().getColor(R.color.tabbed_bg));
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_home, container, false);

        Context context = container.getContext();

        // setting tabbed
        mSectionsPagerAdapter = new SectionsPagerAdapter(getChildFragmentManager(), getLifecycle());
        mViewPagerChannel = view.findViewById(R.id.view_pager_channel);

        // add Fragments in your ViewPagerFragmentAdapter class
        for (int i = 0; i < TAB_TITLES.length; i++) {
            String category = context.getString(TAB_TITLES[i]);
            mSectionsPagerAdapter.addFragment(NewsChannelFragment.newInstance(category, i));
        }
        // setting switch Orientation
        mViewPagerChannel.setOrientation(ViewPager2.ORIENTATION_HORIZONTAL);
        // setting adapter to view pager
        mViewPagerChannel.setAdapter(mSectionsPagerAdapter);
        mTabsChannel = view.findViewById(R.id.tabs_channel);
        // setting tabbed
        new TabLayoutMediator(mTabsChannel, mViewPagerChannel,
                (tab, position) -> tab.setText(context.getString(TAB_TITLES[position]))
        ).attach();

        return view;
    }
}
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

