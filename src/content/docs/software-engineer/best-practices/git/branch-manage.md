---
title: Git分支管理
description: Git分支管理
template: doc
tableOfContents: false
lastUpdated: 2025-11-22 15:36:08
---

### Git分支最佳实践
![Git分支管理——最佳实践](/software-engineer/git/Moatkon-feature-git-manage-best.drawio.png)

该分支管理是自己目前实践过程中相对比较成熟和稳定的分支管理方案


#### 优点
- 多需求并行
- 无需多套环境
- SDK版本管理无冲突
- 当前feature功能受其他feature监督,可以及时发现问题,推动相关feature分支方案调整
- 整体部署成本低

#### 缺点
- 如果dev、test或者pre分支被删除,已经合并进去的feature分支需要重新合并。_实际上,出现上述分支被删除的情况非常好,几乎不会发生.但是不排除,研发人员误操作等特殊情况,可以忽略_
- 因为是先merge into main,如果有Bug需要回滚等操作,只能提交bugfix,不能将整体的feature code回滚


### 历史采用的分支管理

![历史采用的分支管理](/software-engineer/git/Moatkon-feature-git-manage-bad.drawio.png)

**优点:**
- 环境物理隔离
- feature不受其他feature影响
- 因为是后merge into main,如果有Bug无回滚操作,可以在已有的release分支上fix bug

**缺点:**
- 环境物理隔离
- feature不受其他feature影响,在生产环境可能会导致Bug
- 部署成本高
- SDK版本冲突严重,因为相互独立。经常发生在上线阶段临时升级版本号的情况
- 每次部署只能测试一个feature
