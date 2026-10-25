import { describe, expect, test } from "vitest";
import { authenticate } from "./auth.js";
import { buildApp } from "./app.js";
describe("planted API bugs", () => {
  test.fails("rejects inactive keys", () => {
    expect(authenticate("revoked-token")).toBeNull();
  });
  test.fails("does not trust admin role from body", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/admin/users",
      payload: { role: "admin" },
    });
    expect(res.json().ok).toBe(false);
  });
  test("server responds", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "POST", url: "/api/tokens" });
    expect(res.statusCode).toBe(200);
  });
});
describe("zod project schema contract", () => {
  test("validates payloads and strips unknown fields", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/projects",
      payload: { name: "project-a", config: { retries: 3, unknownField: "ignored" } },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ name: "project-a", config: { retries: 3 } });
  });
  test("rejects payloads missing required fields", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/projects",
      payload: { config: {} },
    });
    expect(res.statusCode).not.toBe(200);
  });
});
