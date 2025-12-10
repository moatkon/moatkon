import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';

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

// 使用remark处理MDX内容
remark()
  .use(remarkMdx)
  .use(remarkStringify)
  .process(mdxContent)
  .then((file) => {
    console.log(String(file));
  })
  .catch((error) => {
    console.error(error);
  });