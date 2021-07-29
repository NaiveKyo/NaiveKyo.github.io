---
title: Java String review
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210729083505.jpg'
coverImg: /img/20210729083505.jpg
toc: true
date: 2021-07-29 08:34:37
top: false
cover: false
summary: 复习 Java 的字符串相关操作。
categories: Java
keywords: Java
tags: Java
---

# Java 字符串



## 1、字符串的特点

- 字符串的内容永不可变
- 正因为字符串不可改变，所以字符串是可以共享使用
- 字符串效果上相当于 **char[]** 字符串数组，但是底层原理是 **byte[]** 字节数组



## 2、构造 String 的方法

```java
/**
 * <p>
 * 创建字符串的常见 3 + 1 种方式
 * 三种构造方法：
 * public String(); 创建一个空白字符串，不含任何内容
 * public String(Char[] arr); 根据字符数组创建字符串
 * public String(byte[] arr); 根据字节数组创建字符串
 * <p>
 * 一种直接创建：
 *	String str = "hello";
 *	注意：直接写双引号，就是字符串对象
 */
public class Demo01String {

    public static void main(String[] args) {

        // 使用空参构造
        String str1 = new String();
        System.out.println("第一个字符串: " + str1);

        // 根据字符数组创建
        char[] charArr = {'A', 'B', 'C'};
        String str2 = new String(charArr);
        System.out.println("第二个字符串: " + str2);

        // 根据字节数组创建
        byte[] byteArr = {97, 98, 99};
        String str3 = new String(byteArr);
        System.out.println("第三个字符串: " + str3);
    }
}
```



看看 `String` 的源代码：

```java
public final class String
    implements java.io.Serializable, Comparable<String>, CharSequence {

  	......
      
    /** The value is used for character storage. */
    private final char value[];

  	public String() {
        this.value = "".value;
    }
  	......
}
```



## 3、字符串常量池

```java
/**
 * 字符串常量池，程序中直接写的双引号字符串，就在字符串常量池中。
 * 
 * 对于基本类型来说，== 是进行数值的比较
 * 对于引用类型来说，== 是进行【地址值】的比较
 */
public class Demo02Pool {

    public static void main(String[] args) {
        
        String str1 = "abc";
        
        String str2 = "abc";
        
        char[] charArr = {'a', 'b', 'c'};
        String str3 = new String(charArr);

        System.out.println(str1 == str2);   // true
        System.out.println(str1 == str3);   // false
        System.out.println(str2 == str3);   // false
    }
}
```

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210728224824.png)

## 4、字符串的比较

- `==` 比较的是字符串的地址值，如果确实需要字符串的内容比较，可以使用两个方法
  - `public boolean equals(Object obj);`：参数可以是任何类型
  - `public boolean equalsIgnoreCase(String str);` 忽略大小写



```java
/**
 *  public boolean equals(Object obj)
 *      参数可以是任何对象，但是只有参数是一个字符串且内容相同的时候才会返回 true，否则返回 false
 *  1. 任何对象都可以使用 Object 接收
 *  2. equals 方法具有对称性，也就是 a.equals(b) 和 b.equals(a) 效果一样
 *  3. 如果比较的双方一个是常量一个是变量，推荐把常量字符串写在前面
 *      推荐 "abc".equals(str) 不推荐： str.equals("abc")
 *      
 *  public boolean equalsIgnoreCase(String str); 忽略大小写
 */
public class Demo01StringEquals {

    public static void main(String[] args) {
        
        String str1 = "Hello";
        String str2 = "Hello";
        char[] charArray = {'H', 'e', 'l', 'l', 'o'};
        String str3 = new String(charArray);

        System.out.println(str1.equals(str2));  // true
        System.out.println(str2.equals(str3));  // true
        System.out.println(str3.equals("Hello")); // true
        System.out.println("Hello".equals(str1)); // true
        
        String str4 = "hello";
        System.out.println(str1.equals(str4));  // false
        
        // String str5 = "abc";
        String str5 = null;
        System.out.println("abc".equals(str5)); // 推荐   false
        // System.out.println(str5.equals("abc")); // 不推荐，报错，NPE 异常

        System.out.println("=====================");
        
        String strA = "Java";
        String strB = "java";

        System.out.println(strA.equals(strB)); // false 严格区分大小写
        System.out.println(strA.equalsIgnoreCase(strB));  // true 忽略大小写
    }
}
```



