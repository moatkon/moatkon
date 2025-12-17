---
title: Ollama
description: Ollama
template: doc
lastUpdated: 2025-12-17 21:47:11
draft: false
sidebar:
  order: 6
---

官网: https://ollama.com

#### Docker运行并运行Ollama:
```sh
# 安装ollama
sudo docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# 运行模型
sudo docker exec -it ollama ollama run qwen3-vl:8b
```

#### 进入ollama容器
```sh
# sudo docker exec -it <容器名> /bin/bash
sudo docker exec -it ollama /bin/bash
```

#### Ollama模型库:
https://ollama.com/library

#### Ollama API 文档
https://docs.ollama.com/api/introduction

#### Ollama 命令行操作文档
https://docs.ollama.com/cli
