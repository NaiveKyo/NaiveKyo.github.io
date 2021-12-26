---
title: Spring Security Of User-defined Mode
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150300.jpg'
coverImg: /img/20211031150300.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-21 09:29:44
summary: "Spring Security 用户定义方式"
categories: "Spring Security"
keywords: "Spring Security"
tags: "Spring Security"
---



# 用户定义方式

系列文章：

[Spring Security 基本认证简介](https://naivekyo.github.io/2021/12/13/spring-security-of-basic-authentication/)

[登录用户数据获取](https://naivekyo.github.io/2021/12/16/spring-security-get-logged-in-user-data/)



之前都是在配置文件中设置登录账户和密码（本质上是基于内存的），但是实际开发中，用户信息肯定是要存入数据库的。

Spring Security 支持多种用户定义方式，主要是利用 `UserDetailsService` 的不同实现类来提供用户数据，同时将配置好的 `UserDetailsService` 配置给 `AuthenticationManagerBuilder`，系统再将 `UserDetailsService` 提供给 `AuthenticationProvider` 使用。



## 一、基于内存

通过配置文件定义用户本质上还是基于内存，只不过没有将 `InMemoryUserDetailsManager` 类明确抽出来自定义，现在通过自定义 `InMemoryUserDetailsManager`  看一下基于内存的用户是如何定义的：



```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    // ......................
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {

        InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();

        manager.createUser(User.withUsername("naivekyo").password("{noop}123456").roles("admin").build());

        manager.createUser(User.withUsername("zhangsan").password("{noop}123456").roles("user").build());
        
        auth.userDetailsService(manager);
    }
    
    // .....................
}
```



注意这里重写的是 `configure(AuthenticationManagerBuilder auth)` 方法，首先构造一个 `InMemoryUserDetailsManager` 实例，调用该实例的 createUser 方法来创建用户对象，而这个对象是通过 `User` 类来构建的，它实现了 `UserDetails` 接口，之前提到过这个类。

我们在这里分别设置了用户名、密码以及用户角色，需要注意的是，用户密码加了 `{noop}` 前缀，表示这是一个明文密码，之前在默认用户生成的时候提到过这个。

重启项目，现在就可以使用两个用户登录了。

> 总结

`InMemoryUserDetailsManager`  的实现原理比较简单，它间接实现了 `UserDetailsService` 接口并重写了里面的 `loadUserByUsername` 方法，同时它里面维护了一个 HashMap 变量，Map 的 key 就是用户名，value

就是用户对象，`createUser` 就是往这个 Map 中存储数据，`loadUserByUsername`  方法则是从该 Map 中读取数据。



## 二、基于 JdbcUserDetailsManager



### 1、简介和测试

`JdbcUserDetailsManager` 支持将用户数据持久化到数据库，同时它封装了一系列操作用户的方法，例如用户的添加、删除、修改、查找等等。

Spring Security 为 `JdbcUserDetailsManager`  提供了数据库脚本，位置：`org/springframework/security/core/userdetails/jdbc/users.ddl`，内容如下：

```sql
create table users(username varchar_ignorecase(50) not null primary key,
                   password varchar_ignorecase(500) not null,
                   enabled boolean not null);
                   
create table authorities (username varchar_ignorecase(50) not null,
                          authority varchar_ignorecase(50) not null,
                          constraint fk_authorities_users foreign key(username) references users(username));
                          
create unique index ix_auth_username on authorities (username,authority);
```

可以看到这里一共创建了两张表，users 表存放用户信息，authorities 则是存放用户角色的表。

但是注意 SQL 的数据类型中有一个 `varchar_ignorecase`，这个其实是针对 HSQLDB 的数据类型，我们这里使用的是 MySQL 数据库，所以可以手动将 `varchar_ignorecase` 类型修改为 varchar 类型，然后去数据库执行修改后的脚本。

这里我创建一个名为 spring_security 的数据库，执行脚本后生成了两张表：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211225195313.png)





由于数据要存入数据库中，所以项目也需要提供数据库支持，`JdbcUserDetailsManager` 底层实际使用的是 `JdbcTemplate` 来完成的，所以只需要添加两个依赖就可以了：

```xml
<!-- jdbc support -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>

<!-- mysql driver -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

配置文件中简单配置一下数据库连接信息：

```yml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql:///spring_security?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
```

Security 配置类：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    
    @Autowired
    private DataSource dataSource;

    // ...................
    
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {

        JdbcUserDetailsManager manager = new JdbcUserDetailsManager(dataSource);
        
        if (!manager.userExists("naivekyo")) {
            manager.createUser(User.withUsername("naivekyo").password("{noop}123456").roles("admin").build());
        }
        
        if (!manager.userExists("lisi")) {
            manager.createUser(User.withUsername("lisi").password("{noop}123456").roles("user").build());
        }
        
        auth.userDetailsService(manager);
    }
    
    // ..................
    
}
```

说明：

（1）当引入 spring-boot-stater-jdbc 并配置了数据库连接信息后，一个 `DataSource` 实例就有了，这里首先引入 DataSource 实例；

（2）在 `configure` 方法中，创建一个 `JdbcUserDetailsManager` 实例，在创建时传入 `DataSource` 实例，通过 `userExists` 方法可以判断一个用户是否存在，该方法本质上是去数据库中查询对应的用户：如果用户不存在，就通过 `createUser` 方法创建一个用户，该方法本质上是向数据库中添加一个用户；

（3）最后将 manager 实例设置到 auth 对象中。



重启项目，以刚刚在代码中设置的两个用户登录，最后查看数据库：



![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211225203740.png)



### 2、分析

`JdbcUserDetailsManager` 继承体系如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211225212343.png)