## 5、字符串中的获取方法



```java
/**
 * String 当中与获取相关的常用方法有：
 *  public int length();    获取字符串中含有字符的个数
 *  public String concat(String str); 将当前字符串和参数字符串拼接成新的字符串
 *  public char charAt(int index);  获取指定索引位置的单个字符。(索引从 0 开始)
 *  public int indexOf(String str); 查找参数字符串在本字符串中首次出现的索引位置，如果没有，则返回 -1  
 */
public class Demo02StringGet {

    public static void main(String[] args) {

        // 获取字符串长度
        int length = "dhifahgeroaih".length();
        System.out.println("字符串长度: " + length);
        
        // 拼接字符串 字符串不可变
        String str1 = "Hello";
        String str2 = "World";
        String str3 = str1.concat(str2);
        System.out.println(str1);   // Hello 不变
        System.out.println(str2);   // World 不变
        System.out.println(str3);   // HelloWorld 新的字符串

        System.out.println("======================");
        
        // 获取指定索引位置单个字符
        char c = "Hello".charAt(1);
        System.out.println("index: 1  --  value: " + c);
        System.out.println("======================");
        
        // 查找参数字符串在指定字符串中第一次出现的索引位置，失败返回 -1
        String original = "Hello World.";
        int index = original.indexOf("llo");
        System.out.println("第一次出现的位置: " + index);   // 2

        System.out.println("hello".indexOf("aaa"));     // -1
        System.out.println("hello".indexOf("lloab"));   // -1
    }
}
```



## 6、字符串中的截取方法

```java
/**
 * 字符串的截取方法：
 *  public String substring(int index); 从参数位置到字符串末尾，返回新的字符串
 *  public String substring(int begin, int end); 从 begin 到 end 中间的字符串 [a, b)
 */
public class Demo03Substring {

    public static void main(String[] args) {
        
        String str1 = "HelloWorld";
        String str2 = str1.substring(5);    // 属于 new 出来的对象，不在字符串常量池中
        String str3 = "World";  // 在常量池中
        
        System.out.println(str1);   //  原封不动
        System.out.println(str2);   //  World 新字符串
        System.out.println(str2 == str3);   // 比较地址值    false
        System.out.println(str2.equals(str3));     // 比较内容  true

        System.out.println("==================================");
        
        String str4 = str1.substring(4, 7);
        System.out.println(str4);   // oWo
    }
}
```



## 7、字符串转换方法

```java
/**
 * String 中与转换相关的常用方法
 *  public char[] toCharArray();    将当前字符串拆封成为字符数组作为返回值
 *  public byte[] getBytes();   获得当前字符串底层的字节数据
 *  public String replace(CharSequence oldString, CharSequence newString); 
 *      将所有出现的老字符串替换为新的字符串，返回替换之后的结果新字符串
 *      
 *      备注：CharSequence 意思是说可以接收字符串类型
 */
public class Demo04StringConvert {

    public static void main(String[] args) {

        char[] chars = "Hello".toCharArray();
        for (char aChar : chars) {
            System.out.println(aChar);
        }

        System.out.println("========================================");

        byte[] bytes = "abc".getBytes();
        for (int i = 0; i < bytes.length; i++) {
            System.out.println(bytes[i]);
        }
        
        System.out.println("========================================");

        String str1 = "How do you do?";
        // String str2 = str1.replace("o", "*");
        String str2 = str1.replace('o', '1');
        System.out.println(str1);
        System.out.println(str2);
    }
}
```

## 8、字符串切割

```java
/**
 * 分割字符串常用方法：
 *  public String[] split(String regex) 按照参数的规则，将字符串切分成若干部分
 *  
 *  注意：
 *      split 方法的参数其实是一个“正则表达式”
 *      注意：如果要按照英文句点 "." 进行切分，必须写 "\\." 
 */
public class Demo05StringSplit {

    public static void main(String[] args) {
        
        String str1 = "aaa,bbb,ccc";
        String[] arr1 = str1.split(",");

        for (int i = 0; i < arr1.length; i++) {
            System.out.println(arr1[i]);
        }

        System.out.println("==============================");
        
        String str2 = "XXX.YYY.ZZZ";
        String[] split = str2.split("\\.");
        for (int i = 0; i < split.length; i++) {
            System.out.println(split[i]);
        }
    }
}
```

