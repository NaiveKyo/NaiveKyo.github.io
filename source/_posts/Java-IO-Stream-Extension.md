---
title: Java IO Stream Extension
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210811103701.jpg'
coverImg: /img/20210811103701.jpg
toc: true
date: 2021-08-11 10:36:22
top: false
cover: false
summary: Java I/O 体系补充知识。
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

## 一、属性集

### 1、概述

`java.util.Properties` 继承自 `Hashtable` ，用来表示一个持久的属性集。它使用键值对存储数据，每个键和对应的值都是一个字符串。该类被许多 Java 类使用，比如获取系统属性时，`System.getProperties()` 方法就是返回一个 **Properties** 对象。



### 2、Properties

构造方法：

- `Properties()`：创建一个没有默认值的空属性列表

- `Properties(Properties defaults)` ：创建具有指定默认值的空属性列表



基本的存储方法：

- `public Object setProperty(String key, String value)`：保存一对属性
- `public String getProperty(String key)`：使用此属性列表中指定的键来搜索对应的属性值
- `public Set<String> stringPropertyNames()`：所有键的名称的集合



```java
/**
 * java.util.Properties 集合 extends Hashtable<K, V> implements Map<K, V>
 *     Properties类表示一组持久的属性。 Properties可以保存到流中或从流中加载。 属性列表中的每个键及其对应的值都是一个字符串。
 *     Properties 是唯一一个和 IO 流相结合的集合
 *      可以使用 Properties 集合中的方法：
 *          store: 把集合中的临时数据，持久化写入磁盘中
 *          load: 把硬盘中保存的文件（键值对），读取到集合中
 *          
 *     属性列表中每一个键和对应的值都是字符串：
 *          Porperties 是一个双列集合，key 和 value 默认是字符串
 */
public class Demo01_Properties {

    public static void main(String[] args) {
        
        // show01();

        // try {
        //     show02();
        // } catch (IOException e) {
        //     e.printStackTrace();
        // }

        try {
            show03();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 使用 load 方法将文件中的键值对读取到内存并存储到 Properties 集合中
     * load(InputStream inStream) 从输入字节流读取属性列表（键和元素对）。
     * load(Reader reader) 以简单的线性格式从输入字符流读取属性列表（关键字和元素对）。 
     * 
     * 参数： 
     *      InputStream: 字节输入流
     *      Reader: 字符输出流
     * 使用步骤：
     *      1. 创建 Properties 对象
     *      2. 使用方法 load, 读取保存键值对的文件
     *      3. 遍历 Properties 集合
     * 注意：
     *      1. 存储键值对的文件中，键与值默认的连接符号可以使用 =、空格、或其他符号
     *      2. 存储键值对的文件中，可以使用 # 进行注释，被注释的键值对不会再被读取
     *      3. 存储键值对的文件中，键与值默认就是字符串，不用加引号
     */
    private static void show03() throws IOException {

        Properties properties = new Properties();

        FileReader fr = new FileReader("src\\main\\java\\com\\naivekyo\\Java_Properties\\properties.txt");

        properties.load(fr);
        
        // 遍历集合
        for (String key : properties.stringPropertyNames()) {
            System.out.println(key + " --> " + properties.getProperty(key));
        }
    }

    /**
     * 使用 store 方法将集合中临时存储的内容持久化到硬盘
     * store(OutputStream out, String comments) 
     *      将此属性列表（键和元素对）写入此 Properties表中，以适合于使用 load(InputStream)方法加载到 Properties表中的格式输出流。 
     * store(Writer writer, String comments) 
     *      将此属性列表（键和元素对）写入此 Properties表中，以适合使用 load(Reader)方法的格式输出到输出字符流。 
     *      
     *  参数：
     *      OutputStream out: 字节输出流，不能写出中文
     *      Writer writer: 字符输出流，可以写出中文
     *      comments: 注释，解释说明保存的文件是用来做什么的，注释不可以使用中文，会产生乱码
     *      
     *  使用步骤：
     *      1. 创建 Properties 对象
     *      2. 创建 字节/字符 输出流，构造函数绑定目标文件
     *      3. 使用 Properties 对象的 store 方法，把集合中的临时数据持久化写入到磁盘中存储
     *      4. 释放资源
     */
    private static void show02() throws IOException {

        // 1. 创建 Properties 对象
        Properties properties = new Properties();
        properties.setProperty("one", "1");
        properties.setProperty("two", "2");
        properties.setProperty("three", "3");
        
        // 2. 创建字符输出流
        FileWriter fw = new FileWriter("src\\main\\java\\com\\naivekyo\\Java_Properties\\properties.txt");
        
        // 3. 使用 store 方法
        properties.store(fw, "Test use properties.");
        
        // 4. 关闭流
        fw.close();
    }

    /**
     * 使用 Properties 存储数据，遍历数据
     * Properties 默认 k 和 v 都是字符串
     * 它有一些特有的操作字符串的方法:
     *      Object setProperty(String key, String value) 实质调用的就是 Hashtable 的 put 方法
     *      String getProperty(String key) 通过 key 找到 value，相当于 Map 集合的 get 方法
     *      Set<String> stringPropertyNames() 返回此属性列表的键集，相当于 Map 集合的 KeySet 方法
     */
    private static void show01() {

        // 默认就是字符串
        Properties properties = new Properties();

        // 添加键值对
        properties.setProperty("one", "1");
        properties.setProperty("two", "2");
        properties.setProperty("three", "3");
        
        // 遍历集合
        Set<String> keySet = properties.stringPropertyNames();

        for (String key : keySet) {
            System.out.println(properties.getProperty(key));
        }
    }
}
```



