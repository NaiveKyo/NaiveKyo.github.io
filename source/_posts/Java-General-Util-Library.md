---
title: Java General Util Library
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031145925.jpg'
coverImg: /img/20211031145925.jpg
toc: true
date: 2021-11-28 19:38:58
top: false
cover: false
summary: Java 常用的一些工具类库
categories: Java
keywords: Java
tags: Java
---

## 一、Java 自带工具方法

### 1、List 集合拼接成特定分隔符分隔的字符串

两种方式：

- 使用 String 类的静态方法
- 使用流

```java
// 1. List 集合拼接为逗号分隔的字符串
@Test
public void test1_1() {

    List<String> list = new ArrayList<>();

    Collections.addAll(list, "a", "b", "c");

    String str1 = list.stream().collect(Collectors.joining(","));
    String str2 = String.join(",", list);

    System.out.println(str1); // a,b,c
    System.out.println(str2); // a,b,c
}
```



### 2、比较字符串且忽略大小写

```java
// 2. 比较两个字符串，忽略大小写
@Test
public void test1_2() {

    String str1 = "AbC";
    String str2 = "aBc";

    System.out.println(str2.equals(str1));              // false
    System.out.println(str1.equalsIgnoreCase(str2));    // true
    System.out.println(str2.compareToIgnoreCase(str1) == 0);    // true
}
```



### 3、比较两个对象是否相等

当我们用 `equals` 比较两个对象是否相等的时候，还需要对左边的对象进行判空，不然可能会报空指针异常，我们可以用 java.util 包下 Objects 封装好的比较是否相等的方法：

```java
// 3. 比较对象是否相等
@Test
public void test1_3() {

    String str1 = "abc";
    String str2 = "Abc";

    System.out.println(Objects.equals(str1, str2)); // false
}
```



源码：

```java
// java.util.Objects#equals()

public static boolean equals(Object a, Object b) {
    return (a == b) || (a != null && a.equals(b));
}
```



### 4、两个 List 集合取交集

```java
// 4. 两个 List 集合取交集
@Test
public void test1_4() {

    ArrayList<String> list1 = new ArrayList<>();
    ArrayList<String> list2 = new ArrayList<>();

    Collections.addAll(list1, "a", "c", "d", "e");
    Collections.addAll(list2, "b", "e", "f", "g");

    list1.retainAll(list2);

    System.out.println(list1);  // [e]
}
```



## 二、Apache Commons 工具类库

apache commons 是最强大的，也是使用最广泛的工具类库，里面的子库非常多，下面介绍几个最常用的：



### 1、Commons-Lang

`Commons-Lang` 是 `java.lang` 的增强版本。已经更新到 `commons-lang3` 版本，建议使用最新版。

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.12.0</version>
</dependency>
```

标准 Java 库未能提供足够的方法来操作其核心类。 而 `Apache Commons Lang` 子项目则提供了这些额外的方法。  

`Apache Commons Lang` 为 java.lang API 提供了大量的辅助工具类，尤其是字符串操作方法、基本数值方法、对象反射、并发、创建和序列化以及系统属性。 此外，它还对 java.util.Date 做了一些增强处理，以及一系列工具类用于构建方法，如 hashCode、toString 和equals。



官网：http://commons.apache.org/proper/commons-lang/

文档：http://commons.apache.org/proper/commons-lang/apidocs/index.html



举一些例子：

> 字符串判空

传参 `CharSequence` 类型是 String、StringBuilder、StringBuffer 的父类。

```java
// org.apache.commons.lang3.StringUtils

// 判空
public static boolean isEmpty(final CharSequence cs) {
    return cs == null || cs.length() == 0;
}

// 非空
public static boolean isNotEmpty(final CharSequence cs) {
    return !isEmpty(cs);
}

// 判空，会去除字符串中的空白字符，比如空格、换行、制表符
public static boolean isBlank(final CharSequence cs) {
    final int strLen = length(cs);
    if (strLen == 0) {
        return true;
    }
    for (int i = 0; i < strLen; i++) {
        if (!Character.isWhitespace(cs.charAt(i))) {
            return false;
        }
    }
    return true;
}

