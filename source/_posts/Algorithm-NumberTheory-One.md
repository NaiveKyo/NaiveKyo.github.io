---
title: Algorithm NumberTheory One
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174631.jpg'
coverImg: /img/20211208174631.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-11 14:34:54
summary: '数学问题'
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---





# 巧用进制

## 1、天平称重:变种 3 进制

用天平称重时，我们希望用尽可能少的砝码组合称出尽可能多的重量。

如果有无限个砝码，但它们的重量分别是1，3，9，27，81，……等 3 的指数幂。

神奇之处在于用它们的组合可以称出任意整数重量（砝码允许放在左右两个盘中）。

本题要求编程实现：对用户给定的重量，给出砝码组合方案，重量 < 1000000；

例如：

用户输入：

5

程序输出：

9-3-1

解释：例子意思是这样的，重量为 5，天平左侧放砝码 9，天平右侧放砝码 3、1 以及物品，这样天平两边就等价了，对于程序的输出，天平左盘为正数，右盘为负数。

解题思路：

```
先看看二进制：
0 0 0 0 0 0 0 0
124 64 32 16 8 4 2 1
可以发现二进制非常特殊，想用二进制表示十进制的任意的数，只需要选取二进制的不同位就可以表示了；
假设选中了某一位就将该位置 1，未选中就置 0，只有 0 1 两种状态，即砝码的取和不取两种状态；
则 3 可以表示为 0011，5 可以表示为 0101.
```

二进制有 n 位就可以表示十进制的 1 - 2^n

但是如果换到三进制就不一样了：

```
对于三进制而言是这样的：
0 0 0 0 0
81 27 9 3 1
每一位有三种状态 0，1，2，转换为砝码的取与不取问题可以这样理解，不取，取一次、取两次；
```

注意本题中并没有说砝码可以重复使用，所以一个砝码只能用一次：

```
以例子中的 5 为例，用三进制可以这样表示
0 1 2
9 3 1
2 个 1 加上一个 3 就是 5，表示为 (1, 2)
现在想要向例子的 9-3-1 靠拢，可以这样:
(1, 2) 第一位 + 1 得到 (2, 0)
再让第一位 - 1 得到 (2, -1)；
接着让第二位 + 1 得 (1, 0, -1)
第二位再 -1 得到 (1, -1, -1)
也就是
1 -1 -1
9 3 1
得到了 9-3-1 的结果
```

大概思路就有了，把重量转换为 3 进制，接着我们要做的就是对 3 进制数进行处理要求每一位上只能是 0、 1 、-1中的一个，而且这个处理也是有规律的，就是从低位开始每一位进行 +1 然后 -1 操作：

例如 5 从 （0，1，2）到 （0，2，-1）到（1，-1，-1）；

例如 3 表示为（1，0）无需变换；

例如 26 的 3 进制表示为 （2，2，2），变化过程如下：（2，2，2）到（1，0，0，-1）；

综上可以发现从低位到高位，每一位进行 + 1、- 1 操作，对于每一位而言：

- 遇到 2 则该位变为 -1，且该位的下一位（更高位）要加 1；
- 遇到 0 或 1 则该位不变



代码如下：

```java
@Test
public void test_1_天平称重() {

    System.out.print("please input weight: ");
    Scanner sc = new Scanner(System.in);

    // 接收重量
    int weight = sc.nextInt();
    // 转换为 3 进制字符串
    String str = Integer.toString(weight, 3);
    // 先翻转将低位放在前面, 高位放在后面, 然后转换为字符数组
    char[] chars = new StringBuilder(str).reverse().toString().toCharArray();
    // 再对字符数组进行处理，将三进制数的各个位用 0、-1、1 表示
    // 这里要使用另外一个容器进行存储，并且是逆序插入，这是因为高位在最前面
    ArrayList<Integer> list = new ArrayList<>();
    for (int i = 0; i < chars.length; i++) {
        if (chars[i] == '2') {
            // 遇到 2 就在开头插入 -1
            list.add(0, -1);
            if (i == chars.length - 1) {
                // 如果当前是字符数组的最后一位, 即 3 进制的最高位, 就需要进位
                list.add(0, 1);
            } else {
                ++chars[i + 1]; // 否则就对字符数组的 i + 1 位进行加 1
            }
        } else if (chars[i] == '3') {
            // 遇到字符 '3' 是因为在上一个分支中对字符数组的某一个元素进行了加 1 操作
            // 这种特殊情况首先将该位置 0
            list.add(0, 0);
            if (i == chars.length - 1) {
                // 如果该位是最高位，就需要进位
                list.add(0, 1);
            } else {
                // 否则继续将下一位 + 1
                ++chars[i + 1];
            }
        } else {
            // 如果遇到 0 或者 1, 就将当前字符转换为整数(减去字符 '0')
            list.add(0, chars[i] - '0');
        }
    }
    // 恢复成十进制表示的字符串
    StringBuilder sb = new StringBuilder();
    for (int i = 0; i < list.size(); i++) {
        if (list.get(i) == 1)
            sb.append("+").append((int) Math.pow(3, list.size() - i - 1));
        if (list.get(i) == -1)
            sb.append("-").append((int) Math.pow(3, list.size() -i - 1));
    }

    System.out.println(sb.substring(1));
}
```

注意这里出现了某一位等于 3 的情况，这是因为它的前一位是 2 且不是最高位。