## 二、缓冲流

### 1、概述

缓冲流，也叫高效流，是对 4 个基本的 `FileXxx` 流的增强，所以也是四个流，按照数据类型分类：

- **字节缓冲流**：`BufferedInputStream` 、`BufferedOutputStream`
- **字符缓冲流**：`BufferedReader`、`BufferedWriter`

缓冲流的基本原理：在创建流的时候，会创建一个内置的默认大小的缓冲区数组，通过缓冲区读写，减少系统 IO 次数，从而提高读写效率。



### 2、字节缓冲流

构造方法：

- `public BufferedInputStream(InputStream in)`：创建一个新的字节缓冲输入流
- `public BufferedOutputStream(OutputStream out)`：创建一个新的字节缓冲输出流



> BufferedOutputStream

```java
/**
 * java.io.BufferedOutputStream extends FilterOutputStream extends OutputStream
 * 字节缓冲输出流
 * 
 * 构造方法：
 *      BufferedOutputStream(OutputStream out) 
 *      BufferedOutputStream(OutputStream out, int size) 
 *  参数：
 *      size: 指定缓冲区大小
 *  使用步骤：
 *      1. 创建 FileOutputStream 对象，构造方法绑定输出的目的地
 *      2. 创建 BufferedOutputStream, 构造方法传入 FileOutputStream, 提高 FileOutputStream 的效率
 *      3. 使用 FileOutputStream 对象方法，write，把数据写入到内部缓冲区中
 *      4. 使用 FileOutputStream 对象方法 flush，把内部缓冲区中的内容持久化到磁盘
 *      5. 释放资源（close 方法默认先刷新缓冲区）
 */
public class Demo01BufferedOutputStream {

    public static void main(String[] args) throws IOException {

        FileOutputStream fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_Buffered\\a.txt");

        BufferedOutputStream bos = new BufferedOutputStream(fos);
        
        bos.write("把数据写入到内部缓冲区中".getBytes());
        
        bos.flush();
        
        bos.close();
    }
}
```



> BufferedInputStream

