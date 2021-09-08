---
title: Algorithm Of Recursion Basic Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/banner/0.jpg'
coverImg: /medias/banner/0.jpg
toc: true
date: 2021-09-02 23:45:40
top: false
cover: false
summary: 递归算法基础知识简介
categories: Algorithm
keywords: [Algorithm, Recursion]
tags: Algorithm
---



# 递归

## 一、概述

递归本身带有一定的抽象性质，有时候确实有些难以理解。但是我们是可以按照套路来求解问题的。

- 找重复（子问题）
  - 1、找到一种划分方法（比如 切蛋糕 思维）
  - 2、找到递推公式或者等价转换
  - 这个过程一直是在划分子问题，将父问题的求解转换为求解一系列等价的子问题
- 找重复中的变化量 —— 变化的量作为参数
- 找参数变化趋势 —— 设计出口



注意：递归问题

- 可分解为：直接量 + 小规模子问题
- 可分解为：多个小规模子问题



## 二、练习

### 1、循环改递归

循环处理：求一个数组的和，用循环很简单，直接遍历求解

改为递归：



思路：切分数组

- 划分子问题：将数组每个数求和转变为前一个数和后面数组的和进行求和
- 变化量：数组的下标
- 变化趋势：移动到最后即 length - 1 时停止移动，这里就是出口



```java
public class one_循环改递归求和 {

    public static void main(String[] args) {

        int[] arr = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        int result = 0;

        // 1. 方式一 循环
        result = loopSum(arr);
        System.out.println(result);
        // 2. 方式二 递归
        result = recursionSum(arr);
        System.out.println(result);
    }

    private static int recursionSum(int[] arr) {

        // 设计递归函数，切蛋糕思维，将每个数的求和改为 前面的数和后面数组的和进行求和
        return recursionSum(arr, 0);
    }

    private static int recursionSum(int[] arr, int len) {

        // 出口
        if (len >= arr.length - 1)
            return arr[len];

        // 递归函数
        return arr[len] + recursionSum(arr, len + 1);
    }

    private static int loopSum(int[] arr) {

        int res = 0;

        for (int i : arr) {
            res += i;
        }

        return res;
    }
}
```



### 2、打印阶乘

阶乘公式：n! = n * (n - 1) * (n - 2) * .... 1



递归解题思路：找递归公式

- n = 1：n! = 1
- n = 2：n! = 2 * 1
- n = 3：n! = 3 * 2 * 1



- 划分子问题：一个数的阶乘可以划分为多个数相乘  `f(n) = n * f(n - 1)`
- 变化的量：因数递减
- 变化趋势：到 1 为止



```java
public class two_阶乘 {

    public static void main(String[] args) {

        int target = 10;

        // 1. 常规解法
        System.out.println(genericSolution(target));

        // 2. 递归解法
        System.out.println(recursionSolution(target));
    }

    private static int recursionSolution(int target) {
				
      	// 特殊情况
        if (target == 0)
            return 0;
				// 出口
        if (target == 1)
            return target;
      	// 递推公式
        return target * recursionSolution(target - 1);
    }

    private static int genericSolution(int target) {

        if (target == 0)
            return 0;

        int temp = 1;
        for (int i = target; i > 0; i--) {
            temp = temp * i;
        }

        return temp;
    }
}
```



### 3、字符串反转

递归解题思路：切分字符串

- 划分子问题：反转字符串，可以划分为字符串从后往前拼接成一个新串
- 变化量：指针从字符串末尾移动到头部
- 变化趋势：最后为 0 时返回首字符





```java
public class Three_反转字符串 {

    public static void main(String[] args) {

        String str = "abcdefg";

        String res = reverseStr(str);

        System.out.println(res);
    }

    private static String reverseStr(String str) {
        return reverseStr(str, str.length() - 1);
    }

    private static String reverseStr(String str, int index) {

        if (index == 0)
            return str.charAt(index) + "";

        return str.charAt(index) + reverseStr(str, index - 1);
    }
}
```



### 4、斐波那契数列

数列：1，1，2，3，5，8，13…………

该数列有非常明显的特点，从第三项开始每一项都是前两项的和。

我们可以得出递推公式来计算第 n 项的值：

|  n   | f(n) |         值          |
| :--: | :--: | :-----------------: |
|  1   | f(1) |          1          |
|  2   | f(2) |          1          |
| ...  | ...  |         ...         |
|  n   | f(n) | f(n - 1) + f(n - 2) |

