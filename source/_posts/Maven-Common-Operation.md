---
title: Maven Common Operation
author: NaiveKyo
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211006224435.jpg'
coverImg: /img/20211006224435.jpg
toc: true
date: 2021-11-12 20:23:04
top: false
cover: false
summary: Maven 常用操作
categories: Maven
keywords: Maven
tags: Maven
---

# Maven 常用操作



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211112204519.png)

## 一、Maven 与构建

### 1、概念

> 什么是 Maven

类似于 Linux 平台的 yum、apt、前端领域的 npm。

Maven 前身为 Ant，目前 Tomcat 的源码就是用 Ant 来构建和管理的，更先进的工具有 Gradle，Spring 工程在用。



> 什么是构建

何为构建：编译、运行单元测试、生成文档、打包、部署的过程，这就是构建。



### 2、构建的步骤

- 清理 clean：将以前编译得到的旧文件 class 字节码文件删除
- 编译 complie：将 Java 源程序编译为 class 字节码文件
- 测试 test：自动测试，自动调用 junit 程序
- 报告 report：测试程序执行的结果
- 打包 package：动态 Web 工程打 War 包，Java 工程打 jar 包
- 安装 install：将打包得到的文件复制到 "仓库" 中的指定位置（Maven 特定的概念）
- 部署 deploy：将动态 Web 工程生成的 war 包复制到 Servlet 容器下，使其可以运行



### 3、演示

> 项目骨架

```
根目录：工程名
|---src: 源代码
|---|---main: 主程序
|---|---|---java: 主程序代码路径
|---|---|---resource: 主程序配置文件路径
|---|---test: 测试
|---|---|---java: 测试代码路径
|---|---|---resource: 测试配置文件路径
|---pom.xml: maven 配置文件
```



> 简单演示

```bash
## 1. 使用 archetype 命令生成 maven 简单骨架
mvn archetype:generate -DarchetypeCatalog=internal

## 2. 编译当前生成的项目
mvn complie

## 3. 使用其他命令
mvn test-complie
mvn package
mvn clean
mvn install
mvn deploy 暂时不演示
```



## 二、坐标与依赖

### 1、坐标定义

> 什么是坐标

类比数学中的平面几何，坐标（x，y），任何一个坐标都能唯一标识该平面中的一个点。

该点对应到 maven 中就是 .jar、.war 等文件。



Maven 使用 `groupId`、`artifactId`、`version`、`packaging`、`classifier` 等元素来组成自己的坐标，并定义一组这样的规则，只要能提供正确的坐标元素，Maven 就可以找到对应的构件。 



> 坐标元素

- groupId：定义当前 Maven 项目隶属的实际项目
- artifactId：定义实际项目中的一个 Maven 项目（模块）
- packaging：定义 Maven 项目打包方式。jar、war、pom。默认为 jar
- version：定义 Maven 项目当前所处的版本
- classifier：区分从同一 artifact 构建的具有不同内容的构件



classifier 使用场景：

1、区分基于不同 JDK 版本的包

```xml
<dependency>
	<groupId>net.sj.json-lib</groupId>
    <artifactId>json-lib</artifactId>
    <version>2.2.2</version>
    <classifier>jdk13</classifier>
    <!--<classifier>jdk15</classifier>-->
</dependency>
```

2、区分项目的不同组成部分

```xml
<dependency>
	<groupId>net.sj.json-lib</groupId>
    <artifactId>json-lib</artifactId>
    <version>2.2.2</version>
    <classifier>jdk-javadoc</classifier>
    <!--<classifier>jdk15-sources</classifier>-->
</dependency>
```

构件名和坐标是对应的，一般规则是：`artifactId-version[-classifier].packaging`



### 2、依赖声明

```xml
<dependencies>
	<dependency>
    	<groupId></groupId>
        <artifactId></artifactId>
        <version></version>
        <type></type>
        <scope></scope>
        <optional></optional>
        <exclusions>
        	<exclusion>
            	<artifactId></artifactId>
                <groupId></groupId>
            </exclusion>
            ...
        </exclusions>
    </dependency>
    ...
</dependencies>
```