```java
/**
 * java.io.BufferedInputStream extends InputStream
 * 字节缓冲输入流
 * 
 * 构造方法：
 *      BufferedInputStream(InputStream in) 
 *      BufferedInputStream(InputStream in, int size) 
 * 参数：
 *     size：为缓冲区指定大小
 * 
 * 使用步骤：
 *      1. 创建 FileInputStream 对象，构造方法绑定数据源
 *      2. 创建 BufferedInputStream 对象，构造方法绑定输入流并为其创建缓冲区，提高输入流效率
 *      3. 使用 BufferedInputStream 对象的 read 方法，读取字节
 *      4. 释放资源
 */
public class Demo02BufferedInputStream {

    public static void main(String[] args) throws IOException {

        FileInputStream fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_Buffered\\a.txt");

        BufferedInputStream bis = new BufferedInputStream(fis);
        
        byte[] bytes = new byte[1024];
        int read = bis.read(bytes);

        System.out.println("有效字符: " + read);
        System.out.println(new String(bytes));
    }
}
```



### 3、字符缓冲流

构造方法：

- `public BufferedWriter(Writer out)`：创建一个新的字符缓冲输出流
- `public  BufferedReader(Reader in)`：创建一个新的字符缓冲输入流



> BufferedWriter

```java
/**
 * java.io.BufferedWriter extends Writer
 *      字符缓冲输出流
 *  
 * 特有的成员方法：
 *      void newLine() 写入一个行分隔符。会根据不同的操作系统，获取不同的分隔符
 */
public class Demo03BufferedWriter {

    public static void main(String[] args) throws IOException {

        FileWriter fw = new FileWriter("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_Buffered\\b.txt");

        BufferedWriter bw = new BufferedWriter(fw);
        
        // bw.write("将这段字符串通过 BufferedWriter 先输出到缓冲区中，然后持久化到磁盘。");
        
        // 测试 newLine()
        for (int i = 0; i < 10; i++) {
            bw.write("测试特有方法 newLine()");
            bw.newLine();
        }
        
        bw.flush();
        
        bw.close();
    }
}
```

> BufferedReader

```java
/**
 * java.io.BufferedReader extends Reader
 *      字符缓冲输入流
 * 
 * 特有方法：
 *      readLine() 读一行文字。  
 *      一行被视为由换行符（'\ n'），回车符（'\ r'）中的任何一个或随后的换行符终止。
 *      包含行的内容的字符串，不包括任何行终止字符，如果已达到流的末尾，则为null 
 */
public class Demo04BufferedReader {

    public static void main(String[] args) throws IOException {

        FileReader fr = new FileReader("src\\main\\java\\com\\naivekyo\\Java_IO\\IO_Buffered\\b.txt");

        BufferedReader br = new BufferedReader(fr);
        
        String read = null;
        while ((read = br.readLine()) != null) {
            System.out.println(read);
        }

        br.close();
    }
}
```



## 三、转换流

### 1、字符编码和字符集

> 字符编码

计算机中存储的信息都是用二进制表示的，而我们在屏幕上看到的数字、英文、标点符号、汉字等等字符都是二进制数转换后的结果。

- 按照某种规则，将字符存储到计算机中，称为 **编码**。
- 反之，将存储在计算机中的二进制数据按照某种规则解析显示出来，称为 **解码**。

按照同一套规则编码和解码，字符显示正常，如果规则不同会发生乱码现象。

- **字符编码（Character Encoding）**：就是一套自然语言的字符和二进制数之间的对应规则



编码表：生活中文字和计算机中二进制的对应规则



> 字符集

- **字符集（Charset）**：也叫编码表，是一个系统支持的所有字符的集合，包括国家文字、标点符号、图形符号、数字等等



计算机要准确的存储和识别各种字符集符号，需要进行字符编码，一套字符集必然至少有一套字符编码。常见字符集有 `ASCII` 字符集、`GBK` 字符集、`Unicode` 字符集等等

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210810214028.png)

可见，当指定了 **编码**，它所对应的 **字符集** 也就确定了，所以 **编码** 才是我们要关心的。

