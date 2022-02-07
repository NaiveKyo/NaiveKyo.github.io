---
title: Algorithm-StringMatching-Of-Suffix&HeightArr
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211208174522.jpg'
coverImg: /img/20211208174522.jpg
cover: false
toc: true
mathjax: false
date: 2022-02-07 12:21:56
summary: "字符串匹配之后缀数组、高度数组"
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---



# 字符串匹配

- 前缀树：字典树 Tire
- 后缀数组
- 后缀自动机



# 后缀数组

> 什么是后缀数组？

就是字符串的所有后缀子串按字典序排序后，在数组中记录后缀的起始下标，后缀数组就是：排名和原下标的映射。

例如：suffixArray[0] = 5，即起始下标为 5 的后缀在所有后缀中字典序最小

与之对应的有一个 rank 数组：给定后缀的下标，返回其字典序，rank[5] = 0;

映射关系：`rank[suffixArray[i]] = i`



例如母串："A B A B A B A B B"，模式串："B A B B"

我们就先把母串的所有后缀子串列出来：

| 后缀子串          | 下标 |
| ----------------- | ---- |
| A B A B A B A B B | 0    |
| B A B A B A B B   | 1    |
| A B A B A B B     | 2    |
| B A B A B B       | 3    |
| A B A B B         | 4    |
| B A B B           | 5    |
| A B B             | 6    |
| B B               | 7    |
| B                 | 8    |

将所有子串按照字典序排序后就得到后缀数组



## 1、常规方法构建后缀数组

最简单的构造方法就是遍历母串，获取每一个子串，然后使用快排进行排序，由于需要对每个字符串进行比较，所以构建后缀数组的时间复杂度是 O(n²logn)。

构建完成后，将模式串与后缀数组中的元素进行比较，这里用到二分查找法，而且也需要进行字符串比较，所以时间复杂度是 O(nlogn) ，总体的时间复杂度：

`T(n) = O(n²logn) + O(nlogn)`

```java
public class SunffixArrayDemo {

    public static void main(String[] args) {
        
        String txt = "ABABBBABABBABB";
        
        String pattern = "BABB";
        
        Suffix[] suffixArray = buildSuffixArray(txt);

        search(suffixArray, pattern);
    }

    /**
     * 利用后缀数组匹配模式串
     * @param suffixArray 后缀数组
     * @param pattern 模式串
     */
    private static void search(Suffix[] suffixArray, String pattern) {
        
        int left = 0;
        int right = suffixArray.length - 1;
        
        while (left <= right) {
            
            int mid = (left + right) >>> 1;
            
            Suffix suffix = suffixArray[mid];
            
            int compareRes = -1;
            
            if (suffix.getSuffix().length() > pattern.length()) {
                String subSuffix = suffix.getSuffix().substring(0, pattern.length());
                compareRes = pattern.compareTo(subSuffix);
            } else
                compareRes = pattern.compareTo(suffix.getSuffix());
            
            
            if (compareRes == 0) {
                System.out.println("match index from: " + suffix.getIndex());
                System.out.println("match String: " + suffix.getSuffix());
                break;
            } else if (compareRes > 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }

    /**
     * 为字符串构建后缀数组
     * 由于使用了快排，而且利用了字符串的比较，所以 T(n) = O(n²log(n))
     * @param txt 目标字符串
     * @return 后缀数组
     */
    private static Suffix[] buildSuffixArray(String txt) {
        
        int len = txt.length();

        Suffix[] suffixArray = new Suffix[len];
        
        for (int i = 0; i < len; i++) {
            String subStr = txt.substring(i);
            suffixArray[i] = new Suffix(subStr, i);
        }

        Arrays.sort(suffixArray);
        
        return suffixArray;
    }
}

class Suffix implements Comparable<Suffix> {
    
    private String suffix;

    private int index;

    public Suffix(String suffix, int index) {
        this.suffix = suffix;
        this.index = index;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    @Override
    public int compareTo(@NotNull Suffix o) {
        
        return getSuffix().compareTo(o.getSuffix());
    }
}
```



