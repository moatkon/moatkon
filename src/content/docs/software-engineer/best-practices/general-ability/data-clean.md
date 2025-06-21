---
title: 数据清理
description: 数据清理
template: doc
tableOfContents: false
lastUpdated: 2025-01-21 23:04:49
---


```java title="抽象清理逻辑"
import java.util.Date;
import lombok.extern.slf4j.Slf4j;

/**
 * 抽象清理逻辑
 */
@Slf4j
public abstract class AbstractClean {

  /**
   * 超过指定天数,过期
   *
   * @return 过期天数
   */
  protected abstract Integer expireDays();
  private Integer defaultMinutes(){return 5;}

  protected abstract void clean(String startDate, String endDate);

  protected abstract Boolean checkHasData(String endDate);
  protected abstract Date getLatestdEndDate(Date endDate);

  public void execClean() {
    Date endDate = previousDate(new Date(), expireDays());

    Date startDate;
    while (true) {
      startDate = subtractMinutes(endDate,defaultMinutes());

      // 每次清理很短时间区间内的数据(目前是defaultMinutes()内的数据)
      String startDateStr = formatYYMMDD(startDate);
      String endDateStr = formatYYMMDD(endDate);
      log.info("clean,startDate:{},endDate:{}",startDateStr,endDateStr);
      clean(startDateStr, endDateStr);
      // 校验是否还有数据
      if(!checkHasData(endDateStr)){
        log.info("clean finished,startDate:{},endDate:{}",startDateStr,endDateStr);
        break;
      }

      // 获取索引中在限定条件下最大的时间。 以前推的开始时间作为条件
      endDate = getLatestdEndDate(startDate);
    }
  }

}

```

