---
title: Java IO Stream Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210808175414.jpg'
coverImg: /img/20210808175414.jpg
toc: true
date: 2021-08-08 17:52:55
top: false
cover: false
summary: Java I/O 体系浅析。
categories:
 - Java
 - [Java, IO]
keywords:
 - Java
 - IO
tags:
 - Java
 - IO
---

# IO 流

## 一、IO 概述

### 1、简介

- i：input 输入（读取）
  - 输入：把硬盘中的数据，读取到内存中使用
- o：output 输出（写入）
  - 输出：把内存中的数据，写入到硬盘中保存
- 流：数据（字符，字节）1 个字符 = 2 个字节 = 8 位



Java I/O 操作主要是指使用 `java.io` 包下的内容，进行输入、输出操作。输入也叫做读取数据，输出也叫做写出数据



### 2、分类

根据数据的流向分为：**输入流** 和 **输出流**

- **输入流**：把数据从其他设备上读取到内存中的流
- **输出流**：把数据从内存 中写出到其他设备上的流

根据数据的类型可分为：**字节流** 和 **字符流**



### 3、顶级父类

|        |            输入流             |             输出流             |
| :----: | :---------------------------: | :----------------------------: |
| 字节流 | 字节输入流<br>**InputStream** | 字节输出流<br>**OutputStream** |
| 字符流 |   字符输入流<br>**Reader**    |    字符输出流<br>**Writer**    |



## 二、字节流

### 1、一切皆为字节

一切文本数据（文本、图片、视频等等）在存储时，都是以二进制数字的形式保存，都是一个一个的字节，在传输时也是一样。所以，字节流可以传输任意文件数据。在操作流的时候，我们要时刻明确，无论使用什么样的流对象，底层传输的始终为二进制数据。



### 2、字节输出流 OutputStream

`java.io.OutputStream` 抽象类是表示字节输出流的所有类的超类，将指定的字节信息写出到目的地。它定义了字节输出流的基本共性功能方法：

- `public void close()`：关闭此输出流并释放与此相关联的任何系统资源
- `public void flush()`：刷新此输出流并强制将缓冲区中的字节被写出到磁盘上
- `public void write(byte[] b)`：将 b.length 个字节从指定的字节数组写入此输出流
- `public void write(byte[] b, int off, int len)`：从指定的字节数组写入 len 字节，从偏移量 off 开始输出到此输出流
- `public abstract void write(int b)`：将指定的字节写入此输出流



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210808094827.png)



`OutputStream` 类别的类决定了输出要去往的目标：字节数组（但不是 String）、文件或管道

此外，`FilterOutputStream` 为 “装饰器” 类提供了一个基类，“装饰器” 类把属性或者有用的接口与输出流连接起来。

|            类             |                             功能                             |                   构造器参数<hr/>如何使用                    |
| :-----------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| **ByteArrayOutputStream** |  在内存中创建缓冲区。所有送往 “流” 的数据都要放置在此缓冲区  | 缓冲区初始化尺寸（可选）<hr>用于指定数据的目的地：将其与 `FilterOutputStream` 对象相连以提供有用接口 |
|   **FileOutputStream**    |                      用于将信息写至文件                      | 文件名字符串、文件或 `FileDescriptor` 对象<hr>指定数据的目的地：将其与 `FilterOutputStream` 对象相连以提供有用接口 |
|   **PipedOutputStream**   | 任何写入其中的信息都会自动作为相关 `PipedInputStream` 的输出，实现 "管道化" 概念 | `PipedInputStream`<hr>指定用于多线程的数据的目的地：将其与 `FilterOutputStream` 对象相连以提供有用接口 |
|  **FilterOutputStream**   | 抽象类，作为 "装饰器" 的接口。其中，"装饰器" 为其他 `OutputStream` 提供有用功能 |                         详情请见后文                         |



### 3、文件字节输出流 FileOutputStream

举 `java.io.FileOutputStream` 为例：

简单使用：

