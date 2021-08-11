---
title: Java File Intro
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210808085432.jpg'
coverImg: /img/20210808085432.jpg
toc: true
date: 2021-08-08 08:54:09
top: true
cover: false
summary: Java File 类简介
categories: Java
keywords:
 - Java
 - File
tags: Java
---

# File 类

## 1、概述

在 Java 中，**File 类是 java.io 包中唯一代表磁盘文件本身的对象**，它是文件和目录路径名的 **抽象表示**，主要用于文件和目录的创建、查找和删除操作。



```java
/**
 * Java 把电脑中的文件和文件夹封装为一个 File 类
 *  可以使用 File 类的方法
 *      创建一个文件/文件夹
 *      删除
 *      获取
 *      判断是否存在
 *      遍历
 *      获取文件大小
 * File 类是一个与系统无关的类，任何操作系统都可以使用这个类
 */
public class Demo01_File {

    /**
     * 静态成员变量：
     *  static String pathSeparator 与系统相关的路径分隔符，为了方便，它被表示为一个字符串
     *  static char pathSeparatorChar 与系统有关的路径分隔符
     *  
     *  static String separator 与系统有关的默认名称分隔符，为了方便，它被表示为一个字符串
     *  static char separatorChar 与系统有关的默认名称分隔符
     *  
     *  操作路径：路径不能写死，应该首先获取与操作系统相关的分隔符
     */

    public static void main(String[] args) {

        String pathSeparator = File.pathSeparator;
        System.out.println(pathSeparator);      // 路径分隔符 windows 系统是 分号 ; Linux 系统是 冒号 :

        String separator = File.separator;
        System.out.println(separator);  // 文件名称分隔符 windows 反斜杠 \    Linux 系统 正斜杠 /
    }
}
```



 * 路径：
   *  绝对路径：是一个完整的路径
 * 以盘符开始的路径：
    * 相对路径：是一个简化的路径
    * 相对指的是相对于当前项目的根目录
    * 如果使用当前项目的根目录，路径可以简化书写

 *  注意：

    1. 路径不区分大小写
    2. 路径中的文件名称分隔符 windows 中使用反斜杠，反斜杠是转义字符，所以使用两个反斜杠代表一个普通的反斜杠

    

## 2、构造方法

- `public File(String pathname)`：通过将给定的 **路径名字字符串** 转换为抽象路径名来创建新的 File 实例
- `public File(String parent, String child)`：从 **父路径名字符串和子路径名字符串** 创建新的 File 实例
- `public File(File parent, String child)`：从 **父抽象路径名和子路径名字字符串** 来创建新的 File 实例
- `public File(URI uri)`：通过将 RUI 转换为抽象路径



```java
public class Demo03_File_Constructor {

    public static void main(String[] args) {
        
        // 研究 File 的构造方法
        show01();
        
        show02("D:\\", "a\\b.txt");
        
        show03();
    }

    /**
     * File(String pathname) 将指定的路径名字符串转换为抽象路径名来创建一个 File 实例
     * 参数：
     *  String pathname：字符串表示的路径名称
     *      路径可以以文件结尾也可以以文件夹结尾
     *      路径可以是相对路径，也可以是绝对路径
     *      路径可以存在，也可以不存在
     *  创建 File 对象，只是把字符串路径封装为 File 对象，不考虑路径的真假情况
     */
    public static void show01() {

        // 绝对路径
        File f1 = new File("D:\\file\\a.txt");
        System.out.println(f1);         // D:\file\a.txt

        File f2 = new File("D:\\file");
        System.out.println(f2);         // D:\file
        
        // 相对路径, 相对于当前项目根路径
        File f3 = new File("b.txt");
        System.out.println(f3);         // b.txt
    }

    /**
     * File(String parent, String child)
     *  parent：父路径
     *  child：子路径
     *  
     *  好处：
     *      父路径和子路径，可以单独书写，使用起来非常灵活；父路径和子路径都可以变化
     */
    public static void show02(String parent, String child) {
        
        File file = new File(parent, child);
        System.out.println(file);   // parent\child
    }

    /**
     * File(File parent, String child)
     *  参数：把路径分为两部分
     *      File parent：父路径
     *      String child：子路径
     *  好处：
     *      父路径和子路径，可以单独书写，使用起来非常灵活；父路径和子路径都可以变化
     *      父路径是 File 类型，可以使用 File 的方法对路径进行一些操作，再使用路径创建对象
     */
    public static void show03() {
        
        File parent = new File("D:\\");
        File file = new File(parent, "hello.java");
        System.out.println(file);
    }
}
```



