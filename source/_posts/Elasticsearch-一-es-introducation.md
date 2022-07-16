---
title: Elasticsearch (一) es introducation
author: NaiveKyo
top: false
hide: false
img: 'https://cdn.jsdelivr.net/gh/NaiveKyo/CDN/img/20220425110320.jpg'
coverImg: /img/20220425110320.jpg
cover: false
toc: true
mathjax: false
date: 2022-07-16 17:53:32
summary: "Elasticsearch 入门: HTTP 查询与 Java 客户端"
categories: "Elasticsearch"
keywords: "Elasticsearch"
tags: "Elasticsearch"
---

# 一、Elasticsearch 概述

数据分类：

- 结构化数据（有关系的数据，可以抽象出来用关系型数据库存储，缺点：当现有的结构固定后，不容易扩展）；
- 非结构化数据（一般使用非结构化的数据库，如 Redis、MongoDB、HBase 等等存储，通常是 key value 的形式，通过 key 来查询相对比较快）；
- 半结构化数据（结构和数据混杂在一起，比如 xml、html，一般也是保存到 Redis、MongoDB、HBase 这样的数据库中，缺点就是查询内容不是很容易）。

通常将存储的数据查询出来是一个很重要的功能，但是对于某些数据我们很难从多个维度进行查询，比如全文搜索，模糊匹配等等，而 ES 正是为了解决这个问题而诞生的。

## 1、Elastic Search 是什么

Elastic Search 是一个分布式、RESTFul 风格的搜索和数据分析引擎，作为 Elastic Stack 的核心，它集中存储我们的数据。

`The Elastic Stack`，包括 `Elasticsearch`（存储和搜索数据）、`Kibana`（数据可视化）、`Beats` 和 `Logstash`（后两者用于采集和传输数据）（也成为 ELK Stack）。能够安全可靠的获取任何来源、任何格式的数据，然后实时的对数据进行检索、分析和可视化 。

Elasticsearch 简称 ES，是一个开源的高扩展的分布式全文搜索引擎，是整个 Elastic Stack 技术栈的核心。它可以近乎实时的存储、检索数据；本身扩展性也很好，可以扩展到上百台服务器，处理 PB 级别的数据。

## 2、全文搜索是什么

Google、百度之类的网站，它们都是根据网站中的关键字生成索引，我们在搜索的时候输入关键字，它们将关键字（即索引）匹配到的所有网站返回；还有常见的项目中应用日志的搜索；博客网站中对博文的检索等等。对于这些非结构化的数据，关系型数据库不能很好的支持（即使进行 SQL 层面、索引层面的优化也不能满足需求）。

一般传统数据库，全文搜索都实现的很鸡肋，因为一般也没有人用数据库存储文本字段。进行全文检索需要扫描整个表，如果数据量大的话即使对 SQL 语句进行语法优化，也收效甚微。建立了索引，但是维护起来比较麻烦，对于 insert 和 update 操作都会重新建立索引。

基于以上原因分析可知，在一些生产环境中，使用常规的检索方式，性能是非常差的：

- 搜索的数据对象是大量的非结构化的文本数据；
- 文件记录量达到数十万或数百万甚至更多；
- 支持大量基于交互式文本的查询；
- 需求非常灵活的全文搜索查询；
- 对高度相关的搜索结构有特殊需求，但是没有可用的关系数据库可以满足；
- 对于不同记录类型、非文本数据操作或者安全事务处理的需求相对较少的情况。

为了解决结构化数据搜索和非结构化数据搜索性能问题，我们就需要专业，健壮，强大的全文搜索引擎。

这里说到的全文搜索引擎指的是目前广泛应用的主流搜索引擎。它的工作原理是计算机索引程序通过扫描文章的每一个词，对每一个词建立一个索引，指明该词在文章中出现的次数和位置，当用户查询时，检索程序就根据事先建立好的索引进行查找，并将查找的结果反馈给用户的检索方式。这个过程类似于通过字典中的检索字表查字的过程。

## 3、Lucene 介绍

`Lucene` 是 Apache 软件基金会 `Jakarta` 项目组的一个子项目，提供了一个简单却强大的应用程序接口，能够做全文索引和搜寻。在 Java 开发环境里 Lucene 是一个成树的免费开源的工具。就其本身而言，Lucene 是当前以及最近几年最受欢迎的免费 Java 信息检索程序库。但 Lucene 只是一个提供全文搜索功能类库的核心工具包，想要真正使用它还需要搭建一个完善的服务框架来进行应用。

## 4、Elasticsearch And Solr （技术选型）

`Elasticsearch` 和 `Solr` 的内核都是基于 `Lucene` 的，在使用时，一般会将它俩进行对比，然后进行选型，这两个都是比较流行的，先进的开源搜索引擎，都是围绕核心底层搜索库 —— `Lucene` 构建的，但是它们又是不同的，各有优缺点：

