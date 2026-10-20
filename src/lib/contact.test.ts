// @ts-expect-error — bun:test types are not shipped in this project
import { expect, mock, test } from "bun:test";
import { profile } from "../data/profile";

type ContactData = { name: string; email: string; message: string };
let handler: ((input: { data: ContactData }) => Promise<unknown>) | undefined;
mock.module("@tanstack/react-start", () => ({
  createServerFn: () => ({
    inputValidator: () => ({
      handler: (fn: typeof handler) => { handler = fn; return fn; },
    }),
  }),
}));

test("public contact address uses the new personal email", () => {
  expect(profile.email).toBe("vivekpatne.dev@gmail.com");
});

test("contact messages are delivered to the new personal email", async () => {
  await import("./contact.functions");
  const send = handler;
  if (!send) throw new Error("Contact handler not registered");
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  let recipient: unknown;
  process.env.RESEND_API_KEY = "test-only-key";
  globalThis.fetch = mock(async (_url: unknown, init?: RequestInit) => {
    recipient = JSON.parse(String(init?.body)).to;
    return new Response(JSON.stringify({ id: "test-message" }), { status: 200 });
  }) as typeof fetch;
  try {
    await send({ data: { name: "Contact test", email: "sender@example.com", message: "Recipient routing test" } });
    expect(recipient).toEqual(["vivekpatne.dev@gmail.com"]);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
});