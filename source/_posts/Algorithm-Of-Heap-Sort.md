---
title: Algorithm Of Heap Sort
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211005110235.jpg'
coverImg: /img/20211005110235.jpg
toc: true
date: 2021-11-07 17:38:40
top: false
cover: false
summary: 堆排序浅析
categories: Algorithm
keywords: [Algorithm, "Heap Sort"]
tags: Algorithm
---

# 树相关排序

> 补充：节点和结点

两个概念只有微小的语义差别，简单区分一下：

- 结点：线性结构中使用
- 节点：非线性结构中使用



## 1、逻辑结构和物理结构

树毫无疑问是一种逻辑结构，但是在计算机中存储树用的是物理结构。

数据结构中，物理结构有：

- 顺序存储：数组
- 链式存储：链表



树的性质：

- 用数组存储时：
  - 如果给了某个结点在数组中存储的下标 i，我们可以根据这个下标计算出该结点是否有左儿子或右儿子，从而确定它是不是叶子结点。  性质：左儿子在数组中的下标：`2i + 1`，右儿子在数组中的下标：`2i + 2`，如果它们大于数组的总长度，说明不存在。
  - 如果给了某个结点在数组中存储的下标 i，算父节点在数组中的下标：`(i - 1)/ 2`



## 2、树的遍历

```java
public class T1_树_遍历 {

    /**
     * 常用公式：
     *  以数组形式存储一颗树
     *      根结点: 第一个元素
     *      某一结点（数组下标为 i）的左右结点:
     *          左结点: 2i + 1
     *          右结点: 2i + 2
     *      求其父结点: (i - 1) / 2
     */
    
    // 先序遍历，先遍历根结点，然后左子树，最后右子树
    static void tree_preorder(int[] arr, int index) {
        
        if (index < arr.length) {
            System.out.print(arr[index] + " ");
            tree_preorder(arr, 2 * index + 1);
            tree_preorder(arr, 2 * index + 2);
        }
    }
    
    // 中序遍历，先遍历左子树，然后根结点，最后右子树
    static void tree_inorder(int[] arr, int index) {
        
        if (index < arr.length) {
            tree_inorder(arr, 2 * index + 1);
            System.out.print(arr[index] + " ");
            tree_inorder(arr, 2 * index + 2);
        }
    }
    
    // 后序遍历，先遍历左右子树，最后根结点
    static void tree_postorder(int[] arr, int index) {
        
        if (index < arr.length) {
            tree_postorder(arr, 2 * index + 1);
            tree_postorder(arr, 2 * index + 2);
            System.out.print(arr[index] + " ");
        }
    }

    public static void main(String[] args) {

        /**
         * 示例数组: [78, 56, 34, 43, 4, 1, 15, 2, 23]
         *           78
         *          /  \
         *         56  34
         *        / \  / \
         *       43 4  1 15
         *      /\    
         *     2 23
         */
        
        int[] arr = {78, 56, 34, 43, 4, 1, 15, 2, 23};
        
        // 先序遍历
        tree_preorder(arr, 0);  // 78 56 43 2 23 4 34 1 15 
        System.out.println();
        // 中序遍历
        tree_inorder(arr, 0);   // 2 43 23 56 4 78 1 34 15 
        System.out.println();
        // 后序遍历
        tree_postorder(arr, 0); // 2 23 43 4 56 1 15 34 78 
    }
}
```

## 3、堆的概念

- 二叉堆是完全二叉树或者是近似完全二叉树
- 二叉堆满足两个特性：
  - 1、父结点的键值总是大于等于（小于等于）任何一个子结点的键值
  - 2、每个结点的左子树和右子树都是一个二叉堆（都是最大堆或者最小堆）
- 任意结点的值都大于其子结点的值 ———— 大顶堆
- 任意结点的值都小于其子结点的值 ———— 小顶堆



- 可以用一个数组来表示一棵树
  - 一个二叉树 （满足一定条件）== 堆 == 堆排序



## 4、堆排序

了解了堆的概念之后，对于堆排序，我们需要做两步处理：

- 堆化：反向调整使得每个子树都是大顶堆或者小顶堆
- 按序输出元素：把堆顶和最末元素对调，然后调整堆顶元素



堆排序中堆化这一步骤离不开堆的特性以及用数组表示二叉树时的一些特点。



### （1）小顶堆排序

伪代码：(**堆化**)

