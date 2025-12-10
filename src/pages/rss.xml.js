import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const mdParser = new MarkdownIt();

// 移除MDX组件标签的函数
function removeMdxComponents(content) {
  return content
    // 移除import语句
    .replace(/import\s+[^;]+;/g, '')
    // 移除MDX组件标签，包括自闭合标签和带内容的标签
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '')
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, '')
    // 移除HTML中的空段落标签
    .replace(/<p>\s*<\/p>/g, '')
    // 移除多余的空白行
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

export async function GET(context) {
  const docs = await getCollection('docs');
  
  // 预处理并添加 htmlContent
  const processedDocs = docs
    .filter(post => post.id !== '404')
    .filter(post => post.data.draft !== true)
    .map((post) => {
      // 处理 MD 和 MDX 内容
      let htmlContent = '';
      if (post.body) {
        // 先移除MDX组件标签
        const cleanedContent = removeMdxComponents(post.body);
        // 再转换为HTML
        htmlContent = mdParser.render(cleanedContent);
      }
      
      return {
        ...post,
        htmlContent: sanitizeHtml(htmlContent || '', {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height'],
            a: ['href', 'name', 'target', 'rel'],
            pre: ['class'],
            code: ['class']
          }
        })
      };
    });
  
  return rss({
    title: 'Moatkon',
    description: 'Build your moat | 构建你的护城河',
    site: context.site,
    items: processedDocs.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.lastUpdated || new Date('2024-01-01'),
      content: post.htmlContent,
      link: `/${post.id}/`,
    })),
  });
}