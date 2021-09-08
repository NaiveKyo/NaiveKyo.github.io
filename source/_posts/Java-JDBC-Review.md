---
title: Java JDBC Review
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210811105219.jpg'
coverImg: /img/20210811105219.jpg
toc: true
date: 2021-08-29 16:20:02
top: false
cover: false
summary: 回顾 Java JDBC 相关知识
categories: Java
keywords: [Java, JDBC]
tags: Java
---



## 一、JDBC

### 1、概念

- 概念：Java DataBase Connectivity 
  - Java 数据库连接，使用 Java 语言操作数据库
- JDBC 本质：官方定义的一套操作所有关系型数据库的规则，即接口。各个数据库厂商去实现这套接口提供数据库驱动的 jar 包。我们可以使用这套接口（JDBC）编程，但是真正执行的代码是驱动 jar 包中的实现类



### 2、简单测试

导入 jar 包：

```xml
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>5.1.49</version>
</dependency>
```

编写测试代码：该 Demo 并不规范，只是为了方便演示

```java
public class JDBCDemo1 {

    public static void main(String[] args) throws Exception {

        // 1. 注册驱动
        Class.forName("com.mysql.jdbc.Driver");

        // 2. 获取数据库连接对象
        Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/customer_db",
                "root",
                "123456"
        );

        // 3. 定义 sql 语句
        String sql = "insert into user(username, password) values('张三', '123456')";

        // 4. 执行 sql 语句(需要先获取执行对象)
        Statement stmt = conn.createStatement();

        // 5. 执行 sql
        boolean execute = stmt.execute(sql);

        // true if the first result is a ResultSet object;
        // false if it is an update count or there are no results
        if (!execute) {
            System.out.println("成功插入数据");
        }
    }
}
```



### 3、JDBC 各个类详解



#### （1）DriverManager

- `DriverManager`：驱动管理对象
  - 功能：
    1. 注册驱动：告诉程序该使用哪一个数据库驱动 jar 包
       - `static void registerDriver(Driver driver)`：注册给定的驱动
       - 代码中：`Class.forName("com.mysql.jdbc.Driver");` 这里要注意，为什么把这个类加载进内存中我们就可以使用它呢，**因为相关的执行代码在静态代码块中**
    2. 获取数据库连接：
       - `static Connection getConnection(String url, String user, String password)`
       - 语法：url：**jdbc:mysql://ip地址（域名）:端口号/数据库名称**，如果是本机 MySQL 服务器，且默认端口是 3306 则 url 可以简写为 **jdbc:mysql:/// 数据库名称**



Driver 类：

```java
    static {
        try {
            java.sql.DriverManager.registerDriver(new Driver());
        } catch (SQLException E) {
            throw new RuntimeException("Can't register driver!");
        }
    }
```



这里要注意一点，即使我们没有在程序中显式注册驱动，sql 语句还是可以正常执行，原因就在于这里：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210828114204.png)



MySQL 5 之后的驱动 jar 包中指定了默认加载的驱动：

```
com.mysql.jdbc.Driver
com.mysql.fabric.jdbc.FabricMySQLDriver
```





#### （2）Connection

- `Connection`：数据库连接对象
- 功能：
  1. 获取执行 sql 的对象
     - `Statement createStatement()`
     - `PreparedStatement preparedStatement(String sql)`
  2. 管理事务：
     - 开启事务：`void setAutoCommit(boolean autoCommit)`设置该参数为 false，即开启事务
     - 提交事务：`void commit()`
     - 回滚事务：`void rollback()`







#### （3）Statement

执行 **静态SQL** 的对象。

- `Statement`：执行 sql 的对象
- 执行 sql：
  1. `boolean execute(String sql)`：可以执行任意的 sql，了解即可，不常用
  2. `int executeUpdate(String sql)`：执行 **DML（insert、update、delete）、DDL（create、alter、drop等等）**语句，一般只需 DML
     - 返回值：int 类型，表示受影响的行数
  3. `ResultSet executeQuery(String sql)`：执行 **DQL（select）语句**







#### （4）ResultSet

