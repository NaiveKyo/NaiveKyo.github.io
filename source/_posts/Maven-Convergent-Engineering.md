---
title: Maven Convergent Engineering
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210716083304.jpg'
coverImg: /img/20210716083304.jpg
toc: true
date: 2021-07-16 08:30:33
top: false
cover: false
summary: Maven 聚合工程搭建过程
categories: Maven
keywords: Maven
tags: Maven
---

## Maven 的依赖管理

Maven 项目，如果需要使用第三方的控件，都是通过依赖管理来完成的。这里用到的一个东西就是 pom.xml 文件，概念叫做项目对象模型（POM，Project Object Model），我们在 pom.xml 中定义了 Maven 项目的形式，所以，pom.xml 相当于是 Maven 项目的一个地图。就类似于 web.xml 文件用来描述三大 web 组件一样。



### 1、Maven 坐标

```xml
<dependencies>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.11</version>
    <scope>test</scope>
  </dependency>
</dependencies>
```

- dependencies

  在 dependencies 标签中，添加项目需要的 jar 所对应的 maven 坐标。

- dependency

  一个 dependency 标签表示一个坐标

- groupId

  团体、公司、组织机构等等的唯一标识。团体标识的约定是它以创建这个项目的组织名称的逆向域名（例如 org.javaboy）开头。一个 Maven 坐标必须要包含 groupId。一些典型的 groupId 如 apache 的 groupId 是 org.apache.

- artifactId

  artifactId 相当于在一个组织中项目的唯一标识符。

- version

  一个项目的版本。一个项目的话，可能会有多个版本。如果是正在开发的项目，我们可以给版本号加上一个 SNAPSHOT，表示这是一个快照版（新建项目的默认版本号就是快照版）

- scope

  表示依赖范围。

| 依赖范围 | 编译有效 | 测试有效 | 运行时有效 | 打包有效 |           例子            |
| :------: | :------: | :------: | :--------: | :------: | :-----------------------: |
| Compile  |    ✔     |    ✔     |     ✔      |    ✔     |        spring-core        |
|   test   |    ✘     |    ✔     |     ✘      |    ✘     |           Junit           |
| provided |    ✔     |    ✔     |     ✘      |    ✘     |        servlet-api        |
| runtime  |    ✘     |    ✔     |     ✔      |    ✔     |         JDBC 驱动         |
|  system  |    ✔     |    ✔     |     ✘      |    ✘     | 本地 maven 仓库之外的类库 |

我们添加了很多依赖，但是不同依赖的使用范围是不一样的。最典型的有两个，一个是数据库驱动，另一个是单元测试。

数据库驱动，在使用的过程中，我们自己写代码，写的是 JDBC 代码，只有在项目运行时，才需要执行 MySQL 驱动中的代码。所以，MySQL 驱动这个依赖在添加到项目中之后，可以设置它的 scope 为 runtime，编译的时候不生效。

单元测试，只在测试的时候生效，所以可以设置它的 scope 为 test，这样，当项目打包发布时，单元测试的依赖就不会跟着发布。



### 2、Maven 单继承问题

在 springboot 项目中会看到这样的 xml ：

```xml
<parent>
	<groupId>org.springframework.boot</groupId>
	<artifactId>spring-boot-starter-parent</artifactId>
	<version>1.3.3.RELEASE</version>
</parent>
```



继承一个父模块，然后再引入相应的依赖



但是，如果不想继承，或者想继承多个，该如何处理？

Maven 的继承和 Java 的继承一样，无法实现多继承，如果 10 个、2 0个甚至更多模块继承自同一个模块，那么按照我们之前的做法，这个父模块的 `dependencyManagement` 会包含大量的依赖。如果你想把这些依赖分类以更清晰的管理，那就不可能了，`import scope` 依赖能解决这个问题。你可以把`dependencyManagemen`放到单独的专门用来管理依赖的 pom 中，然后在需要使用依赖的模块中通过 `import scope` 依赖，就可以引入 `dependencyManagement` 。例如可以写这样一个用于依赖管理的 pom：

```xml
<project>
	<modelVersion>4.0.0</modelVersion>
	<groupId>com.test.sample</groupId>
	<artifactId>base-parent1</artifactId>
	<packaging>pom</packaging>
	<version>1.0.0-SNAPSHOT</version>
	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>junit</groupId>
				<artifactid>junit</artifactId>
				<version>4.8.2</version>
			</dependency>
			<dependency>
				<groupId>log4j</groupId>
				<artifactid>log4j</artifactId>
				<version>1.2.16</version>
			</dependency>
		</dependencies>
	</dependencyManagement>
</project>
```

