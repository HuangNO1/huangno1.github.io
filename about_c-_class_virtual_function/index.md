# C++ - 關於多態中的虛函數


## 前言

大一自己寫 C++ 時碰到的問題，一直沒發表文章，現在趁有空寫一下。

## 關於多態與虛函數

我的理解是多態就是一個類（class）演伸出多種物件（Object），父類相當於模板藍圖的功能。

我們先看一下虛函數嘴臉長怎樣：

在下面的例子中是一個 Base Class（基類、父類），如果函數前面宣告有添加 `virtual` 就是虛函數。

```c++
class Shape
{
    public:
        virtual string toString() const;
        virtual double getArea() const;
}
```

下面是一個 Circle 子類（superclass）（超生類、派生類），引入 Circle 的 **`getArea()` 和 `toString()` 是虛函數**，我們現在是在子類中重寫（重定義）類的虛構函數（此時你可以將父類的虛構函數想像成模板）。

```c++
class Circle : public Shape
{
    private:
        double radius;
    public:
        Circle();
        Circle(double);
        double getRadius() const;
        void setRadius(double);
        double getArea() const;
        string toString() const;
}
```

實際當我們在使用虛構函數時，是把它當作跳板，去自動便是哪個函式是哪個函式，e.g. 有多種圖形（園、三角），每種圖形都有面積，虛構函數是當你在使用引用或是指針 (Pointer) 指向基類時，它能根據類自動辨識是哪個圖形（很抽象）。

舉個例子，下面的 Code 引用上面例子的 `Shape` 類，在下面的 **`printShape()` 傳入的 `Shape` 類型參數是一個子類繼承父類 `Shape` 的物件（對象）**，因為 `Circle` 或是 `Triangle` 都是繼承自 `Shape` 的類，所以當 `Circle` 和 `Triangle` 傳入該函數時，你不用特別指定是哪個子類中的 `getArea()` 函數，會自動判定是哪個子類的物件方法。

```c++
void printShape(const Shape &s, double &total)
{
    total += s.getArea();
    cout << s.getArea() << endl;
}
```
