---
title: Algorithm Of Array&Matrix Intro
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150028.jpg'
coverImg: /img/20211031150028.jpg
cover: false
toc: true
mathjax: true
date: 2021-11-30 15:32:57
summary: 多维数据与矩阵运算简介
categories: Algorithm
keywords: Algorithm
tags: Algorithm
---

# 一、基础题解

## 1、顺时针打印二维数组

题目很基础但是也比较注重细节，具体思路：

- 给矩阵定一个左上角和右下角
- 打印的时候设置一个遍历坐标从左上角开始顺时针走
- 顺时针走完一圈后就要更新左上角和右下角坐标，两者不能交错

关键点：不同矩阵最后左上角和右下角的情况不一样，比如说方阵的最后一步左上角和右下角重合，非方阵最后有两种情况，左上角和右下角在同一行上，或同一列上，此时要判断一下。



代码实现:

```java
@Test
public void solution_2_顺时针打印矩阵() {

    int[][] matrix = RandomUtils.getRandomTwoDimensionArray(4, 3, 1, 10);
    printMatrix(matrix);
    System.out.println("顺时针打印:");

    // 左上角
    int leftUpRow = 0;
    int leftUpCol = 0;
    // 右下角
    int rightDownRow = matrix.length - 1;
    int rightDownCol = matrix[rightDownRow - 1].length - 1;

    while (leftUpRow <= rightDownRow && leftUpCol <= rightDownCol) {

        int row = leftUpRow;
        int col = leftUpCol;

        while (col <= rightDownCol) {
            System.out.print(matrix[leftUpRow][col++] + "\t");
        }
        col = rightDownCol;
        System.out.println();
        row++;
        while (row <= rightDownRow) {
            System.out.print(matrix[row++][rightDownCol] + "\t");
        }
        row = rightDownRow;
        System.out.println();
        col--;
        while (row > leftUpRow && col >= leftUpCol) {
            System.out.print(matrix[rightDownRow][col--] + "\t");
        }
        System.out.println();
        row--;
        while (row > leftUpRow) {
            System.out.print(matrix[row--][leftUpCol] + "\t");
        }
        System.out.println();
        leftUpRow++;
        leftUpCol++;
        rightDownRow--;
        rightDownCol--;
    }
}
```



## 2、矩阵中0值所在行列置0

将一个矩阵中 0 所在的行和列都置为 0。

这一题比较巧妙的一点就是并不是在遍历矩阵的时候对 0 值所在行列置 0，而是使用了 2 个数组记录 0 值的行列坐标，最后形成这样的结果：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211130153135.png)



代码实现：

```java
@Test
public void solution_3_矩阵中0值所在的行列一并置0() {

    int[][] matrix = RandomUtils.getRandomTwoDimensionArray(3, 3, 0, 10);

    int M = matrix.length;
    int N = matrix[0].length;

    int[] rowRecord = new int[M];
    int[] colRecord = new int[N];

    for (int i = 0; i < M; i++) {
        for (int j = 0; j < N; j++) {
            if (matrix[i][j] == 0) {
                rowRecord[i] = 1;
                colRecord[j] = 1;
            }
        }
    }

    printMatrix(matrix);
    System.out.println();

    // 这种方式比较巧妙
    for (int row = 0; row < M; row++) {
        for (int col = 0; col < N; col++) {
            if (rowRecord[row] == 1 || colRecord[col] == 1)
                matrix[row][col] = 0;
        }
    }

    printMatrix(matrix);
}
```



## 3、Z 型打印矩阵

按照 Z 型走法去打印一个矩阵中的元素。

解题思路：

- 设置一个坐标去按 Z 型走法遍历矩阵
- 注意该坐标的走向：左下到右上、右上到左下、向右、向下



代码实现：

