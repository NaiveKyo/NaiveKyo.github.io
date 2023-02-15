---
title: 'Project Experiment: Common Utils'
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110919.jpg'
coverImg: /img/20220425110919.jpg
cover: false
toc: true
mathjax: false
date: 2023-02-15 22:30:22
summary: "记录常用的工具类"
categories: "Project Experiment"
keywords: "Project Experiment"
tags: "Project Experiment"
---

# Preface

工具类中使用的日志根据实际情况自行选择；



# Java 8 time 工具类

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.Temporal;
import java.time.temporal.TemporalUnit;
import java.util.Date;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

/**
 * Java 8 新日期 API 工具
 */
public class DateUtils {

   public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";

   public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

   /**
    * 获取当天日期所属年份
    * @return year 年份数值
    */
   public static Integer getYear() {
      return LocalDate.now().getYear();
   }

   /**
    * 获取当天日期所属月份
    * @return month 数值类型 1 - 12
    */
   public static Integer getMonth() {
      return LocalDate.now().getMonthValue();
   }

   // ================================ format LocalDate ========================

   /**
    * 获取当天日期字符串
    * 默认格式: yyyy-MM-dd
    * @throws java.time.DateTimeException 格式化失败则抛出异常
    */
   public static String formatDate() {
      return LocalDate.now().format(getFormatter(DEFAULT_DATE_FORMAT));
   }

   /**
    * 以给定的模式格式化当天日期
    * @param formatStr 格式字符串
    * @throws java.time.DateTimeException 格式化失败则抛出异常  
    */
   public static String formatDate(String formatStr) {
      return LocalDate.now().format(getFormatter(formatStr));
   }

   /**
    * 格式化指定的日期变量
    * @param date           日期对象 {@link LocalDate}
    * @param formatStr       格式字符串
    * @throws java.time.DateTimeException 格式化失败则抛出异常   
    * @return          字符串
    */
   public static String formatDate(LocalDate date, String formatStr) {
      return date.format(getFormatter(formatStr));
   }

   /**
    * <p>
    *     以默认格式来格式化给定的日期对象
    *     默认格式: yyyy-MM-dd
    * </p>
    * @param date 指定的日期对象{@link LocalDate}
    * @throws java.time.DateTimeException 格式化失败则抛出异常   
    * @return    字符串
    */
   public static String formatDate(LocalDate date) {
      return date.format(getFormatter(DEFAULT_DATE_FORMAT));
   }

   // ================================ parse LocalDate ========================

   /**
    * 默认格式解析时间字符串
    * @param date 时间字符串 默认格式 {@link #DEFAULT_DATE_FORMAT}
    * @throws java.time.format.DateTimeParseException 解析异常
    * @return {@link LocalDate}
    */
   public static LocalDate parseLocalDate(String date) {
      return parseLocalDate(date, DEFAULT_DATE_FORMAT);
   }

   /**
    * 按照指定格式解析时间字符串
    * @param date        时间字符串
    * @param pattern  格式字符串 默认格式 {@link #DEFAULT_DATE_FORMAT}
    * @throws java.time.format.DateTimeParseException 解析异常
    * @return {@link LocalDate}
    */
   public static LocalDate parseLocalDate(String date, String pattern) {
      return LocalDate.parse(date, getFormatter(pattern));
   }

   // ================================ format LocalDateTime ========================

   /**
    * 获取当前时间字符串
    * 默认格式: yyyy-MM-dd HH:mm:ss
    * @throws java.time.DateTimeException 时间格式化异常
    */
   public static String formatDateTime() {
      return LocalDateTime.now().format(getFormatter(DEFAULT_DATETIME_FORMAT));
   }

   /**
    * 以给定的模式格式化当前时间
    * @param formatStr 格式字符串
    * @throws java.time.DateTimeException 时间格式化异常   
    */
   public static String formatDateTime(String formatStr) {
      return LocalDateTime.now().format(getFormatter(formatStr));
   }

   /**
    * 将指定的时间按照默认格式进行格式化
    * 默认格式: yyyy-MM-dd HH:mm:ss
    * @param dateTime 时间
    * @throws java.time.DateTimeException 时间格式化异常   
    */
   public static String formatDateTime(LocalDateTime dateTime) {
      return getFormatter(DEFAULT_DATETIME_FORMAT).format(dateTime);
   }

   /**
    * 将指定的时间按照指定格式进行格式化
    *
    * @param dateTime 时间
    * @param pattern  格式
    * @throws java.time.DateTimeException 时间格式化异常   
    */
   public static String formatDateTime(LocalDateTime dateTime, String pattern) {
      return getFormatter(pattern).format(dateTime);
   }

   // ================================ parse LocalDateTime ========================