- `ResultSet`： 结果集对象，封装查询结果
  - `next()`：游标向下移动一行
  - `getXxx()`：获取数据
    - Xxx 代表数据类型 如: `int getInt(int columnIndex)、String getString(int columnIndex)`
    - 参数：int columnIndex 代表列的编号，从 1 开始，如 getString(1)
    - 重载参数：String columnLabel 代表列的名称，如 getString("balance")
  - 使用步骤：
    1. 游标向下移动一行
    2. 判断是否有数据
    3. 获取数据





#### （5）PreparedStatement

执行 **预编译的 SQL** 的对象

- `PreparedStatement`：执行 sql 的对象
- SQL 注入问题：在拼接 Sql 时，有一些 sql 的关键字参与了字符串的拼接。会造成安全性问题
  - 例如用户输入用户名和密码：输入密码 a' or 'a' = 'a
  - `sql: select * from user where username = 'xxx' and password = 'a' or 'a' = 'a'`
  - 最终结果这条 sql where 后面的条件为 true，可以通过
- 解决 sql 注入问题：使用 PreparedStatement 对象执行 sql
- 预编译的 SQL：参数使用 ？作为占位符
  - 方法：setXxx(参数1，参数2...)
    - 参数1：？的位置编号，从 1 开始
    - 参数2：？的值

使用 PreparedStatement 的好处：

1. 防止 sql 注入
2. 效率更高



### 4、测试

该 demo 演示完整用法：

```java
public class JDBCDemo2 {

    public static void main(String[] args) {

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            // 1. 注册驱动
            Class.forName("com.mysql.jdbc.Driver");
            // 2. 获取连接对象
            conn = DriverManager.getConnection("jdbc:mysql:///customer_db", "root", "123456");
            // 3. 获取执行 sql 的对象
            String sql = "select * from user where username = ? and password = ?";
            pstmt = conn.prepareStatement(sql);
            pstmt.setString(1, "张三");
            pstmt.setString(2, "123456");
            // 4. 获取结果
            rs = pstmt.executeQuery();
            // 5. 打印结果
            while (rs.next()) {
                System.out.println(rs.getString("username"));
                System.out.println(rs.getString("password"));
            }
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (conn != null)
                    conn.close();
                if (pstmt != null)
                    pstmt.close();
                if (rs != null)
                    rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```



### 5、JDBC 控制事务

- 事务：一个包含多个步骤的业务操作。如果这个业务操作被事务管理，则这多个步骤要么同时成功，要么同时失败
- 操作：
  1. 开启事务
  2. 提交事务
  3. 回滚事务
- 使用 `Connection` 对象管理事务
  - 开启事务：`void setAutoCommit(boolean autoCommit)`设置该参数为 false，即开启事务
    - 在执行 sql 之前开启事务
  - 提交事务：`void commit()`
    - 当所有 sql 执行完后提交事务
  - 回滚事务：`void rollback()`
    - 在 catch 中回滚事务



```java
public class JDBCDemo3 {

    public static void main(String[] args) {

        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;

        try {
            // 1. 注册驱动
            Class.forName("com.mysql.jdbc.Driver");
            // 2. 获取连接对象
            conn = DriverManager.getConnection("jdbc:mysql:///customer_db", "root", "123456");
						// 3. 开启事务
          	conn.setAutoCommit(false);
          
          	// 4. 执行业务
          	// ......
          	// 5. 提交事务
          	conn.commit();
 
        } catch (Exception e) {
          	// 6. 回滚事务
          	conn.rollback();
            e.printStackTrace();
        } finally {
            try {
                if (conn != null)
                    conn.close();
                if (pstmt != null)
                    pstmt.close();
                if (rs != null)
                    rs.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```



## 二、连接池 及 Spring JDBC

### 1、数据库连接池

#### （1）概念

- 概念：其实就是一个容器（集合），存放数据库连接的容器
  - 当系统初始化完成的时候，容器被创建，容器中会申请一些连接对象，当用户来访问数据库时，从容器中获取连接对象，用户访问完后，将连接对象归还给容器
- 好处：
  1. 节约系统资源
  2. 用户访问高效



#### （2）实现

连接池技术其实是 sun 公司提出的一套规范（接口），在 Java 中即 ：

- `public interface DataSource  extends CommonDataSource, Wrapper`



