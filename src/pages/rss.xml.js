import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const mdParser = new MarkdownIt();

// 自定义MDX组件渲染函数
function renderMdxComponent(componentName, attributes) {
  // 根据组件名称和属性渲染为相应的文本内容
  switch (componentName) {
    case 'Watched':
      const date = attributes?.date;
      const text = "之前看过,记录一下." + (date ? " 📝" + date : "");
      return `<span style="background-color: var(--sl-color-gray-6); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.9em;">${text}</span>`;
    
    case 'WatchTime':
      const watchDate = attributes?.date;
      return `<span style="color: var(--sl-color-gray-3);"><br/>于 ${watchDate} 看完</span>`;
      
    default:
      // 对于其他未知组件，返回空字符串
      return '';
  }
}

// 替换MDX组件标签为HTML的函数
function replaceMdxComponentsWithHtml(content) {
  // 匹配MDX组件标签的正则表达式
  const componentRegex = /<([A-Z][A-Za-z0-9]*)\s*([^>]*)\/?>/g;
  
  return content.replace(componentRegex, (match, componentName, attrsString) => {
    // 解析属性
    const attributes = {};
    const attrRegex = /(\w+)=(?:"([^"]*)"|{([^}]*)})/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      const key = attrMatch[1];
      // 处理字符串值和表达式值
      const value = attrMatch[2] || attrMatch[3];
      attributes[key] = value;
    }
    
    // 渲染组件为HTML
    return renderMdxComponent(componentName, attributes);
  });
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
        try {
          // 替换MDX组件标签为HTML内容
          const processedContent = replaceMdxComponentsWithHtml(post.body);
          
          // 使用内置的rendered.html（如果可用）
          if (post.rendered?.html) {
            htmlContent = post.rendered.html;
          } else {
            // 否则使用Markdown-it处理内容
            htmlContent = mdParser.render(processedContent);
          }
        } catch (error) {
          // 出错时回退到原始处理方式
          htmlContent = mdParser.render(post.body);
        }
      }
      
      return {
        ...post,
        htmlContent: sanitizeHtml(htmlContent || '', {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'pre', 'code', 'span', 'br']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height'],
            a: ['href', 'name', 'target', 'rel'],
            pre: ['class'],
            code: ['class'],
            span: ['style']
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