| 特征              | Solr/SolrCloud                                               | Elasticsearch                                                |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 社区和开发者      | Apache 软件基金会和社区                                      | 单一商用实体及其员工                                         |
| 节点发现          | Apache Zookeeper，在大量项目中成熟且经过实战测试             | Zen 内置于 Elasticsearch 本身，需要专用的主节点才能进行分裂脑保护 |
| 碎片放置          | 本质上是静态的，需要手动进行迁移分片，从 Solr 7 开始，Autoscaling API 允许一些动态操作 | 动态，可以根据集群状态按需移动分片                           |
| 高速缓存          | 全局，每个段无法更改                                         | 每段，更适合动态更改数据                                     |
| 分析引擎性能      | 基于 Lucene 的语言分析，多建议，拼写检查，丰富的高亮显示支持， | 基于 Lucene 的语言分析，单一建议 API 实现，高亮显示重新计算  |
| DevOps 支持       | 尚未完全，但即将到来                                         | 非常好的 API                                                 |
| 非平面数据处理    | 嵌套文档和父 - 子支持                                        | 嵌套和对象类型的自然支持允许近乎无限的嵌套和父 - 子支持      |
| 查询 DSL          | JSON（有限）、XML（有限）或 URL 参数                         | JSON                                                         |
| 索引/收集领导控制 | 领导者安置控制和领导者重新平衡甚至可以节点上负载             | 不可能                                                       |
| 机器学习          | 内置 - 在流聚合之上，专注于逻辑回归和学习排名贡献模块        | 商业功能，专注于异常和异常值以及时间序列数据                 |

## 5、Elasticsearch Or Solr

Elasticsearch 和 Solr 都是开源搜索引擎，那么在使用时该如何选择呢？

- Google 搜索趋势表明，与 Solr 相比，Elasticsearch 具有更大的吸引力，但这并不意味着 Apache Solr 已经死亡。虽然有些人可能这么认为，但 Solr 仍是最受欢迎的搜索引擎之一，拥有强大的社区和开源支持；
- 与 Solr 相比，Elasticsearch 易于安装且非常轻巧。此外，你可以在几分钟之内安装并运行 Elasticsearch。但是，如果 Elasticsearch 管理不当，这种易于部署和使用可能成为一个问题。基于 JSON 的配置很简单，但如果要为文件中的每个配置指定注释，那么它不适合您。总的来说，如果你的应用使用的是 JSON，那么 Elasticearch 是一个更好的选择。否则，请使用 Solr，因为它的 schema.xml 和 solrconfig.xml 都有很好的文档记录； 
- Solr 拥有更大、更成熟的用户，开发者和贡献者社区。ES 虽然拥有规模较小但活跃的用户社区以及不断增长的贡献者社区。Solr 的贡献者和提交者来自许多不同的组织，而 Elasticsearch 提交者来自单个公司；
- Solr 更成熟，但 ES 增长迅速，更稳定；
- Solr 是一个非常有据可查的产品，具有清晰的示例和 API 应用场景。Elasticsearch 的文档组织良好，但它缺乏好的示例和清晰的配置说明。

> 如何选择？

从需求层面进行考虑 ：

- 由于易于使用，Elasticsearch 在新开发者中更受欢迎，一个下载和一个命令就可以启动一切；
- 如果除了搜索文本之外还需要它来处理查询分析，ES 是更好的选择；
- 如果需要分布式索引，则需要选择 ES。对于需要良好可伸缩性以及性能分布式环境，ES 是更好的选择；
- ES 在开源日志管理用例中占据主导地位，许多组织在 ES 中索引它们的日志使其可搜素；
- 如果喜欢监控和指标，那么请使用 ES，因为相对 Solr，ES 暴露了更多关键指标。

# 二、Elasticsearch 入门

## 1、安装