// 非空
public static boolean isNotBlank(final CharSequence cs) {
    return !isBlank(cs);
}
```



> 首字母转大写

```java
@Test
public void testCommons_Lang3() {

    String str = "aaa";
	
    // org.apache.commons.lang3.StringUtils#capitalize()
    String capitalize = StringUtils.capitalize(str);

    System.out.println(capitalize); // Aaa
}
```



> 重复拼接字符串

```java
@Test
public void testCommons_Lang3() {

    String str = "aaa";

    String repeat = StringUtils.repeat(str, 2);

    System.out.println(repeat); // aaaaaa
}
```



> 格式化日期

```java
@Test
public void testCommons_Lang3() throws ParseException {

    // Date 转 String
    // org.apache.commons.lang3.time.DateFormatUtils
    String format = DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss");

    System.out.println(format);

    // String 转 Date
    // org.apache.commons.lang3.time.DateUtils
    Date date = DateUtils.parseDate("2021-11-28 01:01:01", "yyyy-MM-dd HH:mm:ss");

    // 计算一个小时后的日期(常用日期时间计算)
    Date date1 = DateUtils.addHours(new Date(), 1);
    System.out.println(DateFormatUtils.format(date1, "yyyy-MM-dd HH:mm:ss"));

}
```



> 包装临时对象

当一个方法需要返回两个及以上字段时，我们一般会封装成一个临时对象返回，现在有了 `Pair` 和 `Triple` 就不需要了。

```java
@Test
public void testCommons_Lang3() throws ParseException, JsonProcessingException {

    // 返回两个字段
    // org.apache.commons.lang3.tuple.ImmutablePair
    ImmutablePair<Integer, String> pair = ImmutablePair.of(1, "NaiveKyo");

    System.out.println(pair.getLeft() + ", " + pair.getRight());    // 1, NaiveKyo

    // 返回三个字段
    // org.apache.commons.lang3.tuple.
    ImmutableTriple<Integer, String, Date> triple = ImmutableTriple.of(1, "Now", new Date());

    System.out.println(triple.getLeft() + ", " + triple.getMiddle() + ", " + triple.getRight());    // 1, Now, Sun Nov 28 20:43:45 CST 2021

    ObjectMapper mapper = new ObjectMapper();

    // {"1":"NaiveKyo"}
    System.out.println(mapper.writeValueAsString(pair));

    // {"left":1,"middle":"Now","right":1638107105942}
    System.out.println(mapper.writeValueAsString(triple));
}
```



### 2、Commons-Collections

依赖：

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-collections4</artifactId>
    <version>4.4</version>
</dependency>
```

`Apache Commons Collections4` 作为 Java 的集合框架，为我们提供了很多强大的数据结果和处理集合的方法。



官网：https://commons.apache.org/proper/commons-collections/

文档：https://commons.apache.org/proper/commons-collections/apidocs/index.html



下面介绍一些常用方法：

> 集合判空

```java
// org.apache.commons.collections4.CollectionUtils

public static boolean isEmpty(final Collection<?> coll) {
    return coll == null || coll.isEmpty();
}

public static boolean isNotEmpty(final Collection<?> coll) {
    return !isEmpty(coll);
}

// 交、并、差
@Test
public void testApache_Commons_Collections() {

    List<String> list1 = new ArrayList<>();
    List<String> list2 = new ArrayList<>();
    List<String> list3 = new ArrayList<>();

    // org.apache.commons.collections4.CollectionUtils
    CollectionUtils.addAll(list1, "A", "C", "D", "F");
    CollectionUtils.addAll(list2, "A", "B", "E", "G");
    CollectionUtils.addAll(list3, "A", "B", "C", "D", "E", "F", "G");

    // list1 和 list3 的交集
    Collection<String> retains = CollectionUtils.retainAll(list1, list2);
    System.out.println(retains);    // [A]

    // list1 和 list2 的并集
    Collection<String> union = CollectionUtils.union(list1, list2);
    System.out.println(union);      // [A, B, C, D, E, F, G]

    // list3 和 list2 的差集
    Collection<String> subtract = CollectionUtils.subtract(list3, list2);
    System.out.println(subtract);   // [C, D, F]

}
```

还有其他一些强大的数据结构，这里就不一一说明了。



### 3、Commons-BeanUtils

依赖：

```xml
<dependency>
    <groupId>commons-beanutils</groupId>
    <artifactId>commons-beanutils</artifactId>
    <version>1.9.4</version>
</dependency>
```



很多时候我们必须为 JavaBean 提供大量 getter 和 setter 用于操作属性，但是在某些特殊的场合下，比如在程序运行期间修改某个对象的属性（而且没有 getter 和 setter 方法），就比较麻烦了。

Commons-BeanUtils  正是一个很好的解决方案，其底层使用了反射。



官网：https://commons.apache.org/proper/commons-beanutils/

文档：https://commons.apache.org/proper/commons-beanutils/javadocs/v1.9.4/apidocs/



<mark>注: 在 Spring 框架中也有一个类似功能的 BeanWrapper </mark>



> 设置对象属性

这里要注意一点，当需要操作的类为内部类时，Apache Commons BeanUtils 无法通过反射操作其属性，总是会报找不到 set 方法的异常（<mark>mark 一下，日后有空看看</mark>）

```java
public class User {
    
    private Integer id;
    
    private String name;

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static void main(String[] args) throws Exception {
        
        User user = new User();
        
        BeanUtils.setProperty(user, "id", 1);
        BeanUtils.setProperty(user, "name", "NaiveKyo");

        // NaiveKyo
        System.out.println(BeanUtils.getProperty(user, "name"));
        // User{id=1, name='NaiveKyo'}
        System.out.println(user);
    }
}
```



> 对象和 map 互转



