---
title: Java String Review
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



# 深入理解

## 1、+ 和 StringBuilder



C++ 允许重载任何运算符，而在 Java 中被重载的只有一个就是 + 运算符，如果我们使用 + 号拼接两个字符串，结果就是返回一个新的字符串常量，使用 `javap` 反编译可以发现，它在 JVM 汇编层面调用的是 `java.lang.StringBuilder` 类。因为它更高效。

```java
    public static void demo01() {
        
        String str1 = "hello";
        String str2 = "world";
        
        String str3 = str1 + str2;

        System.out.println(str3);
    }
```

看它反编译后的字节码：

```java
    NEW java/lang/StringBuilder
    DUP
    INVOKESPECIAL java/lang/StringBuilder.<init> ()V
    ALOAD 0
    INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
    ALOAD 1
    INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
    INVOKEVIRTUAL java/lang/StringBuilder.toString ()Ljava/lang/String;
    ASTORE 2
```



但是我们比较一下在循环的情况下是怎么样的：

```java
    public static void demo02() {
        String[] fields = {"a", "b", "c"};
        String result = "";

        for (int i = 0; i < fields.length; i++) {
            result += fields[i];
        }

        System.out.println(result);
    }
    
    public static void demo03() {
        String[] fields = {"a", "b", "c"};
        StringBuilder result = new StringBuilder();

        for (int i = 0; i < fields.length; i++) {
            result.append(fields[i]);
        }

        System.out.println(result.toString());
    }
```

看看它们的字节码：

- `demo02()`

```java
   L3
   FRAME APPEND [[Ljava/lang/String; java/lang/String I]
    ILOAD 2
    ALOAD 0
    ARRAYLENGTH
    IF_ICMPGE L4
   L5
    LINENUMBER 26 L5
    NEW java/lang/StringBuilder
    DUP
    INVOKESPECIAL java/lang/StringBuilder.<init> ()V
    ALOAD 1
    INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
    ALOAD 0
    ILOAD 2
    AALOAD
    INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
    INVOKEVIRTUAL java/lang/StringBuilder.toString ()Ljava/lang/String;
    ASTORE 1
   L6
    LINENUMBER 25 L6
    IINC 2 1
    GOTO L3
```

注意这里构成了一个循环体，L6 GOTO L3

每次都会重新生成一个 `StringBuilder`，再看看 demo03



- `demo03()`

```java
   L1
    LINENUMBER 34 L1
    NEW java/lang/StringBuilder
    DUP
    INVOKESPECIAL java/lang/StringBuilder.<init> ()V
    ASTORE 1
   L2
    LINENUMBER 36 L2
    ICONST_0
    ISTORE 2
   L3
   FRAME APPEND [[Ljava/lang/String; java/lang/StringBuilder I]
    ILOAD 2
    ALOAD 0
    ARRAYLENGTH
    IF_ICMPGE L4
   L5
    LINENUMBER 37 L5
    ALOAD 1
    ALOAD 0
    ILOAD 2
    AALOAD
    INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
    POP
   L6
    LINENUMBER 36 L6
    IINC 2 1
    GOTO L3
```

可以看出只有一个 `StringBuilder()` 的实例，而且显式的创建一个 `StringBuilder` 对象可以指定它的大小，如果知道了目标字符串大概有多长，预先指定大小也可以避免多次重新分配缓冲。



- `StringBuilder` 是 JavaSE5 之后引入的，之前使用的是 `StringBuffer` ，它是线程安全的，开销比较大。



## 2、容器的 toString

由于 Java 中的根类是 `Object`，所有的 Java 类都会继承它并拥有 `toString()` 方法，并且覆写该方法用于表达自身。对于容器而言，例如 `ArrayList.toString()`，它会遍历所有元素调用每个元素的 `toString`。



如果想要在 `toString()` 方法中打印对象自身的地址值，可以使用 `super.toString()`  即 `Object.toString()`，而不是直接打印 `this`。