ES 下载地址：[中文官方地址](https://www.elastic.co/cn/)

截止 2022 年 7 月 13 日，当前最新的版本是 8.3.2，在[历史版本](https://www.elastic.co/cn/downloads/past-releases#elasticsearch)中我们选择 7.0 的最后一个版本 7.17.5 进行下载（根据平台自行选择），Windows 版本下是一个 zip 压缩包。

[Github 地址](https://github.com/elastic/elasticsearch)

解压后目录说明：

```
- bin		# 可执行脚本
- config	# 配置文件
- jdk		# 内置的 Java 环境，但是一般我们会使用自己配置的 Java 环境
- lib		# jar 包
- logs		# 日志
- modules	# 模块
- plugins	# 插件
```

Windows 平台上使用 bin 目录下的 `elasticsearch.bat`  可执行脚本启动 ES。

启动后有两个端口需要注意：

- 9300 端口为 ES 集群间组件通信的端口，9200 为浏览器访问的 http 协议 RESTful 端口。

打开浏览器输入：`http://localhost:9200/`，按下回车后出现 JSON 字符串，则说明启动成功。

> 可能出现的问题

- JDK 版本问题，ES 7.x 需要 JDK 1.8 及以上版本，默认的 ES 安装包中含有 JDK 环境，但是如果系统中配置了 `JAVA_HOME` 系统变量，则使用系统配置的 JDK；
- 如果双击启动文件后，命令窗口一闪而逝，可以查看日志跟踪错误，如果提示 "空间不足"，可以修改配置文件中 `config.jvm.options` 配置文件。

## 2、数据格式

ES 是面向文档型数据库，一条数据在这里就是一个文档，我们可以将 ES 存储文档数据和 MySQL 存储数据的概念做一个比对：

| 名称          | Schema             |              |                   |                |
| ------------- | ------------------ | ------------ | ----------------- | -------------- |
| Elasticsearch | Index（索引）      | Type（类型） | Documents（文档） | Fields（字段） |
| MySQL         | Database（数据库） | Table（表）  | Row（行）         | Column（列）   |

ES 里的 Index 可以看作是一个库，而 Types 相当于表，Documents 则相当于表的行。

但是后来发现这种对比存在不合理的地方，在后来 Types 的概念被逐渐弱化，ES 6.x 中一个 index 下已经只能包含一个 type，ES 7.x 中，Type 的概念已经被彻底删除。

> 倒排索引

在传统的关系型数据库中我们通过索引来优化查询速度，一张表中最常见的是主键索引，比如现在有这样的情况：

| 主键 | 内容（字符串） |
| ---- | -------------- |
| 1    | this is A.     |
| 2    | this is B.     |

可以将这种索引称之为正排（正向）索引，从索引到数据。

但是如果出现了这样的需求，比如对内容进行模糊查询，此时索引就失效了，数据库会全表检索并对内容字段逐条遍历匹配，而且这个过程可能涉及到大小写的问题。在这种情况下传统的关系型数据库效率较低，无法满足需求。

在 ES 中，使用了倒排索引的概念，以上面的例子继续说明，将文章内容关键字作为索引：

| 关键字 | id   |
| ------ | ---- |
| A      | 1    |
| B      | 2    |
| this   | 1，2 |

此时查询时会匹配关键字索引，进而找到对应的数据集合，最终找到匹配的文档内容。

## 3、索引 Index 操作

结合前面 ES 和 MySQL 的对比，在 MySQL 中我们要检索数据首先需要指定数据库，在 ES 中就需要指定索引。

### （1）创建索引

**创建索引就等同于创建数据库**

通过 API 工具向 ES 服务端发送请求：

```
# 请求
PUT http://127.0.0.1:9200/shopping

# 返回数据
{
	"acknowledged": true,
	"shards_acknowledged": true,
	"index": "shopping"
}
```

多次发送 PUT 请求只会生效一次，后续操作就会提示 index 已存在，返回 400。

如果使用 POST 请求：

```
POST http://127.0.0.1:9200/shopping

# 返回数据
{
	"error": "Incorrect HTTP method for uri [/shopping] and method [POST], allowed: [GET, HEAD, PUT, DELETE]",
	"status": 405
}
```

会发现对索引的操作不支持 POST 请求。

### （2）索引查询和删除

```
# 请求
GET http://127.0.0.1:9200/shopping

# 响应结果
{
	"shopping": {
		"aliases": {},
		"mappings": {},
		"settings": {
			"index": {
				"routing": {
					"allocation": {
						"include": {
							"_tier_preference": "data_content"
						}
					}
				},
				"number_of_shards": "1",
				"provided_name": "shopping",
				"creation_date": "1657778852909",
				"number_of_replicas": "1",
				"uuid": "xZdBqKgiR4OF_n0qo-G7vw",
				"version": {
					"created": "7170599"
				}
			}
		}
	}
}
```

查询所有索引信息：

```
GET http://127.0.0.1:9200/_cat/indices?v

health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   shopping xZdBqKgiR4OF_n0qo-G7vw   1   1          0            0       226b           226b
```

删除指定索引：

```
DELETE http://127.0.0.1:9200/shopping

{
	"acknowledged": true
}
```

## 4、文档 document 操作

### （1）创建文档

索引已经建立好了，下面来创建文档，并添加数据。这里的文档可以类比为关系型数据库中的表（ES 7+），添加文档的数据格式也是 JSON 格式。

```
# 请求
# 创建 shopping 索引
PUT http://127.0.0.1:9200/shopping
# 向指定索引中添加文档
POST http://127.0.0.1:9200/shopping/_doc
# 请求体
{
    "title": "小米手机",
    "category": "小米",
    "price": 3999.00
}

# 响应结果
{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "eol3-4EBHWtzhPvKFDy9",
	"_version": 1,
	"result": "created",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 0,
	"_primary_term": 1
}
```

注意如果使用 PUT 去添加，PUT 请求就会被拒绝，只能使用 POST 添加文档资源，这也符合 RESTful 的要求。

上述参数：

- `_index`：目标索引名称；
- `_type`：类型，此处表明为文档数据；
- `_id`：文档唯一标识，每次生成的都不一样，用于标识文档数据；（也说明了 POST 请求不是幂等性的）
- `result`：执行结果，此处表示创建成功；

可以看到上述生成的 id 非常复杂不容易辨识，我们也可以在请求中添加自定义 id：

```
POST http://127.0.0.1:9200/shopping/_doc/1001

# 请求体参数
{
    "title": "小米手机",
    "category": "小米",
    "price": 3999.00
}

# 响应结果
{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "1001",
	"_version": 1,
	"result": "created",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 3,
	"_primary_term": 1
}
```

此时如果连续发送上述 POST 请求，会发现返回结果中 `_version` 字段不断递增，其他内容不变。

换成 PUT 请求也是可以的（URL 中的文档名称可以定义，但是必须符合规范，以 _ 开头）：

```
PUT http://127.0.0.1:9200/shopping/_create/1002

{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "1002",
	"_version": 1,
	"result": "created",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 6,
	"_primary_term": 1
}
```

### （2）文档查询

> （1）根据主键查询指定数据

可以依赖主键查询，例如下面的请求，首先指定 index 名称、指定 document 名称、指定主键，最终得到数据：

```
GET http://127.0.0.1:9200/shopping/_doc/1001

{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "1001",
	"_version": 3,
	"_seq_no": 5,
	"_primary_term": 1,
	"found": true,
	"_source": {
		"title": "小米手机",
		"category": "小米",
		"price": 3999
	}
}
```

> （2）查询指定索引下的所有文档数据（**全量查询**）

指定索引后以 `_search` 表示查询动作：

```
GET http://127.0.0.1:9200/shopping/_search

{
	"took": 539,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 6,
			"relation": "eq"
		},
		"max_score": 1,
		"hits": [
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "eol3-4EBHWtzhPvKFDy9",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "e4l6-4EBHWtzhPvK3zy7",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "fIl6-4EBHWtzhPvK5Dx9",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "1001",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "1002",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "1003",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			}
		]
	}
}
```

说明：

- `took`：耗费时间；
- `timed_out`：是否超时；
- `_shards`：状态信息；
- `hits`：命中信息，里面包含查询的结果，现在是查询所有数据；

### （3）全局修改&局部修改&删除

（1）全局修改

首先是全量数据更新，在 URL 中指定文档名称，下面是 `_doc`，然后指定主键，此时可以使用 PUT 它是幂等的：

```
# 请求
PUT http://127.0.0.1:9200/shopping/_doc/1001

# 请求体
{
    "title": "小米手机",
    "category": "小米",
    "price": 4999.00
}

# 响应参数
{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "1001",
	"_version": 4,
	"result": "updated",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 8,
	"_primary_term": 1
}
```

可以看到执行状态 `result` 是 `updated` 表示修改成功。

（2）局部修改

但是在大部分情况下我们不会修改所有的数据，而是仅仅修改其中一部分，此时每次修改都会对资源造成影响，因此不是幂等的，需要使用 POST 请求：

```
POST http://127.0.0.1:9200/shopping/_update/1001

{
    "doc": {
        "title": "华为手机"
    }
}

{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "1001",
	"_version": 5,
	"result": "updated",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 9,
	"_primary_term": 1
}
```

可以看到在 URL 中没有指定文档名称，而是用了 `_update` 表示修改动作，然后指定要修改文档的 id，最终结果可以看到修改成功，且相关状态都发生变化。

（3）删除

指定索引、指定文档名称、指定主键：

```
DELETE http://127.0.0.1:9200/shopping/_doc/1001

{
	"_index": "shopping",
	"_type": "_doc",
	"_id": "1001",
	"_version": 6,
	"result": "deleted",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 10,
	"_primary_term": 1
}
```

如果再次发送相同的删除请求，会发现提示 not_found，表明删除也是幂等性操作。

## 5、条件查询&分页查询&排序查询

### （1）条件查询

以全量查询为基础，`http://127.0.0.1:9200/shopping/_search`

例如下面的查询分类为小米手机的文档数据（`q=category:小米`）

```
GET http://127.0.0.1:9200/shopping/_search?q=category:小米

{
	"took": 44,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 3,
			"relation": "eq"
		},
		"max_score": 0.12907705,
		"hits": [
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "eol3-4EBHWtzhPvKFDy9",
				"_score": 0.12907705,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "e4l6-4EBHWtzhPvK3zy7",
				"_score": 0.12907705,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "fIl6-4EBHWtzhPvK5Dx9",
				"_score": 0.12907705,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			}
		]
	}
}
```

上述的请求我们是通过 URL 携带参数，且参数含有中文，可能会存在乱码问题，所以一般可以通过请求体携带查询参数：

```
GET http://127.0.0.1:9200/shopping/_search

{
    "query": {
        "match": {
            "category": "小米"
        }
    }
}

{
	"took": 3,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 3,
			"relation": "eq"
		},
		"max_score": 0.14821595,
		"hits": [
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "eol3-4EBHWtzhPvKFDy9",
				"_score": 0.14821595,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "e4l6-4EBHWtzhPvK3zy7",
				"_score": 0.14821595,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "fIl6-4EBHWtzhPvK5Dx9",
				"_score": 0.14821595,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			}
		]
	}
}
```

上述是以 GET + 请求体的方式进行条件查询，如果以这种方式进行全量查询呢，此时可以将请求体参数这样修改：

```
{
    "query": {
        "match_all": {
            
        }
    }
}
```

### （2）分页查询

有时候查询的数据过多，我们可以做一个分页处理，比如以上的全量查询为基础：

```
GET http://127.0.0.1:9200/shopping/_search

{
    "query": {
        "match_all": {
            
        }
    },
    "from": 0,
    "size": 2
}

{
	"took": 1,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 5,
			"relation": "eq"
		},
		"max_score": 1,
		"hits": [
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "eol3-4EBHWtzhPvKFDy9",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "e4l6-4EBHWtzhPvK3zy7",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			}
		]
	}
}
```

参数说明：

- `total`：查询的数据总量相关信息；

- `from`：当前页的起始位置，默认从 0 开始；

- `size`：每页查询的数据条数。

  此处需要注意的是，上面的响应参数中表示共有 5 条数据，现在我们查询的是第一页第一条和第二条共两条数据，如果要查询第二页的数据，此时有一个计算公式：**（页码 - 1）* 每页数据条数**。

第一页：`{ 'from' : 0, 'size' : 2 }`

第二页：`{ 'from': (2 - 1) * size, 'size': 2 }` 即 `{ 'from' : 2, 'size' : 2 }`

第三页：`{ 'from' : 4, 'size' : 2 }`

### （3）分页条件查询

如果想要从分页查询的结果中过滤数据，就需要对数据源（查询结果中 `_source` 表示的文档内容）进行过滤，修改请求体参数：

```
{
    "query": {
        "match_all": {
            
        }
    },
    "from": 0,
    "size": 2,
    "_source": ["title"]
}
```

使用 `_source` 字段，传递一个数组，里面包含指定查询的文档内容，比如这里只查询出文档中 `title` 字段内容。

### （4）查询排序

修改查询请求参数：

```
{
    "query": {
        "match_all": {
            
        }
    },
    "from": 0,
    "size": 2,
    "_source": ["title", "price"],
    "sort": {
        "price": {
            "order": "desc"
        }
    }
}
```

利用  `sort` 指定排序字段，利用 `order` 指定是升序 `asc` 还是降序 `desc`。

## 6、多条件查询&范围查询

首先看看多条件查询，例如下面这样：

```
GET http://127.0.0.1:9200/shopping/_search

{
    "query": {
        "bool": {
            "must": [
                {
                    "match": {
                        "category": "小米"
                    }
                },
                {
                    "match": {
                        "price": 1999.00
                    }
                }
            ]
        }
    }
}
```

使用 `must` 表示多条件必须同时成立，类似于 SQL 中的 `and`。

```
GET http://127.0.0.1:9200/shopping/_search

{
    "query": {
        "bool": {
            "should": [
                {
                    "match": {
                        "category": "小米"
                    }
                },
                {
                    "match": {
                        "category": "华为"
                    }
                }
            ]
        }
    }
}
```

此处使用 `should` 表示多条件中只要有一个成立就会查询到，类似于 SQL 中的 `or`。

```
{
    "query": {
        "bool": {
            "should": [
                {
                    "match": {
                        "category": "小米"
                    }
                },
                {
                    "match": {
                        "category": "华为"
                    }
                }
            ],
            "filter": {
                "range": {
                    "price": {
                        "gt": 5000
                    }
                }
            }
        }
    }
}
```

此处使用 `filter` 对查询结果进行过滤，结合 `range` 范围查询，本例表示价格大于 5000 的手机。

## 7、全文检索&完全匹配&高亮查询

> （1）全文检索&完全匹配

如果在全查询中携带下面的参数：

```
{
    "query": {
        "match": {
            "category": "米"
        }
    }
}
```

会发现即使我们使用了一部分关键字依然是可以查询到数据，这是因为在保存文档的时候，ES 会对相关内容进行分词拆解操作，并将拆解后的数据保存到倒排索引中，这样即使输入文字的一部分也可以查询到数据。（具体就是将**查询参数也进行分词然后和倒排索引进行匹配，将所有匹配到的结果返回**）

如果不想对查询参数进行分词，而是要求完全匹配，可以修改查询参数：

```
{
    "query": {
        "match_phrase": {
            "category": "米华"
        }
    }
}
```

如果使用 `match` 此时会将华为和小米的手机全部查询出来，如果使用 `match_phrase` 则不会匹配到数据，注意这里的匹配指定是和 ES 倒排索引进行完全匹配。

> （2）高亮显示

如果要高亮显示指定字段可以这样：

```
{
    "query": {
        "match_phrase": {
            "category": "米"
        }
    },
    "highlight": {
        "fields": {
            "category": {}
        }
    }
}
```

响应结果：

```
{
	"took": 46,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 5,
			"relation": "eq"
		},
		"max_score": 0.074107975,
		"hits": [
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "eol3-4EBHWtzhPvKFDy9",
				"_score": 0.074107975,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				},
				"highlight": {
					"category": [
						"小<em>米</em>"
					]
				}
			}
		]
	}
}
```

可以看到将查询到的指定 field 中的指定内容进行了高亮处理（样式）。

## 8、聚合查询

比如我们要统计不同价格产品的数量，可以做这样的聚合操作：

```
GET http://127.0.0.1:9200/shopping/_search

{
    "aggs": {               // 聚合操作
        "price_group": {    // 自定义聚合后的字段名称
            "terms": {      // 分组操作
                "field": "price"    // 分组字段
            }
        }
    }
}

{
	"took": 33,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 5,
			"relation": "eq"
		},
		"max_score": 1,
		"hits": [
			{
				"_index": "shopping",
				"_type": "_doc",
				"_id": "eol3-4EBHWtzhPvKFDy9",
				"_score": 1,
				"_source": {
					"title": "小米手机",
					"category": "小米",
					"price": 3999
				}
			},
			// ......
		]
	},
	"aggregations": {
		"price_group": {
			"doc_count_error_upper_bound": 0,
			"sum_other_doc_count": 0,
			"buckets": [
				{
					"key": 3999,
					"doc_count": 5
				}
			]
		}
	}
}
```

可以看到最后显示价格为 3999 的产品共有 5 个，但是上面的结构中也包含了原始数据，如果不想查询出原始数据，可以这样做：

```
{
    "aggs": {               // 聚合操作
        "price_group": {    // 自定义聚合后的字段名称
            "terms": {      // 分组操作
                "field": "price"    // 分组字段
            }
        }
    },
    "size": 0
}
```

关于分组的操作，主要有以下几种：

- `terms`：数量统计；
- `avg`：平均值
- ...... 参考网上文档

## 9、映射关系

有的 field 可以分词查询，而有的则不可以，我们如何界定这个关系就涉及到 ES 的映射关系（有些类似于 MySQL 字段属性）。

```
# 创建新的索引
PUT http://127.0.0.1:9200/user

# 向索引中创建文档
POST http://127.0.0.1:9200/user/_mapping

# 请求参数
{
    "properties": {
        "name": {
            "type": "text",
            "index": true
        },
        "sex": {
            "type": "keyword",
            "index": true
        },
        "phone": {
            "type": "keyword",
            "index": false
        }
    }
}

# 响应结果
{
	"acknowledged": true
}
```

这次我们首先定义了文档的结构：

- `type`：field 类型
  - `text`：表示文本，可以进行分词；
  - `keyword`：关键字，表示不能分词，必须完整匹配
- `index`：布尔值，表示该字段是否可以被索引查询

现在向文档中添加数据：

```
POST http://127.0.0.1:9200/user/_create/1001

{
    "name": "校长",
    "sex": "男的",
    "phone": "1111"
}

{
	"_index": "user",
	"_type": "_doc",
	"_id": "1001",
	"_version": 1,
	"result": "created",
	"_shards": {
		"total": 2,
		"successful": 1,
		"failed": 0
	},
	"_seq_no": 0,
	"_primary_term": 2
}
```

插入一条数据后测试查询：

```
GET http://127.0.0.1:9200/user/_search

{
    "query": {
        "match": {
            "name": "长"
        }
    }
}
```

可以查询到刚刚插入的数据。

测试：

```
{
    "query": {
        "match": {
            "sex": "男"
        }
    }
}

{
	"took": 2,
	"timed_out": false,
	"_shards": {
		"total": 1,
		"successful": 1,
		"skipped": 0,
		"failed": 0
	},
	"hits": {
		"total": {
			"value": 0,
			"relation": "eq"
		},
		"max_score": null,
		"hits": []
	}
}
```

可以看到此时就无法查询到数据了，因为 `keyword` 要求完全匹配。

测试：

```
{
    "query": {
        "match": {
            "phone": "1111"
        }
    }
}

{
	"error": {
		"root_cause": [
			{
				"type": "query_shard_exception",
				"reason": "failed to create query: Cannot search on field [phone] since it is not indexed.",
				"index_uuid": "U0Lu5FiZSKWbNAvQtkg6jA",
				"index": "user"
			}
		],
		"type": "search_phase_execution_exception",
		"reason": "all shards failed",
		"phase": "query",
		"grouped": true,
		"failed_shards": [
			{
				"shard": 0,
				"index": "user",
				"node": "aR2c_7ffRiSYu91N3mdtPA",
				"reason": {
					"type": "query_shard_exception",
					"reason": "failed to create query: Cannot search on field [phone] since it is not indexed.",
					"index_uuid": "U0Lu5FiZSKWbNAvQtkg6jA",
					"index": "user",
					"caused_by": {
						"type": "illegal_argument_exception",
						"reason": "Cannot search on field [phone] since it is not indexed."
					}
				}
			}
		]
	},
	"status": 400
}
```

可以看到查询失败，因为设置了 `index : false` 后，该字段无法被索引，无法被匹配。

# 三、Java 连接 Elasticsearch

创建 Maven 项目，导入依赖（注意这里 ES 的版本要和自己机器上的 ES 匹配）：

```xml
<dependencies>

    <!-- es 7.17.5 -->
    <dependency>
        <groupId>org.elasticsearch</groupId>
        <artifactId>elasticsearch</artifactId>
        <version>7.17.5</version>
    </dependency>

    <!-- es 高版本的客户端 -->
    <dependency>
        <groupId>org.elasticsearch.client</groupId>
        <artifactId>elasticsearch-rest-high-level-client</artifactId>
        <version>7.17.5</version>
    </dependency>

    <!-- ES 现在推荐的 Java 客户端 -->
    <!--<dependency>-->
    <!--    <groupId>co.elastic.clients</groupId>-->
    <!--    <artifactId>elasticsearch-java</artifactId>-->
    <!--    <version>7.17.5</version>-->
    <!--</dependency>-->

    <!-- es 依赖于 2.x 的 log4j -->
    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-api</artifactId>
        <version>2.17.1</version>
    </dependency>

    <dependency>
        <groupId>org.apache.logging.log4j</groupId>
        <artifactId>log4j-core</artifactId>
        <version>2.17.1</version>
    </dependency>

    <!-- 单元测试 -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
    </dependency>

    <!-- jackson 序列化 -->
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <version>2.10.4</version>
    </dependency>

</dependencies>
```

## 1、测试连接

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 关闭 ES 客户端
    esClient.close();
}
```

## 2、测试索引操作

### （1）创建索引

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 创建索引
    CreateIndexRequest request = new CreateIndexRequest("user");
    CreateIndexResponse createIndexResponse = esClient.indices().create(request, RequestOptions.DEFAULT);

    // 响应状态
    boolean acknowledged = createIndexResponse.isAcknowledged();
    System.out.println("索引操作: " + (acknowledged ? "acknowledged" : "failure"));
    // 索引操作: acknowledged

    esClient.close();
}
```

PS：这里会提示 ES 没有开启认证，不安全，暂时不用管。

### （2）查询索引

```java
public static void main(String[] args) throws IOException {
        
        // 创建 ES 客户端
        RestHighLevelClient esClient = new RestHighLevelClient(
                RestClient.builder(new HttpHost("localhost", 9200, "http"))
        );

        // 查询索引
        GetIndexRequest request = new GetIndexRequest("user");
        GetIndexResponse response = esClient.indices().get(request, RequestOptions.DEFAULT);
        
        // 响应信息
        System.out.println(response.getAliases());
        System.out.println(response.getMappings());
        System.out.println(response.getSettings());

        esClient.close();
    }
```



### （3）删除索引

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 删除索引
    DeleteIndexRequest request = new DeleteIndexRequest("user");
    AcknowledgedResponse response = esClient.indices().delete(request, RequestOptions.DEFAULT);

    boolean acknowledged = response.isAcknowledged();

    System.out.println("删除操作: " + (acknowledged ? "acknowledged" : "failure"));

    esClient.close();
}
```

## 3、测试文档操作

### （1）插入数据

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 插入操作
    IndexRequest userIndexRequest = new IndexRequest();

    userIndexRequest.index("user").id("1001");

    Document document = new Document();
    document.setName("张三");
    document.setAge(30);
    document.setSex("男");
    // ES 接受的是 JSON 数据
    ObjectMapper mapper = new ObjectMapper();
    String userJSON = mapper.writeValueAsString(document);

    userIndexRequest.source(userJSON, XContentType.JSON);

    // 开始向 ES 中插入数据
    IndexResponse response = esClient.index(userIndexRequest, RequestOptions.DEFAULT);

    System.out.println(response.getResult());       // CREATED
    System.out.println(response.getSeqNo());
    System.out.println(response.getShardId());
    System.out.println(response.getShardInfo());

    // 关闭客户端
    esClient.close();
}
```



### （2）修改操作

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 修改操作
    UpdateRequest updateRequest = new UpdateRequest();
    updateRequest.index("user").id("1001");
    // 局部修改
    updateRequest.doc(XContentType.JSON, "sex", "女");

    UpdateResponse response = esClient.update(updateRequest, RequestOptions.DEFAULT);

    System.out.println(response.getResult());	// UPDATED

    // 关闭客户端
    esClient.close();
}
```

可以看到 Java API 和前面使用 HTTP 请求的方式都是一一对应的。



### （3）查询数据

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 查询操作
    GetRequest getRequest = new GetRequest();
    getRequest.index("user").id("1001");

    GetResponse response = esClient.get(getRequest, RequestOptions.DEFAULT);

    System.out.println(response.getSourceAsString());
    // {"name":"张三","sex":"女","age":30}

    // 关闭客户端
    esClient.close();
}
```