```java
@Test
public void solution_4_Z型打印矩阵() {

    int[][] matrix = RandomUtils.getRandomTwoDimensionArray(4, 5, 1, 10);
    System.out.println("原矩阵: ");
    printMatrix(matrix);
    System.out.println("================================");

    // 打印元素的坐标
    int r = 0, c = 0;
    // 记录矩阵的行列最大值
    int m = matrix.length;
    int n = matrix[0].length;
    // 标记: 控制坐标斜向移动 左下到右上 还是 右上到左下
    boolean l2r = true; // true 表示左下到右上

    while (r < m && c < n) {

        // 从左下到右上的斜线
        if (l2r) {
            System.out.print(matrix[r][c] + "\t");
            // (左->右斜线) 假如现在在第一行 列未到边界，此时只能向右走
            if (r == 0 && c < n -1) {
                // 向右走一格后需要转向: 右上到左下
                l2r = !l2r;
                c++;
                continue;
            } else if (r > 0 && c < n - 1) {
                // 此时正在向右上角前进
                r--;
                c++;
                continue;
            } else {
                // 最后一列, 只能向下走
                r++;
                l2r = !l2r;
                continue;
            }
        } else {
            // 从右上到左下的斜线
            System.out.print(matrix[r][c] + "\t");
            if (r < m - 1 && c > 0) {
                r++;
                c--;
                continue;
            } else if (r < m - 1 && c == 0) {
                r++;
                l2r = !l2r;
                continue;
            } else {
                c++;
                l2r = !l2r;
                continue;
            }
        }
    }
}
```



## 4、边界为 1 的最大子方阵

给定一个 NxN 的矩阵 matrix，在这个矩阵中，只有 0 和 1 两种值，返回边框全是 1 最大正方形的边长长度。

> 方法一：暴力法

给定的是 NxN 方阵，可知符合条件的最大子方阵的边长长度最大是 N，最小是 1。

从最大的情况向内部推进：

```java
@Test
public void solution_5_边界为1的最大子方阵() {

    int[][] matrix = {
        {0, 1, 1, 1, 1},
        {0, 1, 0, 0, 1},
        {0, 1, 0, 0, 1},
        {0, 1, 1, 1, 1},
        {0, 1, 0, 1, 1}
    };

    int maxRow = matrix.length;
    int maxCol = matrix[0].length;
    int maxSide = 0;

    // 暴力破解
    maxSide = s5_brute_force(matrix, maxRow, maxCol);
    System.out.println(maxSide);
}
private int s5_brute_force(int[][] matrix, int maxRow, int maxCol) {

    // matrix 是方阵，可以所求结果最大为 maxRow, 最小为 0
    for (int i = maxRow; i > 0; i--) {
        int maxR = maxRow - i;
        int maxC = maxCol - i;
        // j 和 k 用于确认左上角元素的范围
        for (int j = 0; j <= maxR; j++) {
            loop3:for (int k = 0; k <= maxC; k++) {
                // l 和 m 用于确认右下角元素的范围
                int l = j + i;
                int m = k + i;
                // 遍历方阵的四条边是否全部为 1
                for (int top = k; top < m; top++) {
                    if (matrix[j][top] == 0)
                        continue loop3;
                }
                for (int right = j + 1; right < l; right++) {
                    if (matrix[right][m - 1] == 0)
                        continue loop3;
                }
                for (int left = j + 1; left < l - 1; left++) {
                    if (matrix[left][k] == 0)
                        continue loop3;
                }
                for (int down = k; down < m - 1; down++) {
                    if (matrix[l - 1][k] == 0)
                        continue loop3;
                }
                // 走完循环，证明出现了四周全为 1 的方阵
                return i;
            }
        }
    }
    return 0;
}
```

时间复杂度：

- 假设最大长度：from N to 1
- 遍历矩阵：N * N
- 内部遍历四条边：4n 约等于 N

总的  $T(n) = O(N^4)$



> 方法二：预处理优化



对于该题能够优化的地方就是在内部遍历四条边的时候，我们可以构建一个辅助三维数组，通过预处理数据，得到一些特征数据。

该三维数组前两维和 matrix 矩阵一样，只是最后一维是一个长度为 2 的数组，第一个元素记录前两维锚定的元素的右方有多少个 1（包括自身），第二个元素记录前两维锚定的元素的下方有多少个 1（包括自身）。



代码如下：

