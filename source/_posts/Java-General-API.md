---
title: Java General API
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210730105249.jpg'
coverImg: /img/20210730105249.jpg
toc: true
date: 2021-07-30 10:51:58
top: false
cover: false
summary: Java 常用的一些工具类、API
categories: Java
keywords: Java
tags: Java
---

# 常用 API

## 一、Object 类的方法

### 1、equals 方法

Object 类的 `equals()` 方法，默认比较的是两个对象的地址值，没有意义

我们要重写 equals 方法，实现比较对象的属性



### 2、Objects 工具类

在 **JDK7** 中添加了一个 `Objects` 工具类，它提供了一些方法来操作对象，它由一些静态的实用方法组成，这些方法是 `null-save` （空指针安全）或 `null-tolerant`（容忍空指针的），用于计算对象的 `hashcode`、返回对象的字符串表示形式、比较两个对象。



在比较两个对象的时候，Object 的 equals 方法容易抛出空指针异常，而 Objects 类中的 equals 方法就优化了这个问题。

- `public static boolean equals(Object a, Object b);` 判断两个对象是否相等

```java
public static boolean equals(Object a, Object b) {
  	return (a == b) || (a != null && a.equals(b));
}
```



```java
public class API_Object {

    public static void main(String[] args) {
        
        // 防止空指针异常
        System.out.println(Objects.equals("111", new String(new char[]{'1', '2', '3'})));
        
    }
}

class Person {
    
    // 默认实现是比较地址值
    @Override
    public boolean equals(Object obj) {
        return super.equals(obj);
    }
}
```



## 二、日期时间类

### 1、Date 类

`java.util.Date` 类，表示特定的瞬间，精确到毫秒。

- 常用：
  - 两种构造方法
  - 一种方法

```java
/**
 * java.util.Date ：表示日期和时间的类
 * 类 Date 表示特定的瞬间，精确到毫秒
 * 
 * 毫秒值的作用：可以对时间和日期进行计算
 * 
 * 日期转换为毫秒：
 *  当前日期
 *  时间原点：0 毫秒 1970 年 1 月 1 日 00:00:00 (英国格林威治)
 *  
 * 毫秒转换为日期：
 *  1 天 = 24 x 60 x 60 = 86400 秒 x 1000 = 86400000 毫秒
 *  
 * 注意：中国属于东八区，会把时间增加 8 个消失
 */
public class API_Date {

    public static void main(String[] args) {

        System.out.println(System.currentTimeMillis()); // 获取当前系统时间，从 1970 年 1 月 1 日 00:00:00 到现在的毫秒数
        
        // 测试构造方法
        demo01();
        
        // 带参构造方法
        demo02(0L); // 0L 表示 1970年1月1日 00:00:00
        demo02(1627550637150L);
        
        // getTime() 方法
        demo03();
    }

    /**
     * 空参构造函数，获取当前系统的日期和时间
     */
    private static void demo01() {
        System.out.println(new Date());
    }

    /**
     * Date 的带参构造方法，传递毫秒值，把它转换为 Date 日期
     * @param date
     */
    private static void demo02(long date) {
        System.out.println(new Date(date));
    }

    /**
     * long getTime() 把日期转换为毫秒数
     *  返回 1970年1月1日 00:00:00 到当前的毫秒数
     */
    private static void demo03() {
        System.out.println(new Date().getTime());
    }
}
```

### 2、DateFormat 类

`java.text.DateFormat` 是 日期/时间 格式化子类的抽象类，我们通过这个类完成日期和文本之间的转换，也就是可以在 `Date` 对象和 `String` 对象之间进行来回转换。



- **格式化**：按照指定的格式，从 Date 对象转换为 String 对象
- **解析**：按照指定的格式，从 String 对象转换为 Date 对象



我们一般使用 `DateFormat` 的子类 `SimpleDateFormat` 来格式化日期。

- `public SimpleDateFormat(String pattern)`：用给定的模式和默认语言环境的日期格式符号构造 SimpleDateFormat



> 格式规则

常用的格式规则为：

| 标识字母（区分大小写） | 含义 |
| :--------------------: | :--: |
|           y            |  年  |
|           M            |  月  |
|           d            |  日  |
|           H            |  时  |
|           m            |  分  |
|           s            |  秒  |