## 2、倍增法构建后缀数组

不难看出如果我们想要优化该算法，就得在构建后缀数组上做一些处理，一种相对简单的方法是倍增法。

具体原理就是通过之前提到的 rank 数组，它代表索引与字典序的一种映射关系。

用空间换时间来优化。



`T(n) = O(nlog²(n))`



```java
public class SunffixArrayDemo {

    public static void main(String[] args) {
        
        String txt = "ABBABBBBABBABABB";
        
        String pattern = "BABB";

        Suffix[] suffixArray = redoubleSuffixArray(txt);

        search(suffixArray, pattern);
    }

    /**
     * 利用后缀数组匹配模式串
     * @param suffixArray 后缀数组
     * @param pattern 模式串
     */
    private static void search(Suffix[] suffixArray, String pattern) {
        
        int left = 0;
        int right = suffixArray.length - 1;
        
        while (left <= right) {
            
            int mid = (left + right) >>> 1;
            
            Suffix suffix = suffixArray[mid];
            
            int compareRes = -1;
            
            if (suffix.getSuffix().length() > pattern.length()) {
                String subSuffix = suffix.getSuffix().substring(0, pattern.length());
                compareRes = pattern.compareTo(subSuffix);
            } else
                compareRes = pattern.compareTo(suffix.getSuffix());
            
            
            if (compareRes == 0) {
                System.out.println("match index from: " + suffix.getIndex());
                System.out.println("match String: " + suffix.getSuffix());
                break;
            } else if (compareRes > 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }   
    
    // nlog²(n)
    private static Suffix[] redoubleSuffixArray(String txt) {

        int len = txt.length();
        
        // 需要使用到 rank 数组：下标到排名的映射
        int[] rank = new int[len];
        // 后缀数组
        Suffix[] suffixArray = new Suffix[len];

        // 倍增序列
        for (int k = 1; k <= len; k *= 2) {
            // 参于排序的字符串的长度倍增
            for (int i = 0; i < len; i++) {
                String suffix = txt.substring(i, i + k > len ? len : i + k);
                suffixArray[i] = new Suffix(suffix, i);
            }
            
            if (k == 1) {   // k = 1 表示字符串只有一个字符
                Arrays.sort(suffixArray);
            } else {
                // 填充完毕，开始排序 nlog(n)
                final int tmp = k;
                
                Arrays.sort(suffixArray, (o1, o2) -> {
                    // 利用 rank 数组进行排序: rank 是下标和排名的映射
                    int i = o1.getIndex();
                    int j = o2.getIndex();
                    
                    if (rank[i] == rank[j]) {
                        try {
                            return rank[i + tmp / 2] - rank[j + tmp / 2];
                        } catch (ArrayIndexOutOfBoundsException e) {
                            return o1.getSuffix().length() - o2.getSuffix().length();
                        }
                    } else {
                        return rank[i] - rank[j];
                    }
                });
            }
            
            // 排序完成后生成 rank 数组
            int r = 0;
            rank[suffixArray[0].getIndex()] = r;

            for (int i = 1; i < len; i++) {
                if (suffixArray[i].compareTo(suffixArray[i - 1]) == 0) { // 两串相同
                    rank[suffixArray[i].getIndex()] = r;    // 给定索引，返回该串字典序排名
                } else {
                    rank[suffixArray[i].getIndex()] = ++r;
                }
            }
        }
        
        return suffixArray;
    }
}

class Suffix implements Comparable<Suffix> {
    
    private String suffix;

    private int index;

    public Suffix(String suffix, int index) {
        this.suffix = suffix;
        this.index = index;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    public int getIndex() {
        return index;
    }

    public void setIndex(int index) {
        this.index = index;
    }

    @Override
    public int compareTo(@NotNull Suffix o) {
        
        return getSuffix().compareTo(o.getSuffix());
    }
}
```

## 3、倍增法改进

上面的倍增法构建后缀数组会消耗过多的内存，因为每一次构建后缀数组都要做大量的子串切割，我们可以进行优化，不必总是切分子串。