## 3、格式化输出

### （1）System.out.format()

类似于 C语言 的 `printf()` 函数，Java SE5 引入的 `format()` 方法可用于 `PrintStram` 和 `PrintWriter` 对象 。

```java
    public static void demo01() {
        int x = 8;
        float y = 5.123f;
        
        System.out.format("%d %f", x, y);
    }
```



### （2）Formatter 类

Java 中所有新的格式化都可以通过 `java.util.Formatter` 类处理。可以将 `Formatter` 类看作一个解释器，它将对应的数据根据格式化字符串翻译成想要的结果，在构建 `Formatter` 对象的时候，可以向构造器传递一些信息，告诉它最终结果需要向哪里输出，比如：

```java
    public static void demo02() {

        PrintStream stdOutStream = System.out;

        Formatter formatter = new Formatter(stdOutStream);
        
        formatter.format("%s: %d, %f \n", "测试字符串", 1, 2.1f);
    }
```

和 C/C++ 类似，我们可以使用 **width** 来指定宽度、**precision** 指定精度、默认情况下，数据是右对齐的，可以使用 **-** 来设置左对齐。

- **width** 可以用于各种类型的数据转换，指明最大的宽度
- **precision** 不一样，不是所有的数据类型都可以使用它，并且不同的类型使用它的时候，**precision** 的意义也不一样，比如，`String` 类型使用它表示打印时输出的字符的最大数量，浮点数使用它表示小数部分要显示的位数（默认是 6 位），整数无法使用 precision。

```java
    public static void demo03() {
        PrintStream stdOutStream = System.out;

        Formatter formatter = new Formatter(stdOutStream);
        
        // 宽度
        formatter.format("%10d\n", 10);
        
        // 精度
        formatter.format("%.10f\n", 0.2f);
        
        // 左对齐
        formatter.format("%-10s", "hello");
    }
```



### （3）String.format()

`String.format()` 是一个静态方法，接收和 `Formatter.format()` 一样的参数，返回一个 String 对象。

本质上就是在 `String.format()` 的内部创建了一个 `Formatter` 对象。



### （4）String.split() 和 StringTokenizer

> split()

我们常用的切分字符串的方法是 `split()` 方法：

```java
    public static void demo04() {
        
        String field = "This is my blog that record my coding life.";
        
        // 方式一
        String[] split = field.split(" ");

        for (String s : split) {
            System.out.println(s);
        }
    }
```



它的具体实现是这样的：

```java
    public String[] split(String regex, int limit) {
        /* fastpath if the regex is a
         (1)one-char String and this character is not one of the
            RegEx's meta characters ".$|()[{^?*+\\", or
         (2)two-char String and the first char is the backslash and
            the second is not the ascii digit or ascii letter.
         */
        char ch = 0;
        if (((regex.value.length == 1 &&
             ".$|()[{^?*+\\".indexOf(ch = regex.charAt(0)) == -1) ||
             (regex.length() == 2 &&
              regex.charAt(0) == '\\' &&
              (((ch = regex.charAt(1))-'0')|('9'-ch)) < 0 &&
              ((ch-'a')|('z'-ch)) < 0 &&
              ((ch-'A')|('Z'-ch)) < 0)) &&
            (ch < Character.MIN_HIGH_SURROGATE ||
             ch > Character.MAX_LOW_SURROGATE))
        {
            int off = 0;
            int next = 0;
            boolean limited = limit > 0;
            ArrayList<String> list = new ArrayList<>();
            while ((next = indexOf(ch, off)) != -1) {
                if (!limited || list.size() < limit - 1) {
                    list.add(substring(off, next));
                    off = next + 1;
                } else {    // last one
                    //assert (list.size() == limit - 1);
                    list.add(substring(off, value.length));
                    off = value.length;
                    break;
                }
            }
            // If no match was found, return this
            if (off == 0)
                return new String[]{this};

            // Add remaining segment
            if (!limited || list.size() < limit)
                list.add(substring(off, value.length));

            // Construct result
            int resultSize = list.size();
            if (limit == 0) {
                while (resultSize > 0 && list.get(resultSize - 1).length() == 0) {
                    resultSize--;
                }
            }
            String[] result = new String[resultSize];
            return list.subList(0, resultSize).toArray(result);
        }
        return Pattern.compile(regex).split(this, limit);
    }
```

