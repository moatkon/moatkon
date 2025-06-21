---
title: 自定义注解实现限流
description: 自定义注解实现限流
template: doc
lastUpdated: 2024-01-20 13:12:00
tableOfContents: 
    minHeadingLevel: 1
    maxHeadingLevel: 5
---
因最近在做性能优化相关的工作,要对一部分接口做限流操作。故在此记录一下

#### 思考下,为什么要限流
- 系统的承载能力有限,限流主要是为了防止突发流量打垮自己的系统,导致系统无法对外提供服务。而限流操作可以保护自己的系统,在突发流量下提供有限服务
- 保护下游系统,防止雪崩场景的发生。现在很少会有单体服务了,大多数是微服务架构,如果上游系统未控制好流量,会打垮下游系统,如果下游系统下面还有系统,流量就会一直往下传,像雪崩一样。雪崩时,没有一片雪花是无辜的

:::tip
Żaden płatek śniegu nie czuje się odpowiedzialny za lawinę.

No snowflake in an avalanche ever feels responsible.
:::

#### 思路
1. 使用注解来标记需要限流的接口
2. 注解取入参里的字段做唯一key
3. 基于Redis做限流,逻辑统一在切面做

#### 实现
##### 定义注解
```java title="切面"
@Retention(RetentionPolicy.RUNTIME)
@Target(value = {ElementType.METHOD})
public @interface MoatkonLimit {
    String uniqueKey() default "";
}
```

##### RedisScript Bean
```java
@Bean
public RedisScript<Long> limitRedisScript() {
    DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
    redisScript.setScriptSource(new ResourceScriptSource(new ClassPathResource("scripts/limit.lua")));
    redisScript.setResultType(Long.class);
    return redisScript;
}
```


##### lua脚本
> 网上有很多类似脚本,选择并测试好即可

```lua
-- 下标从 1 开始 获取key
local key = KEYS[1]
-- 下标从 1 开始 获取参数
local now = tonumber(ARGV[1]) -- 当前时间错
local ttl = tonumber(ARGV[2]) -- 有效
local expired = tonumber(ARGV[3]) --
local max = tonumber(ARGV[4])

-- 清除过期的数据
-- 移除指定分数区间内的所有元素，expired 即已经过期的 score
-- 根据当前时间毫秒数 - 超时毫秒数，得到过期时间 expired
redis.call('zremrangebyscore', key, 0, expired)

-- 获取 zset 中的当前元素个数
local current = tonumber(redis.call('zcard', key))
local next = current + 1

if next > max then
  -- 达到限流大小 返回 0
  return 0;
else
  -- 往 zset 中添加一个值、得分均为当前时间戳的元素，[value,score]
  redis.call("zadd", key, now, now)
  -- 每次访问均重新设置 zset 的过期时间，单位毫秒
  redis.call("pexpire", key, ttl)
  return next
end
```

##### 使用切面切注解
```java
@Slf4j
@Aspect
@Component
public class RLimitAspect {
    @Resource
    private StringRedisTemplate stringRedisTemplate;

    @Around(value = "@annotation(com.moatkon.MoatkonLimit)")
    public Object limitAspect(ProceedingJoinPoint pjp) {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        Method method = signature.getMethod();
        MoatkonLimit moatkonLimit = method.getAnnotation(MoatkonLimit.class); // 获取到注解
        String uniqueKey = moatkonLimit.uniqueKey(); // 获取到注解上的值

        // 定义限流参数,这些参数也可以在注解上配置,也可以维护到配置文件,当然如果想做的更好用,可以开发相关的页面。
        // 这里只做简单的演示
        long max = 1;
        long timeout = 10;
        TimeUnit timeUnit = TimeUnit.SECONDS;

        if(limit(uniqueKey,max,timeout,timeUnit)){
            throw new RuntimeException("触发限流");
        }
        
        
        try {
            return pjp.proceed();
        } catch (Throwable e) {
            throw e;
        }
    }

    //限流逻辑
    private boolean limit(String key, long max, long timeout, TimeUnit timeUnit) {
        long ttl = timeUnit.toMillis(timeout);
        long now = Instant.now().toEpochMilli();
        long expired = now - ttl;
        Long executeTimes = stringRedisTemplate.execute(limitRedisScript, Collections.singletonList(key), now + "", ttl + "", expired + "", max + "");
        if (executeTimes != null) {
            if (executeTimes == 0) {
                log.error("触发限流");
                return true;
            } else {
                return false;
            }
        }
        return false;
    }
}
```




#### 使用
使用注解就很简单了

```java
@MoatkonLimit(uniqueKey="moatkon.com") // 添加上注解即可
public void limitExample(){

}
```

----
如果不想uniqueKey是写死的,需要根据请求参数中的值来限流,也很好做,使用spel就可以

```java
@MoatkonLimit(uniqueKey="#request.key") // 添加上注解即可
public void limitExample(MoatkonRequest request){

}
```

将参数中的request key解析出来
```java
String uniqueKeySpel = moatkonLimit.uniqueKey();

ExpressionParser parser = new SpelExpressionParser();
LocalVariableTableParameterNameDiscoverer discoverer = new LocalVariableTableParameterNameDiscoverer();
String[] params = discoverer.getParameterNames(method);
Object[] args = pjp.getArgs();

EvaluationContext context = new StandardEvaluationContext();
for (int len = 0; len < params.length; len++) {
    context.setVariable(params[len], args[len]);
}
Expression expression = parser.parseExpression(uniqueKeySpel);
String uniqueKey = expression.getValue(context, String.class); // 这里就将请求参数中的key取出了
```