- ASCII ((American Standard Code for Information Interchange): 美国信息交换标准代码）是基于拉丁字母的一套电脑编码系统，用于显示现代英语
  - 基本的 ASCII 字符集，使用 7 位（bit）表示一个字符，共 128 字符。ASCII 的扩展字符集使用 8位（bit）表示一个字符，共 256 个字符，方便支持欧洲常用字符
- ISO-8859-1字符集：
  - 拉丁码表，别名 Latin-1，用于显示欧洲使用的语言
  - ISO-8859-1 使用单字节编码，兼容 ASCII 码
- GBxxx 字符集：
  - GB 就是国标的意思，是为了显示中文而设计的一套字符集
  - **GB2312**：简体中文码表。一个字符如果小于 127 就和原来的意义一样。但两个大于 127 的字符连在一起时，就表示一个汉字，这样大约可以组合了包含 7000 多个简体汉字。两个字节长的编码就是常说的 "全角" 符号，原来在 127 号一下的就叫 "半角" 字符
  - **GBK**：最常用的中文码表。在 GB2312 标准基础上的扩展规范，使用了双字节编码方案。
  - **GB18030**：最新的中文码表。采用多字节编码
- Unicode 字符集：
  - Unicode 编码系统为表达任意语言的任意字符而设计，是业界的一种标准，也称为统一码、标准万国码。
  - 它最多使用 4 个字节的数字来表达每个字母、符号、或者文字。有三种编码方案：UTF-8、UTF-16、UTF-32。最为常用的是 UTF-8 编码
  - **UTF-8**：
    1. 128 个 US-ASCII 字符，只需要一个字节
    2. 拉丁文等字符，需要两个字节编码
    3. 大部分常用字（含中文），使用三个字节编码
    4. 其他极少使用的 Unicode 辅助字符，使用四字节编码



### 2、编码引发的问题

在 IDEA 中，使用 `FileReader` 读取项目中的文件。由于 IDEA 的设置，都是默认的 `UTF-8` 编码，所以没有任何问题。但是，当读取 Windows 系统中创建的文件时，由于 Windows 系统默认的是 GBK 编码，就会出现乱码。

```java
public class Trouble_Encoding {

    public static void main(String[] args) throws IOException {

        FileReader fileReader = new FileReader("D:\\GBK_encoding.txt");
        
        int read;
        
        while ((read = fileReader.read()) != -1) {
            System.out.println((char) read);
        }
        
        fileReader.close();
    }
}
```



### 3、转换流简介

- Java 原始的字节流不会被弃用

- Java 现在字符流用的多

- 有些场景需要将字节流转换为字符流，通过 **适配器模式**

- 转换流

  - `java.io.Reader`
    - `java.io.InputStreamReader`
  - `java.io.Writer`
    - `java.io.OutputStreamWriter`

  

### 4、InputStreamReader

转换流 `java.io.InputStreamReader`，是 Reader 的子类，是从字节流到字符流的桥梁。它读取字节，并使用指定的字符集将其解码为字符。它的字符集可以由名称指定，也可以接收平台的默认字符集。



> 构造方法

- `InputStreamReader(InputStream in)`：创建一个使用默认字符集的字符流
- `InputStreamReader(InputStream in, String charsetName)`：创建一个指定字符集的字符流



先提一下之前使用的 `FileReader`

```java
    public FileReader(String fileName) throws FileNotFoundException {
        super(new FileInputStream(fileName));
    }
```

可以发现它的内部使用的是 `FileInputStream`，也就是说利用 FileReader 读取文件做了这两件事：

- 先使用字节流读取文件
- 然后将字节流按照默认字符集对应的编码将字节解码成字符



而 **FileReader 继承自 InputStreamReader**。



> 使用步骤

```java
/**
 * java.io.InputStreamReader extends Reader
 *      作用：是字节流通向字符流的桥梁：它使用指定的 charset 读取字节并将其解码为字符（解码）
 * 
 * 构造方法：
 *      InputStreamReader(InputStream in) 
 *          创建一个使用默认字符集的InputStreamReader
 *      InputStreamReader(InputStream in, String charsetName) 
 *          创建一个使用命名字符集的InputStreamReader
 *       
 *      参数：
 *          in: 字节输入流
 *          charsetName: 指定的编码表名称，不区分大小写
 *      
 *      注意事项：
 *          构造方法指定的编码表要和文件的编码相同，否则会发生乱码
 */
public class Demo02InputStreamReader {

    public static void main(String[] args) {

        try {
            
            read_file_with_charset("utf-8", "utf_8.txt");

            read_file_with_charset("gbk", "gbk.txt");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 以指定字符集读取指定文件
     */
    private static void read_file_with_charset(String charset, String fileName) throws IOException {

        InputStreamReader isr = new InputStreamReader(new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\ReverseStream\\" + fileName), charset);
        
        int read;
        while ((read = isr.read()) != -1) {
            System.out.println((char) read);
        }
        
        isr.close();
    }
}
```



### 5、OutputStreamWriter

- `java.io.Writer`
  - `java.io.OutputStreamWriter`

```java
/**
 * java.io.OutputStreamWriter extends Writer
 *      作用：是字符流通向字节流的桥梁，可使用指定的 charset 将要写入流中的字符编码为字节。(编码)
 *      
 * 继承自父类的共性方法：
 * 
 * 构造方法：
 *      OutputStreamWriter(OutputStream out) 
 *          创建一个使用默认字符编码的OutputStreamWriter。 
 *      OutputStreamWriter(OutputStream out, String charsetName) 
 *          创建一个使用指定字符集的OutputStreamWriter。 
 * 
 * 使用步骤：
 *      1. 创建 OutputStreamWriter 对象，构造方法中传入字节输出流和指定的编码表格式
 *      2. 使用 OutputStreamWriter 对象的方法 write，把字符转换为字节存储到缓冲区（编码）
 *      3. 使用 OutputStreamWriter 对象的方法 flush，把内存缓冲区中的字节刷新到磁盘文件中
 *      4. 释放资源
 */
public class Demo01OutputStreamWriter {

    public static void main(String[] args) {

        try {
            // 1. 创建一个 UTF-8 编码格式的文件
            write_with_charset("UTF-8", "utf_8.txt");
            
            // 2. 创建一个 GBK 格式的文件
            write_with_charset("GBK", "gbk.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 使用转换流写 UTF-8 格式的文件
     */
    private static void write_with_charset(String charset, String fileName) throws IOException {

        OutputStreamWriter osw = new OutputStreamWriter(new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\ReverseStream\\" + fileName, true), charset);
        
        osw.write("你好");
        
        osw.flush();
        
        osw.close();
    }
}
```



## 四、序列化流

### 1、概述

Java 提供了一种对象 **序列化** 的机制，用一个字节序列可以表示一个对象，该字节序列包括该 **对象的数据**、**对象的类型** 和 **对象中存储的属性** 等信息。字节序列写出到文件之后，相当于文件中 **持久保存** 了一个对象的信息。

反之，该字节序列还可以从文件当中读取出来，重构对象，对它进行 **反序列化**。对象的数据、对象的类型 和 对象中存储的数据 信息，都可以用来在内存中创建对象。



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210811090619.png)