```java
/**
 * java.util.DateFormat
 *  作用：格式化、解析
 *   String format(Date date);
 *   Date parse(String source);
 *   
 *  使用子类：
 *      java.text.SimpleDateFormat
 *  构造方法：
 *      SimpleDateFormat(String pattern);
 */
public class API_DateFormat {

    public static void main(String[] args) {

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy年MM月dd日 HH:mm:ss");
        // 格式化日期
        Date date = new Date();
        String str1 = sdf.format(date);

        System.out.println(date);
        System.out.println(str1);
        
        // 解析
        try {
            Date parse = sdf.parse("2020年11月3日 20:30:32");
            System.out.println(parse);
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }
}
```

### 3、Calendar 类

`java.util.Calendar` 是日历类，在 Date 后出现，替换掉了许多 Date 的方法，该类将所有可能用到的时间信息封装为静态成员变量，方便获取。日历类就是方便获取各个时间属性的。



> 获取方式

Calendar 为抽象类，由于语言敏感性，Calendar 类在创建对象时并非直接创建，而是通过静态方法创建，返回子类对象，如下：

Calendar 静态方法：

- `public static Calendar getInstance()`：使用默认时区和语言环境获得一个日历



```java
/**
 * java.util.Calendar ：日历类
 *  Calendar 是一个抽象类，里面提供了许多操作日历字段的方法（YEAR、MONTH、DAY_OF_MONTH、HOUR等等）
 *  
 *  单例模式
 */
public class API_Calendar {

    public static void main(String[] args) {

        Calendar instance = Calendar.getInstance();

        System.out.println(instance);
    }
}
```



> 常用方法

- `public int get(int field)`：返回给定日历字段的值
- `public void set(int field, int value)`：将给定的日历字段设置为给定值
- `public abstract void add(int field, int amount)`：根据日历的规则，为给定的日历字段添加或者减去指定的时间量
- `public Date getTime()`：返回一个标识此 Calendar 时间值（从历元到现在的毫秒偏移量）的 Date 对象

Calendar 类中提供了许多成员变量，代表给定的日历字段：

|    字段值    |              含义              |
| :----------: | :----------------------------: |
|     YEAR     |               年               |
|    MONTH     | 月（从 0 开始，可以 + 1 使用） |
| DAY_OF_MONTH |        月中的天（几号）        |
|     DATE     |          月中的某一天          |
|     HOUR     |               时               |
|    MINUTE    |               分               |
|    SECOND    |               秒               |



```java
/**
 * java.util.Calendar ：日历类
 *  Calendar 是一个抽象类，里面提供了许多操作日历字段的方法（YEAR、MONTH、DAY_OF_MONTH、HOUR等等）
 *  
 *  单例模式
 *  
 *  成员方法的参数：
 *      int field: 日历类的字段，可以使用 Calendar 类的静态成员变量获取
 */
public class API_Calendar {

    public static void main(String[] args) {

        // 设置时区
        Calendar instance = Calendar.getInstance();
        TimeZone.setDefault(TimeZone.getTimeZone("GMT+8"));
        instance.setTimeZone(TimeZone.getTimeZone("GMT+8"));

        System.out.println(instance.getTime());

        demo02(instance);
        demo03(instance);
        demo01(instance);

        System.out.println("========================");
        
        test01();
        test02();
    }

    /**
     * public int get(int field) ：返回给定日历字段的值
     */
    private static void demo01(Calendar calendar) {
        int year = calendar.get(Calendar.YEAR);
        System.out.println(year);

        int month = calendar.get(Calendar.MONTH);
        System.out.println(month);  // 西方的月份 0 - 11，东方 1 - 12

        int dayMonth = calendar.get(Calendar.DAY_OF_MONTH); // 或者 Calendar.DATE
        System.out.println(dayMonth);
    }

    /**
     * public void set(int field, int value)：将给定的日历字段设置为给定值
     *  参数：
     *      int field: 传递指定的日历字段（YEAR、MONTH。。。）
     *      int value: 给指定字段设置的值
     */
    private static void demo02(Calendar calendar) {
        
        calendar.set(Calendar.YEAR, 9999);
        calendar.set(Calendar.MONTH, 12);
        calendar.set(Calendar.DATE, 9);
        
        // 同时设置年月日，可以使用 set 的
        calendar.set(8888, 8, 8);
    }

    /**
     * public abstract void add(int field, int amount)：根据日历的规则，为给定的日历字段添加或者减去指定的时间量
     * 指定字段增加/减少指定的值
     *  int field: 指定日历字段值
     *  int value: 增加/减少指定的量 
     *      正数：增加
     *      负数：减少
     */
    private static void demo03(Calendar calendar) {
        
        // 年增加两年
        calendar.add(Calendar.YEAR, 2);
    }

    /**
     * 测试将 Calenar 设置为当前时区
     */
    private static void test01() {
        Calendar instance = Calendar.getInstance();
        
        Date date = new Date();
        
        instance.setTime(date);
        
        instance.set(2088, 11, 12);

        System.out.println("Year: " + instance.get(Calendar.YEAR));
        System.out.println("Month: " + (instance.get(Calendar.MONTH) + 1));
        System.out.println("Day: " + instance.get(Calendar.DAY_OF_MONTH));
    }

    /**
     * 测试 DateTimeFormatter 进行日期本地化
     */
    private static void test02() {
        // String date = new Date().toString();
        String date = "Fri Jul 30 10:04:48 2021";
        System.out.println(date);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE MMM dd HH:mm:ss yyyy", Locale.US);
        LocalDateTime parse = LocalDateTime.parse(date, formatter);

        System.out.println(parse);
    }
}
```



