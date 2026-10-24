import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';

const publicDir = fileURLToPath(new URL('../../public/', import.meta.url));
const sizeCache = new Map();

async function imageSize(src) {
  if (sizeCache.has(src)) return sizeCache.get(src);

  let size;
  try {
    const filePath = path.resolve(publicDir, decodeURIComponent(src).replace(/^\//, ''));
    if (filePath.startsWith(publicDir) && fs.existsSync(filePath)) {
      const { width, height } = await sharp(filePath).metadata();
      if (width && height) size = { width, height };
    }
  } catch {
    // 无法读取尺寸时保持原样, 不影响构建
  }

  sizeCache.set(src, size);
  return size;
}

/** 为 Markdown 图片补充懒加载、异步解码与固有尺寸, 减少首屏请求和布局偏移。 */
export default function rehypeImageAttributes() {
  return async (tree) => {
    const images = [];
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') images.push(node);
    });

    await Promise.all(
      images.map(async (node) => {
        node.properties ??= {};
        node.properties.loading ??= 'lazy';
        node.properties.decoding ??= 'async';

        const src = node.properties.src;
        if (typeof src !== 'string' || !src.startsWith('/')) return;
        if (node.properties.width && node.properties.height) return;

        const size = await imageSize(src);
        if (!size) return;
        node.properties.width ??= size.width;
        node.properties.height ??= size.height;
      })
    );
  };
}