### （4）删除数据

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 删除操作
    DeleteRequest deleteRequest = new DeleteRequest();
    deleteRequest.index("user").id("1001");

    DeleteResponse deleteResponse = esClient.delete(deleteRequest, RequestOptions.DEFAULT);

    System.out.println(deleteResponse.toString());
    // DeleteResponse[index=user,type=_doc,id=1001,version=3,result=deleted,shards=ShardInfo{total=2, successful=1, failures=[]}]

    // 关闭客户端
    esClient.close();
}
```

### （5）批量新增

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 批量插入数据
    BulkRequest bulkRequest = new BulkRequest();

    bulkRequest.add(new IndexRequest().index("user").id("1001").source(XContentType.JSON, "name", "张三"))
        .add(new IndexRequest().index("user").id("1002").source(XContentType.JSON, "name", "李四"))
        .add(new IndexRequest().index("user").id("1003").source(XContentType.JSON, "name", "王五"));

    BulkResponse response = esClient.bulk(bulkRequest, RequestOptions.DEFAULT);

    System.out.println(response.getTook()); // 耗费时间
    System.out.println(response.getItems());

    // 关闭客户端
    esClient.close();
}
```



### （6）批量删除

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 批量删除数据
    BulkRequest bulkRequest = new BulkRequest();
    bulkRequest.add(new DeleteRequest().index("user").id("1001"));
    bulkRequest.add(new DeleteRequest().index("user").id("1002"));
    bulkRequest.add(new DeleteRequest().index("user").id("1003"));

    BulkResponse response = esClient.bulk(bulkRequest, RequestOptions.DEFAULT);

    System.out.println(response.getTook());
    System.out.println(response.getItems());

    // 关闭客户端
    esClient.close();
}
```

## 4、文档高级查询

### （1）全量查询

```java
public static void main(String[] args) throws IOException {

    // 创建 ES 客户端
    RestHighLevelClient esClient = new RestHighLevelClient(
        RestClient.builder(new HttpHost("localhost", 9200, "http"))
    );

    // 全量查询
    SearchRequest searchRequest = new SearchRequest();
    searchRequest.indices("user");

    // 注意这里有个 QueryBuilder 的接口, 它就是 ES 中各种查询的抽象, 有许多不同的实现
    // QueryBuilders 是快速构建查询器的工具
    searchRequest.source(new SearchSourceBuilder().query(QueryBuilders.matchAllQuery()));

    SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

    // SearchHits 中封装了查询结果
    SearchHits hits = response.getHits();

    System.out.println(response.getTook());
    System.out.println(hits.getTotalHits());

    // 注意 SearchHit 实现了 Iterable 接口, 是可以遍历的
    for (SearchHit hit : hits) {
        System.out.println(hit.getSourceAsString());
    }

    // 关闭客户端
    esClient.close();
}
```

注意这里有几个概念，查询构建器、查询得到的结果等等。



### （2）条件查询

```java
// 条件查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");
// 查询指定年龄的用户信息
searchRequest.source(new SearchSourceBuilder().query(QueryBuilders.termQuery("age", 30)));

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



