import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

// 测试MDX内容
const mdxContent = `
import { Card } from '@astrojs/starlight/components';

<Card>
  #### 职业
  软件工程师 · Java · 高级
</Card>

## 标题

这是一个段落，包含一些文本。

<Watched date="20250922"/>

另一个段落。
`;

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

// 使用remark处理MDX内容
remark()
  .use(remarkMdx)
  .use(removeMdxNodes)
  .use(remarkStringify)
  .process(mdxContent)
  .then((file) => {
    console.log(String(file));
  })
  .catch((error) => {
    console.error(error);
  });