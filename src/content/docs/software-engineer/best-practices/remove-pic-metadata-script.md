---
title: 移除图片中的元信息
description: 移除图片中的元信息
template: doc
lastUpdated: 2024-08-08 00:19:11
---

因之前给奶奶的照片丢失了,需要重新给奶奶发送一些照片,考虑到未经处理过的照片含有GPS等元信息,涉及到隐私,故需要找工具清除这些元信息

在网上检索了一些工具,很麻烦,然后突然想到,是否可以写代码解决这个问题,于是我就找了[AI](/ai#claude)帮忙生成,2分钟就解决了我的问题,比在网上检索一堆信息快多了



```bash title="脚本"
# pip3 install Pillow
import os
from PIL import Image
import sys

def remove_metadata(image_path):
    try:
        # 打开图片
        image = Image.open(image_path)

        # 创建一个新的图像,不包含元数据
        data = list(image.getdata())
        image_without_exif = Image.new(image.mode, image.size)
        image_without_exif.putdata(data)

        # 保存新图像
        filename = os.path.splitext(image_path)
        new_filename = f"{filename[0]}1_{filename[1]}"
        image_without_exif.save(new_filename)

        print(f"已移除元数据并保存为: {new_filename}")
    except Exception as e:
        print(f"处理 {image_path} 时出错: {str(e)}")

def process_directory(directory):
    image_extensions = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(image_extensions):
                image_path = os.path.join(root, file)
                remove_metadata(image_path)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使用方法: python script.py <图片目录路径>")
    else:
        directory_path = sys.argv[1]
        if os.path.isdir(directory_path):
            process_directory(directory_path)
        else:
            print("提供的路径不是一个有效的目录")
```


```bash title="依赖安装"
pip3 install Pillow
```


```bash title="执行"
python3 remove_meta.py <图片目录路径>
```
