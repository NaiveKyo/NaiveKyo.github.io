---
title: Algorithm StringMatching Of KMP
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150142.jpg'
coverImg: /img/20211031150142.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-02 22:37:31
summary: 字符串匹配算法之 KMP 算法
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---

# KMP 算法

Knuth、Morris 和 Pratt 发明的算法的基本思想是当出现不匹配时，就能知晓一部分文本的内容（因为这部分文本在匹配失败之前已经和模式相匹配），我们利用这些信息可以避免将指针回退到所有这些已知的字符之前。



## 1、next 数组解法



重点：

- 依据模式串失配位置前面部分的前缀和后缀的最长匹配来构建一个 next 数组



对于模式串的 next 数组，当匹配的过程中在 j 位置失配，那么模式串的扫描指针应该回退到 k 位置上，

即：`next[j] = k`



| 索引/模式串 | b    | a    | b    | a    | b    | b/（失配位置） | next[i] |
| ----------- | ---- | ---- | ---- | ---- | ---- | -------------- | ------- |
| 0           |      |      |      |      |      | b              | -1      |
| 1           |      |      |      |      | b    | a              | 0       |
| 2           |      |      |      | b    | a    | b              | 0       |
| 3           |      |      | b    | a    | b    | a              | 1       |
| 4           |      | b    | a    | b    | a    | b              | 2       |
| 5           | b    | a    | b    | a    | b    | b              | 3       |



KMP 算法适用于字符重复率比较高的文本，因为这种类型的文本可以很方便的构建 next 数组：

例如，上表中如果在索引为 4 的位置处匹配失败，那么此时已经匹配成功的模式串的那部分就是 b a b a，这一部分的前缀为 b a，后缀为 b a，可得出最长匹配为 2，即 next[4] = 2，那么模式指针应该指向 `pat.charAt(2)` 。

但是我们如果要计算出最长匹配会比较麻烦，这里要利用一些规律，例如这里在 `pat.charAt(4)`  处匹配失败，就看 `next[4 - 1]` 的值，这里为 1，则比对 `pat.charAt[4 - 1]` 和 `pat.charAt(1)` 的字符是否相同，如果相同则 `next[4] = next[4 - 1] + 1` ，如果不同则 `next[4] = next[1] + 1` 。利用这种规律可以很快构建好 next 数组。



最终 next 数组和模式串对应关系如下：

| 模式串  | b    | a    | b    | a    | b    | b    |
| ------- | ---- | ---- | ---- | ---- | ---- | ---- |
| next[i] | -1   | 0    | 0    | 1    | 2    | 3    |



设母串长度为 M，模式串长度为 N，总体使用时间是构建 next 数组和进行匹配相加，即：

 T(n) = O(M + N)​



代码实现：

```java
@Test
public void kmp_1() {

    String pattern = "ABAA";
    String txt = "ABCAABAABAABAA";  // 4、7、10

    int[] next = build_next(pattern);
    System.out.println(Arrays.toString(next));
    kmp_match(txt, pattern, next);
}

private int[] build_next(String pattern) {

    int[] next = new int[pattern.length()];

    next[0] = -1;

    if (pattern.length() == 1)
        return next;

    next[1] = 0;

    for (int i = 2; i < next.length; i++) {
        int pre = next[i - 1];
        if (pattern.charAt(i - 1) == pattern.charAt(pre)) {
            next[i] = pre + 1;
        } else {
            next[i] = next[pre] + 1;
        }
    }

    return next;
}

private void kmp_match(String txt, String pattern, int[] next) {

    int txtPointer = 0;
    int patPointer = 0;
    int txtLen = txt.length();
    int patLen = pattern.length();

    if (patLen > txtLen) {
        System.out.println("模式串长度大于待匹配串!");
        return;
    }
    
    while (txtPointer < txtLen) {

        if (patPointer == -1 || txt.charAt(txtPointer) == pattern.charAt(patPointer)) {
            txtPointer++;
            patPointer++;
        } else {
            patPointer = next[patPointer];
        }

        if (patPointer == patLen) {
            System.out.println("match index begin: " + (txtPointer - patLen));
            txtPointer--;
            patPointer = next[patPointer - 1];
        }
    }
}
```



## 2、dfa 解法

kmp 算法的核心就在于如何确认在匹配失败时，模式指针应该回退到那个地方而不用回退文本指针。

它利用了一个 `dfa[][]` 来记录匹配失败时模式指针应该回退多远。

对于每个字符 c，在比较了 c 和 `pat.charAt(j)` 之后 `dfa[c][j]` 是在比较了 `txt.charAt(i)` 和 `pat.charAt(j)` 之后应该和 `txt.charAt(i + 1)` 比较的模式字符的位置。