```java
// 方法二：预处理优化
private int s5_preprocess_brute_force(int[][] matrix, int maxRow, int maxCol) {

    // 预处理
    preprocessing(matrix);

    // matrix 是方阵，可以所求结果最大为 maxRow, 最小为 0
    for (int i = maxRow; i > 0; i--) {
        int maxR = maxRow - i;
        int maxC = maxCol - i;
        // j 和 k 用于确认左上角元素的范围
        for (int j = 0; j <= maxR; j++) {
            for (int k = 0; k <= maxC; k++) {
                if (check(j, k, i))
                    return i;
            }
        }
    }
    return 0;
}

// 辅助数组
static int[][][] help = null;

// 预处理
private void preprocessing(int[][] matrix) {
    int n = matrix.length;
    // 预处理数组是三维的，前两维和 matrix 一样，但是第三维记录着该元素的右方和下方的 1 的个数
    help = new int[n][n][2];

    // 先处理 matrix 的最后一行
    int lastRow = n - 1;
    for (int lastCol = n - 1; lastCol >= 0; lastCol--) {
        int val = matrix[lastRow][lastCol];
        if (lastCol == n - 1 && val == 1) {
            help[lastRow][lastCol][0] = 1;
            help[lastRow][lastCol][1] = 1;
        } else if (val == 1) {
            help[lastRow][lastCol][0] = help[lastRow][lastCol + 1][0] + 1;
            help[lastRow][lastCol][1] = 1;
        } else {
            help[lastRow][lastCol][0] = 0;
            help[lastRow][lastCol][1] = 0;
        }
    }

    // 再处理 matrix 的最后一列
    int lastCol = n - 1;
    for (int row = n - 2; row >= 0; row--) {
        int val = matrix[row][lastCol];
        if (val == 1) {
            help[row][lastCol][0] = 1;
            help[row][lastCol][1] = help[row + 1][lastCol][1] + 1;
        } else {
            help[row][lastCol][0] = 0;
            help[row][lastCol][1] = 0;
        }
    }

    // 最后处理其他行和列
    for (int i = n - 2; i >= 0; i--) {
        for (int j = n - 2; j >= 0; j--) {
            int val = matrix[i][j];
            if (val == 1) {
                help[i][j][0] = help[i][j + 1][0] + 1;
                help[i][j][1] = help[i + 1][j][1] + 1;
            } else {
                help[i][j][0] = 0;
                help[i][j][1] = 0;
            }
        }
    }
}

// 通过辅助数组进行判断
private boolean check(int j, int k, int n) {
    if (help[j][k][0] >= n && help[j][k][1] >= n) {
        if (help[j][k + n - 1][1] >= n && help[j + n - 1][k][0] >= n)
            return true;
    }
    return false;
}
```

这道题引入了预处理的概念，和动态规划中打表法有些类似，要注意题中我们是如何进行预处理的，先从最后一行和最后一列处理比较方便。



## 5、子数组最大累加和

- 给定一个数组 arr，返回子数组的最大累加和

例如：arr = [1, -2, 3, 5, -2, 6, -1]; 所有的子数组中 [3, 5, -2, 6] 可以累加出最大的和 12



> 方法一：暴力法

子数组必定是连续的，一个数组拥有的子数组数量和其长度 N 是一个平方级的关系。

$T(N) = O(N²)$

```java
@Test
public void solution_6_子数组最大累加和() {

    int[] arr = {1, -2, 3, 5, -2, 6, -1};

    // 暴力法
    int maxSum = solution_6_brute_force(arr);
    System.out.println(maxSum);
}
// 方法一: 暴力破解法
private int solution_6_brute_force(int[] arr) {

    int maxSum = -1;

    for (int i = 0; i < arr.length; i++) {
        int sum = arr[i];
        int maxOfI = sum;

        for (int j = i + 1; j < arr.length; j++) {
            sum += arr[j];
            if (sum > maxOfI)
                maxOfI = sum;
        }

        if (maxOfI > maxSum)
            maxSum = maxOfI;
    }

    return maxSum;
}
```



> 方法二：优化

对于连续子数组的和，如果其中出现了某一连续部分的和为负数，那么可以认为这一部分对于求和是没有意义的，可以直接越过。

```java
// 方法二：优化
private int solution_6_optimize(int[] arr) {

    int maxSum = -1;
    for (int i = 0; i < arr.length; i++) {
        int sum = arr[i];
        int maxOfI = sum;
        for (int j = i + 1; j < arr.length; j++) {
            sum += arr[j];
            // 如果这部分的和为负数，则可以越过
            if (sum < 0) {
                i = j;
                break;
            } else {
                if (sum > maxOfI)
                    maxOfI = sum;
            }
        }
        if (maxOfI > maxSum)
            maxSum = maxOfI;
    }

    return maxSum;
}
```



## 6、子矩阵的最大累加和

- 给定一个矩阵 matrix，其中的值有正、有负、有0，返回子矩阵的最大累加和

这一题和上一题的不同之处就在于，上一题是数组，这一题是矩阵，但是我们可以利用上一题的思路来求解。