- gourpId、artifactId、version：依赖的基本坐标
- type：依赖的类型，对应项目对应的 packaging，一般不必声明
- scope：依赖的范围，后面详解
- optional：标记依赖是否可选
- exclusions：用来排除传递性依赖



### 3、依赖范围

- <mark>compile</mark>：编译依赖范围

如果没有指定，默认使用该依赖范围。对于编译、测试、运行三种 classpath 都有效。如：spring-core



- <mark>test</mark>：测试范围依赖

只对于测试 classpath 有效，只需要在编译测试及运行测试才需要，在打包的时候不会打进去。如：JUnit



- <mark>provided</mark>：已提供依赖范围

对于编译和测试 classpath 有效，但运行时无效。

如：servlet-api 编译和测试项目的时候都需要，但在实际运行中，容器已经提供，不需要 maven 重复的引用。



- <mark>runtime</mark>：运行时依赖范围

对于测试和运行的 classpath 有效，但在编译主代码时无效。

如：JDBC 驱动的实现包。只有在执行测试或者运行项目时，才需要具体的 JDBC 驱动。



- <mark>system</mark>：系统依赖范围

与 provided 依赖范围完全一致，但是使用该范围时必须通过 systemPath 元素显式地指定依赖文件的路径。由于此类依赖不是通过 maven 仓库解析的，而且往往与本机系统绑定，可能造成构建不可移植，因此应该谨慎使用。

systemPath 元素可以引用环境变量，如：

```xml
<dependencies>
	<dependency>
    	<groupId>javax.sql</groupId>
        <artifactId>jdbc-stdxt</artifactId>
        <version>2.0</version>
        <scope>system</scope>
        <optional>${java.home}/lib/rt.jar</optional>
    </dependency>

</dependencies>
```



- <mark>import</mark>：导入依赖范围

只在 dependencyManagement 标签中生效，导入已经定义好的 pom 文件中 dependencyManagement 节点内容：

```xml
<dependencyManagement>
	<dependencies>
    	<dependency>
        	<groupId>org.springframework</groupId>
            <artifactId>spring-framework-bom</artifactId>
            <version>4.3.16.RELEASE</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```



### 4、依赖机制与特性

#### (1) 依赖传递

- A -> B（complie）：第一直接依赖
- B -> C （complie）：第二直接依赖
- A -> C （complie）：传递性依赖



当在 A 中配置：

```xml
<dependency>
	<groupId>com.B</groupId>
    <artifactId>B</artifactId>
    <version>1.0</version>
</dependency>
```

则会自动导入 C 包。

> 传递性依赖的范围如下表所示：

| 直接依赖 \ 传递依赖 | complie  | test | provided | runtime  |
| :------------------ | -------- | ---- | -------- | -------- |
| complie             | complie  | -    | -        | runtime  |
| test                | test     | -    | -        | test     |
| provided            | provided | -    | provided | provided |
| runtime             | runtime  | -    | -        | runtime  |

#### (2) 依赖调解

当传递性依赖出现问题时，能够清楚地知道该传递性依赖是从哪条依赖路径中引入的。



一、路径最近者优先原则

- A -> B -> C -> X（1.0）
- A -> D -> X （2.0）



由于只能导入一个版本的包，按照最短路径选择导入 X（2.0）



二、第一声明者优先原则

- A -> B -> Y（1.0）
- A -> C -> Y（2.0）



此时由于依赖路径长度一致，按照第一声明者优先原则。在路径长度一致的前提下，如果 B 依赖在 POM 文件中声明顺序在 C 依赖之前，那么 Y（1.0）则会被引入。

如下依赖可用于测试：

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.httpcomponents</groupId>
        <artifactId>httpclient</artifactId>
        <version>4.4.1</version>
        <exclusions>
            <exclusion>
                <groupId>commons-codec</groupId>
                <artifactId>commons-codec</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi</artifactId>
        <version>3.9</version>
        <exclusions>
            <exclusion>
                <groupId>commons-codec</groupId>
                <artifactId>commons-codec</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <dependency>
        <groupId>commons-codec</groupId>
        <artifactId>commons-codec</artifactId>
        <version>1.10</version>
    </dependency>
