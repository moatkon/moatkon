---
title: 在Liunx上筛查日志技巧
description: 在Liunx上筛查日志技巧
template: doc
tableOfContents: false
lastUpdated: 2024-03-12 23:43:38
---
:::tip
日常工作中最常用的一些命令
:::

#### 查找文件中的指定内容
```sh
grep '要查找的目标内容' 文件
cat 文件 | grep '要查找的目标内容'
cat 文件 | grep '要查找的目标内容' | ... | ... > 导出到文件
```

#### 在多个文件中查找指定内容
```sh
grep '你要查找的内容' 文件1 文件2
grep '你要查找的内容' 文件通配符

# 查看最后几行:
tail -n 200 文件名
```

#### Linux日志查看技巧
先必须了解两个最基本的命令:
```sh
# 查询日志尾部最后10行的日志
tail -n 10 test.log
# 查询10行之后的所有日志
tail -n +10 test.log
# 查询日志文件中的头10行日志 
head -n 10 test.log
# 查询日志文件除了最后10行的其他所有日志
head -n -10 test.log 
```

##### 场景1: 按行号查看,过滤出关键字附近的日志
因为通常时候我们用grep拿到的日志很少,我们需要查看附近的日志.

1. 首先: `cat -n test.log |grep Goods` 得到关键日志的行号
2. 得到`Goods`关键字所在的行号是102行. 此时如果我想查看`Goods`关键字前10行和后10行的日志:

```sh
cat -n test.log |tail -n +92|head -n 20
# 上面命令的解释
# 表示查询92行之后的日志
tail -n +92
# 则表示在前面的查询结果里再查前20条记录
head -n 20
```

##### 场景2:那么按日期怎么查呢? 通常我们非常需要查找指定时间端的日志
```sh
# 特别说明:上面的两个日期必须是日志中打印出来的日志,否则无效.
sed -n '/2014-12-17 16:17:20/,/2014-12-17 16:17:36/p' test.log
```

关于日期打印,可以先 `grep '2014-12-17 16:17:20' test.log` 来确定日志中是否有该时间点,这个根据时间段查询日志是非常有用的命令.

如果我们查找的日志很多,打印在屏幕上不方便查看, 有两个方法:
1. 使用`more`和`less`命令, 如: `cat -n test.log |grep Goods |more` 这样就分页打印了,通过点击空格键翻页
2. 使用 `>xxx.txt` 将其保存到文件中,到时可以拉下这个文件分析.如:
```sh
cat -n test.log |grep "Goods" >xxx.txt
find -name '*.log' | xargs grep 'orderSn'
cat -n common.log.tmp | grep 'orde' | grep 'execute time:[0-9][0-9][0-9][0-9]'
```


##### 截取日志中指定内容
比如现在有以下日志内容,且暂定日志文件名为demo.txt:
```java
DemoService.demoMethod(..) input:[{"orderSn":"4352345","siteCode":"G5B","userId":234}] 
DemoService.demoMethod(..) input:[{"orderSn":"4563456345","siteCode":"G5B","userId":2345}] 
DemoService.demoMethod(..) input:[{"orderSn":"456343456","siteCode":"G5B","userId":2345}] 
DemoService.demoMethod(..) input:[{"orderSn":"34563456","siteCode":"G5B","userId":52345}] 
DemoService.demoMethod(..) input:[{"orderSn":"52323455","siteCode":"G5B","userId":23}] 
DemoService.demoMethod(..) input:[{"orderSn":"345634563456","siteCode":"G5B","userId":55}] 
DemoService.demoMethod(..) input:[{"orderSn":"23452345","siteCode":"G5B","userId":44}] 
DemoService.demoMethod(..) input:[{"orderSn":"23452345","siteCode":"G5B","userId":3454}] 
DemoService.demoMethod(..) input:[{"orderSn":"2346134531","siteCode":"G5B","userId":534}] 
DemoService.demoMethod(..) input:[{"orderSn":"2363462346","siteCode":"G5B","userId":2345}] 
DemoService.demoMethod(..) input:[{"orderSn":"1345324646","siteCode":"G5B","userId":2345}]
```

需要截取orderSn值，可以使用如下命名:
```sh
cat demo.txt | cut -d \" -f 4 | sort |uniq > ordeSnList.txt
```

使用cut 的“域”操作

根据` " `分成不同的区域(` -d " `),获取第4个区域的值(` -f 4`),即订单号所在区域，得到订单号

uniq 去重

cut只能按照单个字符分割,如果要按照字符串分割,可以使用awk。下面就是按照elapsed来分割，然后取第二区域的字符 234
```sh
echo 'asd elapsed 234' | awk -F "elapsed" '{print $2}'
 ```

执行结果(订单号:23452345已经去重):
```txt
4352345 4563456345 456343456 34563456 52323455 345634563456 23452345 2346134531 2363462346 1345324646 
```
###### 两个文件的交集，并集
1. 取出两个文件的并集(重复的行只保留一份)
```sh
cat file1 file2 | sort | uniq > file3 
```
2. 取出两个文件的交集(只留下同时存在于两个文件中的文件)
```sh
cat file1 file2 | sort | uniq -d > file3
```

3. 删除交集，留下其他的行
```sh
cat file1 file2 | sort | uniq -u > file3
```

###### 两个文件合并
一个文件在上，一个文件在下
```sh
cat file1 file2 > file3 一个文件在左，一个文件在右
paste file1 file2 > file3
```
###### 一个文件去掉重复的行
```sh
sort file | uniq # 注意：重复的多行记为一行，也就是说这些重复的行还在，只是全部省略为一行！
sort file | uniq –u # 可以把重复的行全部去掉，仅保留文件中的非重复行！
```

反向截取
```sh
cat decrByUseCounter | cut -d ":" -f 1-4 --complement | more
```