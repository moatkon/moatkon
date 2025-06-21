---
title: Canal消息处理,写入ES
description: Canal消息处理,写入ES
template: doc
tableOfContents: false
lastUpdated: 2025-01-27 18:25:14
---
**序列图**

![](/software-engineer/best-practices/general-ability/Moatkon-seq-canal.jpg)

**流程图**

![](/software-engineer/best-practices/general-ability/Moatkon-abstract-handler.jpg)

```java title="Canal消息处理,写入ES"
import java.util.List;
import javax.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.CollectionUtils;

/**
 * 抽象Canal消息处理逻辑
 */
@Slf4j
public abstract class AbstractCanalHandler<T extends BaseCanalData<?>, Target extends BaseEsIndexModel> {

  @Resource
  private List<AbstractEsOperate<Target>> abstractEsOperateList;

  private final Class<T> type;

  // Constructor to accept the Class<T> type
  protected AbstractCanalHandler(Class<T> type) {
    this.type = type;
  }

  private final ThreadLocal<T> dataThreadLocal = new ThreadLocal<>();

  protected T getData() {
    return dataThreadLocal.get();
  }

  /**
   * 检查
   *
   * @return
   */
  protected abstract Boolean check();

  /**
   * 组装ES数据模型
   *
   * @return
   */
  protected abstract List<Target> assemble();

  private void deleteEsDoc(List<Target> esOrderModelList) {
    for (Target target : esOrderModelList) {
      abstractEsOperateList.forEach(item -> item.doBusiness(target, Type.DELETE));
    }
  }

  // insert or update
  private void saveEsDoc(List<Target> esOrderModelList) {
    for (Target target : esOrderModelList) {
      abstractEsOperateList.forEach(item -> item.doBusiness(target, Type.SAVE));
    }
  }


  /**
   * 处理流程
   */
  private void handle() {

    List<Target> targetList = assemble();
    if (CollectionUtils.isEmpty(targetList)) {
      return;
    }

    String type = getData().getType();
    if (OperateType.DELETE.name().equals(type)) {
      deleteEsDoc(targetList);
    }

    if (OperateType.INSERT.name().equals(type) || OperateType.UPDATE.name().equals(type)) {
      saveEsDoc(targetList);
    }
  }


  /**
   * 执行业务
   */
  public Boolean execBusiness(String message) {
    try {
      init(message);

      if (!check()) {
        return false;
      }

      handle();

      return true;
    } finally {
      dataThreadLocal.remove();
    }
  }

  private void init(String message) {
    dataThreadLocal.set(JsonUtils.toObject(message, type));
  }

  /**
   * 手动刷数入口
   */
  public void manualFlash(T t) {
    try {
      // 初始化
      dataThreadLocal.set(t);
      // 组装
      List<Target> targetList = assemble();
      if (CollectionUtils.isEmpty(targetList)) {
        return;
      }
      // 写入Es
      saveEsDoc(targetList);
    } catch (Exception e) {
      log.error("手动刷数失败", e);
    } finally {
      dataThreadLocal.remove();
    }
  }

}

```
