import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware =
  typeof createCsrfMiddleware === "function"
    ? createCsrfMiddleware({
        filter: (ctx) => ctx.handlerType === "serverFn",
      })
    : createMiddleware().server(async (ctx) => {
        // Custom CSRF fallback to resolve Vite/Nitro circular dependency packaging issue
        if (ctx.handlerType !== "serverFn") return ctx.next();

        const origin = ctx.request.headers.get("Origin");
        const referer = ctx.request.headers.get("Referer");
        const url = new URL(ctx.request.url);

        if (origin && origin !== url.origin) {
          return new Response("Forbidden", { status: 403 });
        }

        if (referer) {
          try {
            const refererOrigin = new URL(referer).origin;
            if (refererOrigin !== url.origin) {
              return new Response("Forbidden", { status: 403 });
            }
          } catch {
            return new Response("Forbidden", { status: 403 });
          }
        }

        return ctx.next();
      });

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, csrfMiddleware],
}));
