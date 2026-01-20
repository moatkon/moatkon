import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const docs = await getCollection('docs');
  
  
  return rss({
    title: 'Moatkon',
    description: 'Build your moat | 构建你的护城河',
    site: context.site,
    items: docs
    .filter(post => post.slug !== '404')
    .filter(post => post.data.draft !== true)
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.lastUpdated || new Date('2024-01-01'),
      link: `/${post.id}/`,
    })),
  });
}