- 如果 `txt.charAt(i)` 和  `pat.charAt(j)` 匹配，则 `dfa[pat.charAt(j)][j] = j + 1`。
-  如果不匹配的时候，我们要知道  `txt.charAt(i)` 的字符，也需要知道模式指针 j 应该回退到那个地方即 `j = dfa[txt.charAt(i)][j]`



### (1) DFA 模拟



如何构建这样一个 dfa 二维数组就是关键，说明这个过程的一个的一种较好的方法是使用 **确定有限状态自动机（DFA）**。



如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211202223627.png)

如图所示，假设字符集中只包含 A、B、C 三种字符，模式字符串为 A B A B A C。

假设模式字符串的长度代表状态的数量，那么这里共有 0 - 6 七种状态，而待匹配的文本串是一个字符一个字符的输入的，每一个输入的字符代表一次状态的转变。

如上图下方所示，初始状态为 0：

- 第一次输入 A 成功匹配则状态由 0 - 1，如果输入 B 或 C，则状态 0 - 0
- 第二次输入 B 成功匹配则状态由 1 - 2，如果输入 A 状态 1 - 1，如果输入 C 则状态 1 - 0
- 以此类推 ……
- 如果最终状态变为 6 则表示成功匹配模式串



最终自动机可用 `dfa[][] ` 表示：

| 模式指针 j                      |      | 0    | 1    | 2    | 3    | 4    | 5    |
| ------------------------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 模式字符 pat.charAt\(j)         |      | A    | B    | A    | B    | A    | C    |
|                                 | A    | 1    | 1    | 3    | 1    | 5    | 1    |
| dfa[ c &sub;{ A, B, C } ]\[ j ] | B    | 0    | 2    | 0    | 4    | 0    | 4    |
|                                 | C    | 0    | 0    | 0    | 0    | 0    | 6    |

用更严谨的说法是，自动机包含了一个起始状态 0，同时包含了一个不会进行任何转换的停止状态 M（这里 M = 6）。

自动机从状态 0 开始：

- 如果自动机到了状态 M，那么就在文本中找到了和模式相匹配的一段子字符串（我们称这种情况为确定有限状态自动机识别了该模式）；
- 如果自动机在文本结束时还没能到达状态 M，那么就可以知道文本中不存在匹配该模式的子字符串。

每个模式字符串都对应着一个确定有限状态自动机。



KMP 算法的字符串查找方法 `search()` 只是一段模拟自动机运行的 Java 程序。



### (2) 构建 DFA

DFA 的原理大概已经搞明白了，接下来解决 KMP 算法的关键问题：如何计算给定模式相对应的 `dfa[][]` 数组？

Knuth、Morris 和 Pratt 给出了一种巧妙（但也相当复杂）的构造方式，关键点还是在于 DFA 本身。

- 如果字符匹配，状态机会向下一个状态转变
- 如果字符不匹配，我们不需要回退文本指针，只需要把 DFA 重置到适当的状态（这个状态也称为重启状态），就相当于回退了文本指针



构建 dfa：

```java
private int[][] kpm_2_dfa(String pattern) {

    int M = pattern.length();
    int R = 256;        //   ASCII 码 (即输入的字符集, 最多 256 个字符)

    int[][] dfa = new int[R][M];
    dfa[pattern.charAt(0)][0] = 1;

    for (int X = 0, j = 1; j < M; j++) {
        // 计算 dfa[][j]
        for (int c = 0; c < R; c++)
            dfa[c][j] = dfa[c][X];      // 复制匹配失败情况下的值
        dfa[pattern.charAt(j)][j] = j + 1;  // 设置匹配成功情况下的值
        X = dfa[pattern.charAt(j)][X];      // 更新重启状态
    }

    return dfa;
}
```

这里构建 dfa 的过程中最重要的是重启状态，因为通过重启状态我们就可以确认在当前匹配失败时，自动机的状态是不变还是回退状态，匹配成功时比较简单，直接在对应的位置上将状态加 1 即可，**强烈建议 debug 跟踪感受状态是如何转变的**。

这里举其中一个例子：



当匹配到 `pat.charAt(j) = B` 时，j = 3，重启状态 X = 1，此时首先应该将 j = 1 时的所有状态复制过来;



| 模式指针 j        | 0    | 1    | 2    | 3                                    | 4    | 5    |
| ----------------- | ---- | ---- | ---- | ------------------------------------ | ---- | ---- |
| 字符集\模式字符串 | A    | B    | A    | B                                    | A    | C    |
| A                 | 1    | 1    | 3    | <strong style="color:red">1</strong> |      |      |
| B                 | 0    | 2    | 0    | <strong style="color:red">2</strong> |      |      |
| C                 | 0    | 0    | 0    | <strong style="color:red">0</strong> |      |      |
| 重启状态 X        | 0    | 0    | 0    | 1                                    | 2    | 3    |



