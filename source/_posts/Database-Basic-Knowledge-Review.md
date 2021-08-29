---
title: Database Basic Knowledge Review
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/medias/featureimages/14.jpg'
coverImg: /medias/featureimages/14.jpg
toc: true
date: 2021-08-29 22:55:28
top: true
cover: false
summary: 回顾数据库的基础知识
categories: Database
keywords: Database
tags: Database
---



## 一、数据库概念

### 1、基本概念

数据库：DataBase 简称 DB

概念：用于存储和管理数据的仓库



### 2、特点

- 持久化的存储数据。数据库本质是一个文件系统
- 方便存储和管理数据
- 使用了统一的方式操作数据库 --- SQL





### 3、常用的数据库软件

- MySQL：开源免费的数据库，小型的数据库

- Oracle ：收费的大型数据库，Oracle 公司产品
- DB2 ：IBM 公司的收费数据库产品，常用于银行系统
- SQLServer ：Microsoft 公司收费的中型数据库，C#、.net 等语言常用
- SyBass ：现在已经不用了，但是它提供了一个非常专业的数据建模的工具：PowerDesigner
- SQLite：嵌入式的小型数据库，常用于手机端
- 常用数据库：MySQL、Oracle



web 应用中，使用最多的是 MySQL 数据库，原因如下：

- 开源、免费
- 功能足够强大，足以应付 web 开发（最高支持千万级别的并发访问）



## 二、SQL

### 1、简介

什么是 SQL ？

- `Structured Query Language`：结构化查询语言
  - 其实就是定义了操作所有关系型数据库的规则。每一种数据库操作的方式存在不一样的地方，称为 "方言"



### 2、SQL 通用用法

- SQL 语句可以单行或多行书写，以分号结尾
- 可使用缩进和空格来增强语句的可读性
- MySQL 数据库的 SQL 语句不区分大小写，关键字建议使用大写
- 3 种注释：
  1. 单行注释：`-- 注释内容` 或 `# 注释内容`
  2. 多行注释：`/* 注释内容 */`



### 3、SQL 分类

按照功能不同分为 4 类：

- `DDL (Data Definition Language)` 数据定义语言
  - 用来定义数据库对象：数据库、表、列等等。关键字：create、drop、alter 等等
- `DML (Data Manipulation Language)` 数据操作语言
  - 用来对数据库中的表的数据进行增删改。关键字：insert、delete、update 等等
- `DQL (Data Query Language)` 数据查询语言
  - 用来查询数据库中表的记录（数据）。关键字：select、where 等等
- `DCL (Data Control Language)` 数据控制语言（了解）
  - 用来定义数据库的访问权限和安全级别，及创建用户。关键字：GRANT、REVOKE 等等



### 4、DDL 操作数据库、表

> 操作数据库：CRUD

- C（Create）：创建
  - 创建数据库：`create database 数据库名称;`
  - 创建数据库时判断是否已经存在：`create database if not exists 数据库名称;`
- R（Retrieve）：查询
  - 查询所有数据库名称：`show databases;`
  - 查询某个数据库的字符集（数据库的创建语句）：`show create database 数据库名称;`
- U（Update）：修改
  - 修改数据库字符集：`alter database 数据库名称 character set 字符集名称;`
- D（Delete）：删除
  - 删除数据库：`drop database 数据库名称;`
  - 判断数据库存在然后再删除：`drop database if exists 数据库名称;`
- 使用数据库：
  - 查询当前正在使用的数据库名称：`select database();`
  - 使用数据库：`use 数据库名称`



> 操作表

- C（Create）：创建

  - `create table 表名(列名1 数据类型1, 列名2 数据类型2 ... 列名n 数据类型n);`
  - 复制表：`create table 表名 like 被复制的表名`

  - 注意：最后一个列必须要加逗号
  - 数据类型：
    - int：整数类型
    - double：小数类型
    - date：日期，只包含年月日 yyyy-MM-dd
    - datetime：日期，包含年月日时分秒 yyyy-MM-dd HH:mm:ss
    - timestamp：时间戳 包含年月日时分秒 yyyy-MM-dd HH:mm:ss 如果不给这个字段赋值，或赋值为 null，则默认使用当前的系统时间，来自动赋值
    - varchar：字符串
      - name varchar(20)：姓名最大 20 个字符

