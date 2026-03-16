import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import remarkMdx from 'remark-mdx';
import sanitizeHtml from 'sanitize-html';

/**
 * 将 MDX 内容转换为 HTML
 * @param {string} mdxContent - MDX 原始内容
 * @param {string} siteUrl - 网站基础 URL
 * @returns {Promise<string>} - 转换后的 HTML 内容
 */
async function mdxToHtml(mdxContent, siteUrl) {
  if (!mdxContent) return '';
  try {
    // 移除 import 语句和 JSX 组件，因为它们无法在 RSS 中渲染
    let cleanedContent = mdxContent
      // 移除 import 语句
      .replace(/^import\s+.*?from\s+['"].*?['"]\s*;?\s*$/gm, '')
      // 移除 JSX 注释 {/* ... */}
      .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
      // 移除 JSX 组件（简单处理，匹配 <组件名 ... />）
      .replace(/<[A-Z][A-Za-z0-9]*[\s\S]*?\/>/g, '')
      // 移除 JSX 块组件（匹配 <组件名>...</组件名>）
      .replace(/<[A-Z][A-Za-z0-9]*[\s\S]*?>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, '')
      .trim();

    // 使用 remark 处理 Markdown/MDX 并转换为 HTML
    const result = await remark()
      .use(remarkHtml, { sanitize: false })
      .process(cleanedContent);

    let html = String(result);

    // 清理和规范化 HTML
    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code'
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        a: ['href', 'name', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
        code: ['class'],
        pre: ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      // 不要移除空标签
      nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript']
    });

    // 移除标题中的锚点链接（通常包含 "Section titled" 文本）
    // 只移除 <a> 标签中的 "Section titled" 链接，保留其他内容
    html = html.replace(
      /<a\s+[^>]*class=["']?header-anchor["']?[^>]*>[^<]*Section titled[^<]*<\/a>/gi,
      ''
    );

    // 将相对路径的图片和链接转换为完整 URL
    const baseUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;

    // 转换图片 src
    html = html.replace(
      /<img\s+([^>]*?)src=["']\/([^"']+)["']([^>]*)>/g,
      (match, before, path, after) => {
        const fullUrl = `${baseUrl}/${path}`;
        return `<img ${before}src="${fullUrl}"${after}>`;
      }
    );

    // 转换链接 href（仅转换站内链接，以 / 开头但不是 // 开头的）
    html = html.replace(
      /<a\s+([^>]*?)href=["'](\/[^/"'][^"']*)["']([^>]*)>/g,
      (match, before, path, after) => {
        const fullUrl = `${baseUrl}${path}`;
        return `<a ${before}href="${fullUrl}"${after}>`;
      }
    );

    return html;
  } catch (error) {
    console.error('Error converting MDX to HTML:', error);
    return '';
  }
}

export async function GET(context) {
  const docs = await getCollection('docs');
  // context.site 是 URL 对象，需要转换为字符串
  const siteUrl = context.site ? context.site.toString() : 'https://moatkon.com';

  // 过滤并处理文章
  const processedDocs = await Promise.all(
    docs
      .filter(post => post.slug !== '404')
      .filter(post => post.data.draft !== true)
      .map(async (post) => {
        // 将 MDX body 转换为 HTML，并转换图片为完整 URL
        const content = await mdxToHtml(post.body, siteUrl);

        return {
          title: post.data.title,
          description: post.data.description,
          pubDate: post.data.lastUpdated || new Date('2024-01-01'),
          link: `/${post.id}/`,
          content: content, // 添加完整的 HTML 内容
        };
      })
  );

  return rss({
    title: 'Moatkon',
    description: 'Build your moat | 构建你的护城河',
    site: context.site,
    items: processedDocs,
    // 启用完整内容支持
    customData: '<language>zh-cn</language>',
  });
}