import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// ---------------------------------------------------------------------------
// IMPORTANT — DO NOT register `attachSupabaseAuth` globally.
//
// The six public activity server functions are unauthenticated. Registering
// `attachSupabaseAuth` as a global `functionMiddleware` forces the BROWSER
// Supabase client (`src/integrations/supabase/client.ts`) to initialise on
// every server-fn RPC. If `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`
// are missing from a given deployment's browser bundle, that client throws
// synchronously and every server-fn call fails before it leaves the browser —
// collapsing the entire Consistency dashboard to "Unavailable" on any full
// page reload.
//
// A structural regression test in `src/start.test.ts` fails the build if the
// import or middleware is re-added while no server function actually uses
// `requireSupabaseAuth`. If a future feature genuinely needs authenticated
// server functions, register a middleware that is resilient to a missing
// browser client (or scope it to only the protected functions) — never a
// global that couples public RPCs to browser auth.
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
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
