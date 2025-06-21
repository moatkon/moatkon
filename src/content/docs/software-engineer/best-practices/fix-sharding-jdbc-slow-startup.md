---
title: 解决ShardingJDBC分表过多导致启动慢的问题
description: 解决ShardingJDBC分表过多导致启动慢的问题
template: doc
lastUpdated: 2025-01-07 22:21:25
---

#### 第一种解决方案
修改配置,网上有很多资料,这里不在赘述。(自己去查资料，哈哈)

在分表较少的情况下，可以很好的解决问题。如果分表数目过多,依然不能解决问题



#### 第二种解决方案
魔改代码,即下面的解决方式,不把每个分表都遍历,只遍历第一批的分表,后面分表数据在内存中组装,不去数据库中获取了，可以极大的提升速度


```java

package org.apache.shardingsphere.sql.parser.binder.metadata.schema;

import static com.moatkon.SHARDING_TABLE_LIST; // 分表的逻辑表表名,这里是一个集合
import static com.moatkon.OFFLINE_SHARDING_NUM; //分表数

import cn.hutool.extra.spring.SpringUtil;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;
import javax.sql.DataSource;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.shardingsphere.sql.parser.binder.metadata.column.ColumnMetaDataLoader;
import org.apache.shardingsphere.sql.parser.binder.metadata.index.IndexMetaDataLoader;
import org.apache.shardingsphere.sql.parser.binder.metadata.table.TableMetaData;
import org.apache.shardingsphere.sql.parser.binder.metadata.util.JdbcUtil;

/**
 * 解决分表过大,启动时获取表元数据耗时过程问题
 * <p>
 * 使用类加载机制来优先使用自己类。
 * <p>
 * Schema meta data loader.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@Slf4j(topic = "ShardingSphere-metadata")
public final class SchemaMetaDataLoader {

  private static final String TABLE_TYPE = "TABLE";

  private static final String TABLE_NAME = "TABLE_NAME";

  /**
   * Load schema meta data.
   *
   * @param dataSource         data source
   * @param maxConnectionCount count of max connections permitted to use for this query
   * @param databaseType       database type
   * @return schema meta data
   * @throws SQLException SQL exception
   */
  public static SchemaMetaData load(final DataSource dataSource, final int maxConnectionCount,
      final String databaseType) throws SQLException {

    boolean openNewLogic = Boolean.parseBoolean(SpringUtil.getProperty("schema-meta-data-load-logic"));
    log.info("[rewrite] openNewLogic:{}", openNewLogic);
    if(!openNewLogic){
      log.info("old logic");
      return loadBackup(dataSource,maxConnectionCount,databaseType);
    }

    List<String> tableNames;
    try (Connection connection = dataSource.getConnection()) {
      tableNames = loadAllTableNames(connection, databaseType);
    }
    log.info("[rewrite] Loading {} tables' meta data.", tableNames.size());
    if (0 == tableNames.size()) {
      return new SchemaMetaData(Collections.emptyMap());
    }

    // 重写指定表
    tableNames = SHARDING_TABLE_LIST.stream()
        .map(s -> String.format("%s_%s", s, OFFLINE_SHARDING_NUM)).collect(
            Collectors.toList());

    List<List<String>> tableGroups = Lists.partition(tableNames,
        Math.max(tableNames.size() / maxConnectionCount, 1));
    Map<String, TableMetaData> queriedMetaDataMap = 1 == tableGroups.size()
        ? load(dataSource.getConnection(), tableGroups.get(0), databaseType)
        : asyncLoad(dataSource, maxConnectionCount, tableNames, tableGroups, databaseType);

    // 将重写其他分表
    Map<String, TableMetaData> newTableMetaMap = Maps.newHashMap();
    for (int i = 0; i <= OFFLINE_SHARDING_NUM; i++) {
      int seq = i;
      for (String shardingTable : SHARDING_TABLE_LIST) {

        // 查到的表,依次处理
        queriedMetaDataMap.forEach((tableName, tableMetaData) -> { // tableName, tableMetaData 用不到
          String newTableKey = String.format("%s_%s", shardingTable, seq);

          // 获取指定表的元数据,写入新表
          TableMetaData newTableMeta = queriedMetaDataMap.get(
              String.format("%s_%s", shardingTable, OFFLINE_SHARDING_NUM));

          newTableMetaMap.put(newTableKey, newTableMeta);
        });
      }

    }

    return new SchemaMetaData(newTableMetaMap);
  }

  /**
   * Load schema meta data.
   *
   * @param dataSource         data source
   * @param maxConnectionCount count of max connections permitted to use for this query
   * @param databaseType       database type
   * @return schema meta data
   * @throws SQLException SQL exception
   */
  public static SchemaMetaData loadBackup(final DataSource dataSource, final int maxConnectionCount,
      final String databaseType) throws SQLException {
    List<String> tableNames;
    try (Connection connection = dataSource.getConnection()) {
      tableNames = loadAllTableNames(connection, databaseType);
    }
    log.info("Loading {} tables' meta data.", tableNames.size());
    if (0 == tableNames.size()) {
      return new SchemaMetaData(Collections.emptyMap());
    }
    List<List<String>> tableGroups = Lists.partition(tableNames,
        Math.max(tableNames.size() / maxConnectionCount, 1));
    Map<String, TableMetaData> tableMetaDataMap = 1 == tableGroups.size()
        ? load(dataSource.getConnection(), tableGroups.get(0), databaseType)
        : asyncLoad(dataSource, maxConnectionCount, tableNames, tableGroups, databaseType);
    return new SchemaMetaData(tableMetaDataMap);
  }

  private static Map<String, TableMetaData> load(final Connection connection,
      final Collection<String> tables, final String databaseType) throws SQLException {
    try (Connection con = connection) {
      Map<String, TableMetaData> result = new LinkedHashMap<>();
      for (String each : tables) {
        result.put(each, new TableMetaData(ColumnMetaDataLoader.load(con, each, databaseType),
            IndexMetaDataLoader.load(con, each, databaseType)));
      }
      return result;
    }
  }

  private static List<String> loadAllTableNames(final Connection connection,
      final String databaseType) throws SQLException {
    List<String> result = new LinkedList<>();
    try (ResultSet resultSet = connection.getMetaData()
        .getTables(connection.getCatalog(), JdbcUtil.getSchema(connection, databaseType), null,
            new String[]{TABLE_TYPE})) {
      while (resultSet.next()) {
        String table = resultSet.getString(TABLE_NAME);
        if (!isSystemTable(table)) {
          result.add(table);
        }
      }
    }
    return result;
  }

  private static boolean isSystemTable(final String table) {
    return table.contains("$") || table.contains("/");
  }

  private static Map<String, TableMetaData> asyncLoad(final DataSource dataSource,
      final int maxConnectionCount, final List<String> tableNames,
      final List<List<String>> tableGroups, final String databaseType) throws SQLException {
    Map<String, TableMetaData> result = new ConcurrentHashMap<>(tableNames.size(), 1);
    ExecutorService executorService = Executors.newFixedThreadPool(
        Math.min(tableGroups.size(), maxConnectionCount));
    Collection<Future<Map<String, TableMetaData>>> futures = new LinkedList<>();
    for (List<String> each : tableGroups) {
      futures.add(
          executorService.submit(() -> load(dataSource.getConnection(), each, databaseType)));
    }
    for (Future<Map<String, TableMetaData>> each : futures) {
      try {
        result.putAll(each.get());
      } catch (final InterruptedException | ExecutionException ex) {
        if (ex.getCause() instanceof SQLException) {
          throw (SQLException) ex.getCause();
        }
        Thread.currentThread().interrupt();
      }
    }
    return result;
  }
}

```

#### 第三种解决方案
在sharding-jdbc的配置中,再配置一个库,只是不用而已,就不会获取每个分表的元数据了。这个是比较推荐的解决方案!

_20250107更新:_ 配置的另一个库和当前的库是一样的,则推荐采用第三种解决方案,没有一点问题。如果配置的库和现在不一样,则会有问题,sharding-jdbc会随机选择一个库来操作。那么当两个库中的表不一样,则会一会正常一会失败,因为是随机的。 那么如何解决呢? 配置默认的数据源；

```yml
spring:
  shardingsphere:
    datasource:
      # xx-0 线下单主业务库,xx-1 线下单主业务归档库
      names: xx-0,xx-1
      xx-0:
        url: xxx
        username: xxx
        password: xxx
        type: xxx
      xx-1:
        url: xxx
        username: xxx
        password: xxx
        type: xxx
        driver-class-name: xxx
    sharding:
      default-data-source-name: xx-0 # 这里配置默认的库,就不会随机了
```

当配置了默认的数据源,则又回到启动慢的问题。此时按照第二种解决方案即可