### 2、ObjectOutputStream

- `java.io.OutputStream`
  - `java.io.ObjectOutputStream`：将 Java 对象的原始数据类型写出到文件，实现对象的持久存储



> 构造方法

- `public ObjectOutputStream(OutputStream out)`：创建一个指定 OutputStream 的 ObjectOutputStream



> 序列化操作

一个对象想要序列化，必须满足两个条件：

- 该类必须实现 `java.io.Serializable` 接口，`Serializable` 是一个标记接口，不实现此接口的类将不会使任何状态序列化或者反序列化，会抛出 `NotSerializableException`
- 该类的所有属性必须是可序列化的。如果有一个属性不需要可序列化，则该属性必须注明是瞬态的，使用 `transient` 关键字修饰



### 3、ObjectInputStream

- `java.io.InputStream`
  - `java.io.ObjectInputStream`：反序列化流，将之前使用 ObjectOutputStream 序列化的原始数据恢复为对象



> 构造方法

- `public ObjectInputStream(InputStream in)`：创建一个指定 InputStream 的 ObjectInputStream



> 反序列化操作 一

如果能找到一个对象的 `class` 文件，我们可以进行反序列化操作，调用 `ObjectInputStream` 读取对象的方法:

- `public final Object readObject()`：读取一个对象