```java
public static void main(String[] args) throws Exception {

    User user = new User();

    BeanUtils.setProperty(user, "id", 1);
    BeanUtils.setProperty(user, "name", "NaiveKyo");

    // 对象转 Map
    Map<String, String> describe = BeanUtils.describe(user);
    System.out.println(describe);   // {name=NaiveKyo, id=1}

    // Map 转对象
    User newUser = new User();
    BeanUtils.populate(newUser, describe);
    System.out.println(newUser);    // User{id=1, name='NaiveKyo'}

}
```



### 4、Commons-IO

依赖：

```xml
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.11.0</version>
</dependency>
```

该框架简化了 Java IO 的相关操作。



官网：https://commons.apache.org/proper/commons-io/

文档：https://commons.apache.org/proper/commons-io/apidocs/index.html



```java
@Test
public void test_Apache_Commons_IO() throws IOException {

    File file1 = new File("demo1.txt");
    // 读取文件
    List<String> list = FileUtils.readLines(file1, Charset.defaultCharset());
    // 写入文件
    FileUtils.writeLines(new File("demo2.txt"), list);
    // 复制文件
    FileUtils.copyFile(file1, new File("demo3.txt"));
}
```



## 三、Google Guava

依赖：

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>31.0.1-jre</version>
</dependency>
```

Guava工程包含了若干被 Google 的  Java 项目广泛依赖的核心库。



GitHub：https://github.com/google/guava

中文文档：https://wizardforcel.gitbooks.io/guava-tutorial/content/1.html



举其中的集合的部分 API 为例：

```java
@Test
public void test_Google_Guava() {

    // com.google.common.collect.Lists
    List<String> list1 = Lists.newArrayList();
    List<Integer> list2 = Lists.newArrayList(1, 2, 3);
    System.out.println(list2);  // [1, 2, 3]

    // 反转 List
    List<Integer> reverse = Lists.reverse(list2);
    System.out.println(reverse); // [3, 2, 1]

    // 将 List 集合元素切分成若干个集合
    List<List<Integer>> partition = Lists.partition(list2, 1);
    for (List<Integer> integers : partition) {
        System.out.println(integers); // [1] [2] [3]
    }

    // Map
    Map<String, String> map = Maps.newHashMap();
    // Set
    Set<String> set = Sets.newHashSet();
}
```



## 四、Guava 中的特殊数据结构

### 1、Multimap

Multimap：一个 key 可以映射多个 value 的 HashMap。

可以替代 Map<String, List>

```java
@Test
public void multimap() {

    // com.google.common.collect
    Multimap<String, Integer> map = ArrayListMultimap.create();

    map.put("key", 1);
    map.put("key", 2);

    Collection<Integer> values = map.get("key");
    System.out.println(map);    // {key=[1, 2]}

    // 返回普通的 Map
    Map<String, Collection<Integer>> collectionMap = map.asMap();

}
```



### 2、BiMap

BiMap：value 也不能重复的 HashMap。

其实就是双向映射。

```java
@Test
public void biMap() {

    // com.google.common.collect.HashBiMap
    HashBiMap<String, String> biMap = HashBiMap.create();

    // 如果 value 重复，put 方法会抛异常，除非用 forcePut 方法
    // forcePut 原理也很简单，重复直接覆盖
    biMap.put("key1", "value1");
    biMap.put("key2", "value2");

    System.out.println(biMap);  // {key1=value1, key2=value2}

    // 反转 key 和 value
    BiMap<String, String> inverse = biMap.inverse();
    System.out.println(inverse); // {value1=key1, value2=key2}
}
```



### 3、Table

Table：一种有两个 key 的 HashMap。



```java
@Test
public void table() {

    // 按照年龄和性别分组
    // com.google.common.collect.HashBasedTable
    Table<Integer, String, String> table = HashBasedTable.create();

    table.put(18, "男", "张三");
    table.put(19, "男", "李四");
    table.put(19, "女", "赵六");

    // 其实是一个二维的 map，通过 行 和 列 确定一个 value
    System.out.println(table.get(18, "男")); // 张三

    // 查看行数据
    Map<String, String> row = table.row(18);
    System.out.println(row);    // {男=张三}

    // 查看列数据
    Map<Integer, String> column = table.column("男");
    System.out.println(column); // {18=张三, 19=李四}

}
```



### 4、Multiset

Multiset：一种用来计数的 Set。

```java
@Test
public void multiSet() {

    // com.google.common.collect.HashMultiset
    Multiset<String> multiset = HashMultiset.create();

    multiset.add("a");
    multiset.add("a");
    multiset.add("a");
    multiset.add("b");
    multiset.add("c");
    multiset.add("d");

    System.out.println(multiset.count("a"));    // 3

    // 查看去重的元素
    Set<String> set = multiset.elementSet();
    System.out.println(set);    // [a, b, c, d]

    // 查看没有去重的元素
    Iterator<String> iterator = multiset.iterator();
    while (iterator.hasNext()) {
        System.out.print(iterator.next() + " ");    // a a a b c d 
    }

    // 设置某个元素出现的次数
    multiset.setCount("b", 5);
    Iterator<String> iterator1 = multiset.iterator();
    while (iterator1.hasNext()) {
        System.out.print(iterator1.next() + " ");    // a a a b c d a a a b b b b b c d 
    }
}
```

