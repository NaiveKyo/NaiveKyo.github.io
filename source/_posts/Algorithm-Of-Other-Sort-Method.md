---
title: Algorithm Of Other Sort Method
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006224343.jpg'
coverImg: /img/20211006224343.jpg
toc: true
date: 2021-11-10 20:23:06
top: false
cover: false
summary: 计数排序、桶排序、计数排序
categories: Algorithm
keywords: [Algorithm, Sort]
tags: Algorithm
---

## 一、计数排序

- 一句话概括：用辅助数组对数组中出现的数字计数，元素转下标，下标转元素
- 假设元素均大于等于 0，依次扫描原数组，将元素值 k 记录在辅助数组的 k 位上
- 依次扫描辅助数组，如果为 1，将其插入目标数组的空白处
- 问题：如果重复率过高，或者存在负数，就比较麻烦



优缺点：

- 优点：快，适用于数据较为密集或范围较小
- 缺点：如果数据范围很大，元素分布比较稀疏，会导致辅助空间很大，也稀疏，造成空间浪费



代码实现：

```java
// 计数排序
@Test
public void countSort() {

    int[] arr = {9, 8, 7, 6, 5, 4, 3, 2, 1, 2, 3, 9, 10, 11};

    // 这里要找到待待续数组中的最大值从而开辟一个足够大的辅助数组
    // 空间换时间
    int max = findMax(arr);

    int[] help = new int[max + 1];

    for (int i : arr) {
        help[i] += 1;
    }

    for (int i = 0, j = 0; i < help.length; i++) {
        if (help[i] == 0)
            continue;
        else {
            int t = help[i];
            while (t-- > 0) {
                arr[j++] = i;
            }
        }
    }

    System.out.println(Arrays.toString(arr));
}

private int findMax(int[] arr) {
    int max = 0;
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > arr[max])
            max = i;
    }
    return arr[max];
}
```

优缺点都很明显，如果待排序数组元素范围比较紧密而且又追求时间效率，可以用计数排序。



## 二、桶排序

- 一句话：通过 **“分配”** 和 **“收集”** 过程来实现排序
- 思想：设计 k 个桶（bucket）（编号 0 - k-1），然后将 n 个输入数分布到各个桶中，对各个桶中的数进行排序，然后按照次序把各个桶中的元素列出来即可



- 分配算法：value / (max + 1) * arr.length ；
  - 算出 value 应该到哪个桶里，得出的是桶的下标
  - 时间复杂度：O(N) - O(NlgN)

- 数组元素值最大为 max，所以前面除法计算出的值 在 [0, 1) 之间，在乘以数组的长度，最后得到的结果（桶号）为 [0, arr.length) 。



优缺点：

- 优点：速度快 O(N+C)，其中C=N*(logN-logM)，存在两种极端，N = M 和 M = 1
- 缺点：适用于元素分布比较均匀的序列，如果元素分布非常极端，所有元素都分配到同一个桶中，时间复杂度也就退化为桶内排序算法的时间复杂度



代码实现：

```java
// 桶排序
private static LinkedList[] bucket = null;
@Test
public void bucketSort() {

    int[] arr = {9, 5, 3, 7, 1, 4, 6, 9, 2};

    bucketSort(arr);

    System.out.println(Arrays.toString(arr));
}
private void bucketSort(int[] arr) {

    bucket = new LinkedList[arr.length];

    // 入桶
    int max = getMax(arr);
    for (int i = 0; i < arr.length; i++) {
        // 分配算法，计算出当前元素需要进入哪个桶
        int bucketIndex = (arr[i] / (max + 1)) * arr.length;
        // 入桶
        putIntoBucket(bucketIndex, arr[i]);
    }

    // 出桶
    for (int i = 0, j = 0; i < bucket.length && j < arr.length; i++) {
        if (bucket[i] == null)
            continue;
        else {
            for (Object o : bucket[i]) {
                int t = (Integer) o;
                arr[j++] = t;
            }
        }
    }

    // 清理桶
    bucket = null;
}

// 入桶算法
private void putIntoBucket(int index, int element) {

    if (bucket[index] == null) {
        bucket[index] = new LinkedList();
        bucket[index].add(element);
    } else {
        // 排序算法
        sort(bucket[index], element);
    }
}

// 桶内排序算法
private void sort(LinkedList list, int element) {

    int index = -1;
    for (Object o : list) {
        int t = (Integer) o;
        if (element <= t) {
            index = list.indexOf(t);
            break;
        }
    }
    if (index == -1)
        list.addLast(element);
    else 
        list.add(index, element);
}

// 获取数组元素的最大值
private int getMax(int[] arr) {

    int max = 0;
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > arr[max])
            max = i;
    }
    return arr[max];
}
```



