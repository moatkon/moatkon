---
title: Ollama
description: Ollama
template: doc
lastUpdated: 2025-12-18 00:04:57
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

#### 推荐模型
- [granite4](https://ollama.com/library/granite4): Granite 4.0 模型通过结合开源指令数据集（许可开放）和内部收集的合成数据集对其基础模型进行微调。它们具备更优的指令遵循（IF）和工具调用能力，使其在企业应用中更高效。支持中文
- [qwen3](https://ollama.com/library/qwen3): Granite 4.0 模型通过结合开源指令数据集（许可开放）和内部收集的合成数据集对其基础模型进行微调。它们具备更优的指令遵循（IF）和工具调用能力，使其在企业应用中更高效。支持中文