- R（Retrieve）：查询

  - 查询某个数据库中所有表：`show tables;`
  - 查看表结构：`desc 表名;`

- U（Update）：修改

  - 修改表名：`alter table 旧表名 rename to 新表名;`
  - 修改表的字符集：`alter table 表名 character set 字符集名称;`
  - 添加一列：`alter table 表名 add 列名 数据类型;`
  - 修改列名称、类型：
    - 改名称：`alter table 表名 change 旧列名 新列名 新数据类型;`
    - 改 类型：`alter table 表名 modify 列名 新数据类型; `
  - 删除列：`alter table 表名 drop 列名;`

- D（Delete）：删除

  - `drop table 表名;`
  - `drop table if exists 表名;`



### 5、DML 增删改表中数据

- 添加数据
  - 注意：除了数据类型，其他类型都需要使用引号（单、双都可以）引起来
- 删除数据
  - 注意：删除表的方式
    - `delete from 表名`：没有条件，则删除表中所有记录，效率太低，一条一条的删除记录，**不推荐使用**
    - `truncate table 表名`：删除表，然后再创建一个一模一样的空表，**推荐使用**，效率更高

- 修改数据



### 6、DQL 查询表中记录



> （1）语法

- select
  - 字段列表
- from
  - 表名列表
- where
  - 条件列表
- group by
  - 分组字段
- having
  - 分组之后的条件
- order by
  - 排序
- limit
  - 分页限定



> （2）基础查询

- 多字段查询
  - `select 字段1, 字段2, ... 字段n from 表名;`
- 去除重复结果
  - `select distinct 字段列表 from 表名;`
- 计算列：null 字段参于计算，结果都为 null
  - 可以使用函数判断是否为 null，然后替换为其他数字：`IFNULL(字段名, 替换的数字)`，比如：IFNULL('course_score', 0);
- 起别名
  - as，as 可以省略





> （3）条件查询

- where 子句后面跟条件
- 运算符
  - \>、\<、\<=、\>=、\=、\<>
  - BETWEEN ... AND
  - IN （集合）
  - LIKE
    - 模糊查询可借助常用正则表达式：锁定一位字符 `_`，匹配多位字符 `%`
  - IS NULL
  - and 或 &&
  - or 或 ||
  - not 或 ！



> （4）排序查询

排序查询：

- 语法：`order  by 子句`
  - `order by 排序字段 排序方式`
  - 排序方式，升序（默认）：**ASC**    降序：**DESC**
  - 如果有多个排序条件，则当前面的条件值一样时，才会判断第二条件



> （5）聚合函数

聚合函数：将一列数据作为一个整体，进行纵向的计算

- count：计算个数
  - 一般选择非空的列：主键
- max：计算最大值
- min：计算最小值
- sum：求和
- avg：计算平均值



> （6）分组查询

- 语法：`group by 分组字段`
- 注意：
  - 分组之后查询的字段：分组字段、聚合函数
  - **where 和 having 的区别？**
    - where 在分组之前进行限定，如果不满足条件，则不参与分组
    - having 在分组之后进行限定，如果不满足条件，就不会被查询出来
    - where 后不可以跟聚合函数，而 having 可以进行聚合函数的判断



> （7）分页查询

- 语法：`limit 开始的索引，每页查询的条数`;
- 例如：每页显示 3 条记录
  - 第一页：`limit 0 3;`
  - 第二页：`limit 3 3;`
  - ...
  - 公式：开始的索引 = （当前的页码 - 1）* 每一页显示的条数
- limit 是一个 MySQL 的 "方言"



## 三、约束

### 1、概念