</dependencies>
```

这里有一点需要注意，看如下依赖：

```xml
<dependencies>
	<dependency>
    	<groupId>commons-codec</groupId>
    	<artifactId>commons-codec</artifactId>
    	<version>1.11</version>
	</dependency>

    <dependency>
        <groupId>commons-codec</groupId>
        <artifactId>commons-codec</artifactId>
        <version>1.10</version>
    </dependency>
</dependencies>
```

按照两原则，期望得到的结果应该是 1.11 版本的构建将被依赖。但实际结果却依赖了 1.10 版本。



其实这个是 dependency 插件的功能，默认采用的是复写的策略，当构建声明处于同一 pom 中，且 groupId 和 artifactId 一致时，以最新声明为准，后面的覆盖前面的。



注意这里没涉及到依赖调解的功能。我的理解是依赖调解只发生于构建来自不同 pom 时，而此时构建声明处于同一 pom，故不会触发依赖调解。

#### (3) 可选依赖

A -> B、B ->X（可选）、B -> Y（可选）。



项目 A 依赖于项目 B，项目 B 依赖于项目 X 和 Y。



理论上项目 A 中，会把 B、X、Y 项目都依赖进来。



但是 X、Y 两个依赖对于 B 来讲可能是互斥的，如 B 是数据库隔离包，支持多种数据库 MySQL、Oracle，在构建 B 项目时，需要这两种数据库的支持，但在使用这个工具包时，只会依赖一个数据库。

此时就需要在 B 项目 pom 文件中将 X、Y 声明为可选依赖，如下：

```xml
<dependency>
    <groupId>com.X</groupId>
    <artifactId>X</artifactId>
    <version>1.0</version>
    <optionnal>true</optionnal>
</dependency>

<dependency>
    <groupId>com.Y</groupId>
    <artifactId>Y</artifactId>
    <version>1.0</version>
    <optionnal>true</optionnal>
</dependency>
```

使用 optionnal 元素标识以后，只会对当前项目 B 产生影响，当其他的项目依赖 B 项目时，这两个依赖都不会被传递。

项目 A 依赖于项目 B，如果实际应用数据库是 X， 则在 A 的 pom 中就需要显式地声明 X 依赖。

## 三、仓库

仓库分类：包括本地仓库和远程仓库。

其中远程仓库包括：私服和中央仓库。

搜索构建的顺序：

- 本地仓库
- maven settings profile 中的 repository；
- pom.xml 中 profile 中定义的 repository；
- pom.xml 中 repositorys (按定义顺序找)；
- maven settings mirror；
- central 中央仓库；



## 四、生命周期与插件

### 1、生命周期

#### (1) 定义

Maven 的生命周期是为了对所有构建过程进行的抽象和统一，其中包含项目的清理、初始化、编译、测试、打包、集成测试、验证、部署和站点生成等几乎所有的构建步骤。

Maven 的生命周期是抽象的，本身是不做任何实际的工作。实际的任务都交给插件来完成。

意味着 Maven 只在父类中定义了算法的整体结构，子类通过重写父类的方法，来控制实际行为（设计模式中的模板方法 `Template Method`）。伪代码如下：

```java
public abstract class AbstractBuilder {
    public void build() {
        init();
        compile();
        test();
        package();
        integrationTest();
        deploy();
    }
    
