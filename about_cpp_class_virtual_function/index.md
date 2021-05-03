# C++ - 關於多態中的虛函數與純虛函數


## 前言

大一自己寫 C++ 時碰到的問題，一直沒發表文章，現在趁有空寫一下。

## 多態與虛函數

> P.S. 大陸叫對象，台灣叫物件。

我的理解是多態就是一個類（class）演伸出多種物件（Object），父類相當於模板藍圖的功能。**虛函數是用來子類繼承後能夠複寫的函數**。

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

舉個例子，下面的 Code 引用上面例子的 `Shape` 類，在下面的 **`printShape()` 傳入的 `Shape` 類型參數是一個子類繼承父類 `Shape` 的物件（對象）**，因為 `Circle` 或是 `Triangle` 都是繼承自 `Shape` 的類，所以當 `Circle` 和 `Triangle` 傳入該函數時，你**不用特別指定是哪個子類中的 `getArea()` 函數，會自動判定是哪個子類的物件方法**。

```c++
void printShape(const Shape &s, double &total)
{
    total += s.getArea();
    cout << s.getArea() << endl;
}
```

## 虛函數與純虛函數

先要有些概念：

- 定義一個函數為虛函數，不代表函數為不被實現的函數。
- 定義它為虛函數是為了允許父類的指針來調用子類這個函式。
- 定義一個函數為純虛函數，才代表函數沒有被實現。

下面是的例子中，**加上 `= 0` 就代表它是純虛函數，無法創造 Shape 類型的對象**，如果你在 `main()` 函數中打上 `Shape shape;` 聲明一個 Shape 類型的對象，編譯會報錯。

```c++
class Shape
{
    public:
        virtual string toString() const = 0;
        virtual double getArea() const = 0;
}
```

那為什麼我們要加上 `= 0` 變成純虛函數呢？你可以想像 "圖形" 是個抽象的總體概稱，圖形可以衍生出圓形、梯形...等，如果可以用 "圖形" 創造出對象，也就是一個對象類型是 "圖形"，那豈不是很荒謬？**所以我們加入純虛函數使 "圖形" 無法創造對象，使其合理化***。

> 注意：上面 Code 中 `const = 0`，`const` 與 `= 0` 毫無關係，所以別誤解宣告純虛函數時一定要在 `= 0` 前面加上 `const`。

虛函數與純虛函數的差別就在這個**類能不能被用來創造自己的物件（Object）**，都可以拿做父類繼承。

## 補充

如上的 `Shape` 父類，關於子類虛函數的寫法：

下面的子類虛函數前面加上 `virtual` 聲明。

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
        virtual double getArea() const;
        virtual string toString() const;
}
```

有些人會疑惑子類有沒有 `virtual` 有差嗎？答案是沒有差，**不管有沒有加上 `virtual` 都是繼承來的虛函數**，兩種宣告法都可以，但是**加上 `virtual` 能夠增加 Code 的易讀性，所以建議加上**。

## override

`override` 保留字適用在子類的虛函數上，用來避免繼承錯誤。

沒加上 `override` 前：

我故意在 `Circle` 的 `getArea()` 故意改成 `getArea233()`，編譯器不會報錯，因為會被認為這不是繼承的。

```c++
class Shape
{
    public:
        virtual string toString() const;
        virtual double getArea() const;
}
class Circle : public Shape
{
    private:
        double radius;
    public:
        Circle();
        Circle(double);
        double getRadius() const;
        void setRadius(double);
        virtual double getArea233() const;
        virtual string toString() const;
}
```

但如果我加上 `override` 保留字：

編譯器會報錯，可以把 override 當成把這函數標示是繼承來的函數。

```c++
class Shape
{
    public:
        virtual string toString() const;
        virtual double getArea() const;
}
class Circle : public Shape
{
    private:
        double radius;
    public:
        Circle();
        Circle(double);
        double getRadius() const;
        void setRadius(double);
        virtual double getArea233() const override; // 報錯
        virtual string toString() const override;
}
```
