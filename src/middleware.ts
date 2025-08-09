// src/middleware.ts
import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = (context, next) => {
  // 路由
  if (context.url.pathname === "/resume") {
    return context.redirect("https://resume.moatkon.com/", 301);
  }

  // 条件跳转：根据查询参数
  // if (context.url.searchParams.get("lang") === "en") {
  //   return context.redirect("/en/welcome", 302);
  // }

  return next();
};