### （3）分页查询

```java
// 条件查询 (查询全部数据并进行分页)
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder().query(QueryBuilders.matchAllQuery());

// 页码生成算法: (当前页码 - 1) * 分页大小
sourceBuilder.from(0).size(2);

searchRequest.source(sourceBuilder);

SearchResponse searchResponse = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(searchResponse.getTook());
searchResponse.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



### （4）查询排序

```java
// 针对查询结果排序(查询所有数据并针对某个字段进行排序)
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder().query(QueryBuilders.matchAllQuery());
sourceBuilder.sort("age", SortOrder.DESC);

searchRequest.source(sourceBuilder);

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```

### （5）过滤字段

```java
// 查询(过滤特定字段)
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder().query(QueryBuilders.matchAllQuery());
// 使用 FetchSourceContext 指定包含或排除的字段
String[] excludes = {};
String[] includes = { "name" };
sourceBuilder.fetchSource(includes, excludes);

searchRequest.source(sourceBuilder);

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



### （6）多条件组合查询&范围查询

> （1）组合查询

```java
// 多条件组合查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
// 这里的 BoolQueryBuilder 可以用于组合查询
BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
sourceBuilder.query(boolQueryBuilder);

// 操作一: must 和 mustNot 表示必须满足指定条件
// boolQueryBuilder.must(QueryBuilders.matchQuery("sex", "男"));
// boolQueryBuilder.mustNot(QueryBuilders.matchQuery("sex", "男"));

// 操作二: should 表示满足至少一个条件
boolQueryBuilder.should(QueryBuilders.matchQuery("age", 30));
boolQueryBuilder.should(QueryBuilders.matchQuery("age", 40));

// 查询并提取结果
searchRequest.source(sourceBuilder);
SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



> （2）范围查询

```java
// 范围查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
// 这里的 RangeQueryBuilder 表示指定某个字段的范围
RangeQueryBuilder rangeQueryBuilder = QueryBuilders.rangeQuery("age");