```java
MinHeap(A) {
  n = A.length;
  for i from n / 2 - 1 down to 0 {
    MinHeapFixDown(A, i, n);
  }
}

MinHeapFixDown(A, i, n) {
  // 找到左右孩子
  left = 2 * i + 1;
  right = 2 * i + 2;
  
  // 如果左孩子已经越界，i 就是叶子节点
  if(left >= n) {
    return;
  }
  min = left;
  if(right >= n) {	// 
    retrun;
  } else {
    if(A[right] < A[left]) {
      min = right;
    }
  }
  // min 就指向了左右孩子中较小的那个
  
  // 如果 A[i] 比两个孩子都要小，不用调整
  if(A[i] <= A[min]) {
    return;
  }
  // 否则，应该找到两个孩子中较小的和 i 进行交换
  temp = A[i];
  A[i] = A[min];
  A[min] = temp;
  // 小孩子的位置上的值发生了变化，i 变更为小孩子那个位置，递归调整
  MinHeapFixDown(A, min, n);
}
```



伪代码：（**排序**）：

```java
sort(A) {
  // 先对 A 进行堆化
  MinHeap(A);
  for(int x = n - 1; x >= 0; x--) {
  	// 把堆顶，0 号元素和最后一个元素对调
  	swap(A, 0, x);
  	// 缩小堆的范围，对堆顶元素进行向下调整
  	MinHeapFixDown(A, 0, x);
  }
}
```

代码实现：

```java
// 1. 小顶堆排序
@Test
public void minHeapSort() {

    int[] arr = {5, 6, 3, 2, 8, 1, 9, 3, 2, 1};

    minHeapSort(arr);
	
    // 打印的结果是从大到小逆序的
    System.out.println(Arrays.toString(arr));
}

private void minHeapSort(int[] arr) {

    // 堆化
    // 从最后一个叶子结点的根结点开始向前推移，经过的所有结点都可以作为一颗子树的根结点
    int lastRoot = (arr.length - 2) >>> 1;
    for (int i = lastRoot; i >= 0; i--) {
        minHeap(arr, i, arr.length);
    }

    // 排序
    // 由于现在是小顶堆了，堆顶元素一定是最小的那个，把它和最后一个元素交换，然后继续调整小顶堆
    for (int i = arr.length - 1; i >= 0; i--) {
        int t = arr[0];
        arr[0] = arr[i];
        arr[i] = t;

        minHeap(arr, 0, i);
    }
}

// 小顶堆堆化
private void minHeap(int[] arr, int i, int length) {

    // 根据传入的结点下标，得到左右孩子的下标
    int leftChild = 2 * i + 1;
    int rightChild = 2 * i + 2;
    int min = leftChild;    // 默认左孩子是左右孩子中较小的那个

    if (leftChild >= length) {
        return; // 叶子结点，没有孩子
    }

    if (rightChild < length) {
        // 左右孩子都有
        if (arr[leftChild] > arr[rightChild])
            min = rightChild;
    }

    // 如果传入的结点比它的左右结点都小，就不用调整了
    if (arr[i] <= arr[min]) {
        return;
    }
    // 否则将较小的值上浮
    int t = arr[i];
    arr[i] = arr[min];
    arr[min] = t;

    // 以较小结点为根节点的子树发生了变化，需要进行递归调整
    minHeap(arr, min, length);
}
```

### （2）大顶堆排序

大顶堆排序和小顶堆的差别就在于堆化的过程是选择较大的上浮，其他都差不多：

```java
// 2. 大顶堆排序
@Test
public void maxHeapSort() {

    int[] arr = {9, 8, 7, 6, 5, 4, 3, 2, 1};

    maxHeapSort(arr);

    System.out.println(Arrays.toString(arr));

}
private void maxHeapSort(int[] arr) {

    // 堆化
    int lastRoot = (arr.length - 2) / 2;
    for (int i = lastRoot; i >= 0; i--) {
        maxHeapSort(arr, i, arr.length);
    }

    // 排序
    for (int i = arr.length - 1; i >= 0; i--) {

        int t = arr[0];
        arr[0] = arr[i];
        arr[i] = t;

        maxHeapSort(arr, 0, i);
    }
}
// 堆化
private void maxHeapSort(int[] arr, int i, int len) {

    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left >= len)
        return;

    int max = left;

    if (right < len) {
        if (arr[right] > arr[left])
            max = right;
    }

    if (arr[max] <= arr[i])
        return;

    int t = arr[i];
    arr[i] = arr[max];
    arr[max] = t;

    maxHeapSort(arr, max, len);
}
```



### （3）分析

堆排序分为两个过程：

- 堆化：建造堆的过程时间复杂度是 n / 2（logn）2 = NlogN
- 排序：NlogN
- 相加：O(n) = NlogN

堆排序和快排的时间复杂度一样，但是由于堆排序在比较上花费的时间较多，即常数时间内要比快排大的多，所以工程中还是快排用的多。

<mark>一个结论：二叉树的一个分支就是 logN 的时间复杂度</mark>