接着在另一个管理依赖的模块中引入上面的 pom，可以这样：（这就是非继承的方式）

```xml
<dependencyManagement>
	<dependencies>
		<dependency>
			<groupId>com.test.sample</groupId>
			<artifactid>base-parent1</artifactId>
			<version>1.0.0-SNAPSHOT</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>
 
<dependency>
	<groupId>junit</groupId>
	<artifactid>junit</artifactId>
</dependency>
<dependency>
	<groupId>log4j</groupId>
	<artifactid>log4j</artifactId>
</dependency>
```



**注意：import scope只能用在dependencyManagement里面**



这样，父模块的pom就会非常干净，由专门的packaging为pom来管理依赖，也契合的面向对象设计中的单一职责原则。此外，我们还能够创建多个这样的依赖管理pom，以更细化的方式管理依赖。这种做法与面向对象设计中使用组合而非继承也有点相似的味道。



SpringBoot 也采用了这种方式去解决相关问题：

```xml
<dependencyManagement>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-dependencies</artifactId>
			<version>1.3.3.RELEASE</version>
			<type>pom</type>
			<scope>import</scope>
		</dependency>
	</dependencies>
</dependencyManagement>
 
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-web</artifactId>
	</dependency>
</dependencies>
```





### 3、依赖冲突

> 表现形式

通常发生了依赖冲突，可能会抛出如下异常：

- `java.lang.NoSuchMethodError`
- `java.lang.ClassNotFoundException`
- `java.lang.NoClassDefFoundError`

所以当出现上述异常但是项目编译却能通过的时候我们就要考虑是不是出现了依赖冲突。



> 产生原因

由于我们导入了多个包，有些包依赖其他的包，而且依赖的其他包名称相同但是版本不一样，这时候可能会发生冲突

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20210716091247.png)



如上图，A 看起来会依赖两个 E 包



> 解决方法

可以通过两个命令检查依赖项目中的依赖关系：

```bash
mvn -U dependency:tree -Dverbose
# 完整的依赖关系图，且会告诉你哪个包产生了冲突

mvn -U dependency:tree
# 项目中实际的依赖关系图。
```

但是当我我们用 `mvn -U dependency:tree`去检查包依赖关系时，发现依赖树中显示 A 项目只依赖了 E 的 1.1 版本，这是因为 Maven 自己的依赖处理规则：

- 多个依赖情况下，**遵循先声明先依赖（同深度场景下，先声明的先依赖，简单来说就是哪个依赖写在前面，哪个先依赖）**
- 或者是 **最短路径优先依赖的原则**，例如上面的，由于 E1.1 的依赖路径更短一些，所以 Maven 会帮我们去除 E1.2 的依赖，选择 E1.1 的版本。



解决方法：

> 方法一

强制去除 E1.1 版本依赖：

```xml
<dependency>
    <groupId>xxx.xxx</groupId>
    <artifactId>A</artifactId>
    <version>x.x.x</version>
    <exclusions>
        <exclusion>
            <groupId>xxx.xxx</groupId>
            <artifactId>E</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

它表示从 A 中排除 E1.1 依赖



> 方法二

在主工程的 pom 文件下指定想要的版本，根据 **最短路径优先依赖原则**，A 项目就会依赖我们定制的 E 依赖版本



## Maven 私服

TODO



## Maven 聚合工程

所谓的聚合工程，实际上也就是多模块项目。在一个比较大的互联网项目中，项目需要拆分成多个模块进行开发，比如订单模块、VIP 模块、支付模块、内容管理模块、CMS、CRM 等等。这种拆分方式，实际上更接近于微服务的思想。在一个模块中，还可以继续进行拆分，例如分成 dao、service、controller 等。





1. 首先创建一个 Maven 工程，该工程是父工程

2. 将父工程下的 src、test 等等都删掉

3. 在父工程的 pom.xml 中声明打包方式为 pom

   ```xml
   <packaging>pom</packaging>
   ```

4. 父工程 pom 内容如下：

```xml
<project>
  
  <packaging>pom</packaging>
  
  <!-- 指定 dependencyManagement 中依赖的版本 -->
	<properties>
		<java.version>1.8</java.version>
    <mysql.version>8.0.25</mysql.version>
	</properties>
	
	<!-- 管理各种依赖 -->
	<dependencyManagement>
		<dependencies>
      
    	<dependency>
				<groupId>mysql</groupId>
			 	<artifactId>mysql-connector-java</artifactId>
       	<version>${mysql.version}</version>
				<scope>runtime</scope>
			</dependency>
	
		</dependencies>					
	</dependencyManagement>
	
	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