约束：对表中的数据进行限定，保证数据的正确性、有效性和完整性



### 2、分类

- 主键约束：`primary key`
- 非空约束：`not null`
- 唯一约束：`unique`
- 外键约束：`foreign key`



### 3、简介

> 非空约束

- not null：值不能为 null
  - 创建表时添加约束：`create table 表名(name varchar(20) NOT NULL);`
  - 创建表之后删除非空约束：`alter table 表名 midify name varchar(20)`;
  - 创建表之后添加非空约束：`alter table 表名 midify name varchar(20) NOT NULL`;





> 唯一约束

- unique，值不能重复
  - 同上



> 主键约束

- primary key
  - 含义：非空且唯一
  - 一张表只能有一个字段为主键
  - 主键就是表中记录的唯一标识
- 创建表时添加`create table 表名(id INT PRIMARY KEY);`
- 创建完表后添加和删除主键约束同上

- 自动增长：
  - 概念：如果某一列是数值类型，使用 `auto_increment` 可以完成值的自动增长
  - 例如：创建表指定字段为主键且自增：`create table 表名(id int primary key auto_increment);`
  - 创建表之后添加或删除自动增长同上



> 外键约束

- foreign key
- 创建表时添加外键

```sql
create table 表名(
		....
  	外键列
  	constraint 外键名称 foreign key 外键列名称 references 主表名称(主表列名称)
);
```

比如 员工表 和 部门表之间的关联：一个员工属于一个部门:

```sql
create table employee {
		# 员工 id
		id int primary key,
		name varchar(20),
		...
		# 外键
		dep_id int CONSTRAINT emp_dept_fk FOREIGN KEY (dep_id) REFERENCES department(id)
}
```

- 创建表后删除外键
  - `alter table 表名 drop foreign key 外键名`
- 创建表后添加外键
  - `alter table 表名 add constraint 外键名 foreign key 外键列名 references 主表名称(主表列名称)`



- 外键级联操作：
  - 需要在添加外键的时候设置级联更新

```sql
create table employee {
		# 员工 id
		id int primary key,
		name varchar(20),
		...
		# 外键
		dep_id int CONSTRAINT emp_dept_fk FOREIGN KEY (dep_id) REFERENCES department(id) ON UPDATE CASCADE
}
```



- 创建表后设置级联更新，级联删除：
  - 级联更新：`alter table 表名 add constraint 外键名 foreign key 外键列名 references 主表名称(主表列名称) on update cascade`
  - 级联删除：`alter table 表名 add constraint 外键名 foreign key 外键列名 references 主表名称(主表列名称) on delete cascade`



## 四、数据库设计

### 1、多表关系

- 一对一
  - 一对一实现，可以在任意一方添加外键指向另一方的主键
- 一对多
  - 在多的一方建立外键，指向一的一方的主键
- 多对多
  - 多对多关系实现需要借助第三张中间表
  - 中间表至少包含两个字段，这两个字段作为第三张表的外键，分别指向两张表的主键（联合主键）



### 2、设计的范式

概念：设计数据库时，需要遵守一些规范

设计关系型数据库时，遵从不同的规范要求，设计出合理的关系型数据库，这些不同的规范要求被称为不同的范式，各种范式呈递次规范，越高的范式数据库冗余就越小。



注：要遵循后面的范式，必须先遵循前面的范式

目前关系型数据库有六种范式：

- 第一范式（1NF）
- 第二范式（2NF）
- 第三范式（3NF）
- 巴斯-科德范式（BCNF）
- 第四范式（4NF）
- 第五范式（5NF，又称为完美范式）



> 分类