```java
/**
 * java.io.OutputStream：此抽象类表示输出字节流的所有类的超类
 *  
 *  看看它的一个子类 java.io.FileOutputStream extends OutputStream
 *      文件字节输出流
 *      
 *  构造方法：
 *      FileOutputStream(File file) 创建文件输出流以写入由指定的 File对象表示的文件。 
 *      FileOutputStream(String name) 创建文件输出流以指定的名称写入文件。
 *      
 *  参数：写入数据的目的地
 *      String name: 目的地是一个文件的路径
 *      File file: 目的地是一个文件
 *  
 *  构造方法的作用：
 *      1. 创建一个 FileOutputStream 对象
 *      2. 会根据构造方法中传递的文件/文件路径，创建一个空的文件
 *      3. 会把 FileOutputStream 对象指向创建好的文件
 *  
 *  写入数据的原理（内存 --> 硬盘）
 *      Java 程序 --> JVM --> OS --> OS调用写数据的方法 --> 把数据写入文件中
 *      
 *  字节输出流的使用步骤：
 *      1. 创建一个 FileOutputStream 对象，构造方法中传入写入数据的目的地
 *      2. 调用 FileOutputStream 对象的方法 write ，把数据写入到文件
 *      3. 释放资源（流使用会占用一定的内存，使用完毕需要把内存清空，提高效率
 */
public class Demo01OutputStream {
    
    public static void main(String[] args) {
        
        FileOutputStream fos = null;
        
        try {
            // 1. 创建对象
            fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_OutputStream\\a.txt");
            // 2. 将数据写入到文件
            fos.write(97);
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                // 3. 关闭流
                if (fos != null) {
                    fos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }
}
```



- 写数据的时候，会把十进制的整数 97 转换为二进制整数 97 
  - **fos.write(1100001); 97 --> 1100001**
  - 硬盘中存储的都是字节，1 个字节 = 8 个比特位
- 任意的文本编辑器，在打开文件的时候，都会查询编码表，把字节转换为字符表示
  - 0-127：查询 ASCII 表
  - 其他值：比如中文操作系统，就会查看 GBK 编码表



> 一次写入多个字节

```java
public class Demo02OutputStream {

    public static void main(String[] args) throws IOException {

        FileOutputStream fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_OutputStream\\a.txt");
        
        // 方式一： 写入多个字节
        fos.write(48);
        fos.write(49);
        fos.write(50);  // 012

        /**
         * 方式二： 字节数组
         *  一次写入多个字节：
         *      如果写的第一个字节为正数(0 - 127)，那么显示的时候会查询 ASCII 表
         *      如果写的第一个字节是负数，那么第一个字节和第二个字节，两个字节组成一个中文显示，查询系统默认编码表(GBK)
         */
        fos.write(new byte[] {49, 50, 51});
        fos.write(new byte[] {-65, -66, -67, 68, 69});
        
        // 方式三：将字节数组的一部分写入输出流
        fos.write(new byte[] {49, 50, 51}, 1, 2);   // 23
        
        // 方式三：写入字符串
        byte[] bytes = "你好".getBytes();
        fos.write(bytes);
        
        fos.close();
    }
}
```



### 4、数据追加续写

之前使用的方法，其实每次程序运行，会创建输出流对象，然后会清空和此输出流关联的文件内容。如果保留目标文件中的数据，还能继续追加新的数据呢？

- `public FileOutputStream(File file, boolean append)`：创建文件输出流以写入由指定的 `File`对象表示的文件，append 表示是否为追加写入

- `public FileOutputStream(String name, boolean append)`：创建文件输出流以指定的名称写入文件



boolean append：

- true：追加数据
- false：清空数据



换行符：

- windows：`\r\n`
- Linux：`/n`
- mac：`/r`



### 5、字节输入流 InputStream

`java.io.InputStream` 抽象类是表示字节输入流的所有类的超类，可以读取到字节信息存储到内存中。它定义了字节输入流的基本共性功能方法

- `public void close()`：关闭此输入流并释放与此流相关联的任何系统资源
- `public abstract int read()`：从输入流读取数据的下一个字节
- `public int read(byte[] b)`：从输入流读取若干字节的数据保存到参数 b 指定的字节数组中，返回的字节数表示读取的字节数，如果遇到输入流的结尾返回 -1
- `public int read(byte[] b,int off,int len)`：从输入流读取若干字节的数据保存到参数 b 指定的字节数组中，其中 off 是指在数组中开始保存数据位置的起始下标，len 是指读取字节的位数。返回的是实际读取的字节数，如果遇到输入流的结尾则返回 -1
- `public int available()`：返回在不阻塞的情况下可以获取的字节数（阻塞意味着当前线程失去了它对资源的占用
- `public skip(long n)`： 从输入流跳过参数 n 指定的字节数目



