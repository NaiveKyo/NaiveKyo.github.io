---
title: Java JBDC API Review
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425111445.jpg'
coverImg: /img/20220425111445.jpg
cover: false
toc: true
mathjax: false
date: 2023-04-22 20:57:35
summary: "阅读 Java 8 官方文档中关于 JDBC 的部分"
categories: "Java"
keywords: ["Java", "JDBC"]
tags: ["Java", "JDBC"]
---

# 参考

[Java API doc](https://docs.oracle.com/javase/8/docs/api/)

[Java JDBC API document](https://docs.oracle.com/javase/8/docs/technotes/guides/jdbc/index.html)

# Java JDBC API

Java Database Connectivity（JDBC）API 为 Java 编程语言提供了一种通用的数据访问方式，开发者可以利用它实现访问任何数据源，包括关系型数据库、电子表格到文件。JDBC 还提供了一些通用的接口，利用它们可以构建一些工具或者通过继承接口来扩展它。

JDBC API 包含两个 package：

- `java.sql`；
- `javax.sql`；

如果要利用 JDBC API 实现 Java 程序和特定的数据库管理系统结合使用，就需要一个基于 JDBC 技术的驱动，这样 Java 程序才可以通过 JDBC API 操作数据库。处于多方面考虑，驱动可以用纯 Java 程序编写，也可以将 Java 程序和 Java Native Interface（JNI）混合使用。

下面看一下上面两个包的描述：

## java.sql

[java.sql](https://docs.oracle.com/javase/8/docs/api/java/sql/package-summary.html#package.description)

这个包提供了一些 API 可以让 Java 程序访问和处理存储在数据源中的数据（通常是关系型数据库）。此外这个 API 还提供了一种 framework，可以在运行时动态的查找并安装不同的驱动程序来访问不同的数据源（SPI 机制）。尽管 JDBC API 主要用于向数据库传输 sql 语句，但是它也提供了从任何表格形式的数据源读取和写入数据的功能，这种读/写能力是通过 `javax.sql.RowSet` 提供的一组接口实现了，开发者可以通过定制这些接口来实现从电子表格、文件或其他任何表格数据源中读写数据。

java.sql 主要包含以下 API：

- 通过 `DriverManager` 工具创建和 database 之间的 connection：
  - `DriverManager` 类：通过 driver 创建 connection；
  - `SQLPermission` 类：当 Java 程序中存在 SecurityManager 时，可以结合该类提供的 permission 尝试通过 DriverManager 设置 logging stream；
  - `Driver` 接口：提供了基于 JDBC 技术用于注册 driver 和创建 connection 的 API；通常只会被 DriverManager 使用；
  - `DriverPropertyInfo` 类：为 JDBC driver 的属性提供抽象，一般用户不会使用到它；
- 向 database 发送 sql 语句：
  - `Statement` 接口：用于发送 basic sql 语句；
  - `PreparedStatement`  接口：扩展了 Statement 接口，提供发送 prepared sql 语句的能力；
  - `CallableStatement` 接口：扩展了 PreparedStatement 接口，提供了执行数据库 stored procedures 的能力；
  - `Connection` 接口：connection 其实就是和数据库的一次会话，提供了执行 sql 语句、管理 connections 以及其属性的方法；
  - `Savepoint`：为 transaction 提供 savepoints；
- 检索和更新执行一次查询 sql 的结果；
  - `ResultSet` 接口；
- Java 语言提供了一些类和接口和 SQL types 一一对应：
  - `Array` 接口：对应 SQL ARRAY；
  - `Blob` 接口：对应 SQL BLOB；
  - `Clob` 接口：对应 SQL CLOB；
  - `Date` 类：对应 SQL DATE；
  - `NClob` 接口：对应 SQL NCLOB；
  - `Ref` 接口：对应 SQL REF；
  - `RowId` 接口：对应 SQL ROWID；
  - `Struct` 接口：对应 SQL STRUCT；
  - `SQLXML` 接口：对应 SQL XML；
  - `Time` 类：对应 SQL TIME；
  - `Timestamp` 类：对应 SQL TIMESTAMP；
  - `Types` 类：提供了 SQL types 的常量，相当于 type code；
- 如果自定义了一种 SQL 类型（user-defined type，UDT），Java 中也有对应的 class：
  - `SQLDate` 接口：和特定 UDT 类型对应；
  - `SQLInput` 接口：提供了从流中读取 UDT 属性的方法；
  - `SQLOutput` 接口：提供将 UDT 属性写回流的方法；
- Metadata：
  - `DatabaseMetaData` 接口：提供有关数据库的信息；
  - `ResultSetMetaData` 接口：提供关于 ResultSet 对象的列的信息；
  - `ParameterMetaData` 接口：提供有关 PreparedStatement 命令参数的信息；
- Exceptions：
  - `SQLException`：当访问数据出现问题时，大多数方法都会抛出，而由于其他原因，一些方法也会抛出；
  - `SQLWarning`：抛出表示警告；
  - `DataTruncation`：抛出表示数据可能已被截断；
  - `BatchUpdateException`：抛出，表示批处理更新中并非所有命令都成功执行；



## javax.sql

[javax.sql](https://docs.oracle.com/javase/8/docs/api/javax/sql/package-summary.html#package.description)

这个包为 Java 程序访问和处理 server side data source 提供了一些 API。javax.sql 包从 Java 1.4 发行版本开始作为 java.sql 包的补充，包含在 Java SE 和 Java EE 中。

javax.sql 包提供了以下补充：

- `DataSource` 接口作为 DriverManager 的可选方案，可以创建和 data source 的 connection；
- Connection pooling and Statement pooling，连接池和语句池；
- Distributed transactions，分布式事务；
- Rowsets，结果集；

应用程序可以直接使用 DataSource 和 RowSet API，但是 connection pooling 和 distributed transaction API 在内部中间层使用。

> 使用 DataSource 对象来建立 Connection

javax.sql 包提供了一种更好的建立和数据源之间的 connection 的方式。之前通过 DriverManager 类的机制限制仍然有效。只不过更推荐使用 DataSource 来创建 connection，因为这种方式提供了一些增强特性。

下面列出用 DataSource 的好处：

- 可以对数据源的属性进行更改，这意味着当数据源或驱动程序的某些内容发生更改时，不需要对应用程序代码进行更改；
- 连接池、语句池以及分布式事务可以通过 DataSource 对象和程序使用的某些中间层一起使用。之前通过 DriverManager 创建的 Connection 是不具备池化特性的，且不支持分布式事务；

现在数据库供应商需要提供对应的 Driver 且包含 DataSource 的实现。一个特定的 DataSource 实现代表一种物理数据库，由它创建的 Connection 连接的也是一个物理数据源。

对于一个数据源来讲，通过 Java 的 JNDI（Java Naming and Directory Interface）API 注册逻辑名称，应用程序可以通过查找已注册的逻辑名称来检索所需的 DataSource 对象，然后应用程序就可以通过这个 DataSource 对象去创建和物理数据源之间的 connection。

DataSource 对象可以实现为与中间层基础结构一起工作，这样它创建的 connections 将被池化以供重用。使用这种 DataSource 实现的应用程序可以通过池子中的 connection 对象来操作数据库。还可以实现 DataSource 对象以使用中间层基础结构，这样它产生的连接就可以用于分布式事务，而无需任何特殊编码。

> Connection Pooling and Statement Pooling

如果 DataSource 的实现支持池化技术，使用它就可以提高程序的性能，因为创建新的 Connection 对象代价是昂贵的，而复用已有的连接对象则更加高效。

同时 Connection pooling 对于应用程序而言是透明的，程序不会感知到连接池的状态，因为它们和中间层一起工作，程序不需要通过代码操作它，只需要调用 `DataSource.getConnection` 方法就可以获取池子中的连接对象，然后就可以通过 Connection 对象和数据库交互。

connection pooling 使用的类和接口如下所示：

- `ConnectionPoolDataSource` 接口；
- `PooledConnection` 接口；
- `ConnectionEvent` 类；
- `ConnectionEventListener` 接口；
- `StatementEvent` 类；
- `StatementEventListener` 接口；

连接池管理器是三层体系结构的中间层工具，它在幕后使用这些类和接口。当 `ConnectionPoolDataSource` 对象创建 `PooledConnection` 对象时，连接池管理器将会为这个 `PooledConnection` 对象注册一个 `ConnectionEventListener`。当该连接对象 closed 或者出现 error，连接池管理者（作为一个监听者）将会受到通知获取一个 `ConnectionEvent` 对象。

> Distributed Transactions

和 pooled connections 一样，通过与中间层一起工作的 DataSource 创建的 connections 可以参于到分布式事务中。它允许应用程序可以在多个服务器上执行一个事务。

分布式事务使用的接口和类有：

- `XADataSource` 接口；
- `XAConnection` 接口；

由事务管理器（transaction manager）使用这些接口，应用程序无法直接使用它们。

`XAConnection` 继承了 `PooledConnection`，因此分布式事务的 connection 也支持池化技术。中间层中的事务管理器透明地处理所有事情。应用程序代码中唯一的变化是应用程序不能做任何会干扰事务管理器处理事务的事情。具体来说，应用程序不能调用 `Connection.commit` 或 `Connection.rollback`，也不能连接设置为自动提交模式（也就是说，它不能调用 `connection . setautocommit (true)`）。

`XADataSource` 创建 `XAConnection`，`XAConnection` 又可以创建 `XAResource` 对象，事务管理器可以通过 `XAResource` 对象来管理 connection。

注：Java 的分布式事务 API 概念还不够完善，具体实现要看第三方分布式事务框架。

> Rowsets

`RowSet` 接口和其他类或接口一起使用，主要可以分为以下三类：

（1）Event Notification（事件通知）

- `RowSetListener`：
  - RowSet 对象也属于 Java Bean 机制的一部分，因为它符合 Java Bean 的定义，且参于 JavaBeans 的事件通知机制（event notification mechanism），也提供的有 `RowSetListener`，可以通过调用 `RowSet.addRowSetLinstener` 方法来绑定；
  - 当 RowSet 对象发生变化的时候（rows 中某一个发生变化、或者所有 row 都发生变化、或者移除了某个 cursor），就会通知所有注册的监听者；
- `RowSetEvent`
  - 它作为内部通知处理机制的一部分，RowSet 对象创建 RowSetEvent 实例传给它的监听者，监听者可以通过 RowSetEvent 对象来获取具体发生的事件。

（2）Metadata

- `RowSetMetadata` 此接口继承了 `ResultSetMetaData`，包含和 RowSet 对象关联的信息，应用程序可以通过该元数据对象获取 rowset 包含了多少列，每一列包含的数据；

（3）The Reader/Writer Facility

如果一个 RowSet 对象实现了 `RowSetInternal` 接口，那么它就可以调用和它关联的 `RowSetReader` 对象来操作数据，也可以调用关联的 `RowSetWriter` 对象将 rows 的变化回写给数据源。保持与数据源连接的 RowSet 不需要使用读取器和写入器，因为它可以直接对数据源进行操作。

- `RowSetInternal`

实现了该接口的 RowSet 对象可以访问它的内部的状态，且可以调用对应的 reader 和 writer；

- `RowSetReader`

A disconnected `RowSet` object that has implemented the `RowSetInternal` interface can call on its reader (the `RowSetReader` object associated with it) to populate it with data. When an application calls the `RowSet.execute` method, that method calls on the rowset's reader to do much of the work. Implementations can vary widely, but generally a reader makes a connection to the data source, reads data from the data source and populates the rowset with it, and closes the connection. A reader may also update the `RowSetMetaData` object for its rowset. The rowset's internal state is also updated, either by the reader or directly by the method `RowSet.execute`.

- `RowSetWriter`

A disconnected `RowSet` object that has implemented the `RowSetInternal` interface can call on its writer (the `RowSetWriter` object associated with it) to write changes back to the underlying data source. Implementations may vary widely, but generally, a writer will do the following:

- Make a connection to the data source
- Check to see whether there is a conflict, that is, whether a value that has been changed in the rowset has also been changed in the data source
- Write the new values to the data source if there is no conflict
- Close the connection

## JDBC 4.2 API

Java SE 的 JDBC 是有版本的，JDK 8 中 JDBC 的版本是 4.2，相关 API 在两个包中：

- `java.sql` 包中提供了JDBC 的 core API；
- `javax.sql` 包提供 JDBC 的 Optional API；

准确来说完整的 JDBC API 是在 JDK SE 7 中提出的，`javax.sql` 则是将 JDBC API 的功能从 client api 扩展到 server api，它是属于 Java EE 的重要组成部分。

JDBC 4.2 API 集成了以前版本的 JDBC API 版本：

- The JDBC 4.1 API
- The JDBC 4.0 API
- The JDBC 3.0 API
- The JDBC 2.1 core API
- The JDBC 2.0 Optional Package API
  (Note that the JDBC 2.1 core API and the JDBC 2.0 Optional Package API together are referred to as the JDBC 2.0 API.)
- The JDBC 1.2 API
- The JDBC 1.0 API

需要注意的是：有很多新特性是可选的，因此开发者选择的数据库驱动可能有一些改动，在使用特定的驱动版本的时候，最好查询驱动的文档看看它是否支持某些新特性。

# Getting Started

学习环境如下：

- 基于 Docker 创建 MySQL 容器；
- MySQL 版本为 8 +；
- Java 项目构建工具为 Maven；
- JDK 8 +；

Docker image：`mysql:8.0.32-oracle`

Maven 依赖：

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.0.32</version>
</dependency>

<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.9.2</version>
    <scope>test</scope>
</dependency>
```



# 使用 JDBC 处理 SQL 语句

通常来说使用 JDBC 处理 SQL 语句只需要按照如下步骤：

（1）创建 connection；

（2）创建 statement；

（3）利用 statement 执行 sql 语句；

（4）处理 ResultSet 结果集对象；

（5）关闭 connection；

工具类：

```java
package io.naivekyo.util;

import io.naivekyo.annotation.TableColumn;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * @author NaiveKyo
 * @version 1.0
 * @since 2023/4/2 17:32
 */
public class JDBCUtils {
    
    private static final String USERNAME = "root";
    
    private static final String PASSWORD = "123456";
    
    private static final String URL = "jdbc:mysql://192.168.154.2:3306/my_test?useSSL=false&useUnicode=true&characterEncoding=UTF-8&serverTimeZone=Asia/Shanghai";
    
    private static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }

    /**
     * <p>执行插入语句</p>
     * @param sql   预处理的 sql 语句
     * @param params    要填充的数据
     * @return 受影响的行数
     */
    public static int insert(String sql, Object... params) {
        if (params == null || params.length == 0)
            throw new IllegalArgumentException("insert sql must have at least one parameter.");
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = getConnection();
            statement = connection.prepareStatement(sql);
            pretreatmentSQL(statement, params);
            return statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            releaseResource(connection, statement, null);
        }
        
        return -1;
    }

    /**
     * <p>sql 语句根据条件查询一条数据</p>
     * @param sql   sql 查询语句
     * @param clz   实体类的 Class 对象
     * @param params    填充的查询数据
     * @param <T>   数据库实体
     * @return  实体类对象
     */
    public static <T> T getOne(String sql, Class<T> clz, Object... params) {
        if (params == null || params.length == 0)
            throw new IllegalArgumentException("condition query sql must have at least one parameter.");
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet rs = null;
        T t = null;
        try {
            connection = getConnection();
            statement = connection.prepareStatement(sql);
            pretreatmentSQL(statement, params);
            rs = statement.executeQuery();
            while (rs.next()) {
                t = useReflectGetEntity(rs, clz);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            releaseResource(connection, statement, rs);
        }

        return t;
    }

    private static void pretreatmentSQL(PreparedStatement statement, Object[] params) throws SQLException {
        for (int i = 0; i < params.length; i++) {
            statement.setObject(i + 1, params[i]);
        }
    }

    private static <T> T useReflectGetEntity(ResultSet rs, Class<T> clz) throws Exception {
        Field[] fields = clz.getDeclaredFields();
        Constructor<T> constructor = clz.getConstructor();
        constructor.setAccessible(true);
        T obj = constructor.newInstance();
        
        for (Field f : fields) {
            TableColumn anno = f.getAnnotation(TableColumn.class);
            if (anno != null) {
                f.setAccessible(true);
                String columnName = anno.value();
                Object property = rs.getObject(columnName);
                f.set(obj, property);
            }
        }
        
        return obj;
    }

    /**
     * <p>执行查询 sql 获取数据库实体集合</p>
     * @param sql   sql 查询语句
     * @param clz   Java 实体类 Class 对象
     * @param params    查询参数
     * @param <T>   Java 实体类
     * @return  实体类对象集合
     */
    public static <T> List<T> getEntityList(String sql, Class<T> clz, Object... params) {
        if (params == null || params.length == 0)
            throw new IllegalArgumentException("condition query sql must have at least one parameter.");
        Connection connection = null;
        PreparedStatement statement = null;
        ResultSet rs = null;
        List<T> list = null;
        try {
            connection = getConnection();
            statement = connection.prepareStatement(sql);
            pretreatmentSQL(statement, params);
            rs = statement.executeQuery();
            list = new ArrayList<>();
            while (rs.next()) {
                list.add(useReflectGetEntity(rs, clz));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            releaseResource(connection, statement, rs);
        }
        
        return list;
    }
    
    public static int update(String sql, Object... params) {
        if (!sql.contains("where"))
            throw new IllegalArgumentException("illegal update sql statement. sql must contain 'where' clause!");
        if (params == null || params.length == 0)
            throw new IllegalArgumentException("condition update sql must have at least one parameter.");
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = getConnection();
            statement = connection.prepareStatement(sql);
            pretreatmentSQL(statement, params);
            return statement.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            releaseResource(connection, statement, null);
        }
        
        return -1;
    }

    private static void releaseResource(Connection connection, Statement statement, ResultSet resultSet) {
        try {
            if (connection != null)
                connection.close();
            if (statement != null)
                statement.close();
            if (resultSet != null)
                resultSet.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

字段映射注解：

```jav
/**
 * <p>数据库实体与 Java 实体类的字段名称映射</p>
 * <p>标注在对象属性上用于声明当前属性对应的数据库实体字段</p>
 * @author NaiveKyo
 * @version 1.0
 * @since 2023/4/9 21:49
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface TableColumn {
    
    String value();
    
}
```



## 建立 connection

首先你需要和要使用的 data source 建立一个 connection。通常来说一个应用要和数据源建立连接会使用下面两个类中的一个：

- `DriverManager`：这个类可以在应用程序与数据源之间建立 connection，数据源由 database URL 指定。当使用它建立 Connection 时，它会自动在类路径下寻找任何 JDBC 4.0 驱动。而对于 JDBC 4.0 之前的驱动则需要手动加载；
- `DataSource`：这个接口要比 DriverManager 类更好一些，它将底层数据的详细信息和应用程序分开，不同的 DataSource 对象拥有不同的属性集。

使用 DriverManager 时，有一些注意点：

- database connection URL 是一个字符串，DBMS JDBC driver 用它和数据库建立 connection，通常 URL 包含了特定数据库采取的协议、数据库的地址、要连接的目标数据库、连接的属性。详细的信息由对应的数据库供应商提供。

使用 DataSource 的例子后面的文章在 spring 项目中使用，DataSource 是 JDBC API 的补充，要比使用 DriverManager 更好一些，因为它支持使用连接池和分布式事务。

# 处理 SQLExceptions

当使用 JDBC 和数据源交互的时候，如果发生了错误，就会抛出 `SQLException` 该类继承自 Exception，SQLException 实例中封装了一些信息有助于判断到底是什么原因导致的错误。

- 使用 `SQLException.getMessage` 方法获取导致错误的原因的描述字符串；
- `SQLState` 字段封装了数据库状态 code，这些 code 大部分由 ISO/ANSI 和 Open Group（X/Open）组织维护，也有一些由专门的数据库供应商提供，比如 MySQL 官方文档列出了这些 [MySQL Error Numbers](https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-error-sqlstates.html)；
- `vendorCode` 错误码，是一个整型数字标识了造成 SQLException 的原因，它的值和含义是和特定数据库实现相关，可能是底层数据源返回的实际错误代码。要追溯异常链，可以调用 `SQLException.getCause` 方法直到获得 null 值；
- 一个对 `chained exceptions` 的引用，如果发生了多个 error，就会形成 SQL 异常链，通过调用 `SQLException.getNextException` 获取其他异常信息。

## Retrieving Exceptions

下面的例子方法输出 SQLState、error code、error exception 以及可能存在的异常链：

```java
public static void printSQLException(SQLException ex) {

    for (Throwable e : ex) {
        if (e instanceof SQLException) {
            if (ignoreSQLException(
                ((SQLException)e).
                getSQLState()) == false) {

                e.printStackTrace(System.err);
                System.err.println("SQLState: " +
                    ((SQLException)e).getSQLState());

                System.err.println("Error Code: " +
                    ((SQLException)e).getErrorCode());

                System.err.println("Message: " + e.getMessage());

                Throwable t = ex.getCause();
                while(t != null) {
                    System.out.println("Cause: " + t);
                    t = t.getCause();
                }
            }
        }
    }
}
```

## Retrieving Warnings

`SQLWarning` 继承了 SQLException，它主要用于处理数据库的 access warnings。Warnings 并不会像异常一样终止程序的执行，它只是简单的警告用户某些事情发生了。例如，警告可能会让您知道您试图撤销的特权没有被撤销，或者一个警告可能告诉您在请求断开连接期间发生了错误。

`Connection`、`Statement`、`ResultSet` 都有一个 `getWarnings` 方法用于获取可能存在的警告信息。如果获得了 SQLWarning 对象，则可以继续调用它的 `getNextWarning` 获取可能存在的警告链。执行一条语句会自动清除前一条语句中的警告，这样它们就不会堆积起来。然而，这意味着，如果您想检索一条语句上报告的警告，则必须在执行另一条语句之前执行。

下面的例子演示如何获取 Statement 和 ResultSet 对象的完整警告信息：

```java
public static void getWarningsFromResultSet(ResultSet rs)
    throws SQLException {
    JDBCTutorialUtilities.printWarnings(rs.getWarnings());
}

public static void getWarningsFromStatement(Statement stmt)
    throws SQLException {
    JDBCTutorialUtilities.printWarnings(stmt.getWarnings());
}

public static void printWarnings(SQLWarning warning)
    throws SQLException {

    if (warning != null) {
        System.out.println("\n---Warning---\n");

    while (warning != null) {
        System.out.println("Message: " + warning.getMessage());
        System.out.println("SQLState: " + warning.getSQLState());
        System.out.print("Vendor error code: ");
        System.out.println(warning.getErrorCode());
        System.out.println("");
        warning = warning.getNextWarning();
    }
}
```

最常见的警告是 `DataTruncation` 警告，它继承了 SQLWarning，所有的 DataTruncation 对象都有一个 SQLState 01004，表明在读取或者写入数据时出现了问题。调用它的方法可以找到是哪个字段或者哪个参数的数据被截断了。无论截断是在读操作还是写操作上，应该传输多少字节，以及实际传输了多少字节。

## SQLException 的分类

您的 JDBC 驱动程序可能抛出一个 SQLException 的子类，它对应于一个公共的 SQLState 或一个与特定的 SQLState 类值不关联的公共错误状态。这使您能够编写更多可移植的错误处理代码。这些异常是以下类之一的子类:

- `SQLNonTransientException`；
- `SQLTransientException`；
- `SQLRecoverableException`

可以查阅最新版的 java.sql 包的文档说明或者应用使用的 JDBC 驱动的 api 文档。

其他 SQLException 的子类：

下面两种：

- `BatchUpdateException`：在批量更新操作过程中发生错误会抛出该异常。
- `SQLClientInfoException`：当一个 Connection的某些 client 属性没有被正确设置时会抛出这个异常。

# ResultSet

`ResultSet` 接口提供了一些方法用于检索和操作通过查询语句获得的结果。同时 ResultSet 对象也有一些不同的功能和特征，这些特征字段包括：type、concurrency 以及 cursor holdability（保持游标的能力）；

## type

ResultSet 的 type 决定了它的两方面的功能级别：是否可以操作游标，以及 ResultSet 对象如何反映底层数据源的并发更改。

ResultSet 对象的灵敏度由三种不同的 ResultSet type 之一决定：

- `TYPE_FORWARD_ONLY`：顾名思义，result set 不能滚动，游标只能向前移动，从第一行移动到最后一行。结果集中包含的行取决于底层数据库生成结果的方式。也就是说，它包含在执行查询时或在检索行时满足查询的行。
- `TYPE_SCROLL_INSENSITIVE`：这种 result set 可以滚动，游标可以从当前位置向前或向后移动，并且它还可以移动到某个绝对位置，结果集对打开时对底层数据源所做的更改不敏感。它包含在执行查询时或在检索行时满足查询的行。
- `TYPE_SCROLL_SENSITIVE`：这种 result set 可以滚动，游标可以相对于当前位置向前或向后移动，也可以移动到某个绝对位置，结果集反映对底层数据源所做的更改，而结果集保持打开状态。

默认的 ResultSet type 是 `TYPE_FORWARD_ONLY`；

注意：并不是所有的数据库和 JDBC 启动都支持这些 type，使用 `DatabaseMetaData.supportsResultSetType` 方法可以查看结果集是否支持特定的 type。（返回 true 或 false）。

## concurrency

ResultSet 对象的 concurrency 决定了它对 update functionality 的支持程度。

有两个 concurrency level：

- `CONCUR_READ_ONLY`：ResultSet 不能被相关方法更新；
- `CONCUR_UPDATEABLE`：ResultSet 对象可以被相关方法更新；

默认的 ResultSet concurrency 是 `CONCUR_READ_ONLY`；

注意：并不是所有数据库和 JDBC Driver 都支持这两个级别，可以使用 `DatabaseMetaData.supportsResultSetConcurrency` 判断是否支持

## Cursor Holdability

在当前事务中调用 `Connection.commit` 可以关闭在事务中创建的 ResultSet 对象，但是有些情况却不会像我们期望的那样。应用程序可以设置ResultSet 的 `holdability` 属性来决定是否在调用 commit 方法的时候关闭 ResultSet 的 cursor；

以下 ResultSet 常量可以提供给 Connection 的方法 createStatement、 prepareStatement 和 prepareCall：

- `HOLD_CURSORS_OVER_COMMIT`：ResultSet 的 cursor 不会被关闭，它们是 holdable 的：当调用 commit 方法提交事务后，cursor 仍然是打开的状态，如果应用程序中很多场景都是使用只读的 ResultSet 对象，可以考虑使用它；
- `CLOSE_CURSORS_AT_COMMIT`：当 commit 方法被调用时，ResultSet 的 cursor 就会关闭，这样做可以提升程序的性能；

注意：并不是所有的数据库和 JDBC Driver 实现都支持 holdable 和 non-holdable 的 cursor。

下面的例子演示 ResultSet 默认的 cursor holdability，以及是否支持前面说的两种常量：

```java
public static void cursorHoldabilitySupport(Connection conn)
    throws SQLException {

    DatabaseMetaData dbMetaData = conn.getMetaData();
    System.out.println("ResultSet.HOLD_CURSORS_OVER_COMMIT = " +
        ResultSet.HOLD_CURSORS_OVER_COMMIT);

    System.out.println("ResultSet.CLOSE_CURSORS_AT_COMMIT = " +
        ResultSet.CLOSE_CURSORS_AT_COMMIT);

    System.out.println("Default cursor holdability: " +
        dbMetaData.getResultSetHoldability());

    System.out.println("Supports HOLD_CURSORS_OVER_COMMIT? " +
        dbMetaData.supportsResultSetHoldability(
            ResultSet.HOLD_CURSORS_OVER_COMMIT));

    System.out.println("Supports CLOSE_CURSORS_AT_COMMIT? " +
        dbMetaData.supportsResultSetHoldability(
            ResultSet.CLOSE_CURSORS_AT_COMMIT));
}
```

## Cursor

正如前面所说的，可以通过一个 cursor 访问 ResultSet 中的数据，它指向 ResultSet 对象中的某一个 row。但是要注意的是当 ResultSet 刚创建的时候，cursor 是指向第一行的前一行的，所以我们要通过这样的循环方式：

```java
ResultSet rs = ...
while (rs.next()) {
   .....
}
```

当然还有其他 cursor 方法可以根据需要移动 cursor；

注意默认的 sensitivity 是 TYPE_FORWARD_ONLY，就是只能向前移动直到最后一行。





https://docs.oracle.com/javase/tutorial/jdbc/basics/retrieving.html

## 通过 ResultSet 修改数据库数据

`ResultSet.TYPE_SCROLL_SENSITIVE` 可以允许 cursor 向前或向后移动，或者移动到相对当前 position 的某个位置，而 `ResultSet.CONCUR_UPDATABLE` 则允许更新 ResultSet 中某个 row，并通过调用方法来更新该 row 对应的数据库中的记录，参考下面的例子：

```java
public void modifyPrices(float percentage) throws SQLException {
    try (Statement stmt =
         con.createStatement(ResultSet.TYPE_SCROLL_SENSITIVE, ResultSet.CONCUR_UPDATABLE)) {
        ResultSet uprs = stmt.executeQuery("SELECT * FROM COFFEES");
        while (uprs.next()) {
            float f = uprs.getFloat("PRICE");
            uprs.updateFloat("PRICE", f * percentage);
            uprs.updateRow();
        }
    } catch (SQLException e) {
        JDBCTutorialUtilities.printSQLException(e);
    }
}
```

这里的 `uprs.updateRow()` 操作就是更新数据库；

## 使用 Statement 对象进行 Batch Updates

`Statement`、`PreparedStatement` 以及 `CallableStatement` 都有一个和它们关联的命令列表，这个列表包括更新、插入或者删除的语句，同时也包括 DDL 语句，如 create table、drop table 等等。但是这些语句并不能创建 ResultSet 对象。换句话说，这些命令执行的结果是数据库受影响的行数，是一个用于计数的值。

比如下面的例子，一次更新四条记录：

```java
public void batchUpdate() throws SQLException {
    con.setAutoCommit(false);
    try (Statement stmt = con.createStatement()) {

        stmt.addBatch("INSERT INTO COFFEES " +
                      "VALUES('Amaretto', 49, 9.99, 0, 0)");
        stmt.addBatch("INSERT INTO COFFEES " +
                      "VALUES('Hazelnut', 49, 9.99, 0, 0)");
        stmt.addBatch("INSERT INTO COFFEES " +
                      "VALUES('Amaretto_decaf', 49, 10.99, 0, 0)");
        stmt.addBatch("INSERT INTO COFFEES " +
                      "VALUES('Hazelnut_decaf', 49, 10.99, 0, 0)");

        int[] updateCounts = stmt.executeBatch();
        con.commit();
    } catch (BatchUpdateException b) {
        JDBCTutorialUtilities.printBatchUpdateException(b);
    } catch (SQLException ex) {
        JDBCTutorialUtilities.printSQLException(ex);
    } finally {
        con.setAutoCommit(true);
    }
}
```

为了利用事务的特性，方法开头设置了 `con.setAutoCommit(false)`，禁用了当前 Connection 对象的自动提交模式，这样开发者就可以手动控制事务的提交与回滚。

`Statement.addBatch` 方法用于向和当前 Statement 对象关联的 command list 中添加 command，最后调用 `stmt.executeBatch()` 将这四条语句发送给数据库并作为一次批量操作。

最后的 `con.commit()` 则提交本次事务，四条语句对数据库的影响变为永久性的。

事务处理完后，记得将当前 Connection 的提交模式改为自动提交：`con.setAutoCommit(true)`

## Parameterized Batch Update

上面介绍了普通的 Statement 的批量模式，下面看看 PreparedStatement 是如何做的：

```java
con.setAutoCommit(false);
PreparedStatement pstmt = con.prepareStatement(
                              "INSERT INTO COFFEES VALUES( " +
                              "?, ?, ?, ?, ?)");
pstmt.setString(1, "Amaretto");
pstmt.setInt(2, 49);
pstmt.setFloat(3, 9.99);
pstmt.setInt(4, 0);
pstmt.setInt(5, 0);
pstmt.addBatch();

pstmt.setString(1, "Hazelnut");
pstmt.setInt(2, 49);
pstmt.setFloat(3, 9.99);
pstmt.setInt(4, 0);
pstmt.setInt(5, 0);
pstmt.addBatch();

// ... and so on for each new
// type of coffee

int[] updateCounts = pstmt.executeBatch();
con.commit();
con.setAutoCommit(true);
```



# 使用 Transactions

有时候你可能向在其他某些语句执行后再执行某一条语句。确保两个操作都发生或者两个操作都不发生的方法是使用事务。事务是作为一个单元执行的一个或多个语句的集合，因此要么执行所有语句，要么不执行任何语句。

## Disabling Auto-Commit Mode

当一个 Connectino 对象被创建时，默认开启 `auto-commit mode`，这意味着每一条单独的 Statement 将会作为一条 transaction 来执行，并且在执行成功后自动提交事务。（更准确的来说，当 SQL Statement completed 的时候提交而不是 executed 的时候。completed 的时候：当 result sets 或者 update counts 被检索的时候。然而，在几乎所有情况下，语句都是在执行之后立即完成并提交的。）

但是可以通过禁用 auto-commit 模式来允许多个语句组合为一个 transaction 来。比如下面的例子，注意 con 是一个激活的 connection：

`con.setAutoCommit(false);`

## Committing Transactions

在禁用 auto-commit 模式后，除非调用 commit 方法否则不会有语句被提交。在上一次调用 commit 方法后执行的所有语句都包含在当前事务中，并作为一个单元一起提交。

参考下面的例子：

```java
public void updateCoffeeSales(HashMap<String, Integer> salesForWeek) throws SQLException {
    String updateString =
        "update COFFEES set SALES = ? where COF_NAME = ?";
    String updateStatement =
        "update COFFEES set TOTAL = TOTAL + ? where COF_NAME = ?";

    try (PreparedStatement updateSales = con.prepareStatement(updateString);
         PreparedStatement updateTotal = con.prepareStatement(updateStatement))

    {
        con.setAutoCommit(false);
        for (Map.Entry<String, Integer> e : salesForWeek.entrySet()) {
            updateSales.setInt(1, e.getValue().intValue());
            updateSales.setString(2, e.getKey());
            updateSales.executeUpdate();

            updateTotal.setInt(1, e.getValue().intValue());
            updateTotal.setString(2, e.getKey());
            updateTotal.executeUpdate();
            con.commit();
        }
    } catch (SQLException e) {
        JDBCTutorialUtilities.printSQLException(e);
        if (con != null) {
            try {
                System.err.print("Transaction is being rolled back");
                con.rollback();
            } catch (SQLException excep) {
                JDBCTutorialUtilities.printSQLException(excep);
            }
        }
    }
}
```

注意顺序，先禁用 auto-commit，然后执行完语句后，在 commit，事务完成后，在开启 auto-commit，这样当前 connection 又可以继续被其他语句所使用。

## Using Transactions to Preserve Data Integrity

除了将语句分组在一起以作为一个单元执行之外，事务还有助于保持表中数据的完整性。

通过两个方法：

- `commit`：提交事务，对数据库的影响持久化；
- `rollbakc`：回退到所有更改生效之前；

可以通过使用事务来避免数据不一致的情况，事务提供某种程度的保护，防止两个用户同时访问数据时产生冲突。

在一次事务中为了避免冲突，DBMS 会使用 lock 阻止其他人访问事务正在访问的数据的机制（需要注意的是在 auto-commit 模式下，每个 statement 都是作为一条事务执行，此时锁只会被一个 statement 所持有）。在设置好锁之后，在事务提交或回滚之前，它一直有效。例如，DBMS 可以锁定表中的一行，直到提交更新为止。该锁的作用是防止用户进行脏读，也就是说，在将值变为永久值之前读取该值。

锁的设置方式取决于当前事务的 isolation level，它从多个层次提供对事务的不同支持程度，从不支持事务到非常严格的支持事务。

Connectino 接口中包含了五个常量对应了可以在 JDBC 中使用了五种事务隔离级别

| Isolation Level                | Transactions  | Dirty Reads      | Non-Repeatable Reads | Phantom Reads    |
| ------------------------------ | ------------- | ---------------- | -------------------- | ---------------- |
| `TRANSACTION_NONE`             | Not supported | *Not applicable* | *Not applicable*     | *Not applicable* |
| `TRANSACTION_READ_COMMITTED`   | Supported     | Prevented        | Allowed              | Allowed          |
| `TRANSACTION_READ_UNCOMMITTED` | Supported     | Allowed          | Allowed              | Allowed          |
| `TRANSACTION_REPEATABLE_READ`  | Supported     | Prevented        | Prevented            | Allowed          |
| `TRANSACTION_SERIALIZABLE`     | Supported     | Prevented        | Prevented            | Prevented        |

解释一下这个几个问题：

- `Dirty Reads`（脏读）：一条事务中读取到了另一条事务还没有提交的数据；
- `Non-Repeatable Reads`（不可重复读）：当事务 A 读取了某一行，事务 B 随后更新了这一行数据，然后事务 A 又读取了这一行，结果就是在事务 A 中两次检索到同一行的数据前后不一致；
- `Phantom Reads`（幻读）：当事务 A 检索到一组满足给定条件的行时，事务 B 随后就插入或者更新了一些数据，而且这部分数据也可以成功匹配事务 A 的检索条件，然后事务 A 又以这个条件来检索数据，此时，事务 A 会发现多出来一部分数据，这些 row 就被视为 phantom（幻象）；

通常来说开发者不必关心事务隔离级别，这却决于使用的 DBMS，比如 MySQL 默认的隔离级别就是可重复读，能够解决脏读和不可重复读的问题。

使用 `DatabaseMetaData.supportsTransactionIsolationLevel` 方法来查看当前 Driver 是否支持指定的事务隔离级别。



## Setting and Rolling Back to Savepoints

`Connection.setSavepoint` 可以在当前 transaction 中设置 `Savepoint` 对象。`Connection.rollback()` 方法的重载方法可以接收 savepoint 参数；

参考下面的例子：

```java
public void modifyPricesByPercentage(
    String coffeeName,
    float priceModifier,
    float maximumPrice) throws SQLException {
    con.setAutoCommit(false);
    ResultSet rs = null;
    String priceQuery = "SELECT COF_NAME, PRICE FROM COFFEES " +
        "WHERE COF_NAME = ?";
    String updateQuery = "UPDATE COFFEES SET PRICE = ? " +
        "WHERE COF_NAME = ?";
    try (PreparedStatement getPrice = con.prepareStatement(priceQuery, ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
         PreparedStatement updatePrice = con.prepareStatement(updateQuery))
    {
        Savepoint save1 = con.setSavepoint();
        getPrice.setString(1, coffeeName);
        if (!getPrice.execute()) {
            System.out.println("Could not find entry for coffee named " + coffeeName);
        } else {
            rs = getPrice.getResultSet();
            rs.first();
            float oldPrice = rs.getFloat("PRICE");
            float newPrice = oldPrice + (oldPrice * priceModifier);
            System.out.printf("Old price of %s is $%.2f%n", coffeeName, oldPrice);
            System.out.printf("New price of %s is $%.2f%n", coffeeName, newPrice);
            System.out.println("Performing update...");
            updatePrice.setFloat(1, newPrice);
            updatePrice.setString(2, coffeeName);
            updatePrice.executeUpdate();
            System.out.println("\nCOFFEES table after update:");
            CoffeesTable.viewTable(con);
            if (newPrice > maximumPrice) {
                System.out.printf("The new price, $%.2f, is greater " +
                                  "than the maximum price, $%.2f. " +
                                  "Rolling back the transaction...%n",
                                  newPrice, maximumPrice);
                con.rollback(save1);
                System.out.println("\nCOFFEES table after rollback:");
                CoffeesTable.viewTable(con);
            }
            con.commit();
        }
    } catch (SQLException e) {
        JDBCTutorialUtilities.printSQLException(e);
    } finally {
        con.setAutoCommit(true);
    }
}
```



## Releasing Savepoints

`Connection.releaseSavepoint` 方法接收一个 SavePoint 参数并将其从当前事务移除。

当特定的 savepoint 被移除后，如果继续通过 rollback 方法回退到该 savepoint，就会导致 SQLException。在事务中创建的任何 savepoint 都将自动释放，并在事务提交或整个事务回滚时失效。将事务回滚到某个 savepoint 后将自动释放并使在相关 savepoint 之后创建的任何其他 savepoint 无效。



## When to Call Method rollback

如前所述，调用 rollback 方法将终止事务并返回被修改为先前值的任何值，如果您试图在事务中执行一个或多个语句却导致了 SQLException，请调用方法rollback 以结束事务并重新启动事务。



# Using RowSet Objects

JDBC 的 RowSet 对象和 ResultSet 对象相比能够以一种更加灵活、简便的方式存储表格数据；

Oracle 根据使用场景定义了五种通用的 RowSet 接口并提供了标准引用。这些版本的 RowSet 接口及其实现为程序员提供了很多便利。开发者也可以根据需要扩展 `javax.sql.RowSet` 接口，也可以继承前面提到的五种 RowSet 实现，也可以重写它们。然而，许多程序员可能会发现标准参考实现已经满足了他们的需求，并将按原样使用它们。

本小节介绍 RowSet 接口以及以下接口：

- `JdbcRowSet` 接口；
- `CachedRowSet` 接口；
- `WebRowSet` 接口；
- `JoinRowSet` 接口；
- `FilteredRowSet` 接口；

涵盖以下主题：

- RowSet Objects 可以做什么；
- RowSet Objects 的种类；

## What Can RowSet Objects Do?

所有的 RowSet 对象都继承自 ResultSet 接口因此也具有它的各种功能，为什么 RowSet 更加特殊呢？因为它增加了以下新特性：

- [Function as JavaBeans Component](https://docs.oracle.com/javase/tutorial/jdbc/basics/rowset.html#javabeans)
- [Add Scrollability or Updatability](https://docs.oracle.com/javase/tutorial/jdbc/basics/rowset.html#scrollability)

## Function as JavaBeans Component

所有的 RowSet 都属于 JavaBeans 组件，这意味着它们有以下特性：

- 属性（Properties）；
- JavaBean Notification Mechanism；

关于 JavaBean 可以参考：https://docs.oracle.com/javase/tutorial/javabeans/

RowSet 既然可以使用 JavaBean 特性，那么一个 RowSet 对象可以有自身的属性，同时可以使用 JavaBean 的事件模型，这就意味着当某些事件发生时，就会通知到所有已经注册的组件。对于所有的 RowSet 对象而言，有三种事件触发通知机制：

- A cursor movement：游标移动事件；
- The update, insertion, or deletion of a row；某一行被更新、插入或者删除；
- A change to the entire RowSet content；整个 RowSet 发生了变化；

## Add Scrollability or Updatability

DBMS 对 Result Set 的 scroll 或 update 特性支持程度不同，但是 RowSet 对象默认就是 scrollable 和 updatable 的。



## Kinds of RowSet Objects

可以将 RowSet 对象分为两类：`connected` 或者 `disconnected`；

- `connected` RowSet 对象使用 JDBC driver  构建和底层数据库的 connection，在整个生命周期内都会保持连接；
- `disconnected` RowSet 对象则只有在需要从 ResultSet 对象中读取或回写数据到数据源时才会建立 connection。在读/写数据之后就不再维持这个 connection。

> Connected RowSet Objects

RowSet 接口的标准实现中只有一个是 connected RowSet Object： `JdbcRowSet`

JbdcRowSet 对象在其生命周期内会一直维持和数据源的连接，同时它也和 ResultSet 非常相似，可以看作是 ResultSet 的一个包装器，也就可以支持 scrollable 和 updatable 的 ResultSet 对象。

同时也可以将其当作 JavaBeans 组件。

> Disconnected RowSet Objects

RowSet 接口其他四种标准实现都是 disconnected 的。它们具有 connected RowSet 的所有功能，同时追加了断开 connection 的能力。注意 disconnected RowSet 对象相比 connected RowSet 对象要轻量一些，因为它们不用一直维护和数据源的 connection。disconnected RowSet 对象也是可以被序列化的，可串行化和轻量级的结合使得它们非常适合通过网络发送数据。

其中 `CachedRowSet` 定义了所有 disconnected RowSet 对象的基础功能，其他三个接口在此基础上进行扩展，它们提供了更专业的功能，下面展示它们相关的信息：

（1）CachedRowSet

CachedRowSet 对象具备 JdbcRowSet 的所有功能，同时提供了以下特殊功能：

- 获取和数据源的 connection 并可以执行 query；
- 从 ResultSet 对象中读取数据，然后用该数据填充自身；
- 在数据断开连接时操作数据并对其进行更改；
- 重新连接数据源以将更改写回该数据源；
- 检查与数据源的冲突并解决这些冲突；

（2）WebRowSet

WebRowSet 拥有所有 CachedRowSet 的功能，同时添加了以下增强特性：

- 将数据写入到 XML 文档中；
- 从 XML 文档中读取信息构造 WebRowSet 对象；

（3）JoinRowSet

JoinRowSet 对象拥有所有 WebRowSet 的功能，同时添加了以下增强特性：

- 无需连接到数据源即可形成相当于 SQL JOIN 的语句；

（4）FilteredRowSet

FilteredRowSet 对象同样拥有 WebRowSet 的所有功能（CachedRowSet），并且提供了以下增强特性：

- 可以对数据按照特定规则过滤，只展示被选中的数据，这相当于在 RowSet 对象上执行查询，而不必使用查询语言或连接到数据源。

# 参考

https://docs.oracle.com/javase/tutorial/jdbc/basics/cachedrowset.html



# Procedure

https://docs.oracle.com/javase/tutorial/jdbc/basics/storedprocedures.html





# 补充：事件模型

RowSet 可以看作 JavaBean，Java 的 JavaBean 模块提出了一种事件模型：

- `java.util.EventListener`
- `java.util.EventObject`

下面是一次尝试使用事件模型的案例，考虑这样的场景，某个上下文具备状态，包括初始状态、正在初始化、初始化完成、准备就绪，这几类状态，同时提供对应的事件监听者：

接口：

```java
public interface MyEventListener {

    /**
     * 判断能否处理特定的事件
     * @param event
     * @return
     */
    boolean support(MyEventObject event);

    /**
     * 处理特定的事件
     * @param event
     */
    void handleEvent(MyEventObject event);
    
}
```

事件对象模型：

```java
public class MyEventObject {
    
    private Object source;

    public MyEventObject(Object source) {
        if (source == null)
            throw new IllegalArgumentException("event source must not be null.");
        this.source = source;
    }
    
    public static MyEventObject of(Object source) {
        if (source == null)
            throw new IllegalArgumentException("event source must not be null.");
        return new MyEventObject(source);
    }

    public Object getSource() {
        return source;
    }

    public void setSource(Object source) {
        this.source = source;
    }

    @Override
    public String toString() {
        return String.format("Event source: %s", this.source);
    }

}
```

上下文模型：

```java
public class MyContextEntity {

    /**
     * 初始状态
     */
    public static final int INITIAL_STATE = 0;

    /**
     * 正在初始化
     */
    public static final int INITIALIZING_STATE = 1;

    /**
     * 初始化完毕
     */
    public static final int INITIALIZED_STATE = 2;

    /**
     * 准备就绪
     */
    public static final int READY_STATE = 3;

    /**
     * 上下文状态, 默认是初始状态
     */
    private volatile int state = INITIAL_STATE;

    /**
     * 当前上下文注册的所有监听者
     */
    private List<MyEventListener> eventListeners = new ArrayList<>();

    public MyContextEntity() {
    }
    
    public void start() {
        this.state = INITIALIZING_STATE;
        this.publishEvent(MyEventObject.of(this.state));

        this.state = INITIALIZED_STATE;
        this.publishEvent(MyEventObject.of(this.state));

        this.state = READY_STATE;
        this.publishEvent(MyEventObject.of(this.state));
    }
    
    /**
     * 注入监听者对象, 每个监听者针对特定的状态
     * @param eventListener
     */
    public void registerEventListener(MyEventListener eventListener) {
        if (eventListener == null)
            throw new IllegalArgumentException("event listener must not be null.");
        this.eventListeners.add(eventListener);
    }

    /**
     * 将上下文中发生的事件发布给监听者
     * @param event
     */
    private void publishEvent(MyEventObject event) {
        this.eventListeners.forEach(listener -> {
            if (listener.support(event)) {
                listener.handleEvent(event);
            }
        });
    }
}
```

上下文状态监听者实现：

```java
public class ContextStateChangeListener implements MyEventListener {

    /**
     * 当前监听者关注的事件源
     */
    private Integer eventSource;

    public ContextStateChangeListener(Integer eventSource) {
        if (eventSource == null)
            throw new IllegalArgumentException("The event source that the listener is listening for cannot be null");
        this.eventSource = eventSource;
    }
    
    public static MyEventListener of(Integer eventSource) {
        return new ContextStateChangeListener(eventSource);
    }

    @Override
    public boolean support(MyEventObject event) {
        Object targetSource = event.getSource();
        if (this.eventSource == targetSource)
            return true;
        return this.eventSource.equals(targetSource);
    }

    @Override
    public void handleEvent(MyEventObject event) {
        System.out.printf("ContextStateChangeListener accept and handle event: [%s]%n", event);
    }
    
}
```



测试工具：

```java
public static void main(String[] args) {
    // 测试
    // 准备所有的 listener
    MyEventListener contextInitializingListener = ContextStateChangeListener.of(INITIALIZING_STATE);
    MyEventListener contextInitializedListener = ContextStateChangeListener.of(INITIALIZED_STATE);
    MyEventListener contextReadListener = ContextStateChangeListener.of(READY_STATE);

    // 准备上下文
    MyContextEntity context = new MyContextEntity();
    // 注册监听者
    context.registerEventListener(contextInitializingListener);
    context.registerEventListener(contextInitializedListener);
    context.registerEventListener(contextReadListener);

    // 启动上下文
    context.start();
}
```

控制台输出：

```
ContextStateChangeListener accept and handle event: [Event source: 1]
ContextStateChangeListener accept and handle event: [Event source: 2]
ContextStateChangeListener accept and handle event: [Event source: 3]
```