## 3、常用方法

> 获取功能的方法

- `public String getAbsolutePath()`：返回此 File 的绝对路径名字符串
- `public String getPath()`：将此 File 转换为路径名字符串
- `public String getName()`：返回由此 File 表示的文件或者目录的名称
- `public long length()`：返回由此 File 表示的文件的长度，就是文件的大小，以字节表示，注意文件夹不能使用该方法

```java
public class Demo04_File_Methods {

    public static void main(String[] args) {
        
        // show1();
        
        // show2();
        
        // show3();
        
        show4();
    }

    private static void show4() {
        
        // 获取构造方法指定的文件的大小，以字节为单位
        // 注意：文件夹是没有大小概念的
        //      如果构造方法指定的路径不存在，则返回 0

        File f1 = new File("D:\\file_test\\a.txt");
        System.out.println(f1.length());
    }

    private static void show3() {
        
        // 获取表示的文件或者目录的名称
        
        File f1 = new File("D:\\file_test\\a.txt");
        System.out.println(f1.getName());   // a.txt

        File f2 = new File("a.txt");
        System.out.println(f2.getName());   // a.txt
    }

    private static void show2() {

        // 获得创建 File 对象时使用的路径字符串
        
        File f1 = new File("D:\\file_test\\a.txt");
        System.out.println(f1.getPath());

        File f2 = new File("a.txt");
        System.out.println(f2.getPath());
    }

    private static void show1() {

        // 获取绝对路径
        
        File f1 = new File("D:\\file_test\\a.txt");
        String absolutePath = f1.getAbsolutePath();
        System.out.println(absolutePath);
        
        File f2 = new File("a.txt");
        String absolutePath2 = f2.getAbsolutePath();
        System.out.println(absolutePath2);
    }
}
```



> 判断功能的方法

- `public boolean exists()`：此 File 表示的文件或者目录是否实际存在
- `public boolean isDirectory()`：此 File 表示的是否为目录
- `public boolean isFile()`：此 File 表示的是否为文件



> 创建删除功能的方法

- `public boolean createNewFile()`：当且仅当具有该名称的文件尚不存在时，创建一个新的空文件
- `public boolean delete()`：删除由此 File 表示的文件或目录
- `public boolean mkdir()`：创建由此 File 表示的目录
- `public boolean mkdirs()`：创建由此 File 表示的目录，包括任何必须但不存在的父目录



```java
public class Demo05_File_Create_Delete {

    public static void main(String[] args) {
        
        // 创建文件
        // test1();
        
        // 创建单级文件夹
        // test2();
        
        // 创建多级文件夹
        // test3();
        
        // 删除文件或目录
        test4();
    }

    private static void test4() {
        // 注意如果如果文件夹中有内容或者指定路径不存在都会返回 false
        // 删除文件
        File f1 = new File("D:\\1.txt");

        if (f1.delete()) {
            System.out.println("成功删除: " + f1.getAbsolutePath());
        }
        
        // 删除目录
        File f2 = new File("D:\\File_Test\\One\\Two");

        if (f2.delete()) {
            System.out.println("成功删除目录: " + f2.getAbsolutePath());
        }
    }

    private static void test3() {
        
        File f1 = new File("D:\\File_Test\\One\\Two");

        boolean mkdirs = f1.mkdirs();
        
        if (mkdirs)
            System.out.println("成功创建多级文件夹!");
    }

    private static void test2() {
        
        File f1 = new File("D:\\File_Test");

        boolean mkdir = f1.mkdir();
        
        if (mkdir)
            System.out.println("创建成功!");
        
        // 相对路径
        File f2 = new File("Hello");
        boolean mkdir1 = f2.mkdir();
        
        if (mkdir1)
            System.out.println("成功创建文件夹");
    }

    private static void test1() {

        // 注意，如果要给 1.txt 前面加上目录，则该目录必须存在
        File f1 = new File("D:\\1.txt");

        try {
            boolean newFile = f1.createNewFile();
            if (newFile) {
                System.out.println("成功创建文件1");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        // 相对于项目根路径
        File f2 = new File("1.txt");

        try {
            boolean newFile = f2.createNewFile();
            if (newFile) {
                System.out.println("成功创建文件!");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```



