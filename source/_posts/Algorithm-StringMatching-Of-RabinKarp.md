---
title: Algorithm StringMatching Of RabinKarp
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150127.jpg'
coverImg: /img/20211031150127.jpg
cover: false
toc: true
mathjax: true
date: 2021-12-02 16:22:52
summary: 字符串匹配算法之 RabinKarp 算法
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---

# 字符串朴素匹配算法



在字符串匹配算法中，一般将带匹配的字符串称为母串，匹配的字符串称为模式。



按照最简单的想法，就是使用暴力法（朴素字符串匹配算法）：

时间复杂度：$T(n) = O(M \times N)$

```java
@Test
public void solution_1_字符串匹配() {

    String str = "ABABABA";
    String pattern = "ABA";

    System.out.println(solution_1_brute_force(str, pattern));
}

private boolean solution_1_brute_force(String str, String pattern) {

    int res = 0;

    for (int i = 0; i < str.length(); i++) {

        if (str.charAt(i) == pattern.charAt(0)) {
            int j = i + 1;
            int pLeft = 1;
            while (j < str.length() && pLeft < pattern.length()) {
                if (pattern.charAt(pLeft) != str.charAt(j))
                    break;
                pLeft++;
                j++;
            }
            if (pLeft == pattern.length()) {
                res++;
            }
        }
    }

    if (res > 0) {
        System.out.println("匹配成功的次数: " + res);
        return true;
    } else 
        return false;

}
```



# RabinKarp 算法

RK 算法和朴素字符串算法相比，最大的不同是它使用模式串的 hash 值与母串进行比对，通过特定的 hash 函数计算出模式串的 hash 值。

但是在对比的时候它并不是每次都要重头计算待匹配字符串的 hash 值，而是利用前面的子串的 hash 值来计算出当前待匹配串的 hash 值，这也称之为 <strong style="color:red">滚动 hash</strong>。

为什么称之为滚动 hash，我们一步一步来解释：

> 哈希函数

哈希函数其实就是一种映射关系，在字符串匹配中，比如我们有一个模式串："ABC"，我们知道字符在计算机存储中可以转为 int，那么将 ABC 按照特定的 hash 函数是可以得到一个特定的 hash 值的。

$hash = hash(pattern)$

要注意的是对于哈希函数而言最重要的两点就是：

- hash 函数的设计
- 尽可能减少冲突



> 滚动 hash

如果我们在遍历母串的时候以每一个字符开头取匹配串的长度计算 hash 值，那么就和朴素匹配没什么区别了，所以 RK 算法中采用了**滚动哈希算法**，它的思路来源于进制转换。



我们认为长度为 M 的字符串对应着一个 R 进制的 M 位数。

而采用的 hash 函数使用一张大小为 Q 的散列表来保存通过 hash 函数计算出的键，$hash(pattern) ，\subset [0, Q)$

即将一个 R 进制的 M 位数转换为一个 0 到 Q - 1 之间的 int 值散列函数，这一步通过除留余数法可以很方便的做到：
$$
hash(pattern) \quad \\% \quad Q \subset [0, Q)
$$


对于母串的所有位置 i，高效计算出文本中 i + 1 位置的子字符串散列值。这可以由一个简单的数学公式得到。

我们用 ti 表示 `txt.charAt(i)` ，那么文本 txt 中从 i 开始取长度为 M 的子字符串所对应的数为：



$$
\begin{align} 
   x_i &= t_i R^{M-1} + t_{i+1} R^{M-2} + \cdots + t_{i+M-2} R^1 + t_{i+M-1} R^{0} \\\\
   &= (t_i R^{M-2} + t_{i+1} R^{M-3} + \cdots + t_{i+M-2}) R + t_{i+M-1} \\\\
   &= ((t_i R^{M-3} + t_{i+1} R^{M-4} + \cdots + t_{i+M-3})R + t_{i+M-2})R + t_{i+M-1} \\\\
   &= \cdots \\\\
   &= (((\cdots(0 \ast R + t_i)R + t_{i+1})R + t_{i+2})R + \cdots)) + t_{i+M-2})R + t_{i+M-1}
\end{align}
$$