这三个方法一般结合起来使用，可以完成重复读取操作

首先使用 markSupported() 判断，如果可以重复读取，则使用 mark(int readLimit) 方法进行标记，标记完成之后可以使用 read() 方法读取标记范围内的字节数，最后使用 reset() 方法使输入流重新定位到标记的位置，继而完成重复读取操作。



- `public boolean markSupported()`：判断输入流是否可以重复读取，如果可以就返回 true
- `public void mark(int readLimit)`：如果输入流可以被重复读取，从流的当前位置开始设置标记，readLimit 指定可以设置标记的字节数
- `public void reset()`：使输入流重新定位到刚才被标记的位置，这样可以重新读取标记过的数据



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210808104626.png)

`InputStream` 的作用是用来表示那些从不同数据源产生输入的类：

这些数据源包括：

1. 字节数组
2. String 对象
3. 文件
4. 管道
5. 一个由其他种类的流组成的序列，以便我们可以将它们收集合并到一个流内
6. 其他数据源，例如 Internet



每一种数据源都有相应的 **InputStream 子类**。另外，`FilterInputStream` 也属于一种 `InputStream`，为 **装饰器（decorator）**类提供基类，装饰器类可以将属性或有用的接口与输入流连接在一起。



|             类              |                             功能                             |                   构造器参数<hr/>如何使用                    |
| :-------------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|  **ByteArrayInputStream**   |          允许将内存的缓冲区当作 `InputStream` 使用           | 缓冲区，字节将从中取出<hr>作为一种数据源：将其与 `FilterInputStream` 对象相连以提供有用接口 |
| **StringBufferInputStream** |               将 `String` 转换为 `InputStream`               | 字符串。底层实现实际使用的是 `StringBuffer` <hr>作为一种数据源：将其与 `FilterInputStream` 对象相连以提供有用接口 |
|     **FileInputStream**     |                     用于从文件中读取信息                     | 文件名字符串、文件或 `FileDescriptor` 对象<hr>作为一种数据源：将其与`FilterInputStream` 对象相连以提供有用接口 |
|    **PipedInputStream**     | 产业用于写入相关 `PipedOutputStream` 的数据，实现 ”管道化” 概念，数据从一端流入，从另一端流出 | 参数：`PipedOutputStream`<hr>作为多线程中数据源：将其与`FilterInputStream` 对象相连以提供有用接口 |
|   **SequenceInputStream**   |   将两个或多个 `InputStream` 对象转换成单一 `InputStream`    | 两个 `InputStream` 对象或一个容纳 `InputStream` 对象的容器 `Enumeratin`<hr>作为一种数据源：将其与`FilterInputStream` 对象相连以提供有用接口 |
|    **FilterInputStream**    | 抽象类，作为 “装饰器” 放入接口。其中 “装饰器” 为其他的 `InputStream` 类提供有用功能 |                         详情请见后文                         |



Java 中的字符是 Unicode 编码，即双字节的，而 InputerStream 是用来处理单字节的，在处理字符文本时不是很方便。这时可以使用 Java 的文本输入流 Reader 类，该类是字符输入流的抽象类，即所有字符输入流的实现都是它的子类，该类的方法与 InputerSteam 类的方法类似



### 6、文件字节输入流 FileInputStream

这里举文件字节输入流为例子：`java.io.FileInputStream`