现在后缀数组只保存子串的首字符在母串中的下标。



```java
public class SuffixArrayDemo2 {

    public static void main(String[] args) {

        String txt = "ABBABBBBABBABABB";

        String pattern = "BABB";

        SuffixR[] suffixArray = redoubleSuffixArray(txt);
        
        search(suffixArray, txt, pattern);
    }

    private static SuffixR[] redoubleSuffixArray(String txt) {

        int len = txt.length();
        
        SuffixR[] suffixArray = new SuffixR[len];

        for (int i = 0; i < len; i++) {
            suffixArray[i] = new SuffixR(txt.charAt(i), i);
        }
        
        Arrays.sort(suffixArray);

        // rank 数组
        int[] rank = new int[len];
        
        rank[suffixArray[0].getIndex()] = 1;

        for (int i = 1; i < len; i++) {
            rank[suffixArray[i].getIndex()] = rank[suffixArray[i - 1].getIndex()];
            if (suffixArray[i].getC() != suffixArray[i - 1].getC())
                rank[suffixArray[i].getIndex()]++;
        }
        
        // 倍增序列
        for (int k = 2; rank[suffixArray[len - 1].getIndex()] < len; k *= 2) {
            
            final int tmp = k;
            
            Arrays.sort(suffixArray, (o1, o2) -> {
                // 基于 rank 进行比较
                int i = o1.getIndex();
                int j = o2.getIndex();
                if (rank[i] == rank[j]) {
                    // 如果前半部分相同
                    if (i + tmp / 2 >= len || j + tmp / 2 >= len) {
                        // o1 子串比 o2 子串长, 根据子串的性质可知 i 比 j 小
                        return -(i - j);
                    }
                    return rank[i + tmp / 2] - rank[j + tmp / 2];
                } else {
                    return rank[i] - rank[j];
                }
            });
            
            // 更新 rank 数组, 之后要利用这个新的 rank 对后缀数组排序
            rank[suffixArray[0].getIndex()] = 1;
            
            for (int i = 1; i < len; i++) {
                int i1 = suffixArray[i].getIndex();
                int i2 = suffixArray[i - 1].getIndex();
                
                rank[i1] = rank[i2];
                try {
                    if (!txt.substring(i1, i1 + k).equals(txt.substring(i2, i2 + k)))
                        rank[i1]++;
                } catch (Exception e) {
                    rank[i1]++;
                }
            }
        }
        
        return suffixArray;
    }

    private static void search(SuffixR[] suffixArray, String txt, String pattern) {
        
        int pLen = pattern.length();
        int tLen = txt.length();
        
        int left = 0;
        int right = suffixArray.length - 1;
        
        while (left <= right) {
            
            int mid = (left + right) >>> 1;
            int index = suffixArray[mid].getIndex();

            int compareRes;
            
            if (tLen - index >= pLen) {
                String subStr = txt.substring(index, index + pLen);
                compareRes = pattern.compareTo(subStr);
            } else {
                compareRes = pattern.compareTo(txt.substring(index));
            }
            
            if (compareRes == 0) {
                System.out.println("match index from: " + index);
                System.out.println("match subString: " + txt.substring(index));
                break;
            } else if (compareRes > 0) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
    }
}

class SuffixR implements Comparable<SuffixR> {
    
    private char c;
    
    private int index;

    public SuffixR(char c, int index) {
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
    public int compareTo(@NotNull SuffixR o) {
        return this.c - o.getC();
    }

    @Override
    public String toString() {
        return "SuffixR{" +
                "c=" + c +
                ", index=" + index +
                '}';
    }
}
```



# 高度数组

高度数组是后缀数组的一个衍生产物，例如字符串 "ABA"，长度为 3，则后缀数组和高度数组的长度也是 3。

高度数组定义：`height[i]` 等于后缀数组中 `suffixArray[i]` 和 `suffixArray[i - 1]` 的 <strong style="color:red">最长公共子串</strong> 的长度，注意 `height[0] = 0` 。



<mark>注：下面的 rank 数组是从 0 开始排名 </mark>

