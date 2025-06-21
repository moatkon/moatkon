---
title: LocalSend——文件传输
description: LocalSend
template: doc
lastUpdated: 2024-09-17 00:55:04
---

### 背景
最近换了三星手机,因为存储空间有限,需要将三星手机的文件备份到硬盘。之前我一直使用Android File Transfer,这次本来也是用它,但是发现三星屏幕息屏导致传输中断,可以设置不息屏来解决这个问题。

使用Android File Transfer让我难受一点是需要数据线才可以使用,这让我需要找到合适的线才能正常传输数据。其实，按照我的想法，完全可以不使用USB线,使用无线网就可以了

### HandShaker太老了,不被兼容
HandShaker是锤子科技的产品,原本我以为在三星手机上可以正常使用,但实际情况是HandShaker太久没有维护了,三星手机不兼容老的APP了,无法安装。

### 发现LocalSend
于是,我继续寻找方案来解决,就Google了一下,关键字 "android macos file transfer" , 在一篇reddit上发现了LocalSend.

https://www.reddit.com/r/MacOS/comments/1ah0bgn/how_to_transfer_files_from_android_to_mac/

进一步了解后,发现十分契合我的需求。
1. 无线
2. 支持Android到macOS的传输。实际上是全平台支持的

后来发现,LocalSend是开源的,让我瞬间精神了。因为我喜欢开源,开源就意味着安全

- [官网](https://localsend.org/zh-CN)
- [开源](https://github.com/localsend/localsend)


### 使用
##### 在macOS上
![](/share/efficiency-tools/localsend/macOS.png)

##### 在Android手机上

![](/share/efficiency-tools/localsend/android.jpg)