// 指定年龄范围 [30, 40]
rangeQueryBuilder.gte(30);
rangeQueryBuilder.lte(40);

sourceBuilder.query(rangeQueryBuilder);

// 查询并提取结果
searchRequest.source(sourceBuilder);
SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



### （8）模糊查询

模糊查询里有个偏差度的概念，可以研究一下。

```java
// 模糊查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

// ES 中模糊查询的构建器有个特点, 可以指定模糊查询的偏差度(TODO 待研究)
FuzzyQueryBuilder fuzzyQuery = QueryBuilders.fuzzyQuery("name", "王五").fuzziness(Fuzziness.ONE);

sourceBuilder.query(fuzzyQuery);
searchRequest.source(sourceBuilder);

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



### （9）高亮显示

注意这里有一个坑，`TermQueryBuilder` 用于精准匹配，但是在处理文本的时候有些问题，针对中文字符串，可以使用 `字段名.keyword` 的方式进行查询。

```java
// 高亮查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
// 注意这里的精准匹配 termQuery 有一个问题, 就是对中文的处理, 涉及到分词器以及倒排索引, TODO 之后研究
// 解决方法: 使用 字段名.keyword 的方式去查询
TermQueryBuilder termQueryBuilder = QueryBuilders.termQuery("name.keyword", "五六七");