| 子串首地址 | 子串 | 数组下标 | rank 数组 | 后缀数组 | 高度数组 height[i] |
| ---------- | ---- | -------- | --------- | -------- | ------------------ |
| 0          | ABA  | 0        | 1         | A        | 0                  |
| 1          | BA   | 1        | 2         | ABA      | 1                  |
| 2          | A    | 2        | 0         | BA       | 0                  |



记住一个结论：`height[rank[i + 1]] >= height[rank[i]] - 1`



| i    | i + 1 | rank[i]     | rank[i + 1] | height[rank[i + 1] ] | height[rank[i]] - 1 |
| ---- | ----- | ----------- | ----------- | -------------------- | ------------------- |
| 0    | 1     | rank[0] = 1 | rank[1] = 2 | height[2] = 0        | height[1] -1 = 0    |
| 1    | 2     | rank[1] = 2 | rank[2] = 0 | height[0] = 0        | height[2] - 1 = -1  |



> 常规解法

最简单的解法就是根据定义去处理高度数组。

遍历后缀数组（有序递增），计算相邻两串的最长公共子串，其长度就是高度数组的值。

但是字符串的比较时间复杂度：`T(n) = O(n²)`



> 优化

可以看出如果我们想要优化算法，必须在比较这一块做一些处理，普通方法字符串比较是平方级别的，我们可以借助 rank 数组、后缀数组及高度数组的关系：

`height[rank[i + 1]] >= height[rank[i]] - 1`

从而利用 `height[s]` 去推 `height[s + 1]` 的值。

如果已经知道后缀数组中下标为 i 与 i + 1（其实 i 就是排名） 的 lcp 为 h，那么 i 代表的字符串与 i + 1 代表的字符串去掉首字母后的 lcp 为 h - 1.

根据这个我们可以发现，排名为 i 的字符串与排名为 i + 1 的字符串的 lcp 为 k，那么设它去掉首字母后得到的字符串排名为 j，则它与排名为 j + 1 的字符串的 lcp 大于等于 k - 1；

例如对于字符串 `abcefabc`，我们知道 `abcefabc` 与 `abc` 的 lcp 为 3，那么 `bcefabc` 与 `bc` 的 lcp 大于等于 3 - 1。

利用这一点就可以以 `O(n)` 的时间复杂度去求出高度数组。



```java
private static int[] getHeightArray(String txt, SuffixR[] suffixArray) {

    int tLen = txt.length();

    int rank[] = new int[tLen];

    // 将 rank 表示为不重复的排名：0 - n-1
    for (int i = 0; i < tLen; i++) {
        rank[suffixArray[i].getIndex()] = i;
    }

    int[] height = new int[tLen];

    // 为什么设置为 0，是因为高度数组的第一个值就是 0
    int k = 0;

    for (int i = 0; i < tLen; i++) {

        int rk_i = rank[i];    // 首字母下标为 i 的后缀子串的排名

        if (rk_i == 0) { // 如果首地址下标为 i 的后缀子串的排名为 0，则其高度数组为 0，因为没有比该串更小的子串了
            height[0] = 0;
            continue;
        }

        // 首先得到 rank 数组中为 rk_i_1 的值，例如: rank[j] = rk_i_1
        int rk_i_1 = rk_i - 1;  
        // 然后根据排名去后缀数组找到该字符串的首地址下标
        int j = suffixArray[rk_i_1].getIndex(); // j 是字典序为 rk_i_1 的后缀子串首地址下标

        // 当 k 不是 0 时，说明现在高度数组 height[s] = k, 且 s > 0
        if (k > 0)
            k--;

        // i 和 j 分别代表首地址为 i 和 j 的后缀子串
        // 并且 i 和 j 在 rank 数组中是相邻的 rank[j] = rank[i] - 1
        // 这里为什么 j + k 在前面可以想一想
        while (j + k < tLen && i + k < tLen) {
            if (txt.charAt(j + k) != txt.charAt(i + k))
                break;
            k++;
        }

        height[rk_i] = k;
    }

    return height;
}
```