    protected abstract void init();
    protected abstract void compile();
    protected abstract void test();
    protected abstract void package();
    protected abstract void integrationTest();
    protected abstract void deploy();
}
```



#### (2) 三套生命周期

Maven 的生命周期并不是一个整体，Maven 拥有三套相互独立的生命周期，它们分别为 clean、default 和 site。



- clean 生命周期的目的是清理项目；
- default 生命周期的目的是构建项目；
- site 生命周期的目的是建立项目站点；



> 单个生命周期执行顺序

每个生命周期包含一些阶段(phase)，这些阶段是有顺序的，并且后面的阶段依赖于前面的阶段。



以 clean 生命周期为例，它包含的阶段有 pre-clean、clean 和 post-clean。当调用 pre-clean 时，只有 pre-clean 阶段得以执行；



当调用 clean 的时候，pre-clean 和 clean 阶段会得以顺序执行，以此类推。



> 各个生命周期之间的关系

三套生命周期本身是相互独立的，用户可以仅调用 clean 生命周期的某个阶段，或者仅仅调用 default 生命周期的某个阶段，而不会对其他生命周期产生任何影响。



例如，当用户调用 clean 生命周期的 clean 阶段的时候，不会触发 default 生命周期的任何阶段，反之亦然。



> 生命周期各个阶段详解



**clean**



| 生命周期阶段 | 描述                           |
| ------------ | ------------------------------ |
| pre-clean    | 执行一些清理前需要完成的工作。 |
| clean        | 清理上一次构建生成的文件。     |
| post-clean   | 执行一些清理后需要完成的工作。 |



**default**



包含 23 个阶段，此处只介绍重点步骤，如下表：



| 生命周期阶段          | 描述                                                         |
| :-------------------- | :----------------------------------------------------------- |
| validate              | 检查工程配置是否正确，完成构建过程的所有必要信息是否能够获取到。 |
| initialize            | 初始化构建状态，例如设置属性。                               |
| generate-sources      |                                                              |
| process-sources       | 处理项目资源文件，处理项目主资源文件。一般来说，是对src/main/resources目录的内容进行变量替换等工作后，复制到项目输出的主classpath目录中。 |
| generate-resources    |                                                              |
| process-resources     |                                                              |
| compile               | 编译项目的主源码。一般来说，是编译src/main/java目录下的Java文件至项目输出的主classpath目录中。 |
| process-classes       | 处理编译生成的文件，例如 Java Class 字节码的加强和优化。     |
| generate-test-sources |                                                              |
| process-test-sources  | 处理项目测试资源文件。一般来说，是对src/test/resources目录的内容进行变量替换等工作后，复制到项目输出的测试classpath目录中。 |
| test-compile          | 编译项目的测试代码。一般来说，是编译src/test/java目录下的Java文件至项目输出的测试classpath目录中。 |
| process-test-classes  |                                                              |
| test                  | 使用适当的单元测试框架（例如JUnit）运行测试。                |
| prepare-package       | 在真正打包之前，为准备打包执行任何必要的操作。               |
| package               | 获取编译后的代码，并按照可发布的格式进行打包，例如 JAR、WAR 或者 EAR 文件。 |
| pre-integration-test  | 在集成测试执行之前，执行所需的操作。例如，设置所需的环境变量。 |
| integration-test      | 处理和部署必须的工程包到集成测试能够运行的环境中。           |
| post-integration-test | 在集成测试被执行后执行必要的操作。例如，清理环境。           |
| verify                | 运行检查操作来验证工程包是有效的，并满足质量要求。           |
| install               | 安装工程包到本地仓库中，该仓库可以作为本地其他工程的依赖。   |
| deploy                | 拷贝最终的工程包到远程仓库中，以共享给其他开发人员和工程。   |



**site**



| 生命周期阶段 | 描述                                       |
| :----------- | :----------------------------------------- |
| pre-site     | 执行一些在生成项目站点之前需要完成的工作。 |
| site         | 生成项目站点文档。                         |
| post-site    | 执行一些在生成项目站点之后需要完成的工作。 |
| site-deploy  | 将生成的项目站点发布到服务器上。           |

### 2、插件

Maven 三套生命周期定义各个阶段不做任何实际工作，实际工作都是由插件来完成的，每个生命周期阶段都是由插件的目标来完成。在 pom 文件中声明如下（打包源码文件插件）：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>2.1.1</version>
            <executions>
                <execution>
                    <id>attach-sources</id>
                    <phase>verify</phase>
                    <goals>
                        <goal>jar-no-fork</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

#### (1) 插件目标

一个插件有可能有多个功能、每个功能就是一个目标。比如 maven-dependency-plugin 有十多个目标，每个目标对应了一个功能。



插件的目标为 dependency:analyze、dependency:tree和dependency:list。



通用写法：冒号前面是插件前缀，冒号后面是插件的目标。比如 compiler:compile。



#### (2) 插件绑定

为实现快速构建，Maven 有一套内置的插件绑定。三套生命周期的插件绑定具体如下（其实是各个生命周期阶段与插件的目标的绑定）。



其中 default 生命周期的构建方式会其打包类型有关、打包类型在POM中 packaging 指定。一般有 jar、war 两种类型。下面是默认绑定插件与生命周期关系图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211112214449.png)

#### (3) 自定义绑定

自定义绑定允许我们自己掌控插件目标与生命周期的结合。以生成项目主代码的源码 jar 为例。



使用到的插件和它的目标为：maven-source-plugin:jar-no-fork。将其绑定到 default 生命周期阶段 verify 上（可以任意指定三套生命周期的任意阶段）。

```xml
<build>
  <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-source-plugin</artifactId>
        <version>2.1.1</version>
        <executions>
          <execution>
            <id>attach-sources</id> 
            <!-- 指定作用在生命周期的哪个阶段 -->
            <phase>verify</phase> 
            <goals>
               <!-- 指定执行绑定插件的哪些目标 -->
                <goal>jar-no-fork</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
  </plugins>