```java
public interface DataSource  extends CommonDataSource, Wrapper {

  /**
   * <p>Attempts to establish a connection with the data source that
   * this {@code DataSource} object represents.
   *
   * @return  a connection to the data source
   * @exception SQLException if a database access error occurs
   * @throws java.sql.SQLTimeoutException  when the driver has determined that the
   * timeout value specified by the {@code setLoginTimeout} method
   * has been exceeded and has at least tried to cancel the
   * current database connection attempt
   */
  Connection getConnection() throws SQLException;

  /**
   * <p>Attempts to establish a connection with the data source that
   * this {@code DataSource} object represents.
   *
   * @param username the database user on whose behalf the connection is
   *  being made
   * @param password the user's password
   * @return  a connection to the data source
   * @exception SQLException if a database access error occurs
   * @throws java.sql.SQLTimeoutException  when the driver has determined that the
   * timeout value specified by the {@code setLoginTimeout} method
   * has been exceeded and has at least tried to cancel the
   * current database connection attempt
   * @since 1.4
   */
  Connection getConnection(String username, String password)
    throws SQLException;
}
```



具体的实现类应该由驱动程序供应商提供。有三种实现类型：

- 基本实现 —— 生成标准的 Connection 对象
- 连接池实现 —— 生成将自动参与连接池的 Connection 对象。此实现与中间层连接池管理器配合使用
- 分布式事务实现 —— 生成可用于分布式事务的 Connection 对象，并且几乎总是参与连接池。此实现与中间层事务管理器一起工作，并且几乎总是使用连接池管理器



> 标准接口

1. 标准接口：DataSource   javax.sql 包下
   - 方法
     -  获取连接：`getConnection()`
     - 归还连接：如果连接对象 Connection 是从连接池中获取的，那么调用 `Connection.close()` 方法就不会在关闭连接了，而是归还连接
2. 一般我们不去实现它，而是由数据库厂商来实现
   1. **C3P0**：数据库连接池技术，比较老的一个连接池
   2. **Druid**：数据库连接池技术，阿里巴巴提供，目前最好的连接池技术之一





#### （3）C3P0

使用步骤：

1、导入 jar 包

```xml
<dependency>
    <groupId>com.mchange</groupId>
    <artifactId>c3p0</artifactId>
    <version>0.9.5.5</version>
</dependency>
```

2、定义配置文件 `c3p0.properties` 或者 `c3p0-config.xml`

- 配置文件的名字必须为上面两个中的一个
- 配置文件的存放路径：普通 Java 项目放在 src 下就可以了，maven 项目放在 resource 下



3、创建核心对象：数据库连接池对象 `ComboPooledDataSource`

4、获取连接：`getConnection` 方法



c3p0-config.xml

```xml
<c3p0-config>
    <!-- 使用默认的配置 -->
    <default-config>
        <!-- 连接参数 -->
        <property name="driverClass">com.mysql.jdbc.Driver</property>
        <property name="jdbcUrl">jdbc:mysql://localhost:3306/customer_db</property>
        <property name="user">root</property>
        <property name="password">123456</property>

        <!-- 连接池参数 -->
        <property name="checkoutTimeout">30000</property>
        <property name="initialPoolSize">5</property>
        <property name="maxPoolSize">10</property>

        <!-- 适用于用户个人配置,比如给 test-user 这个用户做一些个人配置 -->
        <user-overrides user="test-user">
            <property name="maxPoolSize">10</property>
            <property name="minPoolSize">1</property>
            <property name="maxStatements">0</property>
        </user-overrides>
    </default-config>

    <!-- 下面都是自定义命名配置 -->
    <!-- This app is massive! -->
    <!--<named-config name="intergalactoApp">-->
    <!--    <property name="acquireIncrement">50</property>-->
    <!--    <property name="initialPoolSize">100</property>-->
    <!--    <property name="minPoolSize">50</property>-->
    <!--    <property name="maxPoolSize">1000</property>-->

    <!--    &lt;!&ndash; intergalactoApp adopts a different approach to configuring statement caching &ndash;&gt;-->
    <!--    <property name="maxStatements">0</property>-->
    <!--    <property name="maxStatementsPerConnection">5</property>-->

    <!--    &lt;!&ndash; he's important, but there's only one of him &ndash;&gt;-->
    <!--    <user-overrides user="master-of-the-universe">-->
    <!--        <property name="acquireIncrement">1</property>-->
    <!--        <property name="initialPoolSize">1</property>-->
    <!--        <property name="minPoolSize">1</property>-->
    <!--        <property name="maxPoolSize">5</property>-->
    <!--        <property name="maxStatementsPerConnection">50</property>-->
    <!--    </user-overrides>-->
    <!--</named-config>-->
</c3p0-config>
```



