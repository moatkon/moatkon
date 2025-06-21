---
title: "解决Elasticsearch请求不能执行,I/O reactor status:STOPPED"
description: "解决Elasticsearch报错: Request cannot be executed; I/O reactor status: STOPPED"
template: doc
lastUpdated: 2025-02-25 01:27:42
tableOfContents: false
---

#### 异常报错
```
java.lang.RuntimeException: Request cannot be executed; I/O reactor status: STOPPED
	at org.elasticsearch.client.RestClient.extractAndWrapCause(RestClient.java:889)
	at org.elasticsearch.client.RestClient.performRequest(RestClient.java:283)
	at org.elasticsearch.client.RestClient.performRequest(RestClient.java:270)
	at org.elasticsearch.client.RestHighLevelClient.performClientRequest(RestHighLevelClient.java:2082)
	omit...
```

#### 原因排查
主要参考以下Github issue:
1. [java.lang.IllegalStateException: Request cannot be executed; I/O reactor status: STOPPED](https://github.com/elastic/elasticsearch/issues/39946)
2. [LLRC should detect I/O Reactor failure and log the halting exception](https://github.com/elastic/elasticsearch/issues/49124)
3. [使用ElasticSearch的HLRC（High Level Rest Client）时，报出I/O Reactor STOPPED](https://support.huaweicloud.com/intl/zh-cn/trouble-css/css_10_0019.html)

关于原因分析,上面罗列的第[【3】](https://support.huaweicloud.com/intl/zh-cn/trouble-css/css_10_0019.html)个链接分析的分析的很详细,这里不再啰嗦

#### 尝试解决
重启服务。因为之前从未报这个错误,按照分析重启会解决这个问题。但是实际情况是,重启只能支撑一会儿,后面又报了这个错误

#### 实际解决
根据排查的原因,是连接被关闭了,那么只要在连接被关闭的时候重建一个连接不就好了吗? 依据这个思路就好办了。因为ElasticSearch客户端没有提供重建连接的方法,所以在Debug ElasticSearch连接建立的过程后,通过以下方法可以解决问题

```java title="最简代码"

@Resource
private RestClientBuilder restClientBuilder; // 根据源码可以知道RestClientBuilder也是单实例,所以这里可以直接取出

@Resource
private RestHighLevelClient esClient; // 在Spring中是单例的,这里取到单实例

// 最简单的代码,大家可以根据自己的情况来
public void reCreate(){
   esClient = new RestHighLevelClient(restClientBuilder); // 使用新建的实例替代原来的实例
}

```