简单的 `regex` 直接就在这里执行了，需要创建一个 `ArrayList` ，复杂的匹配模式就需要使用 Java 的正则表达式来做了（`Parttern`）。



> StringTokenizer（了解即可，现在有了更好的方式）

`java.util.StringTokenizer`  是专门用来处理字符串切割的工具类。

它的构造函数有三种：

- `public StringTokenizer(String str)`：构造一个用来解析 str 的 StringTokenizer 对象，采用默认分割符。java 默认的分隔符是空格("")、制表符(\t)、换行符(\n)、回车符(\r)。
- `public StringTokenizer(String str, String delim)`：构造一个用来解析 str 的 StringTokenizer 对象，并提供一个指定的分隔符。
- `public StringTokenizer(String str, String delim, boolean returnDelims)`：构造一个用来解析 str 的 StringTokenizer 对象，并提供一个指定的分隔符，同时，指定是否返回分隔符。

例子：

```java
    public static void demo05() {
        
        String field = "This is my blog that record my coding life.";

        StringTokenizer stringTokenizer = new StringTokenizer(field, " ");
        
        while (stringTokenizer.hasMoreTokens()) {
            System.out.println(stringTokenizer.nextToken());
        }
    }
```



它的常用方法：

- `int countTokens()`：返回 nextToken 方法被调用的次数。
- `boolean hasMoreTokens()`：返回是否还有分隔符。
- `boolean hasMoreElements()`：判断枚举 （Enumeration） 对象中是否还有数据。
- `String nextToken()`：返回从当前位置到下一个分隔符的字符串。
- `Object nextElement()`：返回枚举 （Enumeration） 对象的下一个元素。
- `String nextToken(String delim)`：返回从当前位置到下一个分隔符的字符串，并以指定的分隔符返回结果。



> 对比

在效率上讲 `StringTokenizer` 比 `split()` 方法要快的多，因为 **后者会以给定分割字符串的每个字符进行分割，而前者是以整个字符串进行切割。**



而且当出现两个连续的分隔符时，`StringTokenizer` 会直接跳过，`split` 会将这两个连续的分割符切开，返回一个空字符串。



## 4、正则表达式

Java 中对字符串的操作主要集中在 `String、StringBuilder、StringTokenizer` 类，与正则表达式相比，它们只能提供简单的功能。



### （1）简介

在 Java 中处理正则表达式和其他语言有些不同：

- 在 Java 中 `\\` 表示插入一个正则表达式的反斜线
- 如果想插入一个普通的反斜线要这样：`\\\\`
- 表示一位数字：`\\d`
- 表示一个或多个之前的表达式：`+`
- 可能存在，使用 ：`?`



例如：

```java
    public static void demo01() {

        System.out.println("-1234".matches("-\\d+"));   // true
        System.out.println("5678".matches("-?\\d+"));   // true
        System.out.println("+910".matches("-?\\d+"));   // false
        System.out.println("+1112".matches("(-|\\+)?\\d+"));    // true
    }
```

### （2）正则表达式

`java.util.regex` 包中的 `Pattern` 类 以及 `Matcher` 类

完整的描述请看 JDK 文档

