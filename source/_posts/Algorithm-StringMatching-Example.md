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



## 3、后缀数组 + 高度数组

- 最长重复子串（可重叠或者说可交叉）
  - ------ 直接求 height 数组的最大值
- 不可重叠的最长重复子串
  - ------ 二分枚举 + height 分组
- 可重叠并且出现至少 K 次的最长子串
  - ------ 二分枚举 + height 分组

后缀数组其实也可以用于求前缀周期性。

### （1）最长重复子串

先理解一个比较简单的概念：字符串的所有子串都是某一个后缀的前缀。

当两个后缀的前缀相同时，这个前缀就是重复的串。

我们现在求的是最长的重复子串。

代码如下：

```java
public class Demo1 {
    
    @Test
    public void test_maxRepeatSubString() {
        
        String str1 = "abracadabra";
        String str2 = "ecadadabrbcrdar";
        System.out.println(maxRepeatSubString(str1, str2)); // adabr
        System.out.println(maxRepeatSubString("A", "BA")); // A
    }

    /**
     * 高度数组, 是后缀数组中两个后缀字符串的最长公共前缀的长度
     * 用于求解两个串的最长公共子串
     * 先将两个串拼接, 然后求后缀数组和高度数组
     * 高度数组的最大值表明了两个排序相近的后缀的公共前缀的长度
     * 两个字符串的最长公共子串一定就是这两个后缀的公共前缀
     */
    private String maxRepeatSubString(String str1, String str2) {
        
        String str = str1 + str2;
        SuffixArray[] suffixes = buildSuffixArray(str);
        int[] height = getHeightArray(str, suffixes);

        // 高度数组的最大值(该值表明后缀数组中首地址为 i 和 i - 1 的两个后缀串的最长公共子串的长度最大)
        int maxHeight = Integer.MIN_VALUE;
        // 利用高度数组和 rank 数组的关系: height[rank[i + 1]] >= height[rank[i]] - 1
        // 高度数组的最大值的下标其实就是 rank 数组的值, 也就是对应后缀字符串的排名
        int maxRank = Integer.MIN_VALUE;
        
        for (int i = 0; i < height.length; i++) {
            if (height[i] > maxHeight) {
                maxHeight = height[i];
                maxRank = i;
            }
        }
        
        // 通过 rank 数组和后缀数组的关系, 根据排名得到目标后缀串的首字符下标
        int index = suffixes[maxRank].getIndex();
        
        // 最长公共串就是原始字符串的 [index, index + maxHeight) 这一部分
        return str.substring(index, index + maxHeight);
    }
    
    // 根据母串得到后缀数组
    private static SuffixArray[] buildSuffixArray(String txt) {
        int len = txt.length();
        
        SuffixArray[] suffix = new SuffixArray[len];

        for (int i = 0; i < len; i++) {
            suffix[i] = new SuffixArray(txt.charAt(i), i);
        }

        // 先根据后缀子串首字符进行初步的排序
        Arrays.sort(suffix);
        
        // rank[下标] = 字典序
        int[] rank = new int[len];
        
        // 注意 rank 数组描述的后缀子串的字典序是从 1 开始的, 最大为 len
        rank[suffix[0].getIndex()] = 1;

        for (int i = 1; i < len; i++) {
            // 开始构建 rank 数组, 默认相邻后缀子串排序级别一样
            rank[suffix[i].getIndex()] = rank[suffix[i - 1].getIndex()];
            if (suffix[i].getC() != suffix[i - 1].getC()) {
                rank[suffix[i].getIndex()]++;
            }
        }
        
        // 利用倍增序列来逐步构建后缀数组
        for (int k = 2; rank[suffix[len - 1].getIndex()] < len; k *= 2) {
            int tmp = k;
            Arrays.sort(suffix, (o1, o2) -> {
                // 基于 rank 进行比较
                int preIndex = o1.getIndex();
                int curIndex = o2.getIndex();

                // 如果前半部分的排序等级一样
                if (rank[preIndex] == rank[curIndex]) {
                    if ((preIndex + tmp / 2) >= len || (curIndex + tmp / 2) >= len) {
                        // o1 子串比 o2 子串长, 根据子串的性质可知 preIndex 比 curIndex 小
                        return -(preIndex - curIndex);
                    }
                    return rank[preIndex + tmp / 2] - rank[curIndex + tmp / 2];
                } else {
                    return rank[preIndex] - rank[curIndex];
                }
            });
            
            // 更新 rank 数组
            rank[suffix[0].getIndex()] = 1;
            
            for (int i = 1; i < len; i++) {
                int i1 = suffix[i].getIndex();
                int i2 = suffix[i - 1].getIndex();
                
                rank[i1] = rank[i2];
                try {
                    if (!txt.substring(i1, i1 + k).equals(txt.substring(i2, i2 + k))) {
                        rank[i1]++;
                    }
                } catch (Exception e) {
                    // 抛出异常, 说明 i1 为起始位置的子串比 i2 为起始位置的子串要长
                    rank[i1]++;
                }
            }
        }
        return suffix;
    }
    
    private static int[] getHeightArray(String txt, SuffixArray[] suffixes) {
        int len = txt.length();
        int[] rank = new int[len];
        // 将 rank 表示为不重复的排名 0 - (len - 1)
        for (int i = 0; i < len; i++) {
            rank[suffixes[i].getIndex()] = i;
        }
        
        // 高度数组表示的是后缀数组中 suffixes[i] 和 suffixes[i - 1] 的最长公共子串的长度, 注意 height[0] = 0
        int k = 0;

        int[] height = new int[len];
        
        for (int i = 0; i < len; i++) {
            int rk_i = rank[i]; // 表示首字母地址为 i 的后缀子串的排名
            
            // 如果是排名最小的后缀
            if (rk_i == 0) {
                height[0] = 0;
                continue;
            }
            
            int rk_i_1 = rk_i - 1;
            // 根据字典序排名去后缀数组找到目标后缀子串的首地址
            int j = suffixes[rk_i_1].getIndex();
            
            if (k > 0) {
                // 当 k 不是 0 时, 说明此时高度数组 height[s] = k, 且 s > 0
                k--;
            }
            
            while (j + k < len && i + k < len) {
                if (txt.charAt(j + k) != txt.charAt(i + k))
                    break;
                k++;
            }
            
            height[rk_i] = k;
        }
        
        return height;
    }
}

class SuffixArray implements Comparable<SuffixArray> {

    // 后缀子串首字符
    private char c;
    
    // 后缀子串首地址
    private int index;

    public SuffixArray(char c, int index) {
        this.c = c;
        this.index = index;
    }

    public char getC() {
        return c;
    }

    public void setC(char c) {
        this.c = c;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    @Override
    public int compareTo(@NotNull SuffixArray o) {
        return this.c - o.getC();
    }

    @Override
    public String toString() {
        return "SuffixArray{" +
                "c=" + c +
                ", index=" + index +
                '}';
    }
}
```

