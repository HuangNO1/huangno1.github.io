# Android Java - 簡易今日頭條 - 實現底部按鈕導覽切換 Fragment 頁面


## 前言

我接下來會寫一系列關於安卓開發的過程，由於這學期我選修了安卓應用開發，該課程與字節跳動客戶端員工合作，課程的項目設計是 **"簡易頭條"**，而我身為安卓零基礎的學生在一週內邊做邊學，最終完成了成果。在 Blog 我所遇到的細節技術實現。這篇文章是關於底部導覽頁的實現。

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## Display

![Display_nav.gif](index/Display_nav.gif "Bottom Nav 展示")

## 具體實現

使用 **BottomNavigationView**、**NavController** 與 **NavigationUI.setupWithNavController()** 方法去實現。

現在我需要使用三個子頁面(Fragment)分別是**首頁(home)、視頻(video)、我的(account)**：

> 注意：目錄的正確需要自己去修改

### `layout/activity.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:id="@+id/main_activity"
    tools:context=".activity.MainActivity">

    <com.google.android.material.bottomnavigation.BottomNavigationView
        android:id="@+id/nav_view"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginStart="0dp"
        android:layout_marginEnd="0dp"
        android:background="?android:attr/windowBackground"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:menu="@menu/bottom_nav_menu" />

    <fragment
        android:id="@+id/nav_host_fragment_activity_main"
        android:name="androidx.navigation.fragment.NavHostFragment"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:defaultNavHost="true"
        app:layout_constraintBottom_toTopOf="@id/nav_view"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        app:navGraph="@navigation/mobile_navigation" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

### `navigation/mobile_navigation.xml`

**navigation** 是可以設計**導覽圖**的一個組件也包括 Fragment 頁面的跳轉。

使用可以參考官方文檔 [Navigation 组件使用入门 - Android 开发者](https://developer.android.com/guide/navigation/navigation-getting-started?hl=zh-cn)。

```xml
<?xml version="1.0" encoding="utf-8"?>
<navigation xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/mobile_navigation"
    app:startDestination="@+id/navigation_home">

    <fragment
        android:id="@+id/navigation_home"
        android:name="com.example.toutiao.ui.home.HomeFragment"
        android:label="@string/title_home"
        tools:layout="@layout/fragment_home" />

    <fragment
        android:id="@+id/navigation_video"
        android:name="com.example.toutiao.ui.video.VideoFragment"
        android:label="@string/title_video"
        tools:layout="@layout/fragment_video" />

    <fragment
        android:id="@+id/navigation_account"
        android:name="com.example.toutiao.ui.account.AccountFragment"
        android:label="@string/title_notifications"
        tools:layout="@layout/fragment_account" />
</navigation>
```

### `layout/fragment_home.xml`、`layout/fragment_video.xml`、`layout/fragment_account.xml`

三個 Fragment 需要創建，內容都一樣，自行替換裡面的參數。

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".ui.home.HomeFragment">

    <!-- TODO: Update blank fragment layout -->
    <TextView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:text="@string/hello_home_fragment" />

</FrameLayout>
```

### `activity/MainActivity.java`


```java
package com.example.toutiao.activity;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.Navigation;
import androidx.navigation.ui.NavigationUI;

import com.example.toutiao.R;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        BottomNavigationView navView = findViewById(R.id.nav_view);

        // binding the bottom_nav and fragment to transfer
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment_activity_main);
        NavigationUI.setupWithNavController(navView, navController);
    }
}
```

### `ui/home/HomeFragment.java`、`ui/video/VideoFragment.java`、`ui/account/AccountFragment.java`

這三個類文件都一致，自己去做調整。以下取 `VideoFragment.java` 作為參考。

```java
package com.example.toutiao.ui.video;

import android.os.Bundle;

import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.example.toutiao.R;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link VideoFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class VideoFragment extends Fragment {

    // TODO: Rename parameter arguments, choose names that match
    // the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
    private static final String ARG_PARAM1 = "param1";
    private static final String ARG_PARAM2 = "param2";

    // TODO: Rename and change types of parameters
    private String mParam1;
    private String mParam2;

    public VideoFragment() {
        // Required empty public constructor
    }

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @param param1 Parameter 1.
     * @param param2 Parameter 2.
     * @return A new instance of fragment VideoFragment.
     */
    // TODO: Rename and change types and number of parameters
    public static VideoFragment newInstance(String param1, String param2) {
        VideoFragment fragment = new VideoFragment();
        Bundle args = new Bundle();
        args.putString(ARG_PARAM1, param1);
        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            mParam1 = getArguments().getString(ARG_PARAM1);
            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_video, container, false);
    }
}
```

## 項目心得

由於這次的項目因為我本身是安卓零基礎，而我卻使用了一週的時間將整體的 Code 邏輯架構寫好了，這是因為我會使用 Google 用關鍵字搜索，StackOverFlow 大多數時候都能給我比較好的答案，在做項目之前我頂多是有了做過 Qt C++ 的基礎，所以了解了一下安卓的組件生命週期還有哪些控件和布局，我就直接邊做邊學，我覺得這樣子對我的成長和動手能力提升很多，也謝謝字節跳動客戶端開發的大哥們一直提點我的不足。最終得以完成這個項目。

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)
