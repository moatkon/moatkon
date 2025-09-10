---
title: Git
description: git
template: doc
tableOfContents: false
lastUpdated: 2025-09-10 17:18:42
---
:::tip
分享自己在开发中最常用的几个git命令
:::

##### 重置到某一次提交

```sh
# 退到/进到 指定commit的sha码
git reset --hard <commit-id>

# 强推到远程
git push origin HEAD --force
```

##### 将本地分支与远程分支解绑
```sh
git branch --unset-upstream
```

##### 修改.gitignore使之生效
```sh
# 清楚tracked缓存
git rm -r --cached .
# 重新添加文件
git add .
```

##### 获取一个目录下的所有git项目的当前分支名和项目名
```sh
#!/bin/bash
dir_path=`pwd`
filelist=`ls $dir_path`
for file in $filelist
do
 # 检查目录和git目录是否存在
 if [[ -d $file ]] && [[ -d $dir_path/$file/.git ]]; then
     branch=`cat $dir_path/$file/.git/HEAD`
     # 分支名
     sub_branch=${branch: 16}
     # 打印
     echo "$sub_branch    $file"
 fi
done
```

##### 一个文件夹下的所有项目都创建相同的分支
```sh
#!/bin/bash
dir_path=`pwd`
filelist=`ls $dir_path`
for file in $filelist
do
 # 检查目录和git目录是否存在
 if [[ -d $file ]] &amp;&amp; [[ -d $dir_path/$file/.git ]]; then
      # 每行要加分号 ";" ,一开始没有加分号,就报错
      cd $dir_path/$file;
      git checkout -b 你的分支名;
      cd $dir_path;
 fi
done
```

##### 将当前仓库的所有变动提交到仓库
```sh
#!/bin/bash
# 拉取最新代码到本地仓库
echo "=========>>>拉取最新代码到本地仓库,开始fetch操作"
git fetch
echo "=========>>>fetch 成功"


# 检查本地分支是否落后于远程分支,如果是,则先合并远程分支
if [ -n "$(git status -uno | grep 'Your branch is behind')" ]; then
    echo "=========>>>本地分支落后于远程分支,先合并远程分支"
    git pull
    echo "=========>>>合并远程分支完成"
fi

# 获取当前分支
branch=$(git rev-parse --abbrev-ref HEAD)

# 检查是否存在未推送的本地 commit,如果有则先执行推送操作
if [ -n "$(git log origin/${branch}..HEAD --oneline)" ]; then
    echo "=========>>>存在未推送的本地 commit,先执行推送操作"
    git push 
    echo "=========>>>push 完成"
fi

# 检查是否存在未提交的修改
if [ -z "$(git status --porcelain)" ]; then
    echo "=========>>>当前仓库没有未提交的修改,很干净"
    exit 1
fi

timeValue=0

# 获取提交注释
if [ -z "$1" ]
  then
    echo "=========>>>请在 $timeValue s内输入提交注释,否则使用默认提交信息进行提交 | 快捷操作:直接回车:"
    read -t $timeValue message

    # echo "=========>>>请在输入提交注释 | 如需默认提交信息,请按回车键 "
    # read message
    if [ -z "$message" ]
      then
        # echo "必须输入提交注释!!!!!!!!!!!!"
        # exit 1
        timestamp=$(date +%s)
        message="moatkon.com commit $timestamp"
    fi
  else
    message="$1"
fi

# 添加所有修改到 Git
git add .

# 提交修改
git commit -m "$message" --no-verify

# 输出提交信息
echo "=========>>>提交注释:  $message"

# 推送代码到远程 Git 仓库
git push

# 输出推送信息
echo "=========>>>已将代码推送到远程仓库"

```

##### 使用命令将分支合并到指定分支,比如main

1. 确保你在当前分支，并且已经提交了所有的更改：
```bash
git status
git add .
git commit -m "Your commit message"
```

2. 切换到 main 分支：
```bash
git checkout main
```

3. 更新 main 分支到最新状态：
```bash
git pull origin main
```

4. 合并当前分支到 main 分支：
```bash
git merge <当前分支的名称>
```
> 从远程分支就是 git merge origin <当前分支的名称>

5. 如果合并过程中没有冲突，推送合并后的 main 分支到远程仓库：
```bash
git push origin main
```



##### 查看当前修改的地方
```sh
git diff
```

如果要查看特定的commit id的变动,则使用
```sh
git show <commit-id>
```

##### Git branch相关操作
```sh

git branch <branch-name> # 创建分支

git branch -b <branch-name> # 创建分支并切换到新分支

git checkout -b 分支名 origin/分支名 #直接 checkout 并跟踪远程分支


git fetch origin # 拉远处分支到本地,这样在本地就可以看到
git fetch # 我一般用这个

# 删除分支,删除分支前要先切换到其他分支,不然删除不了
git branch -d <branch-name> # 安全删除
git branch -D <branch-name> # 强制删除

git push origin HEAD # 在远程创建一个新分支,很你的本地分支一样

git branch -a #查看所有分支（本地 + 远程）

git branch -r #只看远程分支


```

#### Git代理设置
```bash
git config --global http.https://github.com.proxy socks5://127.0.0.1:33211
```

#### Git长路径支持
```bash
git config --system core.longpaths true
```

#### Github access token 配置
```bash
https://<username>:<access token>@github.com/<username>/<repositoryname>.git
```