</build>
```

#### (4) 插件配置

> 使用命令行配置

在 maven 命令中加入 -D 参数，并伴随一个参数键=参数值的形式，来配置插件目标参数。

如：maven-surefire-plugin 插件提供一个 maven.test.skip 参数，当值为 true 时会跳过执行测试：

```bash
# 对比 mvn install
mvn install –Dmaven.test.skip=true
```



> 使用 pom 全局配置

在声明插件的时候，对插件进行一个全局配置，后面所有使用该插件的都要遵循这个配置。比如指定 maven-compile-plugin 编译 1.7 版本的源文件：

```xml
<plugin>
   <groupId>org.apache.maven.plugins</groupId>
   <artifactId>maven-compiler-plugin</artifactId>
   <configuration>
       <fork>true</fork>
       <source>1.7</source>
       <target>1.7</target>
   </configuration>
</plugin>
```

## 五、聚合和继承

### 1、定义

**聚合：**为了一次构建多个项目模块，就需要对多个项目模块进行聚合

```xml
<modules>
    <module>模块一</module>
    <module>模块二</module>
    <module>模块三</module>
</modules>
```



**继承：**为了消除重复，把很多相同的配置提取出来，例如：dependency、grouptId，version 等

```xml
<parent>  
    <groupId>com.xxxx.maven</groupId>
    <artifactId>parent-project</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <relativePath>../ParentProject/pom.xml</relativePath>  