如果直接使用暴力法时间复杂度太高，因为要找出所有子矩阵，太不划算。



- 解题思路：

先对矩阵的每一行求解当前行的最大累加和，接着将 2 行合并为 1 行，进行求解最大累加和，以此类推。

以 3 * 3 矩阵为例：

- 情况一：对每一行求解最大累加和，共 3 种情况
- 情况二：将两行合并为一行求解最大累加和，共 2 种情况
- 情况三：将三行合并为一行求解最大累加和，共 1 种情况
- 从 6 种情况中找到最大值即可求解



代码实现：

```java
@Test
public void solution_7_子矩阵的最大累加和() {

    int[][] matrix = {
        {-1, -1, -1},
        {-1, 2, 2},
        {-1, -1, -1}
    };

    // 利用上一题的思想求解此题
    int maxSum = maxSum(matrix);
    System.out.println(maxSum); // 4
}

private int maxSum(int[][] matrix) {

    int beginRow = 0;
    final int M = matrix.length;
    final int N = matrix[0].length;

    int[] sums = new int[N];
    int max = -1;

    while (beginRow < M) {
        for (int i = beginRow; i < M; i++) {
            for (int j = 0; j < N; j++) {
                sums[j] += matrix[i][j];
            }

            int t = findMaxSum(sums);
            if (t > max)
                max = t;
        }
        Arrays.fill(sums, 0);
        beginRow++;
    }
    return max;
}

private int findMaxSum(int[] sums) {
    
    if (sums.length == 0)
        return 0;
    
    int maxSum = -1;
    for (int i = 0; i < sums.length; i++) {
        int tmp = sums[i];
        int sum = tmp;
        for (int j = i + 1; j < sums.length; j++) {
            tmp += sums[j];
            if (tmp < 0) {
                i = j;
                break;
            }
            if (tmp > sum)
                sum = tmp;
        }
        if (sum > maxSum)
            maxSum = sum;
    }

    return maxSum;
}
```



# 二、矩阵运算

## 1、矩阵加减

> 运算规则

- 矩阵的加减运算要求：
  - 参于运算的矩阵必须为同型矩阵（例如 A<sub>mxn</sub> 和 B<sub>mxn</sub>），即行数和列数都相等。
- 实质：
  - 相同位置上的元素相加减



> 运算性质

- 满足交换律和结合律
  - 交换律：A + B = B + A
  - 结合律：（A + B）+ C = A + （B + C）



## 2、矩阵与数的乘法

> 运算规则

数 $\lambda$ 乘矩阵 A，就是将数 $\lambda$ 乘矩阵 A 中的每一个元素，记为 $\lambda{A}$ 或 ${A}\lambda$ 。

特别的，称 $- A$ 称为 $A = ({a_{ij}})_{m \times s}$ 的负矩阵。



> 运算性质

满足结合律和分配律

- 结合律：$(\lambda\mu)A = \lambda({\mu}A)\quad (\lambda + \mu)A = \lambda A + \mu A$
- 分配律：$\lambda (A + B) = \lambda A + \lambda B$



例题：

已知两个矩阵：
$$
A = \begin{bmatrix} 3 & -1 & 2 \\\ 1 & 5 & 7 \\\ 2 & 4 & 5 \end{bmatrix},
\quad 
B = \begin{bmatrix} 7 & 5 & -2 \\\ 5 & 1 & 9 \\\ 4 & 2 & 1 \end{bmatrix}
$$
满足矩阵方程 $A + 2X = B$，求未知矩阵 $X$ 。

解：由已知条件可知：
$$
X = \frac12(B - A) = \frac12 
\left(
	\begin{bmatrix} 7&5&-2 \\\ 5&1&9 \\\ 4&2&1\end{bmatrix}
	-
	\begin{bmatrix}3&-1&2 \\\ 1&5&7 \\\ 2&4&5\end{bmatrix} 
\right)
= \frac12 \begin{bmatrix}4&6&-4 \\\ 4&-4&2 \\\ 2&-2&-4\end{bmatrix}
= \begin{bmatrix}2&3&-2 \\\ 2&-2&1 \\\ 1&-1&-2\end{bmatrix}
$$


代码实现：