## 三、System 类

`java.lang.System` 类中提供了大量的静态方法，可以获取与系统相关的信息或系统级操作，在 System 类的  API 文档中，常用的方法有：

- `public static long currentTimeMillis()`：返回以毫秒为单位的当前时间
- `public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)`：将数组中指定的数据拷贝到另一个数组中



```java
public class API_System {

    public static void main(String[] args) {
        
        timeMillis();

        arrayCopy();
    }
    
    private static void timeMillis() {
        // 获取档期毫秒数
        long timeStamp_1 = System.currentTimeMillis();
        System.out.println("开始时间: " + timeStamp_1);

        int temp;
        for (int i = 0; i < 9999; i++) {
            temp = i;
        }

        long timeStamp_2 = System.currentTimeMillis();
        System.out.println("结束时间: " + timeStamp_2);
        System.out.println("程序共耗时: " + (timeStamp_2 - timeStamp_1) + " 毫秒");
    }

    /**
     * public static void arraycopy(Object src, int srcPos, Object dest, int destPos, int length)
     * 参数：
     *      src: 源数组
     *      srcPos: 源数组中的起始位置
     *      dest: 目标数组
     *      destPost: 目标数组的起始位置
     *      length: 要赋值的数组元素的数量, 注意不要下标越界
     */
    public static void arrayCopy() {
        
        int[] source = {1, 2, 3, 4, 5};
        int[] target = {7, 8, 9, 10, 11, 12, 13};
        
        // 推测结果：target : { 7, 2, 3, 4, 5, 12, 13 }
        System.arraycopy(source, 1, target, 1, 4);
        System.out.println(Arrays.toString(target));
    }
}
```



## 四、StringBuilder 类

String 类：

- 字符串是常量，它们的值在创建之后不能被修改
- 字符串的底层是一个被 final 修饰的数组，不能改变，是一个常量



进行字符串的相加，内存中就会有多个字符串，占用空间多，效率低下



StringBuilder 类

- 字符串缓冲区，可以提高字符串的操作效率
- 底层也是一个数组，但是没有被 final 修饰，可以改变长度

StringBulider 在内存中始终是一个数组，占用空间少，效率高，如果超出了 StringBuilder 的容量，会自动扩容





## 五、包装类

### 1、自动装箱与自动拆箱

```java
/**
 * 装箱：把基本类型的数据，包装到包装类中
 *  构造方法：
 *      Integer(int value)
 *      Integer(String s)
 *  静态方法：
 *      static Integer valueOf(int i)
 *      static Integer valueOf(String s)
 *      
 *  自动装箱与自动拆箱：基本类型的数据和包装类之间可以自动的相互转换
 *  JDK1.5 之后出现的新特性
 */
public class API_PackagingGroup {

    public static void main(String[] args) {

        System.out.println("=========  装箱 =============");
        // 构造方法
        Integer in1 = new Integer(1);

        Integer in2 = new Integer("1");
        
        // 静态方法
        Integer in3 = Integer.valueOf(1);

        Integer in4 = Integer.valueOf("1");

        System.out.println("=========  拆箱 =============");

        int i1 = in1.intValue();
    }
}
```

### 2、基本类型与字符串之间的转换

> 基本类型转字符串

三种方式：

- `toString()` 方法
- `String.valueOf()` 方法
- `+`：运算符

把一个基本数据类型转换为 String，使用 `.toString()`  是最快的方式、`String.valueOf` 和 `toString()` 差不多，`+` 的效率最慢，其实这些执行都是毫秒级，现在处理器的性能都比较强悍，其实影响不大。

> 字符串转基本类型

比如 String 转 int

- `Integer.parseInt(String s)`

