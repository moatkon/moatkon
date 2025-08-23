import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
const isPrd = process.env.VERCEL_ENV == "production";
import starlightImageZoom from "starlight-image-zoom";
// import starlightBlog from 'starlight-blog';
import starlightScrollToTop from "starlight-scroll-to-top";
import starlightLlmsTxt from "starlight-llms-txt";
import mermaid from "astro-mermaid";
import starlightAutoDrafts from "starlight-auto-drafts";
// import starlightDocSearch from '@astrojs/starlight-docsearch';
// https://github.com/matteotagliatti/astro-music-player
// https://github.com/AREA44/astro-audionaut

const siteUrl = isPrd ? "https://moatkon.com" : "http://localhost:4321";

// https://astro.build/config
// 详细配置方式 https://docs.astro.build/zh-cn/reference/configuration-reference/
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
        starlightImageZoom({ showCaptions: false }),
        // starlightBlog({
        //   title: 'Blog',
        //   authors: {
        //     moatkon: {
        //       name: 'Moatkon',
        //       picture: '/moatkon/moatkon.svg',
        //       url: isPrd ? 'https://www.moatkon.com/contact' : 'http://localhost:4321/contact'
        //     },
        //   },
        //   prefix: 'blog' // 文档目录也要修改
        // }),
        // 搜索效果不好,注释掉即恢复到以前的检索
        // starlightDocSearch({
        //   appId: 'JF4GTEW6FH',
        //   apiKey: 'd06e6625fb77b9016e634d03927e62a2',
        //   indexName: 'moatkon',
        //   maxResultsPerGroup: 10
        // })
      ],
      title: isPrd ? "Moatkon" : "Dev",
      lastUpdated: true,
      // logo: {
      //   light: '/src/assets/moatkon.svg',
      //   dark: '/src/assets/moatkon.svg'
      // },
      description: "Build your moat.",
      head: [
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
        TableOfContents: './src/components/TableOfContents.astro',
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
              items: [
                {
                  label: "ArrayList",
                  link: "/software-engineer/base/arraylist",
                },
                { label: "HashMap", link: "/software-engineer/base/hashmap" },
                {
                  label: "ConcurrentHashMap",
                  link: "/software-engineer/base/concurrenthashmap",
                },
                {
                  label: "Java锁",
                  link: "/software-engineer/base/javalock" /* ,badge:  { text: '进行中', variant: 'success' } */,
                },
                {
                  label: "AQS 抽象队列同步器",
                  link: "/software-engineer/base/aqs" /* ,badge: {text: '重绘了图片',variant: 'tip'} */,
                },
                {
                  label: "ReentrantLock",
                  link: "/software-engineer/base/reentrantlock",
                },
                {
                  label: "ThreadLocal",
                  link: "/software-engineer/base/threadlocal",
                },
                { label: "volatile", link: "/software-engineer/base/volatile" },
                {
                  label: "JVM相关",
                  collapsed: false,
                  items: [
                    {
                      label: "JVM基础知识",
                      link: "/software-engineer/base/jvm",
                    },
                    {
                      label: "JVM线上排查方法",
                      link: "/software-engineer/base/jvm-resolve",
                    },
                    {
                      label: "垃圾回收算法",
                      link: "/software-engineer/base/jvm-gc-algo",
                    },
                  ],
                },
                { label: "线程", link: "/software-engineer/base/thread" },
                { label: "线程池", link: "/software-engineer/base/threadpool" },
                { label: "IO", link: "/software-engineer/base/io" },
                { label: "网络", link: "/software-engineer/base/network" },
              ],
            },
            {
              label: "数据库",
              collapsed: true,
              items: [
                {
                  label: "MySQL",
                  items: [
                    {
                      label: "MySQL",
                      link: "/software-engineer/database/mysql",
                    },
                    {
                      label: "MySQL锁",
                      link: "/software-engineer/database/mysql-lock" /* ,badge:  { text: '进行中', variant: 'success' } */,
                    },
                    {
                      label: "MySQL死锁",
                      link: "/software-engineer/database/mysql-dead-lock" /* ,badge:  { text: '进行中', variant: 'success' } */,
                    },
                    {
                      label: "MySQL QA",
                      link: "/software-engineer/database/mysql-qa",
                    },
                    {
                      label: "MySQL死锁问题排查",
                      link: "/software-engineer/database/mysql-dead-lock-gap-prd-problem",
                      badge: { text: "线上问题排查", variant: "danger" },
                    },
                    {
                      label: "MySQL Buffer Pool",
                      link: "/software-engineer/database/mysql-buffer-pool",
                    },
                  ],
                },
                {
                  label: "MongoDB",
                  items: [
                    {
                      label: "MongoDB初见",
                      link: "/software-engineer/database/mongodb",
                    },
                  ],
                },
              ],
            },
            {
              label: "消息队列",
              collapsed: true,
              items: [
                { label: "消息队列", link: "/software-engineer/mq" },
                {
                  label: "Kafka",
                  items: [
                    { label: "Kafka", link: "/software-engineer/mq/kafka" },
                    {
                      label: "Kafka安装及使用",
                      link: "/software-engineer/mq/kafka/use",
                    },
                  ],
                },
                {
                  label: "RabbitMQ",
                  items: [
                    {
                      label: "RabbitMQ",
                      link: "/software-engineer/mq/rabbitmq",
                    },
                  ],
                },
                {
                  label: "RocketMQ",
                  items: [
                    {
                      label: "RocketMQ",
                      link: "/software-engineer/mq/rocketmq",
                      badge: { text: "推荐", variant: "tip" },
                    },
                    {
                      label: "RocketMQ安装及使用",
                      link: "/software-engineer/mq/rocketmq/use",
                    },
                  ],
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
              items: [
                {
                  label: "分布式事务",
                  items: [
                    {
                      label: "分布式事务",
                      link: "/software-engineer/distributed/distributed-transactions",
                    },
                    {
                      label: "分布式事务之Seata",
                      link: "/software-engineer/distributed/distributed-transactions-of-seata",
                    },
                  ],
                },
                {
                  label: "分布式锁",
                  link: "/software-engineer/distributed/distributed-lock" /* ,badge: { text: '进行中', variant: 'success' } */,
                },
                {
                  label: "Zookeeper",
                  link: "/software-engineer/distributed/zookeeper",
                },
                {
                  label: "CAP理论",
                  link: "/software-engineer/distributed/cap",
                },
                {
                  label: "Base理论",
                  link: "/software-engineer/distributed/base",
                },
                // 暂时隐藏
                // {label: '分布式链路追踪', link: '/software-engineer/distributed/trace'},
                // {
                // 	label: 'Nacos架构与原理',
                // 	badge: { text: '进行中', variant: 'tip' },
                // 	collapsed: true,
                // 	items: [
                // 		{label: 'README', link: '/software-engineer/nacos' },
                // 	],
                // },
                {
                  label: "雪花算法在分布式场景下生成重复的Id",
                  link: "/software-engineer/distributed/snowflake-work-id",
                },
                {
                  label: "分布式任务调度分片",
                  link: "/software-engineer/distributed/task-sharding",
                },
              ],
            },
            {
              label: "框架",
              collapsed: true,
              items: [
                {
                  label: "Spring框架",
                  collapsed: false,
                  items: [
                    {
                      label: "Spring,SpringBoot,SpringMVC",
                      link: "/software-engineer/framework/spring",
                    },
                    {
                      label: "Spring Cloud",
                      link: "/software-engineer/framework/spring/spring-cloud",
                    },
                    {
                      label: "AOP",
                      link: "/software-engineer/framework/spring/aop",
                    },
                    {
                      label: "IOC、DI",
                      link: "/software-engineer/framework/spring/ioc_di",
                    },
                    {
                      label: "Spring事务",
                      link: "/software-engineer/framework/spring/transaction-impl-principle",
                    },
                    {
                      label: "Spring事务失效的场景",
                      link: "/software-engineer/framework/spring/transaction-invalid",
                    },
                  ],
                },
                {
                  label: "Dubbo框架",
                  collapsed: false,
                  items: [
                    {
                      label: "Dubbo",
                      link: "/software-engineer/framework/dubbo",
                    },
                    {
                      label: "RPC",
                      link: "/software-engineer/framework/dubbo/rpc",
                    },
                  ],
                },
                {
                  label: "MyBatis",
                  link: "/software-engineer/framework/mybatis",
                },
              ],
            },
            {
              label: "算法",
              collapsed: true,
              items: [
                { label: "算法", link: "/software-engineer/algorithm" },
                {
                  label: "B树和B+树的区别",
                  link: "/software-engineer/algorithm/b-tree-and-b-tree-plus",
                },
                {
                  label: "A*算法",
                  link: "/software-engineer/algorithm/a-star",
                },
                {
                  label: "如何判断一个链表是否有环?",
                  link: "/software-engineer/algorithm/how-to-determine-whether-a-linked-list-has-a-cycle",
                },
                {
                  label: "限流算法",
                  link: "/software-engineer/algorithm/limiting-algorithm",
                },
                {
                  label: "负载均衡",
                  link: "/software-engineer/algorithm/load-balance",
                },
                {
                  label: "雪花算法Id",
                  link: "/software-engineer/algorithm/snow-flake-id",
                },
                {
                  label: "翻转链表",
                  link: "/software-engineer/algorithm/how-to-reverse-linkedlist",
                },
              ],
            },
            {
              label: "ES",
              collapsed: true,
              items: [
                {
                  label: "解决Elasticsearch请求不能执行",
                  link: "/software-engineer/best-practices/resolve-es-client-io-reactor-status-stopped",
                  badge: { text: "线上排查", variant: "danger" },
                },
                {
                  label: "应用接入ES,通用逻辑抽象",
                  link: "/software-engineer/es/es-integration-common-logic",
                },
                { label: "正确的使用ES", link: "/software-engineer/es/es-use" },
              ],
            },
            {
              label: "部署",
              collapsed: true,
              items: [
                {
                  label: "Docker",
                  link: "/software-engineer/deploy/docker" /* ,badge: { text: '进行中', variant: 'success' } */,
                },
                { label: "K8s", link: "/software-engineer/deploy/k8s" },
                {
                  label: "Docker搭建开发环境",
                  link: "/software-engineer/deploy/docker-dev-env" /* ,badge: { text: '进行中', variant: 'success' } */,
                },
              ],
            },
            {
              label: "DDD应用架构",
              collapsed: true,
              items: [
                {
                  label: "DDD 领域驱动设计",
                  link: "/software-engineer/ddd",
                  badge: { text: "初识", variant: "default" },
                },
                {
                  label: "DDD在公司的实践记录",
                  link: "/software-engineer/ddd/landing",
                  badge: { text: "落地阶段", variant: "default" },
                },
                {
                  label: "DDD整体分享",
                  link: "/software-engineer/ddd/share",
                  badge: { text: "分享", variant: "default" },
                },
                {
                  label: "DDD项目结构的演变",
                  link: "/software-engineer/ddd/project-structure",
                },
                {
                  label: "使用DDD来重构现有系统",
                  link: "/software-engineer/ddd/use-ddd-to-refactor",
                  badge: { text: "编写中", variant: "default" },
                },
                {
                  label: "DDD分层规范文档(module)",
                  link: "/software-engineer/ddd/layering-specification",
                },
              ],
            },
            {
              label: "Linux",
              collapsed: true,
              items: [
                {
                  label: "在Liunx上筛查日志技巧",
                  link: "/software-engineer/best-practices/linux/log",
                },
                {
                  label: "Linux命令",
                  link: "/software-engineer/linux/command",
                },
                {
                  label: '本站"上次更新时间"自动维护',
                  link: "/software-engineer/linux/last-updated",
                },
              ],
            },
            {
              label: "Spring Cloud Gateway",
              collapsed: true,
              items: [
                {
                  label: "内存泄漏排查",
                  link: "/software-engineer/spring-cloud-gateway/direct-memory-leak",
                  badge: { text: "线上排查", variant: "danger" },
                },
                {
                  label: "网关压测",
                  link: "/software-engineer/spring-cloud-gateway/stress-test",
                  badge: { text: "压测", variant: "tip" },
                },
                {
                  label: "使用响应式Redis替代同步Redis",
                  link: "/software-engineer/spring-cloud-gateway/reactive",
                  badge: { text: "响应式", variant: "tip" },
                },
                {
                  label: "网关规范",
                  link: "/software-engineer/spring-cloud-gateway/usage-specification",
                  badge: { text: "规范", variant: "tip" },
                },
              ],
            },
            {
              label: "最佳实践",
              collapsed: true,
              items: [
                // {label: 'README', link: '/software-engineer/topics/readme'/* ,badge: { text: '进行中', variant: 'success' } */ },
                // {label: '电商ERP', link: '/software-engineer/topics/e-commerce/erp',badge: { text: '编写中', variant: 'default' } },
                // {label: '独立站ToC', link: '/software-engineer/topics/e-commerce/to-c',badge: { text: '编写中', variant: 'default' } },
                // {label: '独立站流量广告', link: '/software-engineer/collapsed: falsetopics/e-commerce/traffic-advertising',badge: { text: '编写中', variant: 'default' } },
                // {label: '社交', link: '/software-engineer/topics/social-contact',badge: { text: '编写中', variant: 'default' } },
                {
                  label: "Git",
                  collapsed: false,
                  items: [
                    {
                      label: "Git",
                      link: "/software-engineer/best-practices/git",
                      badge: { text: "纯记录", variant: "default" },
                    },
                    {
                      label: "Git分支管理",
                      link: "/software-engineer/best-practices/git/branch-manage",
                    },
                  ],
                },
                {
                  label: "通用能力建设",
                  collapsed: false,
                  items: [
                    {
                      label: "Canal消息处理,写入ES",
                      link: "/software-engineer/best-practices/general-ability/canal-handler",
                    },
                    {
                      label: "刷数",
                      link: "/software-engineer/best-practices/general-ability/flash-data",
                    },
                    {
                      label: "数量一致性校验",
                      link: "/software-engineer/best-practices/general-ability/consistency-check",
                    },
                    {
                      label: "操作ES",
                      link: "/software-engineer/best-practices/general-ability/es-operate",
                    },
                    {
                      label: "数据清理",
                      link: "/software-engineer/best-practices/general-ability/data-clean",
                    },
                  ],
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
            // {
            //   label: '电商独立站',
            //   collapsed: false,
            //   items: [
            //     {label: '搜索广告', link: '/software-engineer/best-practices/business/advertising/google-search',badge: { text: '流量广告', variant: 'default' },},
            //     // {label: 'README', link: '/software-engineer/topics/project-experience/advertising'/* ,badge: { text: '更新中', variant: 'default' }, */},
            //     // {label: '购物广告', link: '/software-engineer/topics/project-experience/advertising/shopping',badge: { text: '待更新', variant: 'default' },},
            //     // {label: '网红KOL', link: '/software-engineer/topics/project-experience/advertising/kol',badge: { text: '待更新', variant: 'default' },},
            //     // {label: '广告监控', link: '/software-engineer/topics/project-experience/advertising/monitor-ad',badge: { text: '待更新', variant: 'default' },},
            //     // {label: '效果数据', link: '/software-engineer/topics/project-experience/advertising/performance-data',badge: { text: '待更新', variant: 'default' },},
            //   ],
            // },
            {
              label: "React",
              collapsed: true,
              badge: { text: "前端", variant: "tip" },
              items: [
                { label: "React学习1/n", link: "/software-engineer/react" },
                { label: "React学习2/n", link: "/software-engineer/react/2" },
                { label: "React学习3/n", link: "/software-engineer/react/3" },
                { label: "React学习4/n", link: "/software-engineer/react/4" },
                { label: "React学习5/n", link: "/software-engineer/react/5" },
                { label: "React学习6/n", link: "/software-engineer/react/6" },
                { label: "React学习7/n", link: "/software-engineer/react/7" },
                { label: "React学习8/n", link: "/software-engineer/react/8" },
                { label: "React学习9/n", link: "/software-engineer/react/9" },
              ],
            },
            // {
            //   label: 'AI Assistant',
            //   collapsed: true,
            //   items: [
            //      {label: 'Claude',link: '/software-engineer/ai-assistant/jetbrains-claude'}
            //   ]
            // },
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
              collapsed: true,
              items: [
                {
                  label: "日常英语1-3",
                  link: "/english/english-for-everyday-activities/1-3",
                },
                {
                  label: "日常英语4-7",
                  link: "/english/english-for-everyday-activities/4-7",
                },
                {
                  label: "日常英语8-10",
                  link: "/english/english-for-everyday-activities/8-10",
                },
                {
                  label: "日常英语11-14",
                  link: "/english/english-for-everyday-activities/11-14",
                },
                {
                  label: "日常英语15-17",
                  link: "/english/english-for-everyday-activities/15-17",
                },
                {
                  label: "日常英语18-19",
                  link: "/english/english-for-everyday-activities/18-19",
                },
                {
                  label: "日常英语20-22",
                  link: "/english/english-for-everyday-activities/20-22",
                },
                {
                  label: "日常英语23-24",
                  link: "/english/english-for-everyday-activities/23-24",
                },
                {
                  label: "日常英语25-27",
                  link: "/english/english-for-everyday-activities/25-27",
                },
                {
                  label: "日常英语28-30",
                  link: "/english/english-for-everyday-activities/28-30",
                },
                {
                  label: "日常英语31-33",
                  link: "/english/english-for-everyday-activities/31-33",
                },
                {
                  label: "日常英语34-36",
                  link: "/english/english-for-everyday-activities/34-36",
                },
                {
                  label: "日常英语37-39",
                  link: "/english/english-for-everyday-activities/37-39",
                },
                {
                  label: "日常英语40-42",
                  link: "/english/english-for-everyday-activities/40-42",
                },
                {
                  label: "日常英语43-45",
                  link: "/english/english-for-everyday-activities/43-45",
                },
                {
                  label: "日常英语46-48",
                  link: "/english/english-for-everyday-activities/46-48",
                },
                {
                  label: "日常英语49-51",
                  link: "/english/english-for-everyday-activities/49-51",
                },
                {
                  label: "日常英语52-54",
                  link: "/english/english-for-everyday-activities/52-54",
                },
                {
                  label: "日常英语55-57",
                  link: "/english/english-for-everyday-activities/55-57",
                },
                {
                  label: "日常英语58-60",
                  link: "/english/english-for-everyday-activities/58-60",
                },
                {
                  label: "日常英语61",
                  link: "/english/english-for-everyday-activities/61",
                },
              ],
            },
            {
              label: "网络",
              collapsed: true,
              items: [
                {
                  label: "OpenAI CEO Sam Altman被解雇",
                  link: "/english/internet/sama-fired-from-openai",
                  badge: { text: "Sam Altman", variant: "default" },
                },
                {
                  label: "What I Learned Working For Mark Zuckerberg",
                  link: "/english/internet/what-i-learned-working-for-mark-zuckerberg",
                  badge: { text: "Mark Zuckerberg", variant: "default" },
                },
                {
                  label: "Study From Reddit",
                  link: "/english/internet/study-from-reddit",
                },
              ],
            },
            {
              label: "视频",
              collapsed: true,
              items: [
                {
                  label: "两个美国女生最日常的交流",
                  link: "/english/videos/daily-communication-between-two-american-girls",
                },
                {
                  label: "美国人在工作中最真实的聊天，你能听懂多少？",
                  link: "/english/videos/the-most-authentic-chat-in-the-movie-the-intern",
                },
                {
                  label: "刻意练习英语听力",
                  link: "/english/videos/english-listening-practice-vibe-1",
                },
                {
                  label: "描述自己/自我介绍",
                  link: "/english/videos/describe-yourself",
                },
                {
                  label: "How to Stop Translating in Your Head",
                  link: "/english/videos/how-to-stop-translating-in-your-head",
                },
                {
                  label: "她们几乎以同样方式，英语达到近母语水平！",
                  link: "/english/videos/achieve-near-native-english",
                  badge: { text: "学习方法", variant: "default" },
                },
                {
                  label: "马云纽约演讲",
                  link: "/english/videos/jack-ma-new-york-speech",
                },
                {
                  label:
                    "如何自学一门外语？7门语言博主超详细干货分享！ 或者 任何一个技能",
                  link: "/english/videos/how-to-study-english",
                  badge: { text: "干货", variant: "default" },
                },
                {
                  label: "如何克服开口恐惧？ 流利说外语！",
                  link: "/english/videos/speaking-fear-overcome",
                },
                {
                  label: "我是怎么学英语的？原来学会这项技能环游世界都不怕了！",
                  link: "/english/videos/how-i-learned-english-producer1573",
                },
              ],
            },
            {
              label: "辅助",
              collapsed: true,
              items: [
                {
                  label: "Trancy沉浸式AI语言学习",
                  link: "/english/auxiliary-tools/trancy",
                },
                {
                  label: "沉浸式翻译",
                  link: "/english/auxiliary-tools/immersivetranslate",
                  badge: { text: "对照翻译", variant: "default" },
                },
                {
                  label: "无痛单词 | Painless",
                  link: "/english/auxiliary-tools/painless",
                  badge: { text: "背单词", variant: "default" },
                },
              ],
            },
          ],
        },
        {
          label: "钢琴🎹",
          collapsed: true,
          items: [
            { label: "钢琴🎹学习", link: "/music/piano/study" },
            { label: "钢琴🎹乐理知识Part1", link: "/music/piano/study-p1" },
            { label: "钢琴🎹乐理知识Part2", link: "/music/piano/study-p2" },
            { label: "钢琴🎹乐理知识Part3", link: "/music/piano/study-p3" },
            { label: "钢琴🎹乐理知识Part4", link: "/music/piano/study-p4" },
            { label: "钢琴🎹乐理知识Part5", link: "/music/piano/study-p5" },
          ],
        },
        {
          label: "分享",
          collapsed: true,
          items: [
            { label: "一起分享吧！", link: "/share" },
            {
              label: "效率工具",
              collapsed: true,
              items: [
                { label: "README", link: "/share/efficiency-tools" },
                {
                  label: "画板",
                  collapsed: true,
                  items: [
                    {
                      label: "Milanote",
                      link: "/share/efficiency-tools/board/milanote",
                    },
                    {
                      label: "小画桌",
                      link: "/share/efficiency-tools/board/xiaohuazhuo",
                    },
                  ],
                },
                {
                  label: "Trello",
                  link: "/share/efficiency-tools/trello",
                  badge: { text: "个人重度依赖", variant: "note" },
                },
                {
                  label: "Focalboard",
                  link: "/share/efficiency-tools/board/focalboard",
                  badge: { text: "开源", variant: "note" },
                },
                {
                  label: "罗技MX Master",
                  link: "/share/efficiency-tools/logi-mx-master",
                  badge: { text: "鼠标", variant: "note" },
                },
                {
                  label: "罗技MX Keys",
                  link: "/share/efficiency-tools/logi-mx-keys",
                  badge: { text: "键盘", variant: "note" },
                },
                {
                  label: "Apple生态",
                  link: "/share/efficiency-tools/apple-ecology",
                  badge: { text: "Apple", variant: "note" },
                },
                {
                  label: "WF-1000XM5",
                  link: "/share/efficiency-tools/wf-1000xm5",
                  badge: { text: "耳机", variant: "note" },
                },
                {
                  label: "LocalSend",
                  link: "/share/efficiency-tools/localsend",
                  badge: { text: "文件传输", variant: "note" },
                },
                {
                  label: "One UI",
                  link: "/share/efficiency-tools/one-ui",
                  badge: { text: "操作系统", variant: "note" },
                },
                {
                  label: "Arc浏览器",
                  link: "/share/efficiency-tools/arc",
                  badge: { text: "浏览器", variant: "note" },
                },
                {
                  label: "飞书",
                  link: "/share/efficiency-tools/lark",
                  badge: { text: "Lark", variant: "note" },
                },
                {
                  label: "Zed",
                  link: "/share/efficiency-tools/zed",
                  badge: { text: "IDE", variant: "note" },
                },
              ],
            },
            {
              label: "电影🎬",
              collapsed: true,
              items: [
                { label: "电影P1", link: "/share/movie" },
                { label: "电影P2", link: "/share/movie/p2" },
                { label: "电影P3", link: "/share/movie/p3" },
                { label: "电影P4", link: "/share/movie/p4" },
                { label: "计划观看", link: "/share/movie/plan-to-watch" },
                { label: "资源", link: "/share/movie/source" },
              ],
            },
            {
              label: "实用",
              collapsed: true,
              items: [
                { label: "开源", link: "/share/useful/open-source" },
                {
                  label: "Avenue GPX Viewer",
                  link: "/share/useful/avenue-gpx-viewer",
                },
              ],
            },
            {
              label: "纯分享",
              collapsed: true,
              items: [
                {
                  label: "第一次恢复魔方",
                  link: "/share/geek-thing/rubik-cube",
                  badge: { text: "含文字步骤", variant: "default" },
                },
                {
                  label: "压力来自于忽视你不应该忽视的事情",
                  link: "/share/positive/pressure-ignoring-important",
                },
                {
                  label: "How to Get Rich",
                  link: "/share/positive/how-to-get-rich",
                },
                {
                  label: "如何致富",
                  link: "/share/positive/how-to-get-rich-zh",
                  badge: { text: "译文", variant: "tip" },
                },
                // {label: '摘录', link: '/share/extract-share' },
                {
                  label: "iPad mini 6",
                  link: "/share/efficiency-tools/useless-ipad-mini-6",
                  badge: { text: "Just For Me · 无用", variant: "danger" },
                },
              ],
            },
            { label: "博主", link: "/share/youtube" },
            { label: "音乐🎵", link: "/share/music" },
            { label: "网站", link: "/share/website" },
            { label: "视频", link: "/share/video" },
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
            // {label: 'AI时代下，程序员的焦虑与出路',link: '/ai/ai-era-programmer-anxiety',badge: {text: 'Grok3',variant: 'default'}},
          ],
        },
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
