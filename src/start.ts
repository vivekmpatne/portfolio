import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

// ---------------------------------------------------------------------------
// IMPORTANT — Supabase auth attachment is intentionally NOT registered here.
//
// No server function in this project uses `requireSupabaseAuth`. Registering
// `attachSupabaseAuth` as a global `functionMiddleware` forces the browser
// Supabase client (`src/integrations/supabase/client.ts`) to initialise on
// every server-fn call. If that client throws in a given runtime (e.g. a
// missing VITE_SUPABASE_* variable at build time in a specific deployment),
// ALL server functions — including the six public activity fetches — fail,
// and the entire Consistency dashboard collapses to "Unavailable".
//
// If a future feature adds a server function that uses `requireSupabaseAuth`,
// re-register `attachSupabaseAuth` here (append, don't replace):
//
//   import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
//   functionMiddleware: [attachSupabaseAuth],
//
// Public server functions (like the activity adapters) must never depend on
// this middleware.
// ---------------------------------------------------------------------------

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

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [errorMiddleware],
}));
