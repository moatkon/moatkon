import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

// 创建一个插件来移除MDX节点
function removeMdxNodes() {
  return (tree) => {
    // 移除MDX JSX元素
    visit(tree, ['mdxJsxTextElement', 'mdxJsxFlowElement'], (node, index, parent) => {
      if (parent && index !== undefined) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
    
    // 移除MDX ESM导入/导出
    visit(tree, 'mdxjsEsm', (node, index, parent) => {
      if (parent && index !== undefined) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
    
    // 移除MDX表达式
    visit(tree, ['mdxTextExpression', 'mdxFlowExpression'], (node, index, parent) => {
      if (parent && index !== undefined) {
        parent.children.splice(index, 1);
        return [visit.SKIP, index];
      }
    });
    
    return tree;
  };
}

// 将MDX内容转换为纯Markdown
async function mdxToMarkdown(mdxContent) {
  try {
    const file = await remark()
      .use(remarkMdx)
      .use(removeMdxNodes)
      .use(remarkStringify)
      .process(mdxContent);
    return String(file);
  } catch (error) {
    // 出错时回退到原始内容
    return mdxContent;
  }
}

export async function GET(context) {
  const docs = await getCollection('docs');
  const mdParser = new MarkdownIt();
  
  // 预处理并添加 htmlContent
  const processedDocs = await Promise.all(docs
    .filter(post => post.id !== '404')
    .filter(post => post.data.draft !== true)
    .map(async (post) => {
      // 处理 MD 和 MDX 内容
      let htmlContent = '';
      if (post.body) {
        try {
          // 使用专业的MDX处理库将整个MDX文件转换为纯Markdown
          const markdownContent = await mdxToMarkdown(post.body);
          
          // 使用Markdown-it处理转换后的Markdown内容
          htmlContent = mdParser.render(markdownContent);
        } catch (error) {
          // 出错时回退到原始处理方式
          htmlContent = mdParser.render(post.body);
        }
      }
      
      return {
        ...post,
        htmlContent: sanitizeHtml(htmlContent || '', {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code', 'span', 'br', 'p', 'div', 'iframe']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height'],
            a: ['href', 'name', 'target', 'rel'],
            pre: ['class'],
            code: ['class'],
            span: ['style'],
            p: ['style'],
            div: ['style'],
            iframe: ['src', 'title', 'frameborder', 'allow', 'allowfullscreen', 'style']
          }
        })
      };
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
      link: `/${post.id}/`,
    })),
  });
}