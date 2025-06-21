---
title: 数量一致性校验
description: 数量一致性校验
template: doc
tableOfContents: false
lastUpdated: 2025-01-27 18:25:14
---

**序列图**

![](/software-engineer/best-practices/general-ability/Moatkon-seq-cons-check.jpg)

**流程图**

![](/software-engineer/best-practices/general-ability/Moatkon-es-db-count.jpg)

```java title="数量一致性校验"
import com.alibaba.fastjson.JSONObject;
import java.util.Date;
import java.util.List;
import javax.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.shardingsphere.api.hint.HintManager;
import org.springframework.beans.factory.annotation.Value;

/**
 * 抽象数量一致性校验
 */
@Slf4j
public abstract class AbstractConsistencyCheck {


  protected Date endDate;
  protected Date startDate;//由endDate往前推指定分钟数获得
  protected FlashParam flashParam; // 补偿参数

  @Value("${consistencyCheckBeforeMinute:10}")
  private Integer consistencyCheckBeforeMinute;

  @Resource
  private AlertService alertService;

  protected Integer defaultMinuteAgo() {
    return consistencyCheckBeforeMinute;
  }

  /**
   * 数据库数据总数
   *
   * @return
   */
  private Long dbTotalCount() {
    return normalDbTotalCount() + shardingDbTotalCount();
  }

  /**
   * 普通数据库库总数
   *
   * @return
   */
  protected abstract Long normalDbTotalCount();

  /**
   * 分表数据库总数
   *
   * @return
   */
  protected abstract Long shardingDbCount();

  /**
   * 是否处理非VIP数据
   *
   * @return
   */
  protected Boolean isHandleNonVipData() {
    return Boolean.FALSE;
  }

  private Long shardingDbTotalCount() {
    Long shardingTotal = 0L;
    List<String> shardingValueList = ShardingUtils.shardingValueList(isHandleNonVipData()); // 获取所有分表值,这里仅做展示
    for (String shardingValue : shardingValueList) {
      try (HintManager hintManager = HintManager.getInstance()) {
        DefineShardingHit hit = new DefineShardingHit();
        hit.setQueryHit(QueryHit.builder().seq(shardingValue).build());
        OfflineOrderTableShardingHintAlgorithm.setHintManager(hintManager, hit);
        shardingTotal = shardingTotal + shardingDbCount();
      }
    }
    return shardingTotal;
  }

  protected void toCompensate() {
    // 组装补偿参数
    FlashParam flashParam = new FlashParam();
    flashParam.setStart(startDate);
    flashParam.setEnd(endDate);
    this.flashParam = flashParam;

    // 补偿
    compensate();
  }

  protected abstract void compensate();

  /**
   * 一致性告警
   * @return
   */
  protected abstract ConsistencyNotify consistencyNotify();


  /**
   * Es数据条数
   *
   * @return
   */
  protected abstract Long esCount();

  public void consistencyAlarm(Long dbTotalCount, Long esTotalCount, String tips) {
    JSONObject req = new JSONObject();
    req.put("startDate", formatYYMMDD(startDate));
    req.put("endDate", formatYYMMDD(endDate));
    ConsistencyNotify consistencyNotify = consistencyNotify();
    String content = String.format("[%s]-参数:%s,数据库总条数:%s,ES总条数:%s。tips:%s", consistencyNotify.domain,
        JsonUtils.toJson(req), dbTotalCount, esTotalCount, tips);
    alertService.alert(content,consistencyNotify.domain); // 发出告警
  }


  /**
   * 检查,如果不一样则补偿
   */
  public void checkIfCompensate(Date endDate) {
    init(endDate);
    Boolean checkOk = checkIfAlert("[第一次检查]正在执行补偿,若无后续消息则补偿成功");
    if (!checkOk) {
      // 补偿
      toCompensate();
      // recheck
      checkIfAlert("[第二次检查]补偿后,依然不等!需要人工介入");
    }
  }

  private Boolean checkIfAlert(String tips) {
    Long dbTotalCount = dbTotalCount();
    Long esTotalCount = esCount();
    boolean checkOk = dbTotalCount.equals(esTotalCount);
    if (!checkOk) {
      consistencyAlarm(dbTotalCount, esTotalCount, tips);
    }
    return checkOk;
  }

  private void init(Date endDate) {
    this.endDate = endDate;
    this.startDate = OrderDateUtils.previousDateForMinute(this.endDate, defaultMinuteAgo());
  }

  public enum ConsistencyNotify {
    MAOTKON_ALERT_1("Moatkon告警示例")

    ;
    private final String domain; // 业务域


    ConsistencyNotify(String domain) {
      this.domain = domain;
    }
  }
}

```


```java title="一致性校验获取有效计数"
import java.util.Date;
import java.util.List;
import lombok.Data;
import org.springframework.util.CollectionUtils;

/**
 * 抽象有效订单数目
 */
public abstract class AbstractConsistencyCheckEfficientCount<T> {

  protected Integer defaultLimit(){
    return 200;
  }

  @Data
  public static class EfficientParam {

    private String startDate;
    private String endDate;
    private Long startId;


    public void refreshStartId(Long startId) {
      this.startId = startId;
    }
  }

  protected EfficientParam param;

  protected abstract List<T> dataList();

  /**
   * 暴露出去的方法
   *
   * @param startDate
   * @param endDate
   * @return
   */
  public Long fetchEfficientCount(Date startDate, Date endDate) {
    init(startDate, endDate);

    Long totalCount = 0L;
    for (; ; ) {
      List<T> list = dataList();
      if (CollectionUtils.isEmpty(list)) {
        break;
      }

      // 刷新最新的游标
      freshStartId(list);

      // 累加有效总数
      totalCount = totalCount + efficientCount(list);
    }

    return totalCount;
  }

  private void init(Date startDate, Date endDate) {
    EfficientParam init = new EfficientParam();
    init.setStartDate(OrderDateUtils.formatYYMMDD(startDate));
    init.setEndDate(OrderDateUtils.formatYYMMDD(endDate));
    init.setStartId(0L);

    this.param = init;
  }


  /**
   * 刷新StartId
   */
  protected abstract void freshStartId(List<T> list);


  /**
   * 过滤后的有效数据条数
   *
   * @return
   */
  protected abstract Long efficientCount(List<T> list);

}

```