演示获取 Connection 的 demo：

```java
/**
 * 演示使用 C3P0
 */
public class C3p0Demo1 {

    public static void main(String[] args) {

        // 1. 创建数据库连接池对象 使用默认的配置 default-config
        // DataSource dataSource = new ComboPooledDataSource();
        // 指定配置名称 例如：intergalactoApp
        DataSource dataSource = new ComboPooledDataSource("intergalactoApp");

        Connection conn = null;

        try {
            // 2. 获取连接对象
            conn = dataSource.getConnection();
            // 3. 打印
            System.out.println(conn);
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```



#### （4）Druid

使用步骤：

1、导入 jar 包

```xml
<!-- druid 连接池 -->
<dependency>
  	<groupId>com.alibaba</groupId>
  	<artifactId>druid</artifactId>
  	<version>1.2.6</version>
</dependency>
```



2、定义配置文件

- 是 .properties 格式的文件
- 名字随意，可以放在任意目录下

[配置信息](https://github.com/alibaba/druid/wiki/DruidDataSource%E9%85%8D%E7%BD%AE%E5%B1%9E%E6%80%A7%E5%88%97%E8%A1%A8#%E5%A6%82%E6%9E%9C%E8%A1%A8%E6%A0%BC%E6%97%A0%E6%B3%95%E5%AE%8C%E5%85%A8%E5%B1%95%E7%A4%BA%E8%AF%B7%E6%9F%A5%E7%9C%8B%E5%9B%BE%E7%89%87)



一个简单的配置文件：

druid.properties

```properties
# 数据库连接信息
driverClassName = com.mysql.jdbc.Driver
url = jdbc:mysql://localhost:3306/customer_db
username = root
password = 123456

# 连接池属性
initialSize = 5
maxActive = 10
maxWait = 10000
```



3、加载配置文件

- 使用 `Properties`



4、获取数据库连接池对象

- 通过工厂类获取数据源：`DruidDataSourceFactory`
- Druid 提供的数据源的名称：`DruidDataSource`



5、获取连接

- 数据源 的 `getConnection` 方法



演示 Demo：

```java
/**
 * Druid 演示
 */
public class DruidDemo {

    public static void main(String[] args) throws Exception {

        // 1. 导入 jar 包
        // 2. 定义配置文件 druid.properties
        // 3. 加载配置文件
        InputStream ias = DruidDemo.class.getClassLoader().getResourceAsStream("druid.properties");
        Properties properties = new Properties();
        properties.load(ias);

        // 4. 获取连接池对象
        DataSource ds = DruidDataSourceFactory.createDataSource(properties);

        // 5. 获取连接对象
        Connection conn = ds.getConnection();
        System.out.println(conn);
    }
}
```



Druid 工具类：

```java
public class JDBCUtil {

    private static DataSource ds = null;

    static {
        try {
            Properties properties = new Properties();
            properties.load(JDBCUtil.class.getClassLoader().getResourceAsStream("druid.properties"));

            ds = DruidDataSourceFactory.createDataSource(properties);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private JDBCUtil() {
    }

    /**
     * 获取连接
     *
     * @return 连接对象
     * @throws SQLException sql异常
     */
    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }

    /**
     * 释放资源，主要用于 DML 语言
     * @param stmt 执行 sql 语句的对象
     * @param conn 连接对象
     */
    public static void close(Statement stmt, Connection conn) {
        close(stmt, conn, null);
    }

    /**
     * 释放资源，主要用于 DQL 语句
     * @param stmt 执行 sql 语句的对象
     * @param conn 连接对象
     * @param rs 结果集对象
     */
    public static void close(Statement stmt, Connection conn, ResultSet rs) {

        try {
            if (stmt != null)
                stmt.close();

            if (conn != null)
                conn.close();

            if (rs != null)
                rs.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * 获取数据源
     * @return 数据源
     */
    public static DataSource getDataSource() {
        return ds;
    }
}
```



### 2、Spring JDBC： JDBC Template

- Spring 框架对 JDBC 操作做了一个简单的封装。提供了一个 JDBCTemplate 对象简化 JDBC 开发



#### （1）使用步骤

步骤：

1、导入 jar 包

```xml
<!-- spring-webmvc -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.3.9</version>
</dependency>

<!-- spring jdbc -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>5.3.9</version>
</dependency>
```



2、创建 JdbcTemplate 对象。

需要依赖于数据源 DataSource



3、调用 JdbcTemplate 的方法来完成 CRUD 操作

- `update()` 执行 DML 语句
  - `queryForMap()` 查询结果并将结果集封装为 map 集合
    - 列名作为 key，将值作为 value，将这条记录封装为一个 map 集合
  - `queryForList()`  查询结果并将结果集封装为 list 集合
    - 每条记录封装为一个 map，再将 map 集合装载到 list 中
  - `query()` 查询结果并将结果集封装为 JavaBean 对象
    - query 的参数：`RowMapper`。这是一个接口，我们一般使用它的实现类，最常用的实现类是 `BeanPropertyRowMapper` 。可以完成数据到 JavaBean 的自动封装
  - `queryForObject()` 查询结果并将结果集封装为 对象
    - 一般用于聚合函数的查询



#### （2）演示 DML 语句

```java
import com.jdbc.JDBCUtil;
import org.springframework.jdbc.core.JdbcTemplate;

public class JdbcTemplateDemo1 {

    public static void main(String[] args) {

        // 1. 导入 jar 包
        // 2. 创建 JdbcTemplate 对象
        JdbcTemplate jdbcTemplate = new JdbcTemplate(JDBCUtil.getDataSource());

        // 3. 调用方法
        String sql = "update user set password = ? where id = ?";
        int update = jdbcTemplate.update(sql, "111111", 2);

        System.out.println("Effects rows : " + update);
    }
}
```



#### （3）演示 DQL 语句

```java
public class JdbcTemplateDemo1 {

    public static void main(String[] args) {

        // 1. 导入 jar 包
        // 2. 创建 JdbcTemplate 对象
        JdbcTemplate jdbcTemplate = new JdbcTemplate(JDBCUtil.getDataSource());

        // 3. 调用方法
        List<Map<String, Object>> maps = jdbcTemplate.queryForList("select * from user");

        maps.forEach(System.out::println);
    }
}
```



#### （4）query()

比较特殊的方法 `query()`;

```java
public class JdbcTemplateDemo1 {

    public static void main(String[] args) {

        JdbcTemplate jdbcTemplate = new JdbcTemplate(JDBCUtil.getDataSource());

        String sql = "select * from user";

        List<User> list = jdbcTemplate.query(sql, new RowMapper<User>() {
            @Override
            public User mapRow(ResultSet resultSet, int i) throws SQLException {
                User user = new User();
                user.setUsername(resultSet.getString("username"));
                user.setPassword(resultSet.getString("password"));
                return user;
            }
        });

        list.forEach(System.out::println);
    }
}

class User {

    private String username;
    private String password;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "User{" +
                "username='" + username + '\'' +
                ", password='" + password + '\'' +
                '}';
    }
}
```



#### （5）RowMapper

这里 Spring 提供给我们一个函数式接口 `RowMapper<T>`  用于解决数据库和实体类对象之间的映射关系，我们可以自定义映射，比如上面这种最简单的，也可以使用 Spring 提供的一些映射机制。



比如说常用的 `BeanPropertyRowMapper<T>`

```java
public static void main(String[] args) {

  	JdbcTemplate jdbcTemplate = new JdbcTemplate(JDBCUtil.getDataSource());

  	String sql = "select * from user";

  	List<User> query = jdbcTemplate.query(sql, new BeanPropertyRowMapper<User>(User.class));

  	query.forEach(System.out::println);
}
```



该类通过反射机制为我们做了许多处理。