1. 第一范式（1NF）：每一列都是不可分割的原子数据项
2. 第二范式（2NF）：在 1NF 的基础上，非码属性必须完全依赖于候选码（主码也称为候选码）（在 1NF 基础上消除非主属性对主码的部分函数依赖）
   - 几个概念：
   - 函数依赖：A --> B，如果通过 A 属性（属性组）的值，可以确定 B 属性的值，则称 B 依赖于 A
     - 如学号被姓名所依赖 学号 --> 姓名 ，（学号，课程）--> 分数
   - 完全函数依赖：A --> B，如果 A 是一个属性组，则 B 属性值的确定需要 A 属性组中所有的属性值
     - 例如：（学号，课程）--> 分数
   - 部分函数依赖：A --> B，如果 A 是一个属性组，则 B 属性值的确定只需要依赖于 A 属性组中某一些属性的值
     - 例如：（学号，课程名称）--> 姓名
   - 传递函数依赖：A --> B，B --> C，如果通过 A 属性（属性组）的值，可以确定唯一 B 属性的值，在通过 B 属性（属性组）的值可以确定唯一 C 属性的值，则称 C 传递函数依赖于 A
     - 例如：学号 --> 系名，系名  -->  系主任
   - 码：如果在一张表中，一个属性或属性组，被其他所有属性所完全依赖，则称这个属性（属性组）为该表的码
     - 主属性：码属性组中的所有属性
     - 非主属性：除了主属性的其他属性
3. 第三范式（3NF）：在 2NF 基础上，任何非主属性不依赖于其他非主属性（在 2NF 基础上消除传递依赖）



## 五、数据库的备份和还原

- 命令行：
  - 语法：
    - 备份：`mysqldump -u用户名 -p密码 > 保存的路径`  最后会生成一个备份文件
    - 还原：
      1. 登录数据库
      2. 创建数据库：要求数据库名字和刚刚备份的数据库名字一样
      3. 使用数据库
      4. 执行文件。`source 文件路径`
- 图形化工具：





## 六、多表查询

查询语法：

- select
  - 列名列表
- from
  - 表名列表
- where



比如：

```sql
select * from employee, department;
```

这样查询出来的结果是两张表记录数相乘 **A * B**，也称为笛卡尔积



如果我们想要对结果进行过滤，消除错误、冗余数据，就需要使用以下这些多表联查：

- 内连接查询
  - 隐式内连接：使用 where 条件消除无用数据
  - 显式内连接：使用 inner join on

隐式：

```sql
select e.name, d.name
from employee as e,    -- 员工表 
		 department as d   -- 部门表
where e.dept_id = d.id
```

显式：

```sql
select e.name, d.name
from employee as e
inner join department as d
on e.dept_id = d.id
```



- 外连接查询
  - 左外连接：
    - 语法 `select 字段列表 from 表1 left [outer] join 表2 on 条件;`
    - 查询左表所有数据以及左表与右表的交集部分
  - 右外连接
    - 语法 `select 字段列表 from 表1 right [outer] join 表2 on 条件;`
    - 查询右表所有数据以及左表与右表的交集部分
- 子查询（可以使用自联结替代）
  - 查询中嵌套查询
  - 子查询不同情况
    - 子查询结果是单行单列的
      - 子查询可以作为条件，使用运算符去判断，\>、\>=、\<、\<=、\=
    - 子查询结果是多行单列的
      - 子查询可以作为条件，使用运算符 in 来判断
    - 子查询结果是多行多列的
      - 子查询可以作为一张虚拟表，参于多表连接查询





## 七、事务

### 1、事务的基本概念

事务的基本概念：

- 如果一个包含多个步骤的业务操作，被事务托管，那么这些操作要么同时成功，要么同时失败。

操作：

1. 开启事务：start transaction;
2. 提交：commit；
3. 回滚：rollback；



经典的场景就是转账问题

例如：张三和李四账户上都各有 1000 块，张三给李四转 500，最后张三剩 500，李四有 1500

```sql
-- 0. 开启事务
start transaction;

-- 1. 判断账户余额是否足够
select 1 from account where name = '张三' and balance > 500;
-- 2. 张三 -500
update account set balance = balance - 500 where name = '张三';
-- 3. 李四 +500
update account set balance = balance + 500 where name = '李四';

-- 下面两个操纵需要我们二选一
-- 没有问题就提交
commit;

-- 出现问题就回滚
rollback;
```