经过测试发现上述代码出现这样的两个字符串时会出现问题：`"123" 和 "2323231"`，稍微修正一下：

```java
@Test
public void test_maxRepeatSubString() {

    String str1 = "abracadabra";
    String str2 = "ecadadabrbcrdar";
    System.out.println(maxRepeatSubString(str1, str2)); // adabr
    String res = maxRepeatSubString("12323", "232323");
    if ("".equals(res) || res.length() == 0)
        System.out.println("无最长公共子串");
    else
        System.out.println(res);
}

private String maxRepeatSubString(String str1, String str2) {

    String str = str1 + str2;
    SuffixArray[] suffixes = buildSuffixArray(str);
    int[] height = getHeightArray(str, suffixes);

    int maxHeight = Integer.MIN_VALUE;
    int maxRank = Integer.MIN_VALUE;

    for (int i = 0; i < height.length; i++) {
        if (height[i] > maxHeight) {
            maxHeight = height[i];
            maxRank = i;
        }
    }

    int index = suffixes[maxRank].getIndex();
    int min = Math.min(str1.length(), str2.length());
    
    if (maxHeight > min) {
        return str.substring(index, min);
    }

    return str.substring(index, index + maxHeight);
}
```



### （2）不可重叠的最长重复子串

我们已经解决了最长重复子串，现在加上不可重叠这一要求，意思就是说最长重复子串不是一个循环串。

比如说目标串是 `"123232323231"` ，可以看出高度数组的最大值是 `height[i]max = 8` 即最长重复子串是 `"23232323"`，但是现在我们要求它不可重叠，即结果应该是 `"2323"`，这里就需要在上一题的基础上进行更改，使用二分枚举 + height 分组的思路。

代码如下：

```java
@Test
public void test_2() {
    System.out.println(maxRepeatSubString2("123232323")); // target: 2323
}

/**
 * 当我们想要求的是不可重叠的最长公共子串的时候, 就需要进行一些特殊的处理
 * 这里应用到一种方法: 二分枚举 + height 分组
 */
private static String maxRepeatSubString2(String str) {
    SuffixArray[] suffix = buildSuffixArray(str);
    int[] height = getHeightArray(str, suffix);

    int l = 0;
    int r = height.length;
    int ans = 0;
    while (l <= r) {
        int mid = (l + r) >> 1; // 二分枚举重叠的最大长度
        if (check(height, suffix, mid)) {
            // 下面的 if 逻辑如果追求极致可以加上
            // if (mid == height.length / 2) {
            //     return mid;
            // }
            l = mid + 1;
            ans = mid;
        } else {
            r = mid - 1;
        }
    }

    int rank = -1;
    for (int i = 0; i < height.length; i++) {
        if (height[i] == ans) {
            rank = i;
            break;
        }
    }

    int index = suffix[rank].getIndex();

    return str.substring(index, index + ans);
}

// 使用 len 对 height 数组进行分组, height[i] 的分布是有规律的, 按照这样的顺序进行交替: [小于 len, 大于等于 len]
// 在大于等于组中更新最大最小原始下标, 大转小的时候检查上一个大于组是否满足不重叠
// 在小于组中, 只需持续地将原始下标赋给 max 和 min, 这样小转大的时候可以保留小于组最后一个元素的下标
private static boolean check(int[] height, SuffixArray[] suffix, int len) {
    int minIndex = suffix[0].getIndex();
    int maxIndex = suffix[0].getIndex();
    for (int i = 1; i < height.length; i++) {
        int index = suffix[i].getIndex();
        if (height[i] >= len) { // lcp 大于 len
            minIndex = Math.min(minIndex, index);
            maxIndex = Math.max(maxIndex, index);
        } else {
            if (maxIndex - minIndex >= len) {
                return true;
            }
            maxIndex = index;
            minIndex = index;
        }
    }
    return false;
}

// 其他代码和上一节一样
```



## 4、总结

字符串匹配的相关算法：

- RabinKarp —— hash
- KMP —— next 数组
- 后缀数组：非常实用，通常会结合高度数组