[JDK: java.util.regex](https://docs.oracle.com/javase/8/docs/api/)





> Patten 简介

典型的调用例子：

```java
Pattern p = Pattern.compile("a*b");
Matcher m = p.matcher("aaaaab");
boolean b = m.matches();
```



`Pattern` 这个类是 `final` 且拥有私有构造器，我们无法实例化它，只能通过静态方法 `complie()` 来获取它的实例，该实例不可变，可以安全的被多个线程并发使用。但是 `Matcher` 不是线程安全的。



当我们给 `compile` 方法传递一个指定的正则表达式时，生成的 `Pattern` 匹配器的模式就被固定了，我们无法修改它，所以并发情况下是安全的。



上面的示例就是可以多次重复使用的匹配器，当然 `Pattern` 也提供了只使用一次的方法，但是它的效率较低，因为它不允许编译的模式被重用。

```java
boolean b = Pattern.matches("a*b", "aaaaab");
```

> 常用字符

|  字符  |                 含义                  |
| :----: | :-----------------------------------: |
|   B    |               指定字符B               |
|  \xhh  |        十六进制为 0xhh 的字符         |
| \uhhhh | 十六进制表示为 0xhhhh 的 Unicode 字符 |
|   \t   |              制表符 tab               |
|   \n   |                换行符                 |
|   \r   |                 回车                  |
|   \f   |                 换页                  |
|   \e   |            转义（Escape）             |



> 常用字符类

|    字符类    |                             含义                             |
| :----------: | :----------------------------------------------------------: |
|      .       |                           任意字符                           |
|    [abc]     |         包含 a、b 和 c 的任何字符（和 a\|b\|c 相同）         |
|    [^abc]    |               除了 a、b、c 以外的字符（否定）                |
|   [a-zA-Z]   |         从 a 到 z 或者 从 A 到 Z 的任何字符（范围）          |
|  [abc[hij]]  | 任意 a、b、c、h、i、j 中的字符（和 a\|b\|c\|h\|i\|j 作用相同）（合并） |
| [a-z&&[hij]] |                    任意 h、i、j （交集）                     |
|      \s      |            空白符（空格、tab、换行、换页和回车）             |
|      \S      |                      非空白符（[\^\s]）                      |
|      \d      |                        数字（[0-9]）                         |
|      \D      |                      非数字（[\^0-9]）                       |
|      \w      |                    词字符（[a-zA-Z0-9]）                     |
|      \W      |                       非词字符（\^\w）                       |

> 逻辑操作符

| 逻辑操作符 |                             含义                             |
| :--------: | :----------------------------------------------------------: |
|     XY     |                       Y 跟在 X 的后面                        |
|    X\|Y    |                            X 或 Y                            |
|   （X）    | 捕获组（capturing group），可以在表达式中用 \i 引用第 i 个捕获组 |

> 边界匹配符

| 边界匹配符 |       含义       |
| :--------: | :--------------: |
|     ^      |    一行的起始    |
|     $      |    一行的结束    |
|     \b     |     词的边界     |
|     \B     |    非词的边界    |
|     \G     | 前一个匹配的结束 |



###  （3）量词

量词描述了一个模式吸入输入文本的方式。

- **贪婪型**：贪婪表达式会为所有可能的模式发现尽可能多的匹配
- **勉强型**：用问号来指定，这个量词匹配满足模式所需的最少字符数
- **占有型**：目前，这种类型的量词只有在 Java 语言中可以使用。正常的正则表达式被应用于字符串的时候，会产生很多的状态，以便在匹配失败时回溯，而 “占有型” 量词并不保存这些中间状态，因此它们可以防止回溯。



**注：X 为表达式，表达式通常要用圆括号括起来**

| 贪婪型  |  勉强型  |  占有型   |            含义            |
| :-----: | :------: | :-------: | :------------------------: |
|   X?    |   X??    |    X?+    |        一个或零个 X        |
|   X*    |   X*?    |    X*+    |        零个或多个 X        |
|   X+    |   X+?    |    X++    |        一个或多个 X        |
|  X{n}   |  X{n}?   |  X{n} +   |        恰好 n 次 X         |
|  X{n,}  |  X{n,}?  |  X{n,} +  |        至少 n 次 X         |
| X{n, m} | X{n, m}? | X{n, m} + | X 至少 n 次，且不超过 m 次 |



## TODO