```java
public class Four_fibozacci {

    public static void main(String[] args) {

        // 菲波扎契数列：1，1，2，3，5，8，。。。。
        // 计算数列的第 n 项的值
        int n = 10;
        System.out.println(fibozacci(n));

        for (int i = 1; i <= 10; i++) {
            System.out.printf("%d\t", fibozacci(i));
        }
    }

    private static int fibozacci(int n) {

        if (n == 1 || n == 2) {
            return 1;
        }

        return fibozacci(n - 1) + fibozacci(n - 2);
    }
}
```



但是注意这种递归的效率是非常低下的，因为当我们将上面这个递归拆分到最底下的时候，会发现都是 1 的累加，做了大量重复计算。



### 5、最大公约数

递归解题思路：

- 划分：等价转换      f(m, n) = f(n, m % n)



```java
public class Five_gcd {

    public static void main(String[] args) {
        
        int m = 10;
        int n = 95;
        
        // 1. 方式一 暴力破解
        System.out.println(method1(m, n));
        
        // 2. 方式二 辗转相除法
        System.out.println(method2(m, n));
        
        // 3. 方式三 更相减损法
        System.out.println(method3(m, n));
        
        // 4. 方式四 利用数学原理优化暴力破解
        System.out.println(method4(m, n));
    }

    // 暴力破解
    private static int method1(int m, int n) {
        
        // 思路：两个数的最大公约数不会大于两者中的较小值
        if (m <= 0 || n <= 0) {
            throw new IllegalArgumentException("m and n must be positive integers");
        }
        
        if (m == n)
            return m;
        
        int min = m > n ? n : m;

        int gcd = 0;

        for (int i = min; i > 0; i--) {
            if (m % i ==0 && n % i == 0) {
                gcd = i;
                break;
            }
        }
        
        return gcd;
    }

    // (递归)辗转相除法
    // 递归解题思路：f(m, n) == f(n, m % n)
    private static int method2(int m, int n) {
        
        int z = m % n;
        if (z == 0) {
            return n;
        }
        
        return method2(n, z);
    }
    
    // 更相减损法
    // 递归解题思路：m > n, f(m, n) == f(m - n, n);  m < n, f(m, n) == f(n - m, m)
    private static int method3(int m, int n) {
        
        if (m == n) {
            return m;
        } else if (m > n)
            return method3(m - n, n);
        else 
            return method3(n - m, m);
    }
    
    // 改进暴力破解
    // 数学原理：两个数的最大公约数一般不会大于较小数的一半
    private static int method4(int m, int n) {

        if (m <= 0 || n <= 0) {
            throw new IllegalArgumentException("m and n must be positive integers");
        }
        
        // 保证 m 是两者较小值
        if (m > n) {
            m = m ^ n;
            n = m ^ n;
            m = n ^ m;
        }
        if (m == n)
            return m;
        
        // 考虑边界值情况，较小值 m 正好是最大公约数
        if (n % m == 0)
            return m;
        
        int gcd = 1;
        for (int i = m / 2; i > 0; i--) {
            if (m % i == 0 && n % i == 0) {
                gcd = i;
                break;
            }
        }
        
        return gcd;
    }
}
```



### 6、插入排序

插排的递归形式：

思路：

- 对数组进行排序等价于对数组的部分排序
- 切分思路：将整个数组的排序切分为对数组下标从 0 到倒数第二个元素进行排序，然后和最后一个元素进行排序，以此类推



```java
public class Six_InsertSort {

    public static void main(String[] args) {
        
        int[] arr = {3, 1, 2, 7, 9, 6, 5, 8, 4};
        // 插排的递归形式
        recursionInsertSort(arr);
        
        for (int i : arr) {
            System.out.print(i + "   ");
        }
    }

    private static void recursionInsertSort(int[] arr) {
        recursionInsertSort(arr, arr.length - 1);
    }

    private static void recursionInsertSort(int[] arr, int k) {
        
        if (k == 0)
            return;

        // 对前面 k - 1 个元素进行排序
        recursionInsertSort(arr, k - 1);
        
        // 将位置为 k 的元素插入到前 k - 1 个有序元素中
        // 由于前 k - 1 个元素是递增的，所以有两种方式去插入，从前往后和从后往前
        
        // 从前往后比较
        // int t = -1;
        // for (int i = 0; i < k; i++) {
        //     if (arr[i] > arr[k]) {
        //         t = i;
        //         break;
        //     }
        // }
        // int temp = arr[k];
        //
        // if (t != -1) {
        //     System.arraycopy(arr, t, arr, t + 1, k - t);
        //     arr[t] = temp;
        // }
        
        // 从后往前去比较
        int x = arr[k];
        int index = k - 1;
        while (index >= 0 && x < arr[index]) {
            arr[index + 1] = arr[index];
            index--;
        }
        arr[index + 1] = x;
    }
  
    private static void genericInsertSort(int[] arr) {
        
        // 普通方式的插入排序
        for (int i = 1; i < arr.length; i++) {
            
            // 已排序数组的末尾元素下标
            int index = i - 1;
            // 备份一下要插入的元素
            int temp = arr[i];
            while (index > -1 && temp < arr[index]) {
                arr[index + 1]  = arr[index];
                index--;
            }
            arr[index + 1] = temp;
        }
    }
}
```



