---
title: ShardingJDBC实践
description: ShardingJDBC实践
template: doc
lastUpdated: 2024-08-24 19:40:31
---
### 背景
因业务高速发展,线下渠道订单量高速增长,订单量每天50w+,据此计算,一个月的订单量有1500w+,一年就有1.8亿数据。

这已远远超过MySQL单表的存储极限。故急需分表

### 技术方案
根据自己前几年调研过的技术方案，选择使用ShardingJDBC来实现
> 各方案优缺点不再此展示,感兴趣的可以自行探索

### 具体接入代码
我们的ORM工具使用的是mybatis-plus,并且结合了多数据源,所以这次接入是在该背景下接入sharding-jdbc。如果需要单独接入sharding-jdbc可以自己截取部分粘贴到自己项目

依赖:
```xml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>sharding-jdbc-spring-boot-starter</artifactId>
    <version>4.1.1</version>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-boot-starter</artifactId>
    <version>3.4.3.4</version>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>dynamic-datasource-spring-boot-starter</artifactId>    
    <version>3.3.1</version>
</dependency>
```

yml配置:
```yml
spring:
  shardingsphere:
    datasource:
      names: moatkon_sharding
      moatkon_sharding:
        url: jdbc:mysql://ip:port/moatkon_db?allowMultiQueries=true&serverTimezone=Asia/Shanghai&useSSL=false&connectTimeout=2000&socketTimeout=60000  #开发
        username: xxxx
        password: xxxx
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.cj.jdbc.Driver
    sharding:
      tables:
        table1:
          actual-data-nodes: moatkon_sharding.table1_$->{0..127}
          table-strategy:
            hint:
              algorithm-class-name: com.moatkon.MoatkonShardingHintAlgorithm
        table2:
          actual-data-nodes: moatkon_sharding.table2_$->{0..127}
          table-strategy:
            hint:
              algorithm-class-name: com.moatkon.MoatkonShardingHintAlgorithm
    props:
      sql.show: false
      max.connections.size.per.query: 50 # 这个可以解决启动慢的问题,在后续的版本,sharding-jdbc优化了此问题,在4.1.1需要配置这个参数

  datasource:
    dynamic:
      primary: moatkon_ds
      strict: false
      datasource:
        moatkon_ds:
          url: jdbc:mysql://ip:port/moatkon_db?allowMultiQueries=true&serverTimezone=Asia/Shanghai&useSSL=false&connectTimeout=2000&socketTimeout=60000
          username: xxxxx
          password: xxxxx
          driver-class-name: com.mysql.cj.jdbc.Driver
          type: com.alibaba.druid.pool.DruidDataSource
          druid:
            initial-size: 40
            min-idle: 40
            max-active: 100
            max-wait: 10000
            wall:
              multi-statement-allow: true
    druid:
      time-between-eviction-runs-millis: 60000
      min-evictable-idle-time-millis: 300000
      validation-query: SELECT 1 FROM DUAL
```


Spring配置:
```java
import com.baomidou.dynamic.datasource.DynamicRoutingDataSource;
import com.baomidou.dynamic.datasource.provider.AbstractDataSourceProvider;
import com.baomidou.dynamic.datasource.provider.DynamicDataSourceProvider;
import com.baomidou.dynamic.datasource.spring.boot.autoconfigure.DataSourceProperty;
import com.baomidou.dynamic.datasource.spring.boot.autoconfigure.DynamicDataSourceAutoConfiguration;
import com.baomidou.dynamic.datasource.spring.boot.autoconfigure.DynamicDataSourceProperties;
import org.apache.shardingsphere.shardingjdbc.jdbc.adapter.AbstractDataSourceAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import javax.annotation.Resource;
import javax.sql.DataSource;
import java.util.Map;

@Configuration
@AutoConfigureBefore({DynamicDataSourceAutoConfiguration.class,SpringBootConfiguration.class})
public class DataSourceConfiguration {
    // 分表数据源名称
    private static final String SHARDING_DATA_SOURCE_NAME = "sharding";

    //动态数据源配置项
    @Autowired
    private DynamicDataSourceProperties properties;

    /**
     * shardingjdbc有四种数据源，需要根据业务注入不同的数据源
     *
     * <p>1. 未使用分片, 脱敏的名称(默认): shardingDataSource;
     * <p>2. 主从数据源: masterSlaveDataSource;
     * <p>3. 脱敏数据源：encryptDataSource;
     * <p>4. 影子数据源：shadowDataSource
     */
    @Lazy
    @Resource(name = "shardingDataSource")
    AbstractDataSourceAdapter shardingDataSource;

    @Bean
    public DynamicDataSourceProvider dynamicDataSourceProvider() {
        Map<String, DataSourceProperty> datasourceMap = properties.getDatasource();
        return new AbstractDataSourceProvider() {
            @Override
            public Map<String, DataSource> loadDataSources() {
                Map<String, DataSource> dataSourceMap = createDataSourceMap(datasourceMap);
                // 将 shardingjdbc 管理的数据源也交给动态数据源管理
                dataSourceMap.put(SHARDING_DATA_SOURCE_NAME, shardingDataSource);
                return dataSourceMap;
            }
        };
    }

    /**
     * 将动态数据源设置为首选的
     * 当spring存在多个数据源时, 自动注入的是首选的对象
     * 设置为主要的数据源之后，就可以支持shardingjdbc原生的配置方式了
     */
    @Primary
    @Bean
    public DataSource dataSource(DynamicDataSourceProvider dynamicDataSourceProvider) {
        DynamicRoutingDataSource dataSource = new DynamicRoutingDataSource();
        dataSource.setPrimary(properties.getPrimary());
        dataSource.setStrict(properties.getStrict());
        dataSource.setStrategy(properties.getStrategy());
        dataSource.setProvider(dynamicDataSourceProvider);
        dataSource.setP6spy(properties.getP6spy());
        dataSource.setSeata(properties.getSeata());
        return dataSource;
    }
}

```