`JdbcDaoImpl` 实现了 `UserDetailsService` 接口，并实现了基本的 `loadUserByUsername` 方法。

`JdbcUserDetailsManager` 则继承自 `JdbcDaoImpl` ，同时完善了数据库操作，又封装了用户的增删改查方法。

这里，我们查看一下 loadUserByUsername 方法的源码：

```java
// org.springframework.security.core.userdetails.jdbc.JdbcDaoImpl#loadUserByUsername()

public class JdbcDaoImpl extends JdbcDaoSupport implements UserDetailsService, MessageSourceAware {
 
    
    @Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		List<UserDetails> users = loadUsersByUsername(username);
        
		if (users.size() == 0) {
			this.logger.debug("Query returned no results for user '" + username + "'");
			throw new UsernameNotFoundException(this.messages.getMessage("JdbcDaoImpl.notFound",
					new Object[] { username }, "Username {0} not found"));
		}
        
		UserDetails user = users.get(0); // contains no GrantedAuthority[]
        
		Set<GrantedAuthority> dbAuthsSet = new HashSet<>();
		if (this.enableAuthorities) {
			dbAuthsSet.addAll(loadUserAuthorities(user.getUsername()));
		}
		if (this.enableGroups) {
			dbAuthsSet.addAll(loadGroupAuthorities(user.getUsername()));
		}
        
		List<GrantedAuthority> dbAuths = new ArrayList<>(dbAuthsSet);
		addCustomAuthorities(user.getUsername(), dbAuths);
		if (dbAuths.size() == 0) {
			this.logger.debug("User '" + username + "' has no authorities and will be treated as 'not found'");
			throw new UsernameNotFoundException(this.messages.getMessage("JdbcDaoImpl.noAuthority",
					new Object[] { username }, "User {0} has no GrantedAuthority"));
		}
        
		return createUserDetails(username, user, dbAuths);
	}

	/**
	 * Executes the SQL <tt>usersByUsernameQuery</tt> and returns a list of UserDetails
	 * objects. There should normally only be one matching user.
	 */
	protected List<UserDetails> loadUsersByUsername(String username) {
		// @formatter:off
		RowMapper<UserDetails> mapper = (rs, rowNum) -> {
			String username1 = rs.getString(1);
			String password = rs.getString(2);
			boolean enabled = rs.getBoolean(3);
			return new User(username1, password, enabled, true, true, true, AuthorityUtils.NO_AUTHORITIES);
		};
		// @formatter:on
		return getJdbcTemplate().query(this.usersByUsernameQuery, mapper, username);
	}
}
```