## 三、小结

递归的解题思想：



找重复：

- 找到一种划分方法
- 找到递推公式或者等价转换

都是将对父问题的求解转换为求解子问题



找变化的量：

- 变化的量作为参数



找到出口：

- 出口就是变化量的变化趋势



## 四、进阶练习

### 1、汉诺塔问题

汉诺塔是使用递归方法求解的一个经典的问题。



问题描述：

有三根杆，A、B、C，假设在 A 杆上有 n 个圆盘，且这些圆盘是按照从上到下面积依次增大来摆放的，现在要求将这些圆盘移动到 C 杆上，且顺序要和原来相同。求移动过去需要多少步。



由于要求顺序完全相同，最底下的是面积最大的一块盘，所以我们可以这样，先将从上到下第 1 块到第 n - 1 块盘移动到 B 杆上， 最后将第 n 块盘移动到 C 杆。这一就将问题划分为两个子问题，接着我们还可以继续划分下去。



从最简单的情况开始分析：（假设圆盘为 M<sub>1</sub> -> M<sub>n</sub>，面积依次增大）

- n = 1，直接 M<sub>1</sub>（A -> C）
- n = 2
  - M<sub>1</sub>（A -> B）1 - (n - 1) 块移动到了 B 杆
  - M<sub>2</sub>（A -> C）第 n 块移动到 C 杆
  - M<sub>1</sub>（B -> C）：最后从 B 上将圆盘移动到 C 盘
- n = 3
  - M<sub>1</sub>（A -> C）
  - M<sub>2</sub>（A -> B）
  - M<sub>1</sub>（C -> B）1 - (n - 1) 块移动到了 B 杆
  - M<sub>3</sub>（A -> C）第 n 块移动到 C 杆
  - 接下来情况发生了变化，我们要从 B 杆上将 n - 1 块盘移动到 C 杆上去，也可以划分子问题，先将 1 到 n - 2 块盘移动到 A 杆上，最后将第 n - 1 块盘移动到 C 盘上
  - M<sub>1</sub>（B -> A）
  - M<sub>2</sub>（B -> C）
  - M<sub>1</sub>（A -> C）
- n = 4
- ......



如果按照原来的递归题解思路：

- 划分等价子问题：我们将移动盘子的问题划分为一部分一部分的移动
- 变化的量：似乎没办法很直观的找出来
- 出口：暂时没办法设计出口



划分或者递推公式不适用汉诺塔问题。

我们可以试试等价转换：**将盘子的移动问题转换为杆子角色变化的问题。**



比如说 n = 3 时：

|  n   |     A      |   B    |     C      |
| :--: | :--------: | :----: | :--------: |
|  3   | 盘子的来源 | 辅助杆 | 盘子的去向 |

当我们完成了第一次的将 1 到 n - 1 块盘移动到 B 杆，然后将 第 n 块盘移动到 C 杆后，此时，角色发生了变化：

- A：盘子的去向
- B：盘子的来源
- C：辅助

此种情况就是一个和原问题等价的子问题，我们现在要将 1 到 n - 2 块盘从 B 杆 移动到 A 杆，然后将第 n - 1 块盘移动到 C 杆上：最后角色又发生了变化：

- A：盘子的来源
- B：辅助
- C：盘子的去向

......

上面的问题为什么能够等价呢？

原因在于当我们移动了最大的一块盘后，可以无视这块盘，所有的情况都是：

- 所有盘子都在一个杆子上，其余两个杆子为空



最后会得到只有 1 块盘的情况，此时是最简单的子问题，只需要将它移动到目标盘就好了。