当且仅当需要使用分表时才需要切换数据源:


`@DS(DataSourceConfiguration.SHARDING_DATA_SOURCE_NAME)`

> `@DS` 是dynamic-datasource-spring-boot-starter的注解,用于切换动态数据源


### 分表策略
因为线下渠道的用户有非会员和会员。所以我们的分表策略是，非会员按照年月归档,会员用户按照用户id分表。我们期望的是会员用户可以通过用户ID和订单号都可以定位到具体的分表,所以我们对自己内部订单号做了一些设计。

规则是: 雪花算法 + 用户ID(后3位)

通过此设计就可以达到通过用户ID和订单号都可以定位到具体分表

#### 分表算法
因为我们的使用场景需要按年月归档非会员订单和按照用户维度进行分表,所以我们采用了灵活性非常之高的强制分片算法,实现HintShardingAlgorithm即可。


com.moatkon.MoatkonShardingHintAlgorithm
```java
import com.google.common.collect.Lists;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.apache.shardingsphere.api.hint.HintManager;
import org.apache.shardingsphere.api.sharding.hint.HintShardingAlgorithm;
import org.apache.shardingsphere.api.sharding.hint.HintShardingValue;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class MoatkonShardingHintAlgorithm implements HintShardingAlgorithm<MoatkonHit> {

  @Override
  public Collection<String> doSharding(Collection<String> collection,
      HintShardingValue<MoatkonHit> hintShardingValue) {
    // 分表结果
    ArrayList<String> shardingResult = Lists.newArrayList();

    String logicTableName = hintShardingValue.getLogicTableName();
    Collection<MoatkonHit> values = hintShardingValue.getValues();

    Optional<MoatkonHit> first = values.stream().findFirst();
    if (!first.isPresent()) {
      throw new RuntimeException(
          String.format("强制分片无数据,请检查使用方式!!! table:%s", logicTableName));
    }

    MoatkonHit moatkonHit = first.get();
    // 获取订单号
    String orderNo = moatkonHit.getOrderNo();

    // 获取用户Id后三位
    String userIdLast3 = ShardingHelper.fetchLast3UserId(orderNo);
    if ("NaN".equals(userIdLast3)) { // NOT_MEMBER_ORDER_SUFFIX 非会员订单号的后三位是”NaN“,表示非会员
      Date createTime = moatkonHit.getCreateTime();
      String position = ShardingHelper.archiveByYearMonth(createTime); // 输出年月的字符串,例如 202401,202412之类的
      shardingResult.add(logicTableName + "_" + position); // 拼接物理表名

      return shardingResult;
    }


    String position = ShardingHelper.splitByUserIdLast3Str(userIdLast3);
    shardingResult.add(logicTableName + "_" + position);
    return shardingResult;
  }

  private static final List<String> tableList = Lists.newArrayList("table1","table2");

  /**
   * 有使用强制分表的地方,使用这个方法可以使用该算法。 注意: 这是使用了强制分片策略才会这么使用。如果是使用其他分表策略则不需要,按照官方文档接入即可
   */
  public static void setHintManager(HintManager hintManager, MoatkonHit moatkonHit) {
    for (String table : tableList) {
      hintManager.addTableShardingValue(table, moatkonHit);
    }
  }
}
```

#### 数据倾斜问题
主要是采用 Hash一致性算法  + 虚拟表 来解决。

##### 为什么采用虚拟表?
避免数据倾斜问题,如果出现了数据倾斜问题,而又没有采用虚拟表,大概率会将所有的数据都重新跑一遍新的分表算法<small style="color:grey;">(这个新的分表算法如果还没有采用虚拟表,估计也只能支撑一段时间,并不能彻底解决问题)</small>,这个成本太大了

##### 实现原理
![](/software-engineer/best-practices/sharding-jdbc/Moatkon-virtual-table.drawio.svg)

##### 算法实现
1024张虚拟表,128张物理表
```java
  public static String splitByUserIdLast3Str(String userId) {
    // 分片键hash 散列
    HashCode hashCode = Hashing.murmur3_128().hashString(userId, StandardCharsets.UTF_8);

    //传入数据主键id(分片片键)和集群中机器数量buckets，返回一个固定的数字，表示数据应当落在第几个机器(虚拟表)上。
    int virtualTable = Hashing.consistentHash(hashCode, 1024); // 一致性hash算法

    // 计算物理表
    int physicsTable = virtualTable / (1024 / 128); // 1024个环节/128表示可 物理表可使用的范围  8个表冗余，每8个表对应一个虚拟表,即步长

    return String.valueOf(physicsTable); // 返回映射到的物理表
  }
```
