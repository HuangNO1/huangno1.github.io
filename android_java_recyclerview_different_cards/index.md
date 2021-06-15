# Android Java - 簡易今日頭條 - RecyclerView 渲染多種不同樣式的新聞卡片


## 前言

上篇文章中我講述了如何實現[Tabs 頻道頁面切換](https://huangno1.github.io/android_java_swip_views_with_tabs/)，接下來我們進一步實現 Tab Channel 中的**新聞卡片列表渲染**。

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## Display

![Display_recyclerView_different_card_styles.gif](index/Display_recyclerView_different_card_styles.gif "不同卡片樣式展示")

## 具體實現

由於一種的渲染方法比較簡單，通常設計者是卡在顯示多種類型的 RecyclerView Item，在多種卡片 item 的設計這裡我只需要設計一種 `DataModel` ，然後在 `DataModel` 中添加 `type` 成員變量判斷是哪種類型的卡片。

以下我舉出實現的 Example，簡化的部份 Code，這裡的 Code 去掉： HTTP 請求的渲染、Pull To ReFresh、Load More。後面會再一一舉例。

### `layout/fragment_news_channel.xml`

在需要渲染列表的地方加上 RecyclerView 組件。

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

    <LinearLayout
        android:id="@+id/linearLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:orientation="vertical"
        tools:ignore="MissingClass,MissingConstraints">

        <TextView
            android:id="@+id/text_view_section_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:visibility="gone" />

        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/recycler_view_card_list"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:layout_marginBottom="5dp"
            android:nestedScrollingEnabled="true"
            android:scrollbars="vertical" />
    </LinearLayout>

</androidx.coordinatorlayout.widget.CoordinatorLayout>
```

### `layout/no_image_card_item.xml`、`layout/one_image_card_item.xml`、`three_images_card_item.xml`

這是我們需要渲染的三種新聞卡片，我這裡就舉出第一種卡片 `no_image_card_item`，其他的可以自己去設計，不多贅述一一放出來。

```xml
<?xml version="1.0" encoding="utf-8"?>

<androidx.cardview.widget.CardView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_margin="5dp"
    app:cardCornerRadius="10dp"
    app:cardElevation="2dp">

    <TextView
        android:id="@+id/text_view_source_url"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:visibility="gone"/>

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginLeft="16dp"
        android:layout_marginTop="16dp"
        android:layout_marginRight="16dp"
        android:layout_marginBottom="8dp"
        android:orientation="vertical">

        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content">

            <ImageView
                android:id="@+id/image_view_card_avatar"
                android:layout_width="25dp"
                android:layout_height="25dp"
                android:layout_marginEnd="10dp"
                tools:ignore="MissingConstraints"
                tools:srcCompat="@drawable/avatar_1"
                android:contentDescription="@string/avatar" />

            <TextView
                android:id="@+id/text_view_card_title"
                style="@style/TextAppearance.MaterialComponents.Headline6"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="@string/title_goes_here"
                app:layout_constraintBottom_toTopOf="@+id/avatar"
                app:layout_constraintStart_toEndOf="@+id/avatar"
                app:layout_constraintTop_toBottomOf="@+id/avatar"
                tools:ignore="MissingConstraints" />

        </LinearLayout>

        <TextView
            android:id="@+id/text_view_card_subtitle"
            style="@style/TextAppearance.MaterialComponents.Caption"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="@string/subtitle_goes_here"
            app:layout_constraintStart_toStartOf="@+id/card_title"
            app:layout_constraintTop_toBottomOf="@+id/card_title" />

        <TextView
            android:id="@+id/text_view_card_bottom_text"
            style="@style/TextAppearance.MaterialComponents.Overline"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="@string/comment"
            app:layout_constraintStart_toStartOf="@+id/card_subtitle"
            app:layout_constraintTop_toBottomOf="@+id/card_subtitle" />

    </LinearLayout>
</androidx.cardview.widget.CardView>
```

### `ui/card/newsCardList/NewsCardItemDataModel.java`

我在 `ui/card/newsCardList/` 創建了兩個文件：`NewsCardItemDataModel.java`、`NewsCardAdapter.java`，分別代表卡片的數據模型和 `RecyclerView` 適配器。

我這裡寫了**三種構造類方法對應三種不同類型的卡片所需數據**，並使用 `mItemType` 判斷卡片類型。

```java
package com.example.toutiao.ui.card.newsCardList;

import java.util.ArrayList;
import java.util.Locale;

/**
 * CardItemDataModel class: the card item data model in New Channel Fragment
 */

public class NewsCardItemDataModel {
    public static final int NO_IMAGE_TYPE = 0;
    public static final int ONE_IMAGE_TYPE = 1;
    public static final int THREE_IMAGE_TYPE = 2;

    private int mItemType; // cart type
    private String mId; //id
    private String mAvatar; // avatar
    private ArrayList<String> mThreeImageDrawable; // three image
    private String mImageDrawable; // one image
    private String mTitle; // title
    private String mSubTitle; // subtitle
    private String mBottomText; // bottom text
    private String mDetailUrl; // detail text to jump

    // no image style constructor
    public NewsCardItemDataModel(int itemType,
                                 String id,
                                 String newsTitle,
                                 String newsAbstract,
                                 int newsCommentsCount,
                                 String newsSource,
                                 String newsMediaAvatarUrl,
                                 String newsSourceUrl
    ) {
        mItemType = itemType;
        mId = id;
        mAvatar = newsMediaAvatarUrl;
        mTitle = String.format(Locale.CHINESE, "%s", newsTitle);
        mSubTitle = String.format(Locale.CHINESE, "%s", newsAbstract);
        mBottomText = String.format(Locale.CHINESE, "%s  %d 评论", newsSource, newsCommentsCount);
        mDetailUrl = newsSourceUrl;
    }

    // one image style constructor
    public NewsCardItemDataModel(int itemType,
                                 String id,
                                 String newsTitle,
                                 String newsAbstract,
                                 int newsCommentsCount,
                                 String newsSource,
                                 String newsMediaAvatarUrl,
                                 String newsSourceUrl,
                                 String imageDrawable
    ) {
        mItemType = itemType;
        mId = id;
        mAvatar = newsMediaAvatarUrl;
        mTitle = String.format(Locale.CHINESE, "%s", newsTitle);
        mSubTitle = String.format(Locale.CHINESE, "%s", newsAbstract);
        mBottomText = String.format(Locale.CHINESE, "%s  %d 评论", newsSource, newsCommentsCount);
        mDetailUrl = newsSourceUrl;
        // one
        mImageDrawable = imageDrawable;
    }

    // three image style constructor
    public NewsCardItemDataModel(int itemType,
                                 String id,
                                 String newsTitle,
                                 String newsAbstract,
                                 int newsCommentsCount,
                                 String newsSource,
                                 String newsMediaAvatarUrl,
                                 String newsSourceUrl,
                                 ArrayList<String> threeImageDrawable
    ) {
        mItemType = itemType;
        mId = id;
        mAvatar = newsMediaAvatarUrl;
        mTitle = String.format(Locale.CHINESE, "%s", newsTitle);
        mSubTitle = String.format(Locale.CHINESE, "%s", newsAbstract);
        mBottomText = String.format(Locale.CHINESE, "%s  %d 评论", newsSource, newsCommentsCount);
        mDetailUrl = newsSourceUrl;
        // three
        mThreeImageDrawable = threeImageDrawable;
    }

    public int getItemType() {
        return mItemType;
    }

    public void setItemType(int itemType) {
        mItemType = itemType;
    }

    public String getId() {
        return mId;
    }

    public void setId(String id) {
        mId = id;
    }

    public String getAvatar() {
        return mAvatar;
    }

    public void setAvatar(String avatar) {
        mAvatar = avatar;
    }

    public String getBottomText() {
        return mBottomText;
    }

    public void setBottomText(String bottomText) {
        mBottomText = bottomText;
    }

    public String getTitle() {
        return mTitle;
    }

    public void setTitle(String title) {
        mTitle = title;
    }

    public String getSubTitle() {
        return mSubTitle;
    }

    public void setSubTitle(String subTitle) {
        mSubTitle = subTitle;
    }

    public ArrayList<String> getThreeImageDrawable() {
        return mThreeImageDrawable;
    }

    public void setThreeImageDrawable(ArrayList<String> threeImageDrawable) {
        mThreeImageDrawable = threeImageDrawable;
    }

    public String getImageDrawable() {
        return mImageDrawable;
    }

    public void setImageDrawable(String imageDrawable) {
        mImageDrawable = imageDrawable;
    }

    public String getDetailUrl() {
        return mDetailUrl;
    }

    public void setDetailUrl(String detailUrl) {
        mDetailUrl = detailUrl;
    }
}
```

### `ui/card/newsCardList/NewsCardAdapter.java`

這是渲染卡片的 `RecyclerView` 適配器類，**三種卡片類型就會有三種 `ViewHolder` 子類**。

`onCreateViewHolder` 綁定 UI 文件，`onBindViewHolder` 綁定數據。

```java
package com.example.toutiao.ui.card.newsCardList;

// ...

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.toutiao.R;
import com.example.toutiao.activity.NewsDetailActivity;
import com.squareup.picasso.Picasso;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

/**
 * A card adapter to help perform to control card item's render in news channel fragment
 */

public class NewsCardAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
    private final List<NewsCardItemDataModel> mDataModelList;
    private final Context mContext;

    public NewsCardAdapter(List<NewsCardItemDataModel> modelList, Context context) {
        mDataModelList = modelList;
        mContext = context;
    }
    @Override
    public int getItemViewType(final int position) {
        switch (mDataModelList.get(position).getItemType()) {
            case NewsCardItemDataModel.NO_IMAGE_TYPE:
                return NewsCardItemDataModel.NO_IMAGE_TYPE;
            case NewsCardItemDataModel.ONE_IMAGE_TYPE:
                return NewsCardItemDataModel.ONE_IMAGE_TYPE;
            case NewsCardItemDataModel.THREE_IMAGE_TYPE:
                return NewsCardItemDataModel.THREE_IMAGE_TYPE;
            default:
                return -1;
        }
    }

    /**
     * load more news and add to mDataModelList
     *
     * @param modelList
     */
    public void setDataModelList(List<NewsCardItemDataModel> modelList) {
        mDataModelList.addAll(modelList);
    }

    @Override
    public int getItemCount() {
        return mDataModelList.size();
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view;
        switch (viewType) {
            case NewsCardItemDataModel.NO_IMAGE_TYPE:
                view = LayoutInflater.from(parent.getContext())
                        .inflate(R.layout.no_image_card_item, parent, false);
                return new NoImageCardViewHolder(view);
            case NewsCardItemDataModel.ONE_IMAGE_TYPE:
                view = LayoutInflater.from(parent.getContext())
                        .inflate(R.layout.one_image_card_item, parent, false);
                return new OneImageCardViewHolder(view);
            case NewsCardItemDataModel.THREE_IMAGE_TYPE:
                view = LayoutInflater.from(parent.getContext())
                        .inflate(R.layout.three_images_card_item, parent, false);
                return new ThreeImageCardViewHolder(view);
            default:
                return null;
        }
    }

    @Override
    public void onBindViewHolder(@NotNull final RecyclerView.ViewHolder holder, final int position) {
        NewsCardItemDataModel object = mDataModelList.get(position);

        if (object != null) {
            switch (object.getItemType()) {
                case NewsCardItemDataModel.NO_IMAGE_TYPE:
                    NoImageCardViewHolder holder1 = (NoImageCardViewHolder) holder;
                    holder1.bindData(object, mContext);
                    break;

                case NewsCardItemDataModel.ONE_IMAGE_TYPE:
                    OneImageCardViewHolder holder2 = (OneImageCardViewHolder) holder;
                    holder2.bindData(object, mContext);
                    break;
                case NewsCardItemDataModel.THREE_IMAGE_TYPE:
                    ThreeImageCardViewHolder holder3 = (ThreeImageCardViewHolder) holder;
                    holder3.bindData(object, mContext);
                    break;
                default:
                    break;
            }
        }
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
        }

        public void bindData(NewsCardItemDataModel dataModel, Context context) {
            Picasso.get().load(dataModel.getAvatar()).into(mAvatarView);
            // deal with title's length and subtitle's length
            String title = dataModel.getTitle();
            if (title.length() > 15) {
                title = title.substring(0, 16);
                title += "...";
            }
            mTitleTextView.setText(title);
            String subTitle = dataModel.getSubTitle();
            if (subTitle.length() > 70) {
                subTitle = subTitle.substring(0, 69);
                subTitle += "...";
            }
            mSubTitleTextView.setText(subTitle);
            mBottomTextView.setText(dataModel.getBottomText());
            mSourceUrlTextView.setText(dataModel.getDetailUrl());
        }
    }

    // One image style card view holder
    class OneImageCardViewHolder extends RecyclerView.ViewHolder {
        private final ImageView mAvatarView;
        private final TextView mTitleTextView;
        private final TextView mSubTitleTextView;
        private final TextView mBottomTextView;
        private final TextView mSourceUrlTextView;
        private final ImageView mCardImageView;

        public OneImageCardViewHolder(@NonNull View itemView) {
            super(itemView);
            mAvatarView = itemView.findViewById(R.id.image_view_card_avatar);
            mTitleTextView = itemView.findViewById(R.id.text_view_card_title);
            mSubTitleTextView = itemView.findViewById(R.id.text_view_card_subtitle);
            mBottomTextView = itemView.findViewById(R.id.text_view_card_bottom_text);
            mSourceUrlTextView = itemView.findViewById(R.id.text_view_source_url);
            mCardImageView = itemView.findViewById(R.id.image_view_card_image);
        }

        public void bindData(NewsCardItemDataModel dataModel, Context context) {
            Picasso.get().load(dataModel.getAvatar()).into(mAvatarView);
            Picasso.get().load(dataModel.getImageDrawable()).into(mCardImageView);
            String title = dataModel.getTitle();
            // deal with title's length and subtitle's length
            if (title.length() > 15) {
                title = title.substring(0, 14);
                title += "...";
            }
            mTitleTextView.setText(title);
            String subTitle = dataModel.getSubTitle();
            if (subTitle.length() > 70) {
                subTitle = subTitle.substring(0, 69);
                subTitle += "...";
            }
            mSubTitleTextView.setText(subTitle);
            mBottomTextView.setText(dataModel.getBottomText());
            mSourceUrlTextView.setText(dataModel.getDetailUrl());
        }
    }

    // Three image style card view holder
    class ThreeImageCardViewHolder extends RecyclerView.ViewHolder {
        private final ImageView mAvatarView;
        private final TextView mTitleTextView;
        private final TextView mSubTitleTextView;
        private final TextView mBottomTextView;
        private final TextView mSourceUrlTextView;
        private final ImageView mCardImageView1;
        private final ImageView mCardImageView2;
        private final ImageView mCardImageView3;

        public ThreeImageCardViewHolder(@NonNull View itemView) {
            super(itemView);
            mAvatarView = itemView.findViewById(R.id.image_view_card_avatar);
            mTitleTextView = itemView.findViewById(R.id.text_view_card_title);
            mSubTitleTextView = itemView.findViewById(R.id.text_view_card_subtitle);
            mBottomTextView = itemView.findViewById(R.id.text_view_card_bottom_text);
            mSourceUrlTextView = itemView.findViewById(R.id.text_view_source_url);
            mCardImageView1 = itemView.findViewById(R.id.image_view_image_1);
            mCardImageView2 = itemView.findViewById(R.id.image_view_image_2);
            mCardImageView3 = itemView.findViewById(R.id.image_view_image_3);
        }

        public void bindData(NewsCardItemDataModel dataModel, Context context) {
            Picasso.get().load(dataModel.getAvatar()).into(mAvatarView);
            ArrayList<String> images = dataModel.getThreeImageDrawable();
            Picasso.get().load(images.get(0)).into(mCardImageView1);
            Picasso.get().load(images.get(1)).into(mCardImageView2);
            Picasso.get().load(images.get(2)).into(mCardImageView3);
            // deal with title's length and subtitle's length
            String title = dataModel.getTitle();
            if (title.length() > 15) {
                title = title.substring(0, 16);
                title += "...";
            }
            mTitleTextView.setText(title);
            String subTitle = dataModel.getSubTitle();
            if (subTitle.length() > 70) {
                subTitle = subTitle.substring(0, 69);
                subTitle += "...";
            }
            mSubTitleTextView.setText(subTitle);
            mBottomTextView.setText(dataModel.getBottomText());
            mSourceUrlTextView.setText(dataModel.getDetailUrl());
        }
    }
}
```

### `ui/page/newsChannel/newsChannelFragment.java`

在需要渲染的 Fragment，添加渲染 Code。

```java
package com.example.toutiao.ui.page.newsChannel;