```java
@Test
public void solution_8_矩阵与数的运算() {

    // 注意：这里只举简单的情况，运算双方都是整数
    int[][] A = {
        {1, 2, 3},
        {4, 5, 6},
        {7, 8, 9}
    };

    int n = 2;
    matrixMULInteger(A, n);

    printMatrix(A);

    // 2	4	6
    // 8	10	12
    // 14	16	18
}
private void matrixMULInteger(int[][] matrix, int n) {

    int M = matrix.length;
    int N = matrix[0].length;

    for (int i = 0; i < M; i++) {
        for (int j = 0; j < N; j++) {
            matrix[i][j] *= n;
        }
    }
}
```



## 3、矩阵与矩阵的乘法

> 运算规则

设 $A$ 为 $m \times p$ 的矩阵，$B$ 为 $p \times n$ 的矩阵，那么称 $m \times n$ 的矩阵 $C$ 为矩阵 $A$ 与 $B$ 的乘积，记作 $C = AB$，其中矩阵 $C$ 的第 $i$ 行第 $j$ 列元素可以表示为:


$$
(AB)_ {ij} = \sum_ {k = 1} ^ {p} a_ {ik} b_ {kj} = a_ {i1} b_ {1j} + a_ {i2} b_ {2j} + {\cdots} + a_ {ip} b_ {pj}
$$




矩阵 $A$ ，$B$ 表示为：




$$
A = \begin{bmatrix}a_{1,1}&a_{1,2}&a_{1,3} \\\ a_{2,1}&a_{2,2}&a_{2,3}\end{bmatrix}
\qquad
B = \begin{bmatrix}b_{1,1}&b_{1,2} \\\ b_{2,1}&b_{2,2} \\\ b_{3,1}&b_{3,2}\end{bmatrix}
$$




注意：

- 当矩阵 $A$ 的列数（column）等于矩阵 $B$ 的行数（row）时，$A，B$ 才可以相乘；
- 矩阵 $C$ 的行数等于矩阵 $A$ 的行数，$C$ 的列数等于 $B$ 的列数；
- 乘积 $C$ 的第 m 行第 n 列元素等于矩阵 $A$ 的第 m 行元素与矩阵 $B$ 的第 n 列对应元素乘积之和。



> 基本性质

- 乘法结合律：$(AB)C = A(BC)$
- 乘法左分配律：$(A + B)C = AC + BC$
- 乘法右分配律：$C(A + B) = CA + CB$
- 对数乘的结合性：$k(AB) = (kA)B = A(kB)$
- 转置：$(AB)^T = B^TA^T$
- 矩阵乘法在以下两种情况下满足交换律：
  - $AA^* = A^*A$，$A$ 和伴随矩阵相乘满足交换律
  - $AE = EA$，$A$ 和单位矩阵或数量矩阵满足交换律

> 方阵的幂

定义：设 $A$ 是方阵，$k$ 是一个正整数，规定 $A^0 = E,{\quad}A^k = \underbrace{A{\cdot}A{\cdot}A{\cdot}\\;{\cdots}\\;{\cdot}A}_k$





> 代码示例: 常规矩阵乘法

例如：
$$
C = AB = 
\begin{bmatrix}7&4&5 \\\ 2&7&3\end{bmatrix}
\times
\begin{bmatrix}5&1 \\\ 1&6 \\\ 7&6\end{bmatrix}
=
\begin{bmatrix}74&61 \\\ 38&62\end{bmatrix}
$$


```java
@Test
public void solution_9_矩阵与矩阵乘法() {

    int[][] A = RandomUtils.getRandomTwoDimensionArray(2, 3, 1, 7);
    int[][] B = RandomUtils.getRandomTwoDimensionArray(3, 2, 1, 7);

    System.out.println("matrix A :");
    printMatrix(A);

    System.out.println("matrix B :");
    printMatrix(B);

    System.out.println("A x B = ");
    int[][] res = matrixMULmatrix(A, B);
    printMatrix(res);

}

private int[][] matrixMULmatrix(int[][] A, int[][] B) {

    if (A[0].length != B.length) {
        throw new IllegalArgumentException("运算双方不符合矩阵乘法规则!");
    }

    int M = A.length;
    int N = B[0].length;

    int[][] res = new int[M][N];

    for (int i = 0; i < M; i++) {
        for (int j = 0; j < N; j++) {
            int sum = 0;
            for (int l = 0; l < B.length; l++) {
                sum += A[i][l] * B[l][j];
            }
            res[i][j] = sum;
        }
    }

    return res;
}
```