</parent>
```

**以下的元素是可以被继承的：**

- groupId，项目组ID；
- version，项目版本；
- description，项目描述信息；
- organazation，项目的组织信息；
- inceptionYear，项目的创始年份；
- developers，项目开发者信息；
- contributors，项目的贡献者信息；
- distributionManagement，项目的部署信息；
- issueManagement，项目的缺陷跟踪系统信息；
- ciManagement，项目的持续集成系统信息；
- scm，项目的版本控制系统信息；
- mailingLists，项目的邮件列表信息；
- properties，自定义的Maven属性；
- dependencies，项目的依赖配置；
- dependencyManagement，项目的依赖管理配置；
- repositories，项目的仓库配置；
- build，包括项目的源码目录配置、输出目录配置、插件配置、插件管理配置等；
- reporting，包括项目的报告输出目录配置、报告插件配置。



注意下面的元素，这些都是不能被继承的：

- artifactId
- name
- prerequisites



### 2、聚合和继承的关系

- 两者共同点为，打方式必须都是 pom
- 在实际的项目中，一个 pom 既是聚合 pom 又是父 pom

<mark>注：父 pom 中使用 dependencies 引入的依赖也会被子 pom 继承，所以不要将过多的实际依赖放在父 pom，父 pom 只用于管理，使用 dependencyManagement 标签。</mark>



## 六、灵活构建

使用属性、 resources 插件资源过滤功能（filter）和 Maven 的 profile 功能，实现环境的灵活切换



### 1、属性

通过 properties 元素用户可以自定义一个或者多个 Maven 属性，然后在 pom 其他的地方使用 ${属性名} 的方式引用该属性，这种方式最大意义在于消除重复。



> 一、内置属性



- `${basedir}` 表示项目根目录，即包含 pom.xml 文件的目录
- `${version}` 等同于或者 {pom.version} 表示项目版本



> 二、POM 属性



所有 pom 中的元素都可以用 project. 例如 `${project.artifactId}` 对应了 < project>元素的值。常用的 POM 属性包括：



- `${project.build.sourceDirectory}` : 项目的主源码目录，默认为 src/main/java/.
- `${project.build.testSourceDirectory}`: 项目的测试源码目录，默认为 /src/test/java/.
- `${project.build.directory}` : 项目构建输出目录，默认为 target/.
- `${project.build.outputDirectory}` : 项目主代码编译输出目录，默认为 target/classes/.
- `${project.build.testOutputDirectory}` : 项目测试代码编译输出目录，默认为 target/testclasses/.
- `${project.groupId}`: 项目的 groupId.
- `${project.artifactId}` : 项目的 artifactId.
- `${project.version}` : 项目的 version, 等同于 ${version}
- `${project.build.finalName}` : 项目打包输出文件的名称，默认为`${project.artifactId}${project.version}`



> 三、自定义属性



在 pom 中元素下自定义的 Maven 属性：

```xml
<properties>
    <swagger.version>2.2.2</swagger.version>
</properties>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>${swagger.version}</version>
</dependency>
```



> 四、setting 属性



所有用的的 settings.xml 中的设定都可以通过 settings。前缀进行引用与 POM 属性同理。

如 `${settings.localRepository}` 指向用户本地仓库的地址



> 五、Java 系统属性



所有 Java 系统属性都可以使用 Maven 属性引用，例如 ${user.home} 指向了用户目录。

可以通过命令行 `mvn help:system` 查看所有的 Java 系统属性



> 六、环境变量属性

所有环境变量都可以使用以 env. 开头的 Maven 属性引用。例如 `${env.JAVA_HOME}` 指代了 JAVA_HOME 环境变量的值。

也可以通过命令行 mvn help:system 查看所有环境变量。



> 七、父级工程属性

上级工程的 pom 中的变量用前缀 引用。上级工程的版本也可以这样引用 `{parent.version}`



### 2、Profile



profile 特性可以让我们定义多个 profile，然后每个 profile 对应不同的激活条件和配置信息，从而达到不同环境使用不同配置信息的效果。



profile 特性可以让我们定义多个 profile，然后每个 profile 对应不同的激活条件和配置信息，从而达到不同环境使用不同配置信息的效果。



- m.xml：这里声明的 profile 只对当前项目有效
- 用户 settings.xml：.m2/settings.xml 中的 profile 对该用户的 Maven 项目有效
- 全局 settings.xml：conf/settings.xml，对本机上所有 Maven 项目有效



示例：

```xml
<project>
  ...
  <profiles>
    <profile>
      <id>dev</id>
      <properties>
        <active.profile>dev</active.profile>
        <key1>value1</key1>
        <key2>value2</key2>
      </properties>

      <!-- 默认激活配置 -->
      <activation>
        <activeByDefault>true</activeByDefault>
      </activation>
      <!-- 在该 profile 下才会引入的依赖 -->
      <dependencies>
        <dependency>
          <groupId>org.springframework</groupId>
          <artifactId>spring-context</artifactId>
          <version>3.2.4.RELEASE</version>
        </dependency>
      <dependencies>
      <!-- 在该 profile 下才会加载的变量文件 -->
      <build>
        <filters>
          <filter>../profile/test-pre.properties</filter>
        </filters>
      </build>
    </profile>
  </profiles>
  ...
</project>
```

