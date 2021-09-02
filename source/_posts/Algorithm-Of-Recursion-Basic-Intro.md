---
title: Algorithm Of Recursion Basic Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/banner/0.jpg'
coverImg: /medias/banner/0.jpg
toc: true
date: 2021-09-02 23:45:40
top: true
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