为什么要这样，因为已经匹配成功的 A B A，现在匹配的是字符 B，让我们直接判断的话，如果匹配失败，会让模式指针回退到 j = 1 而不是 j = 0 比较合适（这里的判断机制和 next 数组的前后缀类似），那么匹配失败的状态就可以直接套用 j = 1 时的情况，如果匹配成功就转入下一个状态：



| 模式指针 j        | 0    | 1    | 2    | 3                                    | 4    | 5    |
| ----------------- | ---- | ---- | ---- | ------------------------------------ | ---- | ---- |
| 字符集\模式字符串 | A    | B    | A    | B                                    | A    | C    |
| A                 | 1    | 1    | 3    | <strong style="color:red">1</strong> |      |      |
| B                 | 0    | 2    | 0    | <strong style="color:red">3</strong> |      |      |
| C                 | 0    | 0    | 0    | <strong style="color:red">0</strong> |      |      |
| 重启状态 X        | 0    | 0    | 0    | 1                                    | 2    | 3    |



此时要重新判断重置状态的取值，可以认为模式字符串的起始位置变为 j = 1，起始状态就是 j = 1 时的匹配成功的状态，即 `X = dfa['B'][1] = 2`





| 模式指针 j        | 0    | 1    | 2    | 3                                    | 4                                    | 5    |
| ----------------- | ---- | ---- | ---- | ------------------------------------ | ------------------------------------ | ---- |
| 字符集\模式字符串 | A    | B    | A    | B                                    | A                                    | C    |
| A                 | 1    | 1    | 3    | <strong style="color:red">1</strong> |                                      |      |
| B                 | 0    | 2    | 0    | <strong style="color:red">2</strong> |                                      |      |
| C                 | 0    | 0    | 0    | <strong style="color:red">0</strong> |                                      |      |
| 重启状态 X        | 0    | 0    | 0    | 1                                    | <strong style="color:red">2</strong> | 3    |

 

然后 `j++` 开启下一轮判断。



### (3) KMP 的 dfa 实现

代码如下：

```java
@Test
public void kmp_2() {

    String txt = "ABCAABAABAABA";
    String pattern = "AABA"; // 2、11、14

    int[][] dfa = kpm_2_dfa(pattern);
    kpm_2_search(txt, pattern, dfa);
}

private int[][] kpm_2_dfa(String pattern) {

    int M = pattern.length();
    int R = 256;        //   ASCII 码 (即字符集，最多 256 z)

    int[][] dfa = new int[R][M];
    dfa[pattern.charAt(0)][0] = 1;

    for (int X = 0, j = 1; j < M; j++) {
        // 计算 dfa[][j]
        for (int c = 0; c < R; c++)
            dfa[c][j] = dfa[c][X];      // 复制匹配失败情况下的值
        dfa[pattern.charAt(j)][j] = j + 1;  // 设置匹配成功情况下的值
        X = dfa[pattern.charAt(j)][X];      // 更新重启状态
    }

    return dfa;
}

// 注意这个过程没有比较，只是将 txt 按顺序输入 dfa 中，然后根据 dfa 的指示设置 patPointer 的位置
private void kpm_2_search(String txt, String pattern, int[][] dfa) {

    int tLen = txt.length();
    int pLen = pattern.length();

    int patPointer = 0;
    int txtPointer = 0;

    while (true) {
        // 在 txt 上模拟 DFA 的运行

        while (txtPointer < tLen && patPointer < pLen) {
            patPointer = dfa[txt.charAt(txtPointer)][patPointer];
            txtPointer++;
        }

        if (patPointer == pLen) {
            System.out.println("match index begin: " + (txtPointer - pLen));
            patPointer = 0;
            txtPointer--;
        }

        if (txtPointer == tLen)
            break;
    }
}
```

对于长度为 M 的字符串，模式字符串为 N 时，KMP 查找的字符不会超过 M + N 个，即：

T(N) = O(M + N)​



KMP 算法为最坏情况提供的线性级别运行时间保证是一个重要的理论成果。在实际应用中，它比暴力算法的速度优势并不十分明显，因为极少有应用程序需要在重复性很高的文本中查找重复性很高的模式。但该方法的一个优点是不需要在输入中回退。这使得KMP子字符串查找算法更适合在长度不确定的输入流（例如标准输入）中进行查找，需要回退的算法在这种情况下则需要复杂的缓冲机制。但其实当回退很容易时，还可以比 KMP 快得多。

