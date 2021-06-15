# Android Java - 簡易今日頭條 - 簡易今日頭條新聞數據請求與卡片渲染


## 前言

上一篇文章中我介紹了如何[在 RecyclerView 中渲染三種不同的卡片樣式](https://huangno1.github.io/android_java_recycler_view_different_cards/)，這次我們加上了**數據請求渲染**，使該頁面是動態加載的。

## Display

## 項目倉庫

[簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

## 具體實現

關於卡片渲染細節我已經在 **RecyclerView 顯示多種寫過了**，所以這裡專注於怎麼使用 OkHttp 進行數據請求，與重新回到主 UI Thread 進行卡片渲染。

### `models/news/NewsDataModel.java`

這個類是為了請求回來的數據做一個數據模型，方便後面將數據添入 `NewsCardItemDataModel`，使邏輯更加清晰。這裡一樣有三種構造函數，分別代表三種不同的卡片類型。

```java
package com.example.toutiao.models.news;

import java.util.ArrayList;

/**
 * Data Model Class for news After requesting
 */

public class NewsDataModel {
    public static final int NO_IMAGE_TYPE = 0;
    public static final int ONE_IMAGE_TYPE = 1;
    public static final int THREE_IMAGE_TYPE = 2;
    // same
    private int mNewsCardStyleType; // three different card style
    private String mNewsId; // id
    private String mNewsTitle; // news title
    private String mNewsAbstract; // news abstract
    private int mNewsCommentsCount; // comments count
    private String mNewsSource; // author name
    private String mNewsMediaAvatarUrl; // author avatar
    private String mNewsSourceUrl; // detail page url
    // different
    private String mNewsImageUrl; // one image card style
    private ArrayList<String> mNewsThreeImage; // three image card style

    // no image style constructor
    public NewsDataModel(
            int newsCardStyleType,
            String newsId,
            String newsTitle,
            String newsAbstract,
            int newsCommentsCount,
            String newsSource,
            String newsMediaAvatarUrl,
            String newsSourceUrl
    ) {
        mNewsCardStyleType = newsCardStyleType;
        mNewsId = newsId;
        mNewsTitle = newsTitle;
        mNewsAbstract = newsAbstract;
        mNewsCommentsCount = newsCommentsCount;
        mNewsSource = newsSource;
        mNewsMediaAvatarUrl = newsMediaAvatarUrl;
        mNewsSourceUrl = newsSourceUrl;
    }

    // one image style constructor
    public NewsDataModel(
            int newsCardStyleType,
            String newsId,
            String newsTitle,
            String newsAbstract,
            int newsCommentsCount,
            String newsSource,
            String newsMediaAvatarUrl,
            String newsSourceUrl,
            String newsImageUrl
    ) {
        mNewsCardStyleType = newsCardStyleType;
        mNewsId = newsId;
        mNewsTitle = newsTitle;
        mNewsAbstract = newsAbstract;
        mNewsCommentsCount = newsCommentsCount;
        mNewsSource = newsSource;
        mNewsMediaAvatarUrl = newsMediaAvatarUrl;
        mNewsSourceUrl = newsSourceUrl;
        mNewsImageUrl = newsImageUrl;
    }

    // three image style constructor
    public NewsDataModel(
            int newsCardStyleType,
            String newsId,
            String newsTitle,
            String newsAbstract,
            int newsCommentsCount,
            String newsSource,
            String newsMediaAvatarUrl,
            String newsSourceUrl,
            ArrayList<String> newsThreeImage
    ) {
        mNewsCardStyleType = newsCardStyleType;
        mNewsId = newsId;
        mNewsTitle = newsTitle;
        mNewsAbstract = newsAbstract;
        mNewsCommentsCount = newsCommentsCount;
        mNewsSource = newsSource;
        mNewsMediaAvatarUrl = newsMediaAvatarUrl;
        mNewsSourceUrl = newsSourceUrl;
        mNewsThreeImage = newsThreeImage;
    }

    public int getNewsCardStyleType() {
        return mNewsCardStyleType;
    }

    public void setNewsCardStyleType(int newsCardStyleType) {
        mNewsCardStyleType = newsCardStyleType;
    }

    public String getNewsId() {
        return mNewsId;
    }

    public void setNewsId(String newsId) {
        mNewsId = newsId;
    }

    public String getNewsTitle() {
        return mNewsTitle;
    }

    public void setNewsTitle(String newsTitle) {
        mNewsTitle = newsTitle;
    }

    public String getNewsAbstract() {
        return mNewsAbstract;
    }

    public void setNewsAbstract(String newsAbstract) {
        mNewsAbstract = newsAbstract;
    }

    public int getNewsCommentsCount() {
        return mNewsCommentsCount;
    }

    public void setNewsCommentsCount(int newsCommentsCount) {
        mNewsCommentsCount = newsCommentsCount;
    }

    public String getNewsSource() {
        return mNewsSource;
    }

    public void setNewsSource(String newsSource) {
        mNewsSource = newsSource;
    }

    public String getNewsMediaAvatarUrl() {
        return mNewsMediaAvatarUrl;
    }

    public void setNewsMediaAvatarUrl(String newsMediaAvatarUrl) {
        mNewsMediaAvatarUrl = newsMediaAvatarUrl;
    }

    public String getNewsSourceUrl() {
        return mNewsSourceUrl;
    }

    public void setNewsSourceUrl(String newsSourceUrl) {
        mNewsSourceUrl = newsSourceUrl;
    }

    public String getNewsImageUrl() {
        return mNewsImageUrl;
    }

    public void setNewsImageUrl(String newsImageUrl) {
        mNewsImageUrl = newsImageUrl;
    }

    public ArrayList<String> getNewsThreeImage() {
        return mNewsThreeImage;
    }

    /*
     * add a image to mNewsThreeImage array list
     */
    public void setNewsThreeImage(String newsImageUrl) {
        this.mNewsThreeImage.add(newsImageUrl);
    }
}
```

### `ui/page/newsChannel/newsChannelFragment.java`

這裡是我們需要進行新聞內容請求的 Fragment。我使用的是 OkHttp 的方法，如果不知道 OkHttp 可以去 Github 看看 [square/okhttp - github](https://github.com/square/okhttp)。

引入依賴需要在 `build.gradle` 中加上下面一段話：

```
dependencies {
	// ...
    implementation 'com.squareup.okhttp3:okhttp:4.9.1'
}
```

**注意：為了能夠進行網路請求需要在 `/manifests/AndroidManifest.xml` 中加上  `<uses-permission android:name="android.permission.INTERNET" />` 這段話。**

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.toutiao">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
// ...
```


下面的 Code 中我分別使用 `getUserAgent()` 固定 UA，`getInitNews()` 請求新聞數據，`initRenderCardList()` 做數據渲染，`dealWithResponseBody()` 處理請求回來的 `ResponseBody`，`dealWithNewsObject()` 處理每個新聞列表，`runThread()` 負責請求後回到在主 UI 線程裡面進行渲染（也就是`initRenderCardList()`），這裡的注意點有：

1. 除了固定 UA 外，需要將請求回來的 **`Response` 中 `Header` 的 `Set-Cookie`** 加入下一次請求中的 Cookie，這樣避免了**請求回來的數據與原數據重複性**。

2. 請求必須使用多線程的方式進行異步請求，不能在 UI 主線程請求，這是新的 Android 規定，所以我建議可以使用 **`AsyncTask`** 或是 **Okhttp 的異步回調方法**。我下面的 Example 是使用了後者。

3. OkHttp 中**異步請求的 `response.body().string()` 只能使用一次**，使用完一次後就會將回應 Body 刪除節省資源（我也不知道為什麼要這樣設計），所以需要先存成 `String` 類型，再接著使用。

4. 注意**處理每一次數據，檢查是否有些數據不完整**，或是 ResponseBody 是空的情況都需要考慮，如果沒有考慮到，就會經常在運行項目時**產生 Crash**。

```java
package com.example.toutiao.ui.page.newsChannel;

// ...

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import static com.example.toutiao.ui.card.newsCardList.NewsCardItemDataModel.NO_IMAGE_TYPE;
import static com.example.toutiao.ui.card.newsCardList.NewsCardItemDataModel.ONE_IMAGE_TYPE;
import static com.example.toutiao.ui.card.newsCardList.NewsCardItemDataModel.THREE_IMAGE_TYPE;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link NewsChannelFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class NewsChannelFragment extends Fragment {
    private final static String BASE_URL =
            "https://www.toutiao.com/api/pc/feed/?max_behot_time=%d&category=%s";
    private static final String[] CATEGORY_ATTR = new String[]{
            "__all__",
            "news_tech",
//            "news_image",
            "news_hot",
            "news_entertainment",
            "news_game",
            "news_sports",
            "news_finance",
            "digital"
    };
    private final static String DEFAULT_AVATAR =
            "https://img.88icon.com/download/jpg/20200901/84083236c883964781afea41f1ea4e9c_512_511.jpg!88bg";
    private final static String DEFAULT_IMAGE =
            "https://www.asiapacdigital.com/Zh_Cht/img/ap/services/reseller/TouTiao_1.jpg";
    private ArrayList<NewsDataModel> mNewsDataModelList = new ArrayList<>();
    private PageViewModel mPageViewModel;
    private RecyclerView mCardListRecyclerView;
    private NewsCardAdapter mCardListAdapter;
    private RecyclerView.LayoutManager mCardListLayoutManager;
    private Boolean mIsScrollToTop = false;
    private final List<NewsCardItemDataModel> mCardDataModelList = new ArrayList<>();
    private String mCategory;
    private int mIndex;
    private boolean mIsRefresh = false;
    private boolean mIsLoadMore = false;
    private boolean mIsLoadingFail = false;
    private int mMaxBehotTime = 0;
    private String mCookie;

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

        TextView mSectionLabelTextView = view.findViewById(R.id.text_view_section_label);

            try {
                // init
                getInitNews();
            } catch (IOException | JSONException e) {
                e.printStackTrace();
            }

        mPageViewModel.getCategory().observe(getViewLifecycleOwner(), new Observer<String>() {
            @Override
            public void onChanged(@Nullable String s) {
                mSectionLabelTextView.setText(s);
            }
        });

        return view;
    }

    // render the recycler view card list when init and refreshing
    public void initRenderCardList() {
        Log.v("start init render", "render init card, news list size: " + mNewsDataModelList.size());
        for (int i = 0; i < mNewsDataModelList.size(); i++) {
            int type = mNewsDataModelList.get(i).getNewsCardStyleType();
            String newsId = mNewsDataModelList.get(i).getNewsId();
            String newsTitle = mNewsDataModelList.get(i).getNewsTitle();
            String newsAbstract = mNewsDataModelList.get(i).getNewsAbstract();
            int newsCommentsCount = mNewsDataModelList.get(i).getNewsCommentsCount();
            String newsSource = mNewsDataModelList.get(i).getNewsSource();
            String newsMediaAvatarUrl = mNewsDataModelList.get(i).getNewsMediaAvatarUrl();
            String newsSourceUrl = mNewsDataModelList.get(i).getNewsSourceUrl();

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
                String middleImage = mNewsDataModelList.get(i).getNewsImageUrl();
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
                ArrayList<String> newsThreeImage = mNewsDataModelList.get(i).getNewsThreeImage();
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
        mLoadingAnimationView.setVisibility(View.GONE);
        mScreenMaskView.setVisibility(View.GONE);
        mCardListRefreshLayout.finishRefreshing();
        mCardListAdapter = new NewsCardAdapter(mCardDataModelList, getContext());
        mCardListRecyclerView.setAdapter(mCardListAdapter);

        mIsRefresh = false;
    }

    private String getUserAgent() {
        String userAgent = "";
        try {
            userAgent = WebSettings.getDefaultUserAgent(getContext());
        } catch (Exception e) {
            userAgent = System.getProperty("https.agent");
        }
        StringBuffer sb = new StringBuffer();
        for (int i = 0, length = userAgent.length(); i < length; i++) {
            char c = userAgent.charAt(i);
            if (c <= '\u001f' || c >= '\u007f') {
                sb.append(String.format("\\u%04x", (int) c));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    /**
     * a methods to init card list
     *
     * @throws IOException
     * @throws JSONException
     */
    public void getInitNews() throws IOException, JSONException {
        // init data
        mNewsDataModelList.clear();
        mCardDataModelList.clear();
        mLoadingAnimationView.setVisibility(View.VISIBLE);
        mMaxBehotTime = 0;
        // setting request
        OkHttpClient client = new OkHttpClient();
        Log.v("request url", String.format(Locale.ENGLISH, BASE_URL, mMaxBehotTime, CATEGORY_ATTR[mIndex]));
        Request request = new Request.Builder()
                .get()
                .url(String.format(Locale.ENGLISH, BASE_URL, mMaxBehotTime, CATEGORY_ATTR[mIndex]))
                .addHeader("User-Agent", getUserAgent())
                .build();
        Call call = client.newCall(request);

        call.enqueue(new Callback() {
            @Override
            public void onFailure(@NotNull Call call, @NotNull IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(@NotNull Call call, @NotNull final Response response) throws IOException {
                Log.v("json status", " " + response.code());
                Log.v("json body", " " + (response.body() != null));
                String jsonData = response.body().string();
                // deal with request body
                dealWithResponseBody(jsonData);
                mCookie = response.header("Set-Cookie");
                Log.v("cookie", "set cookie: " + mCookie);
            }
        });
    }

    /**
     * @param jsonData
     */
    public void dealWithResponseBody(String jsonData) {
        // avoid that jsonData is null
        if(jsonData.length() < 1) {
            mIsLoadingFail = true;
            // run on main ui thread
            runThread();
            return;
        }
        Log.v("deal with response", "string to JsonObject");
        Log.v("deal with response", "json data\n" + jsonData);
        JsonObject result = JsonParser.parseString(jsonData).getAsJsonObject();
        Log.v("deal with response", "result, before max_behot_time " + mMaxBehotTime);
        Log.v("deal with response", String.valueOf(result.getAsJsonObject("next").has("max_behot_time")));
        mMaxBehotTime = result.getAsJsonObject("next").get("max_behot_time").getAsInt();
        Log.v("deal with response", "After max_behot_time : " + mMaxBehotTime + " get news object");
        JsonArray newsData = result.getAsJsonArray("data");
        for (int i = 0; i < newsData.size(); i++) {
            Log.v("deal with response", "newsObjects " + i);
            try {
                dealWithNewsObject(newsData.get(i).getAsJsonObject());
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        runThread();
    }

    /**
     * running on main UI thread to render card list
     */
    private void runThread() {
        Handler handler = new Handler(Looper.getMainLooper());

        new Thread() {
            public void run() {
                // init & refresh
                handler.post(() -> initRenderCardList());
            }
        }.start();
    }

    /**
     * a methods to transfer JsonObject to NewsDataModel
     *
     * @param object
     * @throws JSONException
     */
    public void dealWithNewsObject(JsonObject object) throws JSONException {
        NewsDataModel temp;
        // id
        Log.v("deal with news object", "news_id " + object.get("group_id").getAsString());
        String newsId = object.get("group_id").getAsString();
        // title
        Log.v("deal with news object", "news_title " + object.get("title").getAsString());
        String newsTitle = object.get("title").getAsString();
        // remove \r \n \t
        newsTitle = newsTitle.replaceAll("\r|\n|\t", "");
        // abstract
        String newsAbstract = newsTitle;
        Log.v("deal with news object", "news_abstract " + object.has("abstract"));
        if (object.has("abstract")) {
            newsAbstract = object.get("abstract").getAsString();
            // remove \r \n \t
            newsAbstract = newsAbstract.replaceAll("\r|\n|\t", "");
        }
        // comments count
        Log.v("deal with news object", "news_comments_count " + object.has("comments_count"));
        int newsCommentsCount = 0;
        if (object.has("comments_count")) {
            newsCommentsCount = object.get("comments_count").getAsInt();
        }
        // news source
        Log.v("deal with news object", "news_source " + object.get("source").getAsString());
        String newsSource = object.get("source").getAsString();
        // news media avatar url
        String newsMediaAvatarUrl = DEFAULT_AVATAR;
        if (object.has("media_avatar_url")) {
            newsMediaAvatarUrl = "https:" + object.get("media_avatar_url").getAsString();
        }
        // news source url
        Log.v("deal with news object", "news_source_url " + object.get("source_url").getAsString());
        String newsSourceUrl = object.get("source_url").getAsString();

        Log.v("deal with news object", "have image_list " + object.has("image_list"));
        Log.v("deal with news object", "single_mode " + object.get("single_mode").getAsBoolean());
        // three image style
        if (object.has("image_list")) {
            JsonArray imageList = object.get("image_list").getAsJsonArray();
            ArrayList<String> newsThreeImage = new ArrayList<>();

            // the Json Array is not null
            if(imageList.size() < 3) {
                for (int i = 0; i < 3; i++) {
                    // avoid url is null
                    newsThreeImage.add(DEFAULT_IMAGE);
                }
            } else {
                for (int i = 0; i < 3; i++) {
                    // avoid url is null
                    String url = imageList.get(i).getAsJsonObject().get("url").getAsString();
                    if(url.length() == 0) {
                        url = DEFAULT_IMAGE;
                    } else {
                        url = "https:" + url;
                    }
                    newsThreeImage.add(url);
                }
            }
            temp = new NewsDataModel(
                    NewsDataModel.THREE_IMAGE_TYPE,
                    newsId,
                    newsTitle,
                    newsAbstract,
                    newsCommentsCount,
                    newsSource,
                    newsMediaAvatarUrl,
                    newsSourceUrl,
                    newsThreeImage
            );
        }
        // one image style
        else if (object.get("single_mode").getAsBoolean()) {
            String middleImage = "https:" + object.get("image_url").getAsString();

            temp = new NewsDataModel(
                    NewsDataModel.ONE_IMAGE_TYPE,
                    newsId,
                    newsTitle,
                    newsAbstract,
                    newsCommentsCount,
                    newsSource,
                    newsMediaAvatarUrl,
                    newsSourceUrl,
                    middleImage
            );
        }
        // no image style
        else {
            temp = new NewsDataModel(
                    NewsDataModel.NO_IMAGE_TYPE,
                    newsId,
                    newsTitle,
                    newsAbstract,
                    newsCommentsCount,
                    newsSource,
                    newsMediaAvatarUrl,
                    newsSourceUrl
            );
        }
        mNewsDataModelList.add(temp);
    }
}
```

## Reference

- [簡易今日頭條 - Github](https://github.com/HuangNO1/TouTiao_Simple_Android_App)