```java
/**
 * java.io.InputStream ： 所有字节输入流的超类
 * 
 * java.io.FileInputStream: 文件字节输入流
 * 
 * 构造方法：
 *  FileInputStream(File file) 
 *      通过打开与实际文件的连接创建一个 FileInputStream ，该文件由文件系统中的 File对象 file命名。 
 *  FileInputStream(String name) 
 *      通过打开与实际文件的连接来创建一个 FileInputStream ，该文件由文件系统中的路径名 name命名。 
 *      
 * 构造方法的作用：
 *  1. 会创建一个 FileInputStream 对象
 *  2. 会把 FileInputStream 对象指向构造方法中要读取的文件
 *  
 * 读取数据原理（硬盘 --> 内存）：
 *      Java 程序 --> JVM --> OS --> OS 调用读取数据的方法 --> 读取文件到内存
 *      
 * 字节输入流使用步骤：
 *   1. 创建 FileInputStream 对象，构造方法中绑定要读取的数据源
 *   2. 使用 FileInputStream 的 read() 方法读取文件
 *   3. 释放资源
 */
public class Demo01InputStream {

    public static void main(String[] args) {
        
        FileInputStream fis = null;
        
        try {
            // 1. 创建对象
            fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_InputStream\\b.txt");
            // 2. 从文件读取数据到输入流
            // int read() 读取文件中的一个字节并返回，文件末尾就返回 -1
            int read = 0;
            do {
                read = fis.read();
                // 这里只是打印得到的字节
                System.out.println(read);                
            } while (read != -1);
            
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                // 3. 关闭流
                if (fis != null) {
                    fis.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```



一次读取多个字节：

```java
public class Demo02InputStream {

    public static void main(String[] args) throws IOException {

        FileInputStream fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_InputStream\\b.txt");
        
        // 这里之前测过 b.txt 保存了 22 个字节
        byte[] bytes = new byte[22];

        // 返回的是读取到的字节的数量
        int read = fis.read(bytes); // 从文件中读取字节，将其存储到缓冲区数组中
        System.out.println(read);
        
        // 要打印读取到的字符串, 详见 String 的构造函数
        System.out.println(new String(bytes));
    }
}
```

### 7、文件复制操作

```java
public class Demo03File_Copy {

    // 目标将 b.txt 复制到 c.txt
    public static void main(String[] args) {
        
        // 1. 准备输入和输出流
        FileInputStream fis = null;
        FileOutputStream fos = null;
        
        try {
            // 2. 创建对象和目标文件关联起来
            fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_InputStream\\b.txt");
            fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_InputStream\\c.txt");
            
            // 3. 开始读取文件到内存，同时从内存取数据写出到文件
            int read = fis.read();
            while (read != -1) {
                fos.write(read);
                read = fis.read();
            }
            System.out.println("文件复制完毕!");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
          	// 关闭资源，先关写的，再关读的，如果写完了，肯定也读完了
            try {
                if (fos != null) {
                    fos.close();
                }
                if (fis != null) {
                    fis.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```



## 三、字符流

当使用字节流读取文本时，可能会有一个小问题，就是遇到中文字符时，可能不会显示完整的字符，那是因为一个中文字符可能占用多个字节存储。所以 Java 提供了一些字符流类，以字符为单位读写数据，专门用于处理文本文件。

### 1、字符输入流 Reader

`java.io.Reader` 抽象类是表示用于读取字符流的所有类的超类，可以读取字符信息到内存中。它定义了字符输入流的基本共性功能方法。

- `public void close()`：关闭此流并释放与此流相关联的系统资源
- `public int read()`：从输入流读取一个字符
- `public int read(char[] cbuf)`：从输入流中读取一些字符，并将它们存储到字符数组 cbuf 中





### 2、FileReader

- `java.io.Reader`
  - `java.io.InputStreamReader`
    - `java.io.FileReader`

读取文件的字符输入流 

