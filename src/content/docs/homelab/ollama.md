---
title: Ollama
description: Ollama
template: doc
lastUpdated: 2025-12-17 20:59:09
draft: false
sidebar:
  order: 6
---

官网: https://ollama.com

Docker运行并运行Ollama:
```sh
# 安装ollama
sudo docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama

# 运行模型
sudo docker exec -it ollama ollama run qwen3-vl:8b
```
