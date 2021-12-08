---
title: Open Source Of Easy Excel Quick Start
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20211031150404.jpg'
coverImg: /img/20211031150404.jpg
cover: false
toc: true
mathjax: false
date: 2021-12-08 17:08:13
summary: EasyExcel 快速入门
categories: "Open Source"
keywords: ["Open Source", "Easyexcel"]
tags: "Open Source"
---

## EasyExcel 快速入门

### 1、项目环境搭建

> 建表 sql：

```sql
DROP TABLE IF EXISTS `easy_excel_user_info`;
CREATE TABLE `easy_excel_user_info`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '姓名',
  `age` int(11) NOT NULL COMMENT '年龄',
  `gender` tinyint(4) NOT NULL COMMENT '性别( 0 女; 1 男)',
  `address` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '家庭住址',
  `create_time` datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` datetime(0) NULL DEFAULT NULL COMMENT '更新时间',
  `delete_flag` tinyint(4) NULL DEFAULT 0 COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '测试 easyexcel 的表' ROW_FORMAT = Dynamic;
```

> 依赖：

基于 SpringBoot、Mybatis-plus、MySQL、Thymeleaf、Easyexcel。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- MySQL Driver -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- mybatis-plus-stater -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.3.4</version>
</dependency>

<!-- mybatis-plus-code-generator -->
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-generator</artifactId>
    <version>3.5.1</version>
</dependency>

<!-- template engine -->
<dependency>
    <groupId>org.apache.velocity</groupId>
    <artifactId>velocity-engine-core</artifactId>
    <version>2.2</version>
</dependency>

<!-- thymeleaf support -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>

<!-- easy-excel support -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>easyexcel</artifactId>
    <version>3.0.5</version>
</dependency>
```



> 配置文件：

```properties
server:
  port: 8080
  
spring:
  web:
    resources:
      static-locations: classpath:/static/
  mvc:
    servlet:
      load-on-startup: 1
      
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: 123456
    url: jdbc:mysql://localhost/customer_db?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=GMT%2B8
    type: com.zaxxer.hikari.HikariDataSource
  
  jackson:
    time-zone: GMT+8
    date-format: yyyy-MM-dd HH:mm:ss
    
  thymeleaf:
    prefix: classpath:/templates/
    cache: false
    enabled: true
    mode: HTML
    suffix: .html

# Mybatis-Plus Configuration
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
    map-underscore-to-camel-case: true
    
  global-config:
    db-config:
      logic-delete-value: 1
      logic-not-delete-value: 0
      logic-delete-field: delete_flag
      
  mapper-locations: classpath*:mapper/**/*.xml
  type-aliases-package: com.naivekyo.springbootthirdtoolsintegration.pojo
```

### 2、通用设置

> 自定义异常

```java
@Setter
@Getter
@ToString
public class GeneralException extends RuntimeException{
    
    private static final long serialVersionUID = 2932666413162371446L;

    private Integer code = ResultCode.ERROR;
    
    private String message;
    
    public GeneralException(String message) {
        super(message);
    }
    
    public GeneralException(Integer code, String message) {
        super(message);
        this.code = code;
    }
}
```



> 全局异常处理

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 通用异常处理
     * @param e 异常
     * @return
     */
    @ExceptionHandler(value = Exception.class)
    public R error(Exception e) {
        
        e.printStackTrace();
        
        return R.error().message("服务端异常!");
    }

    /**
     * 通用业务层异常处理
     * @param e 业务异常
     * @return
     */
    @ExceptionHandler(value = GeneralException.class)
    public R error(GeneralException e) {
        
        log.error(ExceptionUtils.getMessage(e));
        
        e.printStackTrace();
        
        return R.error().code(e.getCode()).message(e.getMessage());
    }
}
```

> 工具类

```java
public class ExceptionUtils {

    /**
     * 获取异常信息
     * @param e
     * @return
     */
    public static String getMessage(Exception e) {
        
        try(
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw)
        ) {
            e.printStackTrace(pw);
            
            pw.flush();
            sw.flush();
            
            return sw.toString();
        } catch (IOException ioException) {
            ioException.printStackTrace();
        }
        
        return null;
    }
}
```

> 统一 JSON 格式

```java
@Data
public class R implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 执行结果
     */
    private Boolean result;

    /**
     * 状态码
     */
    private Integer code;

    /**
     * 返回信息
     */
    private String message;

    /**
     * 返回数据
     */
    private Map<String, Object> map = new HashMap<>();

    private R() {
    }
    
    public static R ok() {

        R res = new R();
        res.setCode(ResultCode.SUCCESS);
        res.setMessage("执行成功!");
        
        return res;
    }
    
    public static R error() {

        R res = new R();
        res.setCode(ResultCode.ERROR);
        res.setMessage("执行失败!");
        
        return res;
    }
    
    public R result(Boolean result) {
        this.setResult(result);
        return this;
    }
    
    public R code(Integer code) {
        this.setCode(code);
        return this;
    }
    
    public R message(String message) {
        this.setMessage(message);
        return this;
    }
    
    public R data(String key, Object value) {
        this.map.put(key, value);
        return this;
    }
    
    public R data(Map<String, Object> data) {
        this.setMap(data);
        return this;
    }
}
```



> 返回状态码

```java
public final class ResultCode {