（1）先根据用户名，调用 `loadUsersByUsername` 方法去数据库查询用户，查询出来的是一个 List 集合，集合中如果没有数据，说明用户不存在，直接抛出异常；

（2）如果集合中有数据，就将集合的第一个元素取出来，然后再去查询用户角色，最后根据这些信息创建一个新的 `UserDetails` 出来；

（3）需要注意的是这里引入了分组的概念，以后再说。



### 3、总结

上面就是使用 `JdbcUserDetailsManager` 做数据持久化的方法，这种方式看起来比较简单，都不用开发者自己写 SQL，但是局限性比较大，无法灵活地定义用户表、角色表，而在实际开发中，我们还是希望能够灵活地掌控数据表的结构。



## 三、基于 Mybatis

### 1、准备工作

使用 Mybatis 做数据持久化是目前较为流行的方案，Spring Security 中结合 Mybatis 可以灵活地定制用户表以及角色表。



首先需要设计三张表，分别是用户表、角色表和用户角色关联表，三种表的关系如图：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211225222122.png)



用户和角色是多对多的关系，所以用一张 user_role 表将两者关联起来。

SQL 脚本：

```sql
CREATE TABLE `user`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(32) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `enabled` tinyint(1) NULL DEFAULT 1 COMMENT '账户是否可用，1 表示正常，0 表示禁用',
  `account_non_expired` tinyint(1) NULL DEFAULT 1 COMMENT '账户是否没有过期，1 表示正常，0 表示过期',
  `account_non_locked` tinyint(1) NULL DEFAULT 1 COMMENT '账户是否被锁定，1 表示正常，0 表示被锁定',
  `credentials_non_expired` tinyint(1) NULL DEFAULT 1 COMMENT '凭证（密码）是否过期，1 表示正常，0 表示过期',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `role`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键，角色 id',
  `name` varchar(32) NOT NULL COMMENT '角色英文名称',
  `name_zh` varchar(32) NOT NULL COMMENT '角色中文名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `user_role`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `uid` int(11) NOT NULL COMMENT '用户 id',
  `rid` int(11) NOT NULL COMMENT '角色 id',
  PRIMARY KEY (`id`),
	KEY `uid` (`uid`),
	KEY `rid` (`rid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

插入一些测试数据：

```sql
INSERT INTO `role` (`id`, `name`, `name_zh`)
VALUES 
(1, 'ROLE_dba', '数据库管理员'),
(2, 'ROLE_admin', '系统管理员'),
(3, 'ROLE_user', '用户');

INSERT INTO `user` (`id`, `username`, `password`)
VALUES 
(1, 'root', '{noop}123456'),
(2, 'admin', '{noop}123456'),
(3, 'naivekyo', '{noop}123456');

INSERT INTO `user_role` (`id`, `uid`, `rid`)
VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 2),
(4, 3, 3);
```



### 2、测试

引入 Mybatis 和 MySQL 依赖：

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.0</version>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

配置信息：

```yml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql:///spring_security?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai

mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
  type-aliases-package: org.naivekyo.springsecurity4integratemybatis.entity
  mapper-locations: classpath:/mapper/*.xml

```

创建用户类和角色类：

```java
// 角色类
@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class Role {
    
    private Integer id;
    
    private String name;
    
    private String nameZh;
}

// 用户类
@Setter
public class User implements UserDetails {
    
    private Integer id;
    
    private String username;
    
    private String password;
    
    private Boolean enabled;
    
    private Boolean accountNonExpired;
    
    private Boolean accountNonLocked;
    
    private Boolean credentialsNonExpired;
    
    private List<Role> roles = new ArrayList<>();
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();

        for (Role role : this.roles) {
            authorities.add(new SimpleGrantedAuthority(role.getName()));
        }
        
        return authorities;
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return this.accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return this.accountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return this.credentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }

    public Integer getId() {
        return id;
    }
}
```



自定义用户类需要实现 `UserDetails` 接口，并实现接口中的方法，这些方法的含义之前已经说明过。