   /**
    * 默认格式解析时间字符串
    * @param date 时间字符串 默认格式 {@link #DEFAULT_DATETIME_FORMAT}
    * @return {@link LocalDateTime}
    * @throws java.time.format.DateTimeParseException 解析异常
    */
   public static LocalDateTime parseLocalDateTime(String date) {
      return parseLocalDateTime(date, DEFAULT_DATETIME_FORMAT);
   }

   /**
    * 按照指定格式解析时间字符串
    * @param date        时间字符串
    * @param pattern  格式字符串 默认格式 {@link #DEFAULT_DATETIME_FORMAT}
    * @return {@link LocalDateTime}
    * @throws java.time.format.DateTimeParseException 解析异常
    */
   public static LocalDateTime parseLocalDateTime(String date, String pattern) {
      return LocalDateTime.parse(date, getFormatter(pattern));
   }

   // ================================ generic format ========================

   /**
    * 将字符串转换为时间实例, 转换方法自定义, 注意可能导致的异常
    *
    * @param str     目标字符串
    * @param function 转换方法
    * @param <R>     目标时间类型
    * @return       时间对象实例
    * @throws java.time.format.DateTimeParseException 解析异常
    */
   public static <R> R stringToTime(String str, Function<String, R> function) {
      return function.apply(str);
   }

   // ================================ legacy date transform ====================