这个过程中我们发现 A、B 两个杆的角色一直在发生变化。



```java
public class Seven_HanoiTower {

    public static int sum = 0;
    
    public static void main(String[] args) {
        
        hanoi(10, "A", "B", "C");
        System.out.println("total steps: " + sum);
    }

    private static void hanoi(int n, String source, String help, String target) {
        
        if (n == 1) {
            // 最简单的一种情况
            sum++;
            System.out.println("move " + n +" from " + source + " to " + target);
        } else {
            // 不是最简单的情况，就要划分等价的子问题
            // 先将 n - 1 个盘子从 source 移动到 help，此时杆角色发生变化
            hanoi(n - 1, source, target, help);
            sum++;
            // 在将第 n 个盘子从 source 移动到 target
            System.out.println("move " + n +" from " + source + " to " + target);
            // 移动完后此时杆子角色又发生了变化，source 和 help 互换角色
            hanoi(n - 1, help, source, target);
        }
    }
}
```

当我们有 10 块盘的时候需要移动 1023 次，而原问题中的 64 块盘想要移动完几乎是不可能的，这个数字非常庞大。



### 2、二分查找的递归解法

二分查找法是一个非常实用的查找方法，只不过它有一定的要求和注意点：

- 原数组有序递增
- 注意边界



我们按照递归的思路去解题：

- 划分等价子问题：原数组从中间一分为二，拆成两个数组，对这两个数组分别进行二分查找
- 变化量：我们利用两个索引框定一个子数组，这两个索引一直在变化
- 出口：当限定子数组的两个索引不合法时，就是出口



这里面一个难点就在于如何确定边界：

```java
public class Eight_BinarySearch {

    public static void main(String[] args) {
        
        int[] arr = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21};

        System.out.println(binarySearchRecursion(arr, 21));
    }

    // 输入源数组和目标数，返回下标，找不到就返回 -1
    private static int binarySearchRecursion(int[] arr, int target) {
        
        return binarySearchRecursion(arr, target, 0, arr.length - 1);
    }

    private static int binarySearchRecursion(int[] arr, int target, int left, int right) {
        
        // 设计出口
        if (left > right)
            return -1;
        
        // 拿到切分的位置
        int mid = (left + right) >>> 1;
        
        if (arr[mid] == target)
            return mid;
        else if (arr[mid] > target) {
            return binarySearchRecursion(arr, target, left, mid - 1);
        } else {
            return binarySearchRecursion(arr, target, mid + 1, right);
        }
    }
}
```



### 3、希尔排序

希尔排序也是插入排序的一种，也称为缩小增量排序，是直接插入排序算法的一种更高效的改进版本。希尔排序是非稳定排序算法。



思路：

- 根据特定算法确定一个增量序列
- 根据此增量序列中的每一个增量将原数组划分为多个子序列
- 对每个增量确定的子序列进行插入排序
- 完成排序



分析：

- 时间复杂度：不确定，在 O（nlog<sub>n</sub> ）~ O（n<sup>2</sup>）
- 空间复杂度：由于是原址排序，所以是 O（1）
- 稳定性：由于相同的元素可能会被划分到不同的子序列中单独排序，所以无法保证稳定性



解析：

- 增量是用于分组的
- 例如增量为 n
  - 则数组中下标为 0、(0 + n)、(0 + 2n)... 为一组进行插排
  - 下标为 1、(1 + n)、(1 + 2n)... 为一组进行插排
  - .....
- 缩小增量的意思是增量序列的值是递减的



要点：

- 确定增量序列的算法
- 常用的是：arr.length / 2



```java
public class Nine_ShellSort {

    public static void main(String[] args) {
        
        int[] arr = {9, 3, 5, 7, 4, 8, 6, 10, 1, 2, 6, 9};

        shellSort(arr);
        
        System.out.println(Arrays.toString(arr));
    }

    private static void shellSort(int[] arr) {

        // 增量选择：初始值为数组长度的一半，之后逐次减半，缩小增量
        for (int i = arr.length / 2; i > 0; i = i >>> 2) {
            
            // 多个增量确定的子序列并行进行插入排序
            for (int j = i; j < arr.length ; j++) {
                
                int temp = arr[j];  // 备份要插入的元素
                int index = j - i;  // 记录有序数列的末尾元素的下标
                
                while (index > -1 && arr[index] > temp) {
                    arr[index + i] = arr[index];
                    index = index - i;
                }
                arr[index + i] = temp;
            }
        }
    }
}
```