反序列化的两个条件：

- 类必须实现 `Serializable` 接口
- 类必须存在对应的 class 文件



> 反序列化操作 二

对于 JVM 而言，反序列化的时候，先找到 class 文件，但是 class 文件在序列化对象之后被修改了，那么反序列化操作也会失败，抛出 `InvalidClassException` 异常，发生这个异常的原因可能如下：

- 该类的序列版本号与从流中读取的类描述符的版本号不匹配
- 该类包含未知数据类型
- 该类没有可访问的无参数构造方法



`Serializable` 接口给需要序列化的类，提供了一个序列版本号。`serialVersionUID` 该版本号的目的在于验证序列化对象和对应类是否版本匹配。

### 示例代码

```java
/**
 * java.io.ObjectOutputStream extends OutputStream
 *  ObjectOutputStream: 对象的序列化流
 *  作用：把对象以流的形式写入到文件中保存
 *  
 *  构造方法：ObjectOutputStream(OutputStream out) 
 *              创建一个写入指定的 OutputStream 的 ObjectOutputStream。 
 *
 *  特有的成员方法：
 *      writeObject(Object obj) 将指定的对象写入 ObjectOutputStream。 
 *      
 *  流的使用步骤：
 *      1. 创建 ObjectOutputStream 对象，构造方法传入字节输出流
 *      2. 使用 ObjectOutputStream 对象的 writeObject 方法，把对象写入到文件中
 *      3. 释放资源
 *      
 *      
 *      
 * java.io.ObjectInputStream extends InputStream
 *  ObjectInputStream: 对象的反序列化流
 *      作用：把对象从文件中以流的形式读取出来
 *  构造方法：public ObjectInputStream(InputStream in) 创建从指定的 InputStream 读取的 ObjectInputStream。 
 *  
 *  特有的成员方法:
 *      readObject(): 从 ObjectInputStream 读取一个对象。 
 *  
 *  使用步骤：
 *      1. 创建 ObjectInputStream 对象，构造方法传入字节输入流
 *      2. 使用 ObjectInputStream 对象方法 readObject, 从输入流中读取一个对象
 *      3. 释放资源
 *      4. 使用读取出的对象 (打印)
 */
public class Demo01ObjectStream {

    public static void main(String[] args) {

        try {
            // 1. 序列化对象
            object_serializable();
            
            // 2. 反序列化对象
            object_deserialization();
            
        } catch (IOException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * 对象反序列化
     */
    private static void object_deserialization() throws IOException, ClassNotFoundException {

        FileInputStream fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\ObjectStream\\fos.txt");

        ObjectInputStream ois = new ObjectInputStream(fis);

        Person person = (Person) ois.readObject();

        System.out.println(person);
        
        ois.close();
        
        fis.close();
    }

    /**
     * 对象序列化
     */
    private static void object_serializable() throws IOException {
        
        FileOutputStream fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\ObjectStream\\fos.txt");

        ObjectOutputStream oos = new ObjectOutputStream(fos);

        oos.writeObject(new Person("张三", 40));

        oos.close();
        
        fos.close();
    }


}

class Person implements Serializable {

    private static final long serialVersionUID = -4567099507017768632L;
    
    private String name;
    private int age;

    public Person() {
    }

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Person{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```



### 4、transient 关键字

- **transient** 又称为瞬态关键字

```java
/**
 * static 关键字：静态关键字
 *      静态优先于非静态加载到内存中（静态优先于对象进入到内存中）
 *      被 static 修饰的成员变量不能被序列化，能序列化的都是对象
 * 
 * transient 关键字：瞬态关键字
 *      被 transient 修饰的成员变量，也不能被序列化
 */
public class Demo02Transient {


    public static void main(String[] args) throws IOException, ClassNotFoundException {
        
        // 序列化
        FileOutputStream fos = new FileOutputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\ObjectStream\\transient.txt");
        ObjectOutputStream oos = new ObjectOutputStream(fos);

        oos.writeObject(new Student("小明", 20));

        oos.close();
        fos.close();
        
        // 反序列化
        FileInputStream fis = new FileInputStream("src\\main\\java\\com\\naivekyo\\Java_IO\\ObjectStream\\transient.txt");
        ObjectInputStream ois = new ObjectInputStream(fis);

        Object o = ois.readObject();

        System.out.println(o);

        ois.close();
        fis.close();
    }
}

class Student implements Serializable {

    private static final long serialVersionUID = 2728526502524076243L;

    // transient 修饰，无法被序列化
    private transient String name;
    private int age;

    public Student() {
    }

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
    }
}
```