其中 `roles` 属性存放的是用户具备的角色信息，由于系统获取用户角色调用的方法是 `getAuthorites`，所以我们在该方法中，将 roles 中角色转换为系统可识别的对象并返回。

<mark>注意：User 类中的 isXXX 方法可以当作 get 方法来对待，不需要再给这些属性生成 get 方法</mark>

接下来自定义 `UserDetailsService` 以及对应的数据库查询方法：

```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private UserMapper userMapper;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = this.userMapper.loadUserByUsername(username);
        if (user == null)
            throw new UsernameNotFoundException("用户不存在!");
        
        return user;
    }
}
```

自定义的 `UserDetailsServiceImpl` 实现了 `UserDetailsService` 接口，并实现该接口中的方法 `loadUserByUsername`，根据用户名去数据库中查询用户信息，如果没有查找就抛出 `UsernameNotFoundException` 异常；



`UserMapper`：

```java
@Mapper
@Repository
public interface UserMapper {

    /**
     * 根据用户名，从数据库查询出相关用户信息
     * 
     * @param username 用户名
     * @return 用户信息
     */
     User loadUserByUsername(@Param("uname") String username);
}
```

`UserMapper.xml`：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="org.naivekyo.springsecurity4integratemybatis.mapper.UserMapper">
    
    <resultMap id="userDetailsResultMap" type="User">
        <id property="id" column="id" />
        <result property="username" column="username" />
        <result property="password" column="password" />
        <result property="enabled" column="enabled" />
        <result property="accountNonExpired" column="account_non_expired" />
        <result property="accountNonLocked" column="account_non_locked" />
        <result property="credentialsNonExpired" column="credentials_non_expired" />
        <collection property="roles" ofType="Role">
            <id property="id" column="role_id" />
            <result property="name" column="role_name" />
            <result property="nameZh" column="role_name_zh" />
        </collection>
    </resultMap>

    <!-- 根据用户名，从数据库查询出相关用户信息 -->
    <select id="loadUserByUsername" resultMap="userDetailsResultMap">
        select u.id, u.username, u.password, u.enabled, u.account_non_expired, u.account_non_locked, u.credentials_non_expired,
               r.id as role_id, r.`name` as role_name, r.name_zh as role_name_zh
        from `user` as u
            inner join `user_role` as ur on u.id = ur.uid
            inner join `role` as r on ur.rid = r.id
        where u.username = #{uname}
    </select>
    
</mapper>
```

注意我们在这里将 `UserMapper.xml` 放在了 resources/mapper/ 目录下。



最后一步就是在 `SecurityConfig` 中注入 `UserDetailsService`：

```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        
        auth.userDetailsService(this.userDetailsService);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        
        http.authorizeRequests()
                    .anyRequest().authenticated()
                .and()
                .formLogin()
                    .loginPage("/myLogin.html")
                    .loginProcessingUrl("/doLogin")
                    .successHandler((request, response, authentication) -> {
                        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("status", 200);
                        resp.put("msg", "登录成功!");
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(resp);
                        response.getWriter().write(s);
                    })
                    .failureHandler(((request, response, exception) -> {
                        response.setContentType("application/json;charset=utf-8");
                        Map<String, Object> resp = new HashMap<>();
                        resp.put("status", 500);
                        resp.put("msg", "登录失败! " + exception.getMessage());
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(resp);
                        response.getWriter().write(s);
                    }))
                    .usernameParameter("uname")
                    .passwordParameter("passwd")
                    .permitAll()
                .and()
                    .logout()
                    .logoutUrl("/logout")
                    .logoutSuccessHandler((request, response, authentication) -> {
                        response.setContentType("application/json;charset=utf-8");
                        Map<String, Object> result = new HashMap<>();
                        result.put("status", 200);
                        result.put("msg", "使用 logout 注销成功!");
                        ObjectMapper om = new ObjectMapper();
                        String s = om.writeValueAsString(result);
                        response.getWriter().write(s);
                    })
                .and()
                .csrf().disable();
    }
}
```



最后启动项目进行测试，就可以成功登录了，举 root 用户为例，打个断点查看用户信息如下：

![](https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211226114013.png)