```java
/**
 * java.io.Reader 字符输入流，是字符输入流最顶层的父类，定义了一些共性的方法，它是抽象类
 * 
 * 方法：
 *      int read() 读取单个字符并返回
 *      int read(char[] cbuf) 一次读取多个字符，将字符读入数组
 *      void close() 关闭流并释放资源
 *
 * java.io.FileReader extends InputStreamReader extends Reader
 * FileReader: 文件字符输入流
 * 作用：把硬盘文件中的数据以字符的方式读取到内存中
 * 
 * 构造方法：
 *      FileReader(File file) 
 *      FileReader(String fileName) 
 *      参数：读取文件的数据源
 *          fileName ： 文件的路径
 *          file： 一个文件
 *      作用：
 *          1. 创建一个 FileReader 对象
 *          2. 将该对象指向要读取的文件
 *          
 * 文件字符输入流使用步骤：
 *      1. 创建 FileReader 对象，绑定要读取的数据源
 *      2. 使用 FileReader 对象方法，read 读取文件
 *      3. 释放资源
 */
public class Demo01Reader {

    public static void main(String[] args) {

        FileReader fr = null;
        
        try {
            // 创建文件字符流对象
            fr = new FileReader("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_Reader\\c.txt");
            // 读取一个字符
            // int read = 0;
            // while ((read = fr.read()) != -1) {
            //     System.out.println((char) read);
            // }
            
            // 按照字符数组读取
            char[] cbuf = new char[1024];
            int len = 0;    // 记录每次读取的有效字符的数量
            
            len = fr.read(cbuf);

            System.out.println("有效字符: " + len + "\n" + new String(cbuf));
            
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            // 释放资源
            try {
                if (fr != null) {
                    fr.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

### 3、字符输出流 Writer

`java.io.Writer` 抽下类是表示用于写出字符流的所有类的超类，将指定的字符信息写出到目的地。它定义了字符输出流的基本共性功能方法：

- `void write(int c)`：写入单个字符
- `void write(char[] cbuf)`：写入字符数组
- `abstract void write(char[] cbuf, int off, int len)`：写入字符数组的某一部分，从偏移量 off 开始写入 len 长度个字符
- `void write(String str)`：写入字符串
- `void write(String str, int off, int len)`：写入字符串的某一部分，从偏移量 off 开始，写入 len 个字符
- `void flush()`：刷新该流的缓冲
- `void close()`：关闭此流，同时释放资源



### 4、FileWriter

- `java.io.Writer`
  - `java.io.OutputStreamWriter`
    - `java.io.FileWriter`

 ```java
/**
 * java.io.writer ：字符输出流，所有字符输出流的顶层父类，是一个抽象类
 * 
 * java.io.FileWriter extends OutputStreamWriter extends Writer
 * FileWriter：文件字符输出流
 *  作用：把内存中的字符数据写入到文件中
 *  
 * 构造方法：
 *      FileWriter(File file)
 *      FileWriter(File file, boolean append) 
 *      FileWriter(String fileName)
 *      FileWriter(String fileName, boolean append) 
 *      参数：
 *          file：写入数据的目的地
 *          fileName：文件路径
 *          append: 是否是追加写入
 *      构造方法作用：
 *          1. 创建一个 FileWriter 对象
 *          2. 根据构造方法中传入的 文件/文件的路径，创建文件
 *          3. 会把 FileWriter 对象指向创建好的文件
 * 使用步骤：
 *      1. 创建 FileWriter 对象，构造方法绑定写入数据的目的地
 *      2. 使用 FileWriter 对象的方法 write, 将数据写入到内存缓冲区中（字符转换为字节的过程）
 *      3. 使用 FileWriter 对象的方法 flush, 把内存缓冲区中的数据，刷新到文件中
 *      4. 释放资源（会先把内存缓冲区中的数据刷新到文件中）
 */
public class Demo01Writer {

