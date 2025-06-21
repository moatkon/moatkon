---
title: ES操作
description: ES操作
template: doc
tableOfContents: false
lastUpdated: 2025-01-23 00:21:23
---
![](/software-engineer/best-practices/general-ability/Moatkon-es-operate.jpg)

```java title="抽象Es操作"
/**
 * 抽象Es操作
 */
public abstract class AbstractEsOperate<T extends BaseEsIndexModel> {

  private final ThreadLocal<T> threadLocalT = new ThreadLocal<>();
  private final ThreadLocal<Type> threadLocalType = new ThreadLocal<>();

  // 获取当前线程的 t
  protected T getT() {
    return threadLocalT.get();
  }

  // 获取当前线程的 type
  protected Type getType() {
    return threadLocalType.get();
  }

  private final Class<T> clazz;

  // Constructor to accept the Class<T> type
  protected AbstractEsOperate(Class<T> clazz) {
    this.clazz = clazz;
  }


  public enum Type {
    DELETE, SAVE
  }

  private Boolean check() {
    return clazz.equals(threadLocalT.get().getClass());
  }


  private void init(T t, Type type) {
    threadLocalT.set(t);
    threadLocalType.set(type);
  }


  protected abstract Boolean exec();


  public void doBusiness(T t, Type type) {
    try {
      init(t, type);
      if (!check()) {
        return;
      }

      exec();
    } finally {
      threadLocalT.remove();
      threadLocalType.remove();
    }
  }


}

```