   /**
    * 将 {@link Date} 转换为 {@link LocalDateTime}
    *
    * @param date {@link Date}
    * @return {@link LocalDateTime}
    */
   public static LocalDateTime convertDateToLocalDateTime(Date date) {
      return ZonedDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()).toLocalDateTime();
   }

   /**
    * 将 {@link Date} 转化为 {@link LocalDate}
    * @param date {@link Date}
    * @return {@link LocalDate}
    */
   public static LocalDate convertDateToLocalDate(Date date) {
      return ZonedDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()).toLocalDate();
   }

   /**
    * 获得特定格式的时间格式化器
    *
    * @param formatStr 格式字符串
    * @return {@link DateTimeFormatter}
    */
   private static DateTimeFormatter getFormatter(String formatStr) {
      return DateTimeFormatter.ofPattern(formatStr);
   }

   // ====================================== time arithmetic operation ============================

   /**
    * <p>计算两个时间的间距, 注意可能抛出的异常</p>
    * <p>以计算两个时间点相差的天数为例</p>
    * <ul>
    *     <li>如果传入的参数是 LocalDate 类型的, 则正常的计算天数, 比如 2022-11-02 和 2022-11-03 相差一天, 返回 1;</li>
    *     <li>如果传入的参数是 LocalDateTime 类型的, 则计算天数时考虑时间参数, 比如 2022-11-02 10:00:00 和 2022-11-03 09:00:00 没有相差天数, 返回 0, 表示属于同一天;</li>
    * </ul>
    * <p>注意区间: [begin, end)</p>
    * @param begin    起始时间, 包含
    * @param end  终止时间, 不包含
    * @param unit 相差时间的单位, 如 {@link ChronoUnit#DAYS}   
    * @return 整数值, 大于等于 0
    * @throws IllegalArgumentException 非法参数异常, 起始时间必须早于终止时间
    */
   public static long between(Temporal begin, Temporal end, TemporalUnit unit) {
      long between = unit.between(begin, end);
      if (between < 0)
         throw new IllegalArgumentException("参数 begin 代表的时间必须在 end 时间之前");
      return between;
   }

}
```



# OkHttp 工具类

```java
import okhttp3.HttpUrl;
import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class HttpUtils {
    
    private static final Logger log = LogManager.getLogger(HttpUtils.class);
    
    // http client must single instance for reuse thread pool
    // in addition, also can use OkHttpClient.Builder to custom client
    private static final OkHttpClient HTTP_CLIENT = new OkHttpClient.Builder()
            .writeTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .connectTimeout(10, TimeUnit.SECONDS)
            .callTimeout(10, TimeUnit.SECONDS).build();

    // JSON
    private static final MediaType JSON_CONTENT = MediaType.parse("application/json; charset=utf-8");

    // Form-data
    private static final MediaType FORM_DATA = MediaType.parse("multipart/form-data");
    
    /**
     * 无参数 get 调用
     * @param url 目标地址
     */
    public static ResponseWrapper get(String url) {
        Request request = new Request.Builder().url(url).build();

        try (Response response = HTTP_CLIENT.newCall(request).execute()) {
            return new ResponseWrapper.Builder().code(response.code()).body(response.body().string()).build();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * query 传参 get 调用
     * @param url    目标地址
     * @param params 参数
     */
    public static ResponseWrapper get(String url, Map<String, String> params) {
        HttpUrl.Builder urlBuilder = HttpUrl.parse(url).newBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            urlBuilder.addQueryParameter(entry.getKey(), entry.getValue());
        }
        Request request = new Request.Builder().url(urlBuilder.build()).build();

        return doSyncExecute(request);
    }

    /**
     * post 请求, json 传参, 支持自定义请求头
     * @param url       目标地址
     * @param json      请求体 json 参数
     * @param headers   请求头, 支持 null 或者空 map
     */
    public static ResponseWrapper post(String url, String json, Map<String, String> headers) {
        HttpUrl.Builder urlBuilder = HttpUrl.parse(url).newBuilder();
        RequestBody body = RequestBody.create(json, JSON_CONTENT);

        Request.Builder requestBuilder = new Request.Builder().url(urlBuilder.build()).post(body);
        
        if (headers != null || !headers.isEmpty()) {
            headers.forEach(requestBuilder::addHeader);
        }
        
        return doSyncExecute(requestBuilder.build());
    }

    /**
     * post 请求以 form-data 形式上传文件
     * 
     * @param url       上传地址
     * @param file      文件对象
     * @throws Exception 可能抛出的异常:
     * <ul>
     *     <li>{@link IllegalArgumentException}</li>
     *     <li>{@link FileNotFoundException}</li>
     * </ul>
     * 
     */
    public static ResponseWrapper postFile(String url, File file) throws Exception {
        if (file.isDirectory()) {
            throw new IllegalArgumentException("上传对象必须为文件, 不能是文件夹!");
        }
        if (!file.exists()) {
            throw new IllegalArgumentException("上传文件必须存在!");
        }
        
        FileInputStream fis = null;
        try {
            fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
            log.error("读取文件失败!");
            throw e;
        }
        byte[] bytes = new byte[fis.available() + 1000];
        fis.read(bytes);
        
        RequestBody requestBody = RequestBody.create(bytes, FORM_DATA);
        MultipartBody multipartBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", file.getName(), requestBody)
                .build();
        
        Request request = new Request.Builder().url(url).post(multipartBody).build();
        return doSyncExecute(request);
    }

    private static ResponseWrapper doSyncExecute(Request request) {
        try (Response response = HTTP_CLIENT.newCall(request).execute()) {
            return new ResponseWrapper.Builder().code(response.code()).body(response.body().string()).build();
        } catch (IOException e) {
            // TODO 这个地方应该打印更详细的日志, 包括 HTTP status code、body 等等
            log.error("okHttp 调用远程接口失败... exception: {}", e.toString());
            throw new RuntimeException(e);
        }
    }

    public static class ResponseWrapper {
        
        private Integer statusCode;
        
        private String responseBody;

        public ResponseWrapper() {
        }

        public ResponseWrapper(Integer statusCode, String responseBody) {
            this.statusCode = statusCode;
            this.responseBody = responseBody;
        }

        public Integer getStatusCode() {
            return statusCode;
        }

        public void setStatusCode(Integer statusCode) {
            this.statusCode = statusCode;
        }

        public String getResponseBody() {
            return responseBody;
        }

        public void setResponseBody(String responseBody) {
            this.responseBody = responseBody;
        }

        @Override
        public String toString() {
            return "ResponseWrapper {\n" +
                    "\tstatusCode = " + statusCode +
                    ",\n\tresponseBody = '" + responseBody + '\'' + "\n" +
                    '}';
        }
        
        public static class Builder {
            
            private final ResponseWrapper resp = new ResponseWrapper();
            
            Builder code(Integer code) {
                resp.setStatusCode(code);
                return this;
            }
            
            Builder body(String body) {
                resp.setResponseBody(body);
                return this;
            }
            
            ResponseWrapper build() {
                return resp;
            }
        }
    }
}
```



# EasyExcel 通用读监听器

```java
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.alibaba.excel.util.ListUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.util.List;
import java.util.function.Consumer;

/**
 * 通用 Excel 读监听器
 */
public class GenericDataListener<E> implements ReadListener<E> {

    private static final Logger LOG = LogManager.getLogger(GenericDataListener.class);
    
    // 分批读取 Excel 行数据
    private static final int BATCH_SIZE = 10000;
    
    private List<E> cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_SIZE);
    
    private Consumer<List<E>> consumer;
    
    public GenericDataListener(Consumer<List<E>> consumer) {
        this.consumer = consumer;
    }
    
    // 解析 Excel 的每一行数据
    @Override
    public void invoke(E data, AnalysisContext context) {
        cachedDataList.add(data);
        if (cachedDataList.size() >= BATCH_SIZE) {
            // do something
            this.consumer.accept(cachedDataList);
            cachedDataList = ListUtils.newArrayListWithExpectedSize(BATCH_SIZE);
        }
    }

    // 所有数据解析完成, 会调用该方法
    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        this.consumer.accept(this.cachedDataList);
        if (LOG.isInfoEnabled())
            LOG.info("所有数据解析完毕.");
    }

    public Consumer<List<E>> getConsumer() {
        return consumer;
    }

    public void setConsumer(Consumer<List<E>> consumer) {
        this.consumer = consumer;
    }

}
```

