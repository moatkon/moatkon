import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt();



export async function GET(context) {
  const docs = await getCollection('docs');
  // console.log(docs[10].rendered.html);
  return rss({
    // 输出的 xml 中的`<title>`字段
    title: 'Moatkon',
    // 输出的 xml 中的`<description>`字段
    description: 'Build your moat | 构建你的护城河',
    // 从端点上下文获取项目“site”
    // https://docs.astro.build/zh-cn/reference/api-reference/#contextsite
    site: context.site,
    // 输出的 xml 中的`<item>`数组
    // 有关使用内容集合和 glob 导入的示例，请参阅“生成`items`”部分 https://moatkon.com/resume-yangrunkang/
    items: docs
        .filter(post => post.id !== '404')
        .filter(post => post.data.draft !== true)
        .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.lastUpdated || '2024-01-01',
        content: sanitizeHtml(parser.render(post.body || ''), {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
        }),
        link: `${post.id}`,
      })),
    // (可选) 注入自定义 xml
    // customData: `<language>en-us</language>`,
  });
}