// 这里有一个 HighlightBuilder, 它和 QueryBuilder 属于不同的体系
HighlightBuilder highlightBuilder = new HighlightBuilder();
// 定制高亮标签
highlightBuilder.preTags("<font color='red'>")
    .postTags("</font>");
highlightBuilder.field("name");

sourceBuilder.highlighter(highlightBuilder).query(termQueryBuilder);

searchRequest.source(sourceBuilder);

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
```



### （10）聚合查询

聚合有多种类型，可以参考 `AggregationBuilders` 源码中定义的各种聚合操作：

```java
// 聚合查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

// 聚合查询使用的是 AggregationBuilder 体系的查询构建器, 可以使用 AggregationBuilders 工具类快速生成
// 这里以求最大值为例
MaxAggregationBuilder maxAggregationBuilder = AggregationBuilders.max("maxAge").field("age");

sourceBuilder.aggregation(maxAggregationBuilder);

searchRequest.source(sourceBuilder);

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));
for (Aggregation aggregation : response.getAggregations()) {
    System.out.println(aggregation.getMetadata());
    System.out.println(aggregation.getName());
    System.out.println(aggregation.getType());
}
```



### （11）分组查询

```java
// 分组查询
SearchRequest searchRequest = new SearchRequest();
searchRequest.indices("user");

SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();

// 根据 age Field 进行分组查询
TermsAggregationBuilder termsAggregationBuilder = AggregationBuilders.terms("ageGroup").field("age");

sourceBuilder.aggregation(termsAggregationBuilder);

searchRequest.source(sourceBuilder);

SearchResponse response = esClient.search(searchRequest, RequestOptions.DEFAULT);

System.out.println(response.getTook());
response.getHits().forEach(hit -> System.out.println(hit.getSourceAsString()));

// 一样的打印数据
for (Aggregation aggregation : response.getAggregations()) {
    System.out.println(aggregation.getType());
    System.out.println(aggregation.getName());
    Optional.ofNullable(aggregation.getMetadata())
        .ifPresent(map -> {
            map.forEach((key, value) -> System.out.println("key" + key + " val: " + value));
        });
}
```

进度：[集群概念](https://www.bilibili.com/video/BV1hh411D7sb?p=29&spm_id_from=pageDriver&vd_source=ae48b583780c8d5999def7f5416875a9)