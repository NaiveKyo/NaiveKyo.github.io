---
title: Algorithm Of String General Exercises
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150048.jpg'
coverImg: /img/20211031150048.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-01 17:16:16
summary: 字符串常规题解
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---

# 字符串常规题解



## 1、字符串中是否有重复字符

- 判断字符串中是否有重复字符

```java
@Test
public void solution_1_判断字符串中有无重复字符() {

    String str = "abcdefghi";

    System.out.println(judgeRepeatChar(str) ? "无重复" : "有重复字符");
}

private boolean judgeRepeatChar(String str) {
    // 这里要注意字符编码集是 ASCII 还是 Unicode
    // ASCII 是一个字节，长度为 128 或 256
    // Unicode 是两个字节

    // 默认按照 ASCII 码处理
    int[] helper = new int[128];

    for (int i = 0; i < str.length(); i++) {
        int c = str.charAt(i);
        if (helper[c] == 1)
            return false;
        else
            helper[c] = 1;
    }

    return true;
}
```



## 2、翻转字符串

```java
@Test
public void solution_2_翻转字符串() {
    String str = "abcd ef ghi jk";

    // 方法一
    System.out.println(reverse_1(str));

    // 方法二
    System.out.println(reverse_2(str));

    // 方法三
    System.out.println(reverse_3(str));
}
// 开辟辅助数组
private String reverse_1(String str) {
    char[] chars = str.toCharArray();
    char[] tmp = new char[str.length()];
    int len = chars.length;
    for (int i = 0; i < len; i++) {
        tmp[i] =chars[len - 1 - i];
    }
    return new String(tmp);
}
// 利用 Java API
private String reverse_2(String str) {
    StringBuilder sb = new StringBuilder(str);
    return sb.reverse().toString();
}
// 使用递归
private String reverse_3(String str) {

    return reverse_3(str, str.length() - 1);
}
private String reverse_3(String str, int i) {

    if (i == 0)
        return str.charAt(i) + "";

    return str.charAt(i) + reverse_3(str, i - 1);
}
```



## 3、变形词

给定两字符串，确认其中一个字符串的字符重新排列后，能够变成另一个字符串。

这里规定大小写不同为不同的字符，且考虑字符串中的空格。

<mark>变形词：两个字符串由相同的字符及数量组成，abc 和 abc 不互为变形词</mark>

```java
@Test
public void solution_3_变形词() {

    String str1 = "abcd";
    String str2 = "badc";

    System.out.println(judgeAnagram_1(str1, str2));

    System.out.println(judgeAnagram_2(str1, str2));
}

private boolean judgeAnagram_1(String str1, String str2) {

    if (str1.length() != str2.length())
        return false;

    for (int i = 0; i < str1.length(); i++) {
        if (str2.indexOf(str1.charAt(i)) == -1)
            return false;
    }

    return true;
}

private boolean judgeAnagram_2(String str1, String str2) {

    char[] chars1 = str1.toCharArray();
    char[] chars2 = str2.toCharArray();

    Arrays.sort(chars1);
    Arrays.sort(chars2);

    return Arrays.equals(chars1, chars2);
}
```



## 4、替换空格

编写一个方法，将字符串中的空格全部替换为 "%20"，假定该字符串有足够的空间存放新增的字符，并且知道字符串的真实长度（小于等于 1000），同时保证字符串由大小写的英文字母组成。



给定原始字符串和长度，返回新的字符串。

这一题比较困难的是 Java 中字符串是不可变的，我们要么转成 char 数组，要么使用 StringBuilder。

```java
@Test
public void solution_4_替换空格() {

    String str = "abc de f";

    System.out.println(replaceStr1(str));
    System.out.println(replaceStr2(str, str.length()));

}

private String replaceStr2(String str, int len) {

    int count = 0;
    for (int i = 0; i < len; i++) {
        if (str.charAt(i) == ' ')
            count += 2;
    }

    int newLen = len + count;

    char[] chars = new char[newLen];
    char[] tmp = str.toCharArray();
    System.arraycopy(tmp, 0, chars, 0, len);

    int pointer1 = len - 1;
    int pointer2 = newLen - 1;

    while (pointer1 >= 0) {
        if (chars[pointer1] != ' ') {
            chars[pointer2--] = chars[pointer1--];
        } else {
            pointer1--;
            chars[pointer2--] = '0';
            chars[pointer2--] = '2';
            chars[pointer2--] = '%';
        }
    }

    return new String(chars);
}

private String  replaceStr1(String str) {
    return str.replaceAll("\\s", "%20");
}
```



## 5、字符串压缩

利用字符串重复出现的次数，编写一个方法，实现基本的字符串压缩功能。

比如：字符串 "aabcccccaaa"，经压缩会变成 "a2b1c5a3"。若压缩后字符串的长度未发生变化，则返回原来的字符串。



```java
@Test
public void solution_4_字符串压缩() {

    String str1 = "aabbcc";
    String str2 = "aabcccccaaa";

    System.out.println(zipStr(str1));
    System.out.println(zipStr(str2));
}

private String zipStr(String str) {

    StringBuilder sb = new StringBuilder();

    for (int i = 0; i < str.length(); i++) {
        sb.append(str.charAt(i));
        int count = 1;
        int j = i + 1;
        while (j < str.length()) {
            if (str.charAt(i) == str.charAt(j)) {
                count++;
            } else {
                i = j - 1;
                break;
            }
            j++;
        }
        if (j == str.length())
            i = j - 1;

        sb.append(count);
    }

    if (sb.length() >= str.length())
        return str;
    else 
        return sb.toString();
}
```