    public static void main(String[] args) {

        FileWriter fw = null;
        
        try {
            // 1. 创建对象
            fw = new FileWriter("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_Writer\\d.txt");
            // 2. 写入单个字符
            // fw.write(97);
            // 2. 写入字符数组
            // char[] chars = {'1', '2', '3', 'a', 'b', 'c', '你', '好'};
            // fw.write(chars);
            // 2. 写入字符串
            String str = "Hello Java I/O Writer, 文件字符输出流";
            fw.write(str);
            // 3. 刷新缓冲区
            fw.flush();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                // 4. 释放资源
                if (fw != null) {
                    fw.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
 ```

> Tip：
>
> 1、虽然 write 重载方法的参数是 int 类型，四个字节，但是只会保留一个字符的信息写出
>
> 2、未调用 close 方法，数据只是保存到了缓冲区，并没有写出到文件中

### 5、关闭和刷新

因为内置缓冲区的原因，如果不关闭输出流，无法写出字符到文件中。但是关闭的流对象，是无法继续写出数据的。如果我们既想写出数据，又想继续使用流，就需要 `flush` 方法。

- **flush**：刷新缓冲区，流对象可以继续使用
- **close**：先刷新缓冲区，然后通知系统释放资源。流对象被关闭，无法继续使用

> Tip: 即便 flush 方法刷新了缓冲区，将数据写入到文件，在操作的最后还是要调用 close 方法关闭流对象，释放系统资源。



**补充：续写和换行**

操作类似 `FileOutputStream`

- 使用带有 `append` 布尔值的构造函数
- 换行：`fw.write("\r\n")`

换行符：

- windows：`\r\n`
- Linux：`/n`
- mac：`/r`



## 四、对比 JDK7 和 JDK9 中流异常处理

### 1、JDK 7 新特性

在 try 的后面加一个 `()`，在括号中定义流对象，那么这个流对象的作用域就只在 try 块中有效。

try 中代码执行完毕，会自动包流对象释放，不用写 finally 了。

```java
public class JKD7_IO {

    public static void main(String[] args) {

        try (FileInputStream fis = new FileInputStream("D:\\a.txt")) {
            
            int read = fis.read();
            
            System.out.println(read);
            
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 2、JDK 9 新特性

try 的前面可以定义流对象

在 try 后边的 `()` 中可以直接引入流对象的名称（变量名）

try 块中代码执行完毕后，流对象也可以自动释放，无需 finally 块

```java
public class JKD9_IO {

    public static void main(String[] args) throws IOException {

      	FileInputStream fis = new FileInputStream("D:\\a.txt");
        FileOutputStream fos = new FileOutputStream("D:\\b.txt");
      
        try (fis; fos) {
            
            int read = fis.read();
            
            fos.write(read);
           
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```



## 五、补充

### 1、Java 字符编码介绍

计算机中，任何的文字都是以指定的编码方式存在的。

Java 中常见编码：

- ISO8859-1：属于单字节编码，最多只能表示 0~255 的字符范围。
- GBK/GB2312：中文的国标编码，用来表示汉字，属于双字节编码。GBK 可以表示简体中文和繁体中文，而 GB2312 只能表示简体中文。GBK 兼容 GB2312。
- Unicode：是一种编码规范，是为解决全球字符通用编码而设计的。UTF-8 和 UTF-16 是这种规范的一种实现，此编码不兼容 ISO8859-1 编码。Java 内部采用此编码。
- UTF：UTF 编码兼容了 ISO8859-1 编码，同时也可以用来表示所有的语言字符，不过 UTF 编码是不定长编码，每一个字符的长度为 1~6 个字节不等。一般在中文网页中使用此编码，可以节省空间



本地的默认编码可以使用 System 类查看。Java 中 System 类可以取得与系统有关的信息，所以直接使用此类可以找到系统的默认编码。方法如下所示：

```java
public static void main(String[] args) {
    // 获取当前系统编码
    System.out.println("系统默认编码：" + System.getProperty("file.encoding"));
}
```

### 2、装饰器模式在 Java I/O 中的应用

Java I/O 类库需要多种不同功能的组合，这正是使用装饰器模式的理由所在。

这也是 Java I/O 类库里存在 **filter（过滤器）**类的原因，抽象类 `filter` 是所有装饰器类的基类。

装饰器必须具有和它所装饰的对象相同的接口，但它也可以扩展接口，而这种情况只发生在个别 `filter` 类中。



但是，装饰器模式也有一个缺点：在编写程序时，它给我们提供了相当多的灵活性（我们可以很容易的混合和匹配属性），但是它同时也增加了代码的复杂性。



Java I/O 类操作不变的原因在于：我们必须创建很多类 —— "核心" I/O 类型加上所有的装饰器，才能得到我们所期望的单个 I/O 对象。（PS：C 语言就不一样，一个 file 包完成所有工作 OvO）。



`FileterInputStream` 和 `FilterOutputStream` 是用来提供装饰器类接口以控制特定输入流（`InputStream`）和输出流（`OutputStream`）的两个类。

它们分别自 I/O 类库中的基类 `InputStream` 和 `OutputStream` 派生而来，这两个类是装饰器的必要条件（以便能为所有正在被修饰的对象提供通用接口）



#### （1）FilterInputStream 类型

通过 `FilterInputStream` 从 `InputStream` 读取数据。



在 `FilterInputStream` 的诸多子类中，如果按照功能来看大致可以分为两类：

- `DataInputStream` 允许我们读取不同的基本类型数据以及 String 对象。搭配相应的 `DataOutputStream`，我们就可以通过数据 "流" 将基本类型的数据从一个地方迁移到另一个地方
- 其他的 `FilterInputStream` 类则在内部修改 `InputStream` 的行为方式：
  - 是否缓冲
  - 是否保留它所读过的行（允许我们查询行数或者设置行数）
  - 是否把单一字符推回输入流等等
  - 可能是为了创建一个编译器



> Tip：我们几乎每次都要对输入进行缓冲 —— 不管我们正在连接什么 I/O 设备，所以，I/O 类库把无缓冲输入（不是缓冲输入）作为特殊情况就显得很合理。



看看 `FilterInputStream` 的常用子类：



|            类             |                             功能                             |                    构造器参数<hr>如何使用                    |
| :-----------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|    **DataInputStream**    | 与 `DataOutputStream` 搭配使用，因此我们可以按照可移植方式从流读取基本数据类型（int，char，long 等等） |     `InputStream`<hr>包含用于读取基本类型数据的全部接口      |
|  **BufferedInputStream**  | 使用它可以防止每次读取时都得进行实际写操作。代表 "使用缓冲区" | `InputStream`，可以指定缓冲区大小（可选）<hr>本质上不提供接口，只不过是向进程中添加缓冲区所必需的。与接口对象搭配 |
| **LineNumberInputStream** | 跟踪输入流中的行号；可调用 `getLineNumber()` 和 `setLineNumber(int)` | `InputStream`<hr>仅增加了行号，因此可能要与接口对象搭配使用  |
|  **PushbackInputStream**  | 具有 "能弹出一个字节的缓冲区"。因此可以将读到的最后一个字符回退。 | `InputStream`<hr>通常作为编译器的扫描器，之所以包含在内是因为 Java 编译器的需要，我们可能永远不会用到 |



#### （2）FilterOutputStream 类型

- 与 `DataInputStream` 对应的是 `DataOutputStream` ，它可以把各种基本数据类型以及 String 对象格式化输出到 "流" 中；这样，任何机器上的任何 `DataInputStream` 都能够读取它们。
- `PrintStream` 最初的目的是为了以可视化格式打印所有的基本数据类型以及 String 对象。它和 DataOutputStream 不同，它的目的是将数据置入 "流" 中，使 DataInputStream 能够可移植的重构它们
- `BufferedOutputStream` 是一个修改过的 `OutputStream`，它对数据流使用缓冲技术；因此当每次向流写入时，不必每次都进行实际的物理写操作。所以在进行输出时，我们可能更经常的使用它。



看看 `FilterOutputStream` 的常用子类：



|            类            |                             功能                             |                    构造器参数<hr>如何使用                    |
| :----------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
|   **DataOutputStream**   | 与 `DataInputStream` 搭配使用，因此可以按照可移植的方式向流中写入基本数据类型（int，char，long等等）（PS：可移植其实指的是不同操作系统定义基本数据类型占用的字节不同） |     `OutputStream`<hr>包含用于写入基本类型数据的全部接口     |
|     **PrintStream**      | 用于产生格式化输出。其中 `DataOutputStream` 处理数据的存储，`PrintStream` 处理数据的显示 | `OutputStream`，可以用 boolean 值指示是否在每次换行时清空缓冲区（可选的），应该是对 `OutputStrem` 对象的 "final" 封装<hr>可能会经常使用到它 |
| **BufferedOutputStream** | 使用它以避免每次发送数据时都要进行实际的写操作。代表 "使用缓冲区" 。可以调用 `flush()` 清空缓冲区 | `OutputStream`，可以指定缓冲区大小（可选的）<hr>本质上并不提供接口，只不过是向进程中添加缓冲区是必须的。与接口对象搭配 |



### 3、字节流和字符流

老的 I/O 流继承层次结构仅支持 8 位字节流，不能很好的处理 16 位的 Unicode 字符。由于 Unicode 用于字符国际化，所以添加了 `Reader` 和 `Writer` 继承层次结构就是为了在所有的 I/O 操作中都支持 Unicode。



- Java 1.1 中向老的字节流体系中添加了一些新类，所以 `InputStream` 和 `OutputStream` 显然不会被取代
- 有时候我们必须把来自 "字节" 层次结构中的类和 "字符" 层次结构中的类结合起来使用。为了实现这个目的，就需要用到 **"适配器"（adapter）** 类
  - `InputStreamReader` 可以把 `InputStream` 转换为 `Reader` 
  - `OutputStreamWriter` 可以把 `OutputStream` 转换为 `Writer`



设计 `Reader` 和 `Writer` 继承层次结构主要是为了国际化。