<strong style="color:red">注：在 MySQL 中事务默认自动提交</strong>

- 事务提交的两种方式：
  - 自动提交
    - 一条 DML 语句，语句会自动提交一次事务
  - 手动提交：先开启事务，在提交事务
- 修改事务的默认提交方式
  - 查看事务的默认提交方式：`select @@autocommit;`
    - 1 代表自动提交
    - 0 代表手动提交
  - 修改默认提交方式：`set @@autocommit = 0;`



MySQL 数据库默认自动提交，Oracle 数据库默认手动提交



### 2、事务的四大特征

- 原子性：是不可分割的最小操作单位，要么同时成功，要么同时失败
- 持久性：当事务提交或回滚后，数据库会持久化的保存数据
- 隔离性：多个事务之间。相互独立。
- 一致性：事务操作前后数据总量不变



### 3、事务的隔离级别

概念：

- 多个事务之间隔离的，即相互独立的。但是如果多个事务操作同一批数据则会引发一些问题，设置不同的隔离级别就可以解决这些问题。



存在问题：

- 脏读：一个事务读取到另一个事务中没有提交的数据
- 不可重复读（虚读）：在同一个事务中两次读取到的数据不一样
- 幻读：一个事务操作（DML）数据表中所有记录，另一个事务添加了一条数据，则第一条事务查询不到自己的修改
- 注：幻读很难通过命令行界面去复现，前两个都可以复现



隔离级别：

- read uncommitted：读未提交
  - 产生的问题：脏读、不可重复读、幻读
- read committed：读已提交 （Oracle 默认）
  - 产生的问题：不可重复读、幻读
- repeatable read：可重复读 （MySQL 默认）
  - 产生的问题：幻读
- serializable：串行化
  - 可以解决所有问题
  - **串行化，其实就是锁定整张表，事务开启后锁定需要使用到的表，其他事务无法对这些表读或写。所以虽然安全，但是效率极低。**



- 注意：隔离级别从小到大，安全性越来越高，但是效率也越来越低，所以我们需要设置一个合适的隔离级别，既保证相对安全，又保证效率。





数据库设置隔离级别：

- 查询隔离级别：`select @@tx_isolation;`
- 设置隔离级别：`set global transaction isolation level 级别字符串;`





## 八、DCL 管理数据库

### 1、用户管理

DBA ：数据库管理员



DCL：管理用户、授权

MySQL 有一个系统数据库叫做 `mysql` ，其中有一张表 `user` 管理所有数据库用户。

- 管理用户
  - 添加用户：
    - `create user '用户名'@'主机名' identified by '密码';`
  - 删除用户
    - `drop user '用户名'@'主机名';`
  - 修改用户密码
    - `update user set password = PASSWORD('新密码') where user = '用户名';`
    - `set password for '用户名'@'主机名' = PASSWORD('新密码');`
    - 如果 root 用户密码忘记了：
      - cmd 执行 `net stop mysql` 停止 mysql 服务（需要管理员运行 cmd）
      - 使用无验证方式启动 mysql 服务：`mysqld --skip-grant-tables`，然后开启另一个 cmd 窗口，直接输入 `mysql` 登录服务器，然后修改密码，然后关闭两个 cmd
      - 使用任务管理器结束 mysql 服务
      - 最后再次启动服务，使用新密码登录
  - 查询用户：
    - `use mysql;`
    - `select * from user;`
    - 注意查询出的字段 **Host**
      - 通配符 %：表示用户可以在任何主机登录数据库（不限制 ip）
      - localhost：仅限本机登录



### 2、权限管理

- 查询权限
  - 查询某用户权限：`show grants for '用户名'@'主机名';`
- 授予权限
  - 授予权限
  - `grant 权限列表 on 数据库名.表名 to '用户名'@'主机名'`
- 撤销权限
  - 撤销权限
  - `revoke 权限列表 on 数据库名.表名 from '用户名'@'主机名'`

