import { describe, expect, it } from "bun:test";
import { ensureTablesExist, normalizeDbUrl } from "./client.js";

describe("Database Client Utilities", () => {
  it("normalizes turso:// database URL scheme to libsql://", () => {
    expect(normalizeDbUrl("turso://my-db-org.turso.io")).toBe("libsql://my-db-org.turso.io");
    expect(normalizeDbUrl("libsql://my-db-org.turso.io")).toBe("libsql://my-db-org.turso.io");
    expect(normalizeDbUrl("file:./data/saving_plan.db")).toBe("file:./data/saving_plan.db");
    expect(normalizeDbUrl(undefined)).toBe("file:./data/saving_plan.db");
  });

  it("ensures tables exist without errors", async () => {
    await expect(ensureTablesExist()).resolves.toBeUndefined();
  });
});
