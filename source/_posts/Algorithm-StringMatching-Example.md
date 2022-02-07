---
title: Algorithm StringMatching Example
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174615.jpg'
coverImg: /img/20211208174615.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-07 12:53:20
summary: "字符串匹配算法例题"
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---



# 应用例题

## 1、尺取法

### hiho 字符串

如果一个字符串恰好包含 2 个 'h'、1 个 'i' 和 一个 'o'，我们就称这个字符串是 hiho 字符串。

例如："oihateher"、"hugeinputhugeoutput" 都是 hiho 字符串。

我们要找出给定字符 S 的所有子串中，最短的 hiho 字符串是哪一个，输出该子串的长度，如果 S 的子串中没有 hiho 字符串，输出 -1。



例如：

- 输入："happyhahaiohell"
- 输出：5

代码实现：

```java
@Test
public void solution_1_尺取法求hiho字符串() {

    String txt = "isverygodokjgoadiheoginhellojighao";

    solution_1_solve(txt.toCharArray());
}

private void solution_1_solve(char[] charArr) {

    int min = Integer.MAX_VALUE;

    int j = -1;

    for (int i = 0; i < charArr.length; i++) {
        char c = charArr[i];

        if ( (c)) {

            if (j == -1)
                j = i + 1;

            while (j < charArr.length) {
                char cc = charArr[j];
                if (solution_1_check(cc) && solution_1_containAll(charArr, i, j)) {
                    if (solution_1_check(charArr, i, j) && j - i + 1 < min) {
                        min = j - i + 1;
                    }
                    break;
                }
                j++;
            }
        }
    }
    System.out.println(min == Integer.MAX_VALUE ? -1 : min);
}

private boolean solution_1_check(char[] charArr, int i, int j) {

    int c1 = 0, c2 = 0, c3 = 0;
    for (int k = i; k <= j; k++) {
        if (charArr[k] == 'h') c1++;
        if (charArr[k] == 'i') c2++;
        if (charArr[k] == 'o') c3++;
    }

    return c1 == 2 && c2 == 1 && c3 == 1;
}

private boolean solution_1_containAll(char[] charArr, int i, int j) {
    int c1 = 0, c2 = 0, c3 = 0;
    for (int k = i; k <= j; k++) {
        if (charArr[k] == 'h') c1++;
        if (charArr[k] == 'i') c2++;
        if (charArr[k] == 'o') c3++;
    }

    return c1 >= 2 && c2 >= 1 && c3 >= 1;
}

private boolean solution_1_check(char c) {
    return c == 'h' || c == 'i' || c == 'a';
}
```



## 2、next 数组

- 前缀周期性

在 KMP 算法（适合重复度较高的字符串）的 next 数组解法中，我们了解到  `next[j] = k` 表示模式串在下标为 j 的地方失配后，模式指针应该回退到下标为 k 的地方。

当出现了这样的字符串后：`a b c d e a b c x` x 表示适配位置，则 `next[8] = 3`，已匹配成功的子串的最长前后缀匹配是 `a b c`；

有一种比较特殊的情况，比如说已匹配成功的串类似下面这样：`a b c a b c x`、`a b c a b c a b c x`，x 表示失配位置，设 `next[j] = k`，会发现这样的规律，即 `j % (j - k) = 0`，此时我们称已匹配成功的子串为 <strong style="color:red">周期串</strong>。



### HDU 1358

给一字符串，求其所有完整循环的前缀及其循环节的长度

输入：

```
3
aaa
12
aabaabaabaab
0
```

输出：

```
Test case #1
2 2 // 前缀长度为 2, 循环节为 a, 个数为 2 个 a
3 3 // 前缀长度为 3, 循环节为 a, 个数为 3 个 a

Test case #2
2 2
6 2
9 3
12 4 // 前缀长度为 12, 循环节为 aab, 个数为 4 个 aab
```

代码实现：

```java
@Test
public void solution_2_HDU1358() {

    Scanner sc = new Scanner(System.in);
    List<String> list = new ArrayList<>();

    while (true) {
        int n = sc.nextInt();
        if (n == 0)
            break;

        String txt = sc.next();
        list.add(txt);
    }

    for (int i = 0; i < list.size(); i++) {
        String str = list.get(i);
        int[] next = next(str);
        System.out.println("Test case #" + (i + 1));

        for (int j = 2; j < next.length; j++) {
            int k = next[j];
            int t = j - k;
            if (j % t == 0 && j / t > 1) {
                System.out.println(j + " " + (j / t));
            }
        }
        System.out.println();
    }
}

// 根据目标串构建 next 数组
private int[] next(String str) {
    int[] res = new int[str.length() + 1];
    res[0] = -1;
    res[1] = 0;

    // next数组 从第 j 位推出第 j + 1 位的值
    int j = 1;
    int pre = res[j];

    while (j < res.length - 1) {
        if (pre == -1 || str.charAt(j) == str.charAt(pre)) {
            res[++j] = ++pre;
        } else {
            pre = res[pre];
        }
    }

    return res;
}
```

> 注意

这里有一点比较特殊，就是 next 数组的长度是模式串的长度增加一位，这是因为该题包含一种情况: 前缀为完整的字符串，而 KMP 中前缀是不包含整个串的。