    public static final Integer SUCCESS = 20000;
    
    public static final Integer ERROR = 20001;
    
    
    private ResultCode() {
    }
}
```

### 3、Mybatis-Plus 配置

> 代码生成器

```java
public class MybatisCodeGenerator {

    @Test
    public void test() {

        // 数据库配置
        DataSourceConfig dsc = new DataSourceConfig.Builder(
                "jdbc:mysql://localhost:3306/customer_db",
                "root",
                "123456"
        ).build();

        // 代码生成器
        AutoGenerator ag = new AutoGenerator(dsc);

        // 全局配置
        String projectPath = System.getProperty("user.dir");
        GlobalConfig gc = new GlobalConfig.Builder()
                .outputDir(projectPath + "/src/main/java")
                .fileOverride()
                .author("Naive Kyo")
                .disableOpenDir()
                .enableSwagger()
                // 设置 Date 为 Java.util 下的
                .dateType(DateType.ONLY_DATE)
                .commentDate("yyyy-MM-dd")
                .build();

        // 包配置
        PackageConfig pc = new PackageConfig.Builder()
                .parent("com.naivekyo")
                .moduleName("springbootthirdtoolsintegration")
                .controller("controller")
                .entity("pojo")
                .service("service")
                .serviceImpl("service.impl")
                .mapper("mapper")
                .build();

        // 策略配置，逆向工程，根据数据库表生成实体类
        StrategyConfig strategy = new StrategyConfig.Builder()
                .enableCapitalMode()
                .enableSkipView()
                .disableSqlFilter()
                // 下面是添加指定的表
                .addInclude("easy_excel_user_info")
                .entityBuilder() 
                    .enableChainModel()
                    .enableLombok()
                    .logicDeleteColumnName("delete_flag")
                    .logicDeletePropertyName("deleteFlag")
                    .naming(NamingStrategy.underline_to_camel)
                    .columnNaming(NamingStrategy.underline_to_camel)
                    .addTableFills(new Column("create_time", FieldFill.INSERT))
                    .addTableFills(new Column("update_time", FieldFill.INSERT_UPDATE))
                    .idType(IdType.AUTO)
                .controllerBuilder()
                    .enableRestStyle()  // 开启 REST 支持
                    .formatFileName("%sController")
                .serviceBuilder()
                    .formatServiceImplFileName("%sServiceImpl")
                .build();

        // 执行
        ag.global(gc).packageInfo(pc).strategy(strategy).execute();
    }
}
```

> 插件及事务托管

```java
@Configuration
@EnableTransactionManagement
public class MybatisPlusConfiguration {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        
        return interceptor;
    }
    
    @Bean
    public DataSourceTransactionManager transactionManager(DataSource dataSource) {
        
        return new DataSourceTransactionManager(dataSource);
    }
}
```



> 属性注入

```java
@Component
public class MybatisPlusMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {

        this.strictInsertFill(metaObject, "createTime", Date::new, Date.class);
        this.strictInsertFill(metaObject, "updateTime", Date::new, Date.class);
    }

    @Override
    public void updateFill(MetaObject metaObject) {

        this.strictInsertFill(metaObject, "createTime", Date::new, Date.class);
    }
}
```



### 4、EasyExcel Web 读写案例

#### (1) 前置准备

> Excel 模型

```java
@Getter
@Setter
@EqualsAndHashCode
public class ExcelModel {
    
    @ExcelProperty("姓名")
    private String name;
    
    @ExcelProperty("年龄")
    private Integer age;
    
    @ExcelProperty("性别")
    private String gender;
    
    @ExcelProperty("家庭住址")
    private String address;
}
```

> 数据库实体

```java
@Getter
@Setter
@Accessors(chain = true)
@TableName("easy_excel_user_info")
public class EasyExcelUserInfo implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    private String name;

    private Integer age;

    private Integer gender;

    private String address;

    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    @TableLogic
    private Integer deleteFlag;
}
```

> 读取 Excel 所需监听器

```java
public class UploadDataListener implements ReadListener<ExcelModel> {

    /**
     * 用 list 接收 BATCH_SIZE 条记录后，一次性插入到数据库中，然后清理 list，方便内存回收
     */
    private static final int BATCH_SIZE = 50;
    
    private List<ExcelModel> cacheDataList = ListUtils.newArrayListWithExpectedSize(BATCH_SIZE);

    /**
     * 业务对象，当然也可以是 DAO 层对象
     */
    private final EasyExcelUserInfoService easyExcelUserInfoService;

    /**
     * 使用构造器将 Spring 容器管理的组件注入进来
     * @param easyExcelUserInfoService
     */
    public UploadDataListener(EasyExcelUserInfoService easyExcelUserInfoService) {
        this.easyExcelUserInfoService = easyExcelUserInfoService;
    }