## 4、目录的遍历

- `public String[] list()`：返回一个 String 数组，表示该 File 目录中的所有子文件或目录
- `public File[] listFiles()`：返回一个 File 数组，表示该 File 目录中的所有的子文件或目录

> 调用 listFiles() 方法的 File 对象，表示的必须是实际存在的目录，否则返回 null，无法进行遍历



注意：

- list 和 listFiles 方法，遍历的是构造方法中给出的目录
- 如果构造方法传入的路径字符串不存在，则抛出 NPE
- 如果构造方法给出的路径字符串不是一个目录，也会抛出 NPE



```java
public class Demo06_File_Traverse {

    public static void main(String[] args) {
        
        // list
        show1();
        
        // listFiles
        show2();
    }

    private static void show2() {
        
        // listFiles 也只会返回指定路径下一级目录中的所有目录和文件的 File 对象
        File file = new File("D:\\File_Test");

        File[] files = file.listFiles();

        for (File f : files) {
            System.out.println(f.getAbsolutePath());
        }
    }

    private static void show1() {

        File file = new File("D:\\File_Test");

        // list 方法只会返回指定目录下的一级目录中的所有目录和文件的字符串表示形式
        String[] list = file.list();

        for (String str : list) {
            System.out.println(str);
        }
    }
}
```



## 5、递归遍历目录树

之前使用的 `list()` 和 `listFiles()` 方法都只能查看一层目录，我们要实现一个工具类，传入一个 File 对象，递归遍历打印目录树：

```java
/**
 * 递归打印目录树
 */
public class Demo07_File_Recursion {

    public static void main(String[] args) {

        File f = new File("D:\\File_Test");

        try {
            
            recursionShow(f);
            
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    private static void recursionShow(File f) throws Exception {
        
        if (f.isFile()) {
            throw new Exception("必须传入目录 File 对象");
        }
        
        recursion(f);
    }

    private static void recursion(File f) {

        if (f.list() == null) {
            // 如果下一级目录中没有目录或文件了就可以直接 return
            return;
        }

        for (File file : f.listFiles()) {
            if (file.isFile()) {
                System.out.println(file.getAbsolutePath());
                continue;
            }
            
            if (file.isDirectory()) {
                System.out.println(file.getAbsolutePath());
                recursion(file);
            }
        }
    }
}
```



改一下就可以变成递归删除了 OvO



## 6、过滤器

### （1）文件过滤器

`java.io.FileFilter` 是一个接口，是 File 的过滤器，该接口中只有一个方法。

该接口的对象可以传递给 File 类的 `listFiles(FileFilter)` 作为参数。



- `boolean accept(File pathname);` 测试 pathname 是否应该包含在当前 File 目录中，符合则返回 true



### （2）文件名过滤器

`java.io.FilenameFilter` 也是一个接口，该接口中也只拥有一个方法：

- `boolean accept(File dir, String name);`：可以用于测试指定目录下是否拥有指定名字的目录或文件

该接口的对象可以传递给 File 类的 `list(FilenameFilter)` 方法。



### 总结

当将这两个接口的对象传递给对应的方法时，会回调 `accept()` ，进而决定哪些文件包含在列表中。

这是 **策略模式** 的一个例子。



- list 或 listFiles 实现了基本的功能
- 同时按照 `FilenameFilter` 和 `FileFilter` 的形式提供了相应的策略，进而完善 list 或 listFiles 在提供服务时所需的算法
