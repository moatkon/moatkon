import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
const isPrd = process.env.VERCEL_ENV == "production";
import starlightImageZoom from 'starlight-image-zoom';
import starlightSidebarSwipe from 'starlight-sidebar-swipe';
import starlightScrollToTop from "starlight-scroll-to-top";
import starlightLlmsTxt from "starlight-llms-txt";
import mermaid from "astro-mermaid";
import starlightAutoDrafts from "starlight-auto-drafts";
import starlightPageActions from 'starlight-page-actions';
import starlightUiTweaks from 'starlight-ui-tweaks';

const siteUrl = isPrd ? "https://moatkon.com" : "http://localhost:4321";

export default defineConfig({
  site: siteUrl,
  integrations: [
    mermaid({
      theme: "forest",
    }),
    starlight({
      expressiveCode: {
        styleOverrides: { borderRadius: "0.6rem" },
        // themes:['starlight-dark']
      },
      favicon: "/favicon.ico",
      // defaultLocale: 'root',
      // locales: {
      //   root: {
      //     label: '简体中文',
      //     lang: 'zh-CN', // lang 是 root 语言必须的
      //   }
      // },
      defaultLocale: "root",
      locales: {
        // en: { label: 'English' },
        root: { label: "简体中文", lang: "zh-CN" },
      },
      plugins: [
        starlightImageZoom(),
        starlightUiTweaks({
          // navbarLinks: [
          //   { label: "Documentation", href: "/docs" },
          //   { label: "API Reference", href: "/api" },
          // ],
          ad: { // 不能赋写TableOfContents组件
            image: "/kofi.svg",
            title: "Coffee",
            description: "One cup of coffee, twice the motivation.",
            buttonLabel: "Buy me a coffee",
            buttonHref: "https://ko-fi.com/moatkon",
          },
        }),
        starlightSidebarSwipe(),
        starlightPageActions({
          baseUrl: "https://moatkon.com/",
        }),
        starlightAutoDrafts(),
        starlightLlmsTxt(),
        starlightScrollToTop({
          position: "right",
          tooltipText: "回到顶部",
          showTooltip: false,
          smoothScroll: true,
          threshold: 20,
          svgPath: "M12 4L8 10H10V16H14V10H16L12 4M10 16L12 20L14 16",
          svgStrokeWidth: 1,
          borderRadius: "50",
        }),
        // starlightImageZoom({ showCaptions: false }),
      ],
      title: isPrd ? "Moatkon" : "Dev",
      lastUpdated: true,
      // logo: {
      //   light: '/src/assets/moatkon.svg',
      //   dark: '/src/assets/moatkon.svg'
      // },
      description: "Build your moat.",
      head: [
        // Font preload for better performance
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.googleapis.com",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: "anonymous",
          },
        },
        //ga 已经使用cf标记管理来设置ga了
        // {
        //   tag: 'script',
        //   attrs: {
        //     src: isPrd ? 'https://www.googletagmanager.com/gtag/js?id=G-83FGM7HTQ2' : '/lib/devMode.js',
        //     async: true
        //   }
        // },
        // {
        //   tag: 'script',
        //   attrs: {
        //     src: isPrd ? '/lib/gtag.js' : '/lib/devMode.js'
        //   }
        // },
        // adsense
        {
          tag: "script",
          attrs: {
            src: isPrd
              ? "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1453990415987216"
              : "/lib/devMode.js",
            async: true,
            crossorigin: "anonymous",
          },
        },
        // adsense元标记
        {
          tag: "meta",
          attrs: {
            name: "google-adsense-account",
            content: "ca-pub-1453990415987216",
          },
        },
      ],
      customCss: [
        // 你的自定义 CSS 文件的相对路径
        "./src/styles/fonts.css",
        "./src/styles/root.css",
        "./src/styles/custom.css",
        "./src/styles/md.css",
        "./src/styles/aside.css",
      ],
      // 目录配置
      tableOfContents: {
        minHeadingLevel: 1,
        maxHeadingLevel: 4,
      },
      // lastUpdated: false,
      // pagination: false,
      components: {
        Footer: "./src/components/Footer.astro",
        Header: './src/components/Header.astro',
        // TableOfContents: './src/components/TableOfContents.astro',
      },
      social: [
        // { icon: 'x.com', label: '@moatkon', href: 'https://x.com/moatkon' },
        {
          icon: "github",
          label: "@moatkon",
          href: "https://github.com/moatkon",
        },
        {
          icon: "email",
          label: "gmail",
          href: "mailto:moatkon@gmail.com?subject=Moatkon护城河&body=构建你的护城河",
        },
        { icon: "rss", label: "rss", href: `${siteUrl}/rss.xml` },
      ],
      sidebar: [
        {
          label: "软件工程师",
          collapsed: true,
          // 在网站大的版本下设置,这样就会自动隐藏另一个
          items: [
            { label: "README", link: "/software-engineer/readme" },
            {
              label: "基础",
              collapsed: true,
              autogenerate:{directory:"/software-engineer/base"},
            },
            {
              label: "JVM",
              collapsed: true,
              autogenerate:{directory:"/software-engineer/jvm"},
            },
            {
              label: "数据库",
              collapsed: true,
              autogenerate:{directory:"/software-engineer/database/"},
            },
            {
              label: "消息队列",
              collapsed: true,
              items: [
                { label: "消息队列", link: "/software-engineer/mq" },
                {
                  label: "Kafka",
                  autogenerate:{directory:"/software-engineer/mq/kafka"},
                },
                {
                  label: "RabbitMQ",
                  autogenerate:{directory:"/software-engineer/mq/rabbitmq"},
                },
                {
                  label: "RocketMQ",
                  autogenerate:{directory:"/software-engineer/mq/rocketmq"},
                },
              ],
            },
            {
              label: "缓存",
              collapsed: true,
              items: [
                {
                  label: "Redis",
                  items: [
                    {
                      label: "Redis",
                      link: "/software-engineer/cache/redis" /* ,badge: { text: '需要进一步拆分', variant: 'success' } */,
                    },
                  ],
                },
              ],
            },
            {
              label: "分布式",
              collapsed: true,
              autogenerate: { directory: '/software-engineer/distributed/'},
            },
            {
              label: "框架",
              collapsed: true,
              items: [
                {
                  label: "Spring框架",
                  collapsed: false,
                  autogenerate: { directory: '/software-engineer/framework/spring/'},
                },
                {
                  label: "Dubbo框架",
                  collapsed: false,
                  autogenerate: { directory: '/software-engineer/framework/dubbo/'},
                },
                {
                  label: "MyBatis",
                  collapsed: false,
                  autogenerate: { directory: '/software-engineer/framework/mybatis/'},
                },
              ],
            },
            {
              label: "算法",
              autogenerate: { directory: '/software-engineer/algorithm'},
              collapsed: true,
            },
            {
              label: "ES",
              collapsed: true,
              autogenerate: { directory: '/software-engineer/es/'},
            },
            {
              label: "部署",
              autogenerate: { directory: '/software-engineer/deploy/'},
              collapsed: true
            },
            {
              label: "DDD应用架构",
              collapsed: true,
              autogenerate: { directory: '/software-engineer/ddd'},
            },
            {
              label: "Linux",
              collapsed: true,
              autogenerate: {directory: "/software-engineer/linux/"},
            },
            {
              label: "Spring Cloud Gateway",
              collapsed: true,
              autogenerate: {directory: "/software-engineer/spring-cloud-gateway/"},
            },
            {
              label: "Git",
              collapsed: true,
              autogenerate: {directory: "/software-engineer/git/"},
            },
            {
              label: "最佳实践",
              collapsed: true,
              items: [
                {
                  label: "案例·Case",
                  collapsed: false,
                  autogenerate: {directory: "/software-engineer/best-practices/case/"},
                },
                {
                  label: "通用能力建设",
                  collapsed: false,
                  autogenerate: {directory: "/software-engineer/best-practices/general-ability/"},
                },
                {
                  label: "如何设置超时",
                  link: "/software-engineer/best-practices/timeout",
                },
                {
                  label: "自定义注解实现限流",
                  link: "/software-engineer/best-practices/custom-annotations-to-limit-and-downgrade",
                },
                {
                  label: "优化现有系统",
                  link: "/software-engineer/best-practices/optimize-existing-system",
                },
                {
                  label: "代码里的那些兜底策略",
                  link: "/software-engineer/best-practices/fallback-strategies-in-code",
                },
                {
                  label: "ShardingJDBC实践",
                  link: "/software-engineer/best-practices/sharding-jdbc-4_1_1" /* ,badge: { text: '编写中', variant: 'tip' } */,
                },
                {
                  label: "SpringBoot集成多数据源",
                  link: "/software-engineer/best-practices/spring-boot-multi-datasource",
                  badge: { text: "纯记录", variant: "default" },
                },
                {
                  label: "移除图片元信息脚本",
                  link: "/software-engineer/best-practices/remove-pic-metadata-script",
                },
                {
                  label: "解决ShardingJDBC分表过多导致启动慢的问题",
                  link: "/software-engineer/best-practices/fix-sharding-jdbc-slow-startup",
                },
                {
                  label: "接口超时治理",
                  link: "/software-engineer/best-practices/interface-timeout-management",
                },
                {
                  label: "刷数的最佳姿势",
                  link: "/software-engineer/best-practices/flush-data",
                },
                {
                  label: "数据迁移",
                  link: "/software-engineer/best-practices/migration",
                },
                {
                  label: "Http Proxy",
                  link: "/software-engineer/best-practices/http-proxy",
                },
              ],
            },
            {
              label: "React",
              collapsed: true,
              badge: { text: "前端", variant: "tip" },
              autogenerate: { directory: '/software-engineer/react'},
            },
          ],
        },
        {
          label: "英语",
          collapsed: true,
          items: [
            { label: "说明", link: "/english" },
            {
              label: "英文网站",
              link: "/english/website",
              badge: { text: "大量输入", variant: "default" },
            },
            {
              label: "Duolingo 多邻国",
              link: "/english/duolingo",
              attrs: { style: "text-decoration: line-through;color:grey" },
            },
            { label: "Cambly免费教材", link: "/english/cambly" },
            {
              label: "词汇量测试",
              link: "/english/myvocab",
              badge: { text: "词汇量渣渣级别", variant: "default" },
            },
            {
              label: "Anki",
              link: "/english/anki",
              badge: { text: "强烈推荐", variant: "default" },
            },
            {
              label: "English News In Levels",
              collapsed: true,
              items: [
                {
                  label: "Level 1",
                  link: "/english/english-news-in-levels/level/1",
                },
              ],
            },
            {
              label: "日常英语",
              badge: { text: "已完结", variant: "tip" },
              autogenerate: { directory: '/english/english-for-everyday-activities/'},
              collapsed: true,
            },
            {
              label: "网络",
              collapsed: true,
              autogenerate: { directory: '/english/internet'},
            },
            {
              label: "视频",
              collapsed: true,
              autogenerate: { directory: '/english/videos'},
            },
            {
              label: "辅助工具",
              collapsed: true,
              autogenerate: { directory: '/english/auxiliary-tools'},
            },
            {
              label: "NotebookLM",
              collapsed: true,
              autogenerate: { directory: '/english/notebooklm'},
            },
          ],
        },
        {
          label: "钢琴🎹",
          collapsed: true,
          autogenerate: { directory: '/music/piano'},
        },
        {
          label: "分享",
          collapsed: true,
          items: [
            { label: "一起分享吧！", link: "/share" },
            {
              label: "效率工具",
              collapsed: true,
              autogenerate: { directory: '/share/efficiency-tools'},
            },
            {
              label: "电影🎬",
              collapsed: true,
              autogenerate: { directory: '/share/movie'},
            },
            {
              label: "实用",
              collapsed: true,
              autogenerate: { directory: '/share/useful'},
            },
            {
              label: "正向",
              collapsed: true,
              autogenerate: { directory: '/share/positive'},
            },
            { label: "博主", link: "/share/youtube" },
            { label: "音乐🎵", link: "/share/music" },
            { label: "网站", link: "/share/website" },
            { label: "视频", link: "/share/video" },
            { label: "UI组件库", link: "/share/ui-component-library" },
            { label: "第一次恢复魔方", link: "/share/geek-thing/rubik-cube" },
          ],
        },
        {
          label: "AI",
          collapsed: true,

          items: [
            { label: "AI", link: "/ai" },
            {
              label: "Dify",
              collapsed: true,
              items: [
                { label: "Docker安装Dify", link: "/ai/dify" },
                {
                  label: "发布moatkon网站及其子域",
                  link: "/ai/dify/project/deploy",
                },
                { label: "知识库开发记录", link: "/ai/dify/knowledge-base" },
              ],
            },
            { label: "Gemini Cli", link: "/ai/gemini/cli" },
            { label: "AI相关的Github项目", link: "/ai/github" },
            { label: "AI in Work", link: "/ai/in-work" },
            { label: "Vibe coding", link: "/ai/vibe-coding" },
            { label: "AI中转站", link: "/ai/transit-station" },
          ],
        },
        {
          label: 'HomeLab',
          collapsed: true,
          autogenerate: { directory: '/homelab'},
        }
        // {
        //   label: '增长计划',
        //   collapsed: true,
        //   items: [
        //     {label: 'Home',link: '/growth'},
        //     {label: '复盘·Retrospective',link: '/growth/retrospective'},
        //     {label: 'ROI',link: '/growth/roi'},
        //     // {label: 'Start A Business',link: '/growth/start-a-business'},
        //   ]
        // }
      ],
    }),
    // 集成react
    react({
      // namespace: "React",
      include: ["**/moatkon-react/*"],
      // experimentalReactChildren: true,// 告诉 Astro 将子元素始终作为 React vnodes 传递给 React。虽然这样做会有一些运行时成本，但有助于保持兼容性
    }),
  ],
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // 抑制空块警告
          if (warning.code === "EMPTY_BUNDLE") return;
          // 抑制特定的空块警告
          if (
            warning.message &&
            warning.message.includes("Generated an empty chunk")
          )
            return;
          warn(warning);
        },
        output: {
          // 配置块命名以避免生成空块
          manualChunks: (id) => {
            // 将 starlight-showcases 相关的模块合并到一个块中
            if (id.includes("starlight-showcases")) {
              return "starlight-showcases";
            }
            // 将 astro-embed 相关的模块合并到一个块中
            if (id.includes("@astro-community/astro-embed")) {
              return "astro-embed";
            }
            // 将 lite-youtube-embed 合并到一个块中
            if (id.includes("lite-youtube-embed")) {
              return "lite-youtube-embed";
            }
          },
        },
      },
    },
  },
});