## 三、基数排序

- 基数排序是特殊的桶排序，也要设计一个桶，只不过这个桶的大小一开始就决定了
- 基数排序无需比较关键字，而是通过 “分配” 和 “收集” 过程实现排序，它的时间复杂度可达到线性阶：O(n)
- 对于十进制来说，每一位的数在 [0 - 9] 之中，d 位的数，就有 d 列。
- 基数排序首先按照低位有效数字进行排，然后逐次向上一位排序，直到最高位排序结束

优缺点：

- 优点：非常快，线性时间复杂度，而且不需要进行比较
- 缺点：只能用于特定进制的数排序，一般都是十进制
  - 约定：待排数字中没有 0，没有负数（如果有负数，就做一次转换，所有数字加上最小负数的正数，这样可以保证所有数字都是正数）
  - 适用于小范围数据



代码实现：

```java
// 基数排序
private static ArrayList[] bucket_re = new ArrayList[10];

@Test
public void radixSort() {

    // 初始化桶
    for (int i = 0; i < bucket_re.length; i++) {
        bucket_re[i] = new ArrayList();
    }

    int[] arr = {19, 81, 63, 1327, 53, 2, 111, 32, 641, 0};

    radixSort(arr);

    System.out.println(Arrays.toString(arr));
}

private void radixSort(int[] arr) {

    int d = 1;  // 入桶初始化位
    int max = getMax(arr);  // 获取最大值
    int maxD = 1;   // 记录最大值共有多少位

    while (max / 10 != 0) {
        maxD++;
        max /= 10;
    }

    while (d <= maxD) {
        // 从最低位开始进行入桶和出桶，然后依次向更高位进行这个操作
        radixSort(arr, d++);
    }
}

private void radixSort(int[] arr, int radix) {

    // 全部入桶
    for (int i = 0; i < arr.length; i++) {
        putIntoBucket_re(arr[i], getDigitOn(arr[i], radix));
    }

    // 全部出桶
    for (int i = 0, j = 0; i < bucket_re.length && j < arr.length; i++) {
        for (Object o : bucket_re[i]) {
            arr[j++] = (Integer) o;
        }
    }

    // 清空桶
    for (int i = 0; i < bucket_re.length; i++) {
        bucket_re[i].clear();
    }
}

private void putIntoBucket_re(int data, int digitOn) {

    switch (digitOn) {
        case 0:
            bucket_re[0].add(data);
            break;
        case 1:
            bucket_re[1].add(data);
            break;
        case 2:
            bucket_re[2].add(data);
            break;
        case 3:
            bucket_re[3].add(data);
            break;
        case 4:
            bucket_re[4].add(data);
            break;
        case 5:
            bucket_re[5].add(data);
            break;
        case 6:
            bucket_re[6].add(data);
            break;
        case 7:
            bucket_re[7].add(data);
            break;
        case 8:
            bucket_re[8].add(data);
            break;
        default:
            bucket_re[9].add(data);
            break;
    }

}

private int getDigitOn(int data, int radix) {
    // 获取 data 的第 radix 位上面的数 (除法和模运算都用到了, 值得学习)
    return (data / ((int) Math.pow(10, radix - 1))) % 10;
}
```