希尔排序是比普通的插入排序要快的。



### 4、上楼梯问题

问题描述：小白正在上楼梯，楼梯共有 n 阶台阶，小白一次可以上 1 阶，2 阶或者 3 阶，实现一个方法，计算小白有多少种走完楼梯的方式。



递归解题思路：

- 递归公式：f(n) = f(n - 1) + f(n - 2) + f(n - 3) 
- n 代表楼梯的阶数
- 划分子问题思路：由于有 3 种上楼梯方式，我们可以逆着来，首先到达最后一个台阶的方案分为三种，总方案就是这三种的和
- 而到达最后台阶的三种方案中每一种方案也可作为一个等价的子问题，以此类推，直到推导到 n = 0、1、2 的情况







```java
public class Ten_上楼梯 {

    public static void main(String[] args) {

        System.out.println(solution(6));
    }
    
    public static int solution(int n) {
        
        if (n == 0)
            return 1;
        if (n == 1)
            return 1;
        if (n == 2)
            return 2;
        
        return solution(n - 1) + solution(n - 2) + solution(n - 3);
    }
}
```



### 5、旋转数组的最小数字（改造二分法）

问题描述：

- 把一个数组最开始的若干个元素搬到数组的末尾，我们称之为数组的旋转。输入一个递增排序的数组的一个旋转，输出旋转数组的最小元素。
- 例如：数组 {3, 4, 5, 1, 2} 为 {1, 2, 3, 4, 5} 的一个旋转，该数组最小值为 1



这种情况比较特殊，因为它有前置条件：数组递增有序，有这个条件一般使用二分的思想比较方便。



我们可以用二分法的思想去做：

```java
public class Eleven_旋转数组 {

    public static void main(String[] args) {
        
        int[] arr1 = {1, 2, 3, 4, 5, 6, 7};
        int[] arr2 = {3, 4, 5, 6, 7, 1, 2};
        int[] arr3 = {6, 7, 1, 2, 3, 4, 5};

        System.out.println(solution(arr1));
        System.out.println(solution(arr2));
        System.out.println(solution(arr3));

        System.out.println(solution(new int[]{2, 3, 4, 5, 6, 7, 1}));
    }
    
    public static int solution(int[] arr) {
        
        return solution(arr, 0, arr.length - 1);
    }

    private static int solution(int[] arr, int left, int right) {
        
        // 如果没有旋转，则必定 arr[left] < arr[right]
        if (arr[left] < arr[right])
            return arr[left];
        
        int mid = (left + right) >>> 1;
        
        if (arr[mid] < arr[mid - 1])
            return arr[mid];
        else if (arr[mid] > arr[left] && arr[mid] > arr[right])
            return solution(arr, mid + 1, right);
        else 
            return solution(arr, left, mid - 1);
    }
}
```



### 6、在有空字符串的有序字符串数组中查找

- 有个排序后的字符串数组，其中散布着一些空字符串，编写一个方法，找到给定字符串（肯定不是空字符串）的索引。



这个也是有序的，可以使用二分法，但是需要注意空字符串和边界问题。

```java
public class Twelve_有序字符串查找 {

    public static void main(String[] args) {
        
        String[] strs = {"a", "", "ac", "", "ad", "b", "", "ba"};
        System.out.println(strs[indexOf(strs, "a")]);
        System.out.println(strs[indexOf(strs, "ba")]);
        System.out.println(strs[indexOf(strs, "ad")]);
        System.out.println(indexOf(strs, "abc"));
        System.out.println(indexOf(strs, "bac"));
    }
    
    public static int indexOf(String[] arr, String tar) {
        
        if ("".equals(tar))
            return -1;
        
        int begin = 0;
        int end = arr.length - 1;
        
        while (begin <= end) {
            int mid = begin + ((end - begin) >>> 1);
            while (arr[mid].equals("")) {
                mid++;
                if (mid > end)
                    return -1;
            }
            if (arr[mid].compareTo(tar) > 0)
                end = mid - 1;
            else if (arr[mid].compareTo(tar) < 0)
                begin = mid + 1;
            else 
                return mid;
        }
        return -1;
    }
}
```



### 7、最长连续递增子序列（部分有序）

- {1, 9, 2, 5, 7, 3, 4, 6, 8, 0} 中最长的递增子序列为 {3, 4, 6, 8}



