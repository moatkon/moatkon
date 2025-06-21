---
title: 刷数
description: 刷数
template: doc
tableOfContents: false
lastUpdated: 2025-01-27 18:25:14
---
**序列图**

![](/software-engineer/best-practices/general-ability/Moatkon-seq-flash.jpg)

**流程图**

![](/software-engineer/best-practices/general-ability/Moatkon-abstract-flash.jpg)

```java title="抽象刷数逻辑"
import com.fasterxml.jackson.annotation.JsonFormat;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import joptsimple.internal.Strings;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.shardingsphere.api.hint.HintManager;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

/**
 * 抽象刷数逻辑
 *
 * @param <Source>        源数据类型
 * @param <CanalData>     Canal数据类型
 * @param <BusinessScene> 业务场景类型（仅作为语义标记）
 */
@Slf4j
public abstract class AbstractFlash<Source, CanalData, BusinessScene extends Scene> {

  protected Integer defaultLimit() {
    return 500;
  }


  /**
   * 刷数入参
   */
  private static final ThreadLocal<FlashParam> flashParamThreadLocal = new ThreadLocal<>();

  protected FlashParam getFlashParam(){
    return flashParamThreadLocal.get();
  }

  /**
   * 获取数据源
   *
   * @return
   */
  protected abstract List<Source> getSourceList();

  /**
   * 组装Canal目标数据
   *
   * @param sourceList DB数据,需要转成目标CanalData
   * @return canalData
   */
  protected abstract List<CanalData> assembleCanalData(List<Source> sourceList);

  /**
   * 刷数
   */
  protected abstract void flash(List<CanalData> canalDataList);

  /**
   * 私有执行
   */
  private void innerExec() {
    // 初始化游标
    initCursor();

    while (!getFlashParam().empty() && getFlashParam().getCursorStartId() <= getFlashParam().getCursorEndId()) {
      log.info("Flushing_{},{}",this.getClass().getName(), JsonUtils.toJson(getFlashParam()));

      List<Source> sourceList = getSourceList();
      if (CollectionUtils.isEmpty(sourceList)) {
        refreshCursor();//防止物理删除造成的空洞,所以需要更新游标起始位置
        continue;
      }

      // 更新游标起始位置
      refreshCursor();

      // 组装目标Canal数据
      List<CanalData> canalDataList = assembleCanalData(sourceList);
      if (CollectionUtils.isEmpty(canalDataList)) {
        return;
      }
      // 基于Canal数据刷数
      flash(canalDataList);
    }
  }

  private void initCursor() {
    Long cursorStartId = queryCursorStartId();
    Long cursorEndId = queryCursorEndId();

    getFlashParam().setCursorStartId(Objects.isNull(cursorStartId) ? 0L : cursorStartId);
    getFlashParam().setCursorEndId(Objects.isNull(cursorEndId) ? 0L : cursorEndId);
  }

  private void refreshCursor() {
    getFlashParam().setCursorStartId(getFlashParam().getCursorStartId() + defaultLimit());
  }


  @Data
  public static class FlashParam {
    private Date start; // 开始时间
    private Date end; // 结束时间

    private List<String> noList; // 单号列表

    private Long cursorStartId; // 游标起始Id
    private Long cursorEndId; // 游标结束Id

    private String monitorKey = Strings.EMPTY; // 基于Redis实现监控key

    public Boolean empty() {
      return cursorStartId == 0L && cursorEndId == 0L;
    }
  }

  private void init(FlashParam flashParam) {
    flashParamThreadLocal.set(flashParam);
  }

  /**
   * 查询起始游标ID
   * @return
   */
  protected abstract Long queryCursorStartId();

  /**
   * 查询结束游标ID
   * @return
   */
  protected abstract Long queryCursorEndId();


  protected Boolean isSharding() {
    return Boolean.FALSE;
  }

  /**
   * 是否处理非会员数据
   *
   * @return
   */
  protected Boolean isHandleNonVipData() {
    return Boolean.FALSE;
  }

  /**
   * 【暴露接口】开始刷数
   *
   * @param flashParam
   */
  public void startFlush(FlashParam flashParam) {
    try {
      init(flashParam);

      monitor("刷数中");

      flash();

      monitor("刷数结束");
    } finally {
      flashParamThreadLocal.remove();
    }
  }

  private void monitor(String tips) {
    if(!StringUtils.isEmpty(getFlashParam().getMonitorKey())){
      String flashKey = flashKey();
      String message = tips + OrderDateUtils.formatYYMMDD(new Date());

      String redisMonitorKey = String.format("%s_%s",getFlashParam().getMonitorKey(),flashKey);
      log.info("{}-{}",redisMonitorKey,message);
      RedisStringUtil.setValue(redisMonitorKey, message, 30L, TimeUnit.DAYS);
    }
  }

  private void flash() {
    if (isSharding()) {
      shardingExec();
    } else {
      innerExec();
    }
  }

  private String flashKey() {
    String key = String.format("Flash_%s", this.getClass().getName());
    if (!CollectionUtils.isEmpty(getFlashParam().getNoList())) {
      key = key + "_" + getFlashParam().getNoList().get(0);// 取第一个简单标识一下
    }
    return key;
  }

  /**
   * 分表执行
   */
  protected void shardingExec() {
    List<String> shardingValueList = ShardingUtils.shardingValueList(isHandleNonVipData());

    String no = Strings.EMPTY;
    List<String> noList = getFlashParam().getNoList();
    if(!CollectionUtils.isEmpty(noList) && noList.size() == 1){
      String tableIndexByNo = ShardingHelper.getTableIndexByNo(noList.get(0)); // 根据单号获取分表位置
      if(shardingValueList.contains(tableIndexByNo)){
        no = noList.get(0);
      }else {
        log.info("忽略，{}",noList);
        return;
      }
    }

    for (String shardingValue : shardingValueList) {
      try (HintManager hintManager = HintManager.getInstance()) {
        OfflineOrderHit hit = new OfflineOrderHit();
        if(!StringUtils.isEmpty(no)){
          hit.setDefineNo(no);
        }else {
          hit.setQueryHit(QueryHit.builder().seq(shardingValue).build());
        }
        OfflineOrderTableShardingHintAlgorithm.setHintManager(hintManager, hit);

        innerExec();
      }

      // 指定了单号,就跳出,避免无效循环
      if(!StringUtils.isEmpty(no)){
        break;
      }
    }
  }


}



```