    /**
     * 逐条记录进行解析
     * @param data 对应一条 excel 记录
     * @param context 解析 Excel 的上下文对象
     */
    @Override
    public void invoke(ExcelModel data, AnalysisContext context) {
        
        this.cacheDataList.add(data);
        
        // 批量操作
        if (cacheDataList.size() >= BATCH_SIZE) {
            // 业务操作
            this.easyExcelUserInfoService.batchInsertExcelData(cacheDataList);
                    
            // 清理 list
            cacheDataList = ListUtils.newArrayListWithExpectedSize(BATCH_SIZE);
        }
    }

    /**
     * 所有数据解析完成了，就会调用该方法
     * @param context
     */
    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        
        // 这里也需要保存数据，确保最后遗留的数据也存储到数据库
        this.easyExcelUserInfoService.batchInsertExcelData(cacheDataList);
        this.cacheDataList = null;
    }
}
```

> 业务处理

```java
public interface EasyExcelUserInfoService extends IService<EasyExcelUserInfo> {

    /**
     * 批量插入数据
     * @param list 数据
     */
    void batchInsertExcelData(List<ExcelModel> list);

    /**
     * 从数据库中查询数据填充到 Excel 中
     * @return
     */
    List<ExcelModel> getExcelData();
}
```

```java
@Service
public class EasyExcelUserInfoServiceImpl extends ServiceImpl<EasyExcelUserInfoMapper, EasyExcelUserInfo> implements EasyExcelUserInfoService {


    @Transactional(rollbackFor = Exception.class)
    @Override
    public void batchInsertExcelData(List<ExcelModel> list) throws RuntimeException {

        ArrayList<EasyExcelUserInfo> easyExcelUserInfos = new ArrayList<>(list.size());

        list.forEach(e -> {
            
            EasyExcelUserInfo easyExcelUserInfo = new EasyExcelUserInfo();
            BeanUtils.copyProperties(e, easyExcelUserInfo);
            easyExcelUserInfo.setGender(e.getGender().equals("男") ? 1 : 0);
            
            easyExcelUserInfos.add(easyExcelUserInfo);
        });

        boolean b = this.saveBatch(easyExcelUserInfos);
        
        if (!b) {
            throw new RuntimeException("batch insert failed！");
        }
        
    }

    @Override
    public List<ExcelModel> getExcelData() {

        List<EasyExcelUserInfo> easyExcelUserInfos = this.baseMapper.selectList(null);

        ArrayList<ExcelModel> excelModels = new ArrayList<>();

        easyExcelUserInfos.forEach(e -> {
            ExcelModel excelModel = new ExcelModel();
            BeanUtils.copyProperties(e, excelModel);
            excelModel.setGender(e.getGender() == 1 ? "男" : "女");
            
            excelModels.add(excelModel);
        });
        
        return excelModels;
    }
}
```

#### (2) 读/写

```java
@Controller
public class EasyExcelUserInfoController {
    
    @Autowired
    private EasyExcelUserInfoService easyExcelUserInfoService;
    
    @PostMapping("/easy-excel-test/easyExcelUserInfo/v1")
    public String batchInsertInfo(@RequestParam("excel_file") MultipartFile file, Model model) throws IOException {
        
        EasyExcel.read(file.getInputStream(), ExcelModel.class, new UploadDataListener(this.easyExcelUserInfoService))
                .sheet().doRead();
        
        model.addAttribute("msg", "上传成功!");
        
        return "index";
    }
    
    @GetMapping("/easy-excel-test/easyExcelUserInfo/v1")
    public void downloadExcel(HttpServletResponse response) throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        
        try {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            // 使用 URLEncoder 防止中文乱码
            String fileName = URLEncoder.encode("测试下载文件", "UTF-8").replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");
            // 这里需要设置不关闭流
            EasyExcel.write(response.getOutputStream(), ExcelModel.class)
                    .autoCloseStream(Boolean.FALSE)
                    .sheet("模板")
                    .doWrite(this.easyExcelUserInfoService.getExcelData());
        } catch (Exception e) {
            
            // 重置response
            response.reset();
            response.setContentType("application/json");
            response.setCharacterEncoding("utf-8");
            response.getWriter().println(mapper.writeValueAsString(R.error().message("下载文件失败!")));
        }
    }
}
```



#### (3) 前端页面

```html
<!DOCTYPE html>
<html lang="zh" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>主页</title>
    <style>
        .container {
            border: 1px solid;
            width: 400px;
            height: 400px;
            margin: 100px auto;
            padding: 20px;
        }
    </style>
</head>
<body>

    <div class="container">
        <form th:action="@{${#request.getContextPath()} + '/easy-excel-test/easyExcelUserInfo/v1'}" method="post" enctype="multipart/form-data">
            <input type="file" name="excel_file"/>
            <button type="submit">提交</button>
        </form>
        
        <br />
        <button><a th:href="@{${#request.getContextPath()} + '/easy-excel-test/easyExcelUserInfo/v1'}" style="text-decoration: none">下载文件</a></button>
    </div>

    <script th:inline="javascript">
        
        window.onload = function () {
            
            var msg = /*[[${msg}]]*/ null

            if (msg !== null) {
                alert(msg);
            }
        }
        
    </script>
</body>
</html>
```

