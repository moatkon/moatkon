// Giscus配置文件
// 请根据你的GitHub仓库信息修改以下配置

export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  strict: string;
  reactionsEnabled: string;
  emitMetadata: string;
  inputPosition: string;
  lang: string;
  loading: string;
}

// 默认配置
// 你需要访问 https://giscus.app 来获取正确的配置值
// 也可以通过环境变量来配置（优先级更高）
export const giscusConfig: GiscusConfig = {
  repo: import.meta.env.GISCUS_REPO || "moatkon/moatkon", // 你的GitHub用户名/仓库名
  repoId: import.meta.env.GISCUS_REPO_ID || "R_kgDOO_cyBw", // 从giscus.app获取
  category: import.meta.env.GISCUS_CATEGORY || "Announcements", // 讨论分类名称
  categoryId: import.meta.env.GISCUS_CATEGORY_ID || "DIC_kwDOO_cyB84CvDL1", // 从giscus.app获取
  mapping: import.meta.env.GISCUS_MAPPING || "pathname", // 页面映射方式
  strict: import.meta.env.GISCUS_STRICT || "0", // 严格匹配：0 或 1
  reactionsEnabled: import.meta.env.GISCUS_REACTIONS_ENABLED || "1", // 启用反应：0 或 1
  emitMetadata: import.meta.env.GISCUS_EMIT_METADATA || "0", // 发出元数据：0 或 1
  inputPosition: import.meta.env.GISCUS_INPUT_POSITION || "top", // 输入框位置：top 或 bottom
  lang: import.meta.env.GISCUS_LANG || "zh-CN", // 语言
  loading: import.meta.env.GISCUS_LOADING || "lazy" // 加载方式：lazy 或 eager
};

// 主题映射
export const themeMapping = {
  light: "light",
  dark: "dark",
  auto: "preferred_color_scheme"
} as const;

export type ThemeMode = keyof typeof themeMapping;