## 五、打印流

### 1、概述

平时我们在控制台打印输出，是调用 `print` 方法或 `println` 方法完成的。这两个方法都来自 `java.io.PrintStream` 类，该类能够方便地打印出各种数据类型的值，是一种便捷的输出方式。



### 2、PrintStream

构造方法：

- `PrintStream(String fileName)` ：使用指定的文件名创建一个新的打印流，无需自动换行



```java
/**
 * java.io.PrintStream extends FilterOutputStream extends OutputStream
 *      PrintStream 为其他输出流添加了功能，使它们能够方便的打印出各种数据值表现形式
 * 
 * 特点：
 *      1. 只负责数据的输出，不负责数据的读取
 *      2. 与其他流不同，PrintStream 永远不会抛出 IOException
 *      3. 有特有的方法：print、println
 *      
 * 构造方法:
 *      PrintStream(File file) 输出目的是一个文件
 *      PrintStream(File file, String csn)
 *      PrintStream(OutputStream out) 输出目的是一个字节输出流
 *      PrintStream(OutputStream out, boolean autoFlush) 
 *      PrintStream(OutputStream out, boolean autoFlush, String encoding) 
 *      PrintStream(String fileName) 输出目的是一个文件路径
 *      PrintStream(String fileName, String csn) 
 *      
 * 注意：
 *      如果使用继承自父类的 write 方法，那么查看数据的时候会查询编码表进行编码 97 -> a
 *      如果使用自己特有的方法 print/println 方法写数据，写的数据原样输出    97 -> 97
 */
public class DemoPrintStream {

    public static void main(String[] args) throws FileNotFoundException {

        // 创建打印流, 构造方法中绑定要输出的目的地
        PrintStream ps = new PrintStream("src\\main\\java\\com\\naivekyo\\Java_IO\\PrintStream\\print.txt");
        
        ps.write(97);
        
        ps.print(97);
        ps.println('c');
        ps.println("HelloWorld");
        ps.println(5.7);
        ps.println(true);        
        // 释放资源
        ps.close();
    }
}
```



改变打印流向：

`System.out` 就是 `PrintStream` 类型的，只不过它的流向是系统规定的，打印在控制台上。不过，既然是流对象，我们就可以改变它的流向：



```java
/**
 * 可以改变输出语句的目的地（打印流的流向）
 * 输出语句，默认在控制台输出
 * 使用 System.setOut 方法可以改变输出语句的目的地
 *      static void setOut(PrintStream out)
 *          重新分配 "标准" 输出流
 */
public class Demo02PrintStream {

    public static void main(String[] args) throws FileNotFoundException {

        System.out.println("默认控制台输出");

        PrintStream ps = new PrintStream("src\\main\\java\\com\\naivekyo\\Java_IO\\PrintStream\\打印流.txt");
        
        System.setOut(ps); // 把输出语句的目的地改成打印流指向的目的地
        
        System.out.println("在打印流的目的地输出");
    }
}
```



## 六、补充：Java 系统流

每个 Java 程序运行时都带有一个系统流，系统流对应的类为 `java.lang.System` 。

System 封装了 Java 程序运行时的 3 个系统流，分别通过 **in**、**out** 和 **err** 变量来引用：

- `System.in` ：标准输入流，默认设备是键盘
- `System.out`：标准输出流，默认设备是控制台
- `System.err`：标准错误流，默认设备是控制台



以上变量的作用域为 `public` 和 `static`，因此在程序中的任何部分都不需要引用 System 对象就可以使用它们。

