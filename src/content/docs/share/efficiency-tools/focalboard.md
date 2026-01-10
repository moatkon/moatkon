---
title: Focalboard
description: Focalboard
template: doc
tableOfContents: false
draft: false
lastUpdated: 2026-01-11 06:10:07
sidebar:
  order: 5.2
  badge:
    text: 画板·开源
    variant: note
---

### 先看
我是使用docker安装的,非常方便

![](/share/efficiency-tools/board/focalboard/u-1.png)
![](/share/efficiency-tools/board/focalboard/u-2.png)

**我是Trello的重度用户,在试用了Focalboard之后,发现Focalboard可以导入Trello的资料。加上其开源,部署方便,如果Trello收紧非付费用户的功能,我有极大的概率切换到此工具**

**因为我个人比较喜欢开源的产品,数据可以自己管控,对于中心化的产品(eg.[小画桌](/share/efficiency-tools/xiaohuazhuo)、[Trello](/share/efficiency-tools/trello)、[Milanote](/share/efficiency-tools/milanote))还是有点担心哪天资料突然就消失了。开源产品虽然数据可以管控,但是使用的便利性不如中心化的产品。有舍有得嘛**

![](/share/efficiency-tools/board/focalboard/focalboard-logo.svg)

##### 开源地址
https://github.com/mattermost-community/focalboard

##### 官网
https://www.focalboard.com/


##### 安装
```sh title="docker安装"
docker run -it -p 80:8000 mattermost/focalboard
```