## 6、两个串字符集是否相同

这一题和变形词有些区别，变形词要求字符和字符的个数一致，而此题只要求字符一样就可以了。

这里可以换个方法使用 hash 映射来实现：

```java
@Test
public void solution_5_相同字符集() {

    String str1 = "aabcbd";
    String str2 = "abcd";

    System.out.println(judgeSameCharset(str1, str2));
}

private boolean judgeSameCharset(String str1, String str2) {

    HashMap<Character, Integer> map = new HashMap<>();

    int str1Count = 0;
    for (int i = 0; i < str1.length(); i++) {
        char c = str1.charAt(i);
        if (map.get(c) == null) {
            map.put(c, 1);
            str1Count++;
        }
    }

    int str2Count = 0;
    for (int i = 0; i < str2.length(); i++) {
        char c = str2.charAt(i);
        Integer tmp = map.get(c);
        if (tmp == null) {
            return false;
        } else {
            if (tmp == 1) {
                str2Count++;
                map.put(c, tmp + 1);
            }
        }

    }

    return str1Count == str2Count;
}
```



## 7、旋转词

字符串移位包含问题：

给定两字符串 s1、s2，判断 s2 是否可以通过被 s1 做循环移位（rotate）得到的字符串包含。

例如，给定 s1 = AABCD 和 s2 = CDAA，返回 true；

给定 s1 = ABCD 和 s2 = ACBD，返回 false。



<mark>结论：如果 s2 是 s1 通过循环移位得到的，那么 s2 一定被 s1s1 包含：</mark>

如上面的 s1s1 = AABCDAABCD，s2 = CDAA，s2 &sub; s1s1

```java
@Test
public void solution_6_旋转词() {

    String str1 = "AABCD";
    String str2 = "CDAA";

    System.out.println(isRotate(str1, str2));
}
private boolean isRotate(String str1, String str2) {
    if (str1.length() < str2.length())
        return false;

    StringBuilder sb = new StringBuilder(str1).append(str1);
    return sb.toString().contains(str2);
}
```

## 8、字符串按单词翻转

如："here you are" 翻转成 "are you here"



```java
@Test
public void solution_7_反转单词() {

    String str = "here are you";

    System.out.println(reverseWord(str));
}

private String reverseWord(String str) {

    StringBuilder sb1 = new StringBuilder(str);

    String[] words = sb1.reverse().toString().split(" ");

    StringBuilder sb2 = new StringBuilder();

    for (int i = 0; i < words.length; i++) {
        StringBuilder sb3 = new StringBuilder(words[i]);
        sb2.append(sb3.reverse().append(" "));
    }

    return sb2.deleteCharAt(sb1.length()).toString();
}
```



## 9、去除连续出现的 k 个 0



```java
@Test
public void solution_8_去除连续的k个0() {

    String str = "12ag0000003434";
    int k = 3;

    String newStr = str.replaceFirst("0{" + k + "}", "");

    System.out.println(newStr);
}
```



## 10、回文串

回文串判断比较简单，但是在此基础上的题型有很多。

```java
@Test
public void solution_9_判断回文串() {

    String str1 = "abcdcba";
    String str2 = "abccba";
    String str3 = "";

    System.out.println(judgePlalindrome(str1));
    System.out.println(judgePlalindrome(str2));
    System.out.println(judgePlalindrome(str3));
}

private boolean judgePlalindrome(String str) {

    if (str.length() <= 0)
        return false;

    LinkedList<Character> stack = new LinkedList<>();

    int len = str.length();
    boolean flag = len % 2 == 0;

    int middle = (len - 1) >>> 1;

    for (int i = 0; i <= (flag ? middle : middle - 1); i++) {
        stack.push(str.charAt(i));
    }

    for (int i = middle + 1; i < len; i++) {
        if (stack.pop() != str.charAt(i))
            return false;
    }

    return true;
}
```



## 11、密码脱落

字符集为 A、B、C、D，给定一个字符串，求至少需要添加多少个字符才可以让整个字符串为回文串。

比如：

ABCBA，输出：0

ABECDCBABC，输出：3

```java
@Test
public void solution_10_密码脱落() {

    String str = "ABCBA";
    String str1 = "ABECDCBABC";

    System.out.println(solution_10(str));
    System.out.println(solution_10(str1));
}

private int solution_10(String str) {

    char[] chars = str.toCharArray();

    int i = 0, n = 0;
    int ti, tj;
    int j = str.length() - 1;

    while (i <= j) {
        // 第一种情况，如果前后相等，则向中间靠拢
        if (chars[i] == chars[j]) {
            i++;
            j--;
        } else {
            // 如果不相等，又分为两种情况
            ti = i;
            tj = j;
            // 以右边为标记，左边为游标，寻找相等的情况
            while (chars[ti] != chars[j] && ti < j)
                ti++;

            // 以左边为标记，右边为游标，寻找相等的情况
            while (chars[tj] != chars[i] && tj > i)
                tj--;

            // 比较两个游标移动的距离，取小的那个
            if ((ti - i) < (j - tj)) {
                n += ti - i;
                i = ti;
            } else {
                n += j - tj;
                j = tj;
            }
        }
    }

    return n;
}
```