// ...

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.toutiao.R;
import com.example.toutiao.ui.card.newsCardList.NewsCardAdapter;
import com.example.toutiao.ui.card.newsCardList.NewsCardItemDataModel;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link NewsChannelFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class NewsChannelFragment extends Fragment {
    private String mCategory;
    private int mIndex;
    
    private RecyclerView mCardListRecyclerView;
    private NewsCardAdapter mCardListAdapter;
    private RecyclerView.LayoutManager mCardListLayoutManager;
    private final List<NewsCardItemDataModel> mCardDataModelList = new ArrayList<>();

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
        // ...
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_news_channel, container, false);
        // ...
        
        for (int i = 0; i < 10; i++) {
            int type = i % 3;
            String newsId = i;
            String newsTitle = "你好";
            String newsAbstract = "我是卡片";
            int newsCommentsCount = 100;
            String newsSource = "https://example.com/e.png";
            String newsMediaAvatarUrl = "https://example.com/e.png";
            String newsSourceUrl = "www.google.com";

            if (type == NO_IMAGE_TYPE) {
                mCardDataModelList.add(new NewsCardItemDataModel(
                        NO_IMAGE_TYPE,
                        newsId,
                        newsTitle,
                        newsAbstract,
                        newsCommentsCount,
                        newsSource,
                        newsMediaAvatarUrl,
                        newsSourceUrl
                ));
            } else if (type == ONE_IMAGE_TYPE) {
                String middleImage = "https://example.com/e.png";
                mCardDataModelList.add(new NewsCardItemDataModel(
                        ONE_IMAGE_TYPE,
                        newsId,
                        newsTitle,
                        newsAbstract,
                        newsCommentsCount,
                        newsSource,
                        newsMediaAvatarUrl,
                        newsSourceUrl,
                        middleImage
                ));

            } else if (type == THREE_IMAGE_TYPE) {
                ArrayList<String> newsThreeImage = new ArrayList()<>;
                newsThreeImage.add("https://example.com/e.png");
                newsThreeImage.add("https://example.com/e.png");
                newsThreeImage.add("https://example.com/e.png");
                mCardDataModelList.add(new NewsCardItemDataModel(
                        THREE_IMAGE_TYPE,
                        newsId,
                        newsTitle,
                        newsAbstract,
                        newsCommentsCount,
                        newsSource,
                        newsMediaAvatarUrl,
                        newsSourceUrl,
                        newsThreeImage
                ));
            }
        }
        // cardList
        mCardListRecyclerView = view.findViewById(R.id.recycler_view_card_list);

        // use this setting to improve performance if you know that changes
        // in content do not change the layout size of the RecyclerView
        mCardListRecyclerView.setHasFixedSize(true);

        // use a linear layout manager
        mCardListLayoutManager = new LinearLayoutManager(getContext());
        mCardListRecyclerView.setLayoutManager(mCardListLayoutManager);

        // specify an adapter and pass in our data model list
        mCardListAdapter = new NewsCardAdapter(mCardDataModelList, getContext());
        mCardListRecyclerView.setAdapter(mCardListAdapter);
        return view;
    }
}
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