假设已知  $h(x_i) = x_i \\; mod \\; Q$  。将模式字符串右移一位即等价于将 x<sub>i</sub> 替换为：
$$
x_{i+1} = (x_i - t_iR^{M-1}) R + t_{i + M}R^0
$$


即它要减去第一个数字的值，然后整体乘以 R，最后加上最后一个数字的值。

有一点比较特殊的是这一步不用考虑取模运算，这和取余操作的性质有关：如果在每次运算操作之后都要进行取余操作，等价于在完成了所有的算术运算后再将最后的结果取余。

<mark>注意这个 Q 的取值也很有意思，在哈希函数中 Q 一般取质数，这和数学的一些性质有关，可以尽可能降低冲突</mark>



RK 算法中使用的散列函数：

```java
private long hash(String key, int M, long Q) {
    long h = 0;
    for (int i = 0; i < M; i++) {
        h = (h * R + key.charAt(i)) % Q;
    }
    return h;
}
```

RabinKarp 算法：

```java
@Test
public void solution_3_RK() {

    String txt = "ABCABCBAAB";
    String pattern = "AB";

    rabin_karp_2(txt, pattern);
}

private void rabin_karp_2(String txt, String pattern) {

    int patLen = pattern.length();   // 模式字符串的长度

    int R = 256;                    // ASCII 码最大长度m

    long Q = longRandomPrime();     // 获取一个尽可能大的素数

    // 将字符串看作 R 进制的 M 位数
    // 我们每次滚动 hash 时都要减去第一个数 ti * R^(M-1)
    // 先计算出 R^(M - 1) 这一部分
    long RM = 1;
    for (int i = 0; i < patLen - 1; i++) {
        RM = (R * RM) % Q;
    }

    rk_match(txt, pattern, R, RM, Q);
}

// 获取一个尽可能大的素数
private static long longRandomPrime() {
    BigInteger prime = BigInteger.probablePrime(31, new Random());
    return prime.longValue();
}

/**
* 计算给定字符串的 hash 值
* @param key 给定字符串
* @param M 字符串的长度
* @param R 进制数
* @param Q 质数
* @return hash 值
*/
private long rk_hash(String key, int M, int R, long Q) {

    long h = 0;

    for (int i = 0; i < M; i++) {
        h = (R * h + key.charAt(i)) % Q;
    }

    return h;
}

/**
* 匹配算法
* @param txt 母串
* @param pattern 模式串
* @param R 进制数
* @param RM 每次减去的数的一部分
* @param Q 质数
*/
private void rk_match(String txt, String pattern, int R, long RM, long Q) {

    int txtLen = txt.length();
    int patLen = pattern.length();

    long patHash = rk_hash(pattern, pattern.length(), R, Q);

    // 计算母串中第一个和模式串匹配的子串的 hash 值
    long txtHash = rk_hash(txt, patLen, R, Q);
    if (txtHash == patHash)
        System.out.println("match index begin: " + 0);

    for (int i = patLen; i < txtLen; i++) {
        // 减去第一个数字，加上最后一个数字，再次检查匹配
        // 但是要注意我们的 hash 函数计算的是取余后的数, 所以这里要先加上一个 Q
        txtHash = ((txtHash + Q) - (RM * txt.charAt(i - patLen) % Q)) % Q;
        txtHash = (txtHash * R + txt.charAt(i)) % Q;

        if (txtHash == patHash)
            System.out.println("match index begin: " + (i - patLen + 1));
    }
}
```

也许你会这样想，当匹配成功一次后就从匹配的地址开始取模式串的长度去和模式串进行一个字符一个字符的比较，这样才能保证匹配完全是正确的，因为存在散列冲突的可能性。



不过 Rabin 和 Karp 证明了只要选择适当的 Q 值，随机字符串产生散列碰撞的概率为 $\frac1Q$ ，这意味着对于这些变量实际可能出现的值，字符串不匹配时散列值也不会匹配，散列值匹配时字符串才会匹配。

理论上来说，文本中的某个子字符串可能会在与模式不匹配的情况下产生散列冲突，但是实际应用中使用该算法寻找匹配是可靠的。 
