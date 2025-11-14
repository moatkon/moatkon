import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';

export async function GET(context) {
  const docs = await getCollection('docs');
  
  // 预处理并添加 htmlContent
  const processedDocs = docs
    .filter(post => post.id !== '404')
    .filter(post => post.data.draft !== true)
    .map((post) => ({
      ...post,
      htmlContent: sanitizeHtml(post.rendered?.html || '', {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          ...sanitizeHtml.defaults.allowedAttributes,
          img: ['src', 'alt', 'title', 'width', 'height'],
          a: ['href', 'name', 'target', 'rel']
        }
      })
    }));
  
  return rss({
    title: 'Moatkon',
    description: 'Build your moat | 构建你的护城河',
    site: context.site,
    items: processedDocs.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.lastUpdated || new Date('2024-01-01'),
      content: post.htmlContent,
      link: `${post.id}`,
    })),
  });
}