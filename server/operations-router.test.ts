import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  listManagedPosts: vi.fn().mockResolvedValue([{ id: "post-1", title: "Solstice Ring", content: "<p>Fine ring</p>", labels: ["product", "price-25000"] }]),
  createProductPost: vi.fn().mockResolvedValue({ id: "post-2" }),
  updateProductPost: vi.fn().mockResolvedValue({ id: "post-1" }),
  deleteProductPost: vi.fn().mockResolvedValue({ success: true }),
  listPaystackSales: vi.fn().mockResolvedValue([{ reference: "sale-1", amount: 2500000, currency: "NGN", paidAt: "2026-08-28T00:00:00Z", customerEmail: "buyer@example.com", channel: "card" }]),
}));

vi.mock("./bloggerAdmin", () => ({
  listManagedPosts: mocks.listManagedPosts,
  createProductPost: mocks.createProductPost,
  updateProductPost: mocks.updateProductPost,
  deleteProductPost: mocks.deleteProductPost,
}));
vi.mock("./paystack", () => ({
  initializePaystackCheckout: vi.fn(),
  verifyPaystackTransaction: vi.fn(),
  listPaystackSales: mocks.listPaystackSales,
}));

import { appRouter } from "./routers";
import { OPS_COOKIE } from "./opsAuth";

function makeContext(cookie?: string) {
  const cookies: Array<{ name: string; value: string }> = [];
  const ctx = {
    user: null,
    req: { protocol: "https", headers: cookie ? { cookie } : {}, get: () => undefined },
    res: { cookie: (name: string, value: string) => cookies.push({ name, value }), clearCookie: vi.fn() },
  } as unknown as TrpcContext;
  return { ctx, cookies };
}

const product = { title: "Solstice Ring", description: "Fine ring.", price: 25000, currency: "NGN", category: "Rings", collection: "Solstice", materials: ["18k Gold"], attributes: [{ name: "Ring size", values: ["7"] }], availability: "in-stock" as const, featured: false, newArrival: true, sale: false, imageUrls: ["https://images.example.com/ring.jpg"], publishNow: true };

afterEach(() => {
  delete process.env.ADMIN_DASHBOARD_PASSWORD;
  delete process.env.JWT_SECRET;
  vi.clearAllMocks();
});

describe("operations router", () => {
  it("rejects private post and sales access without a signed password session", async () => {
    const caller = appRouter.createCaller(makeContext().ctx);
    await expect(caller.operations.posts()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.operations.sales()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("creates a password session and gates Blogger posts, mutations, and Paystack sales behind it", async () => {
    process.env.ADMIN_DASHBOARD_PASSWORD = "Github";
    process.env.JWT_SECRET = "test-session-signing-key";
    const loginContext = makeContext();
    const loginCaller = appRouter.createCaller(loginContext.ctx);
    await expect(loginCaller.operations.login({ password: "incorrect" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(loginCaller.operations.login({ password: "Github" })).resolves.toEqual({ success: true });
    const session = loginContext.cookies.find(item => item.name === OPS_COOKIE)?.value;
    expect(session).toBeTruthy();
    const authorized = appRouter.createCaller(makeContext(`${OPS_COOKIE}=${encodeURIComponent(session!)}`).ctx);
    await expect(authorized.operations.status()).resolves.toMatchObject({ authenticated: true });
    await expect(authorized.operations.posts()).resolves.toHaveLength(1);
    await authorized.operations.createPost(product);
    await authorized.operations.updatePost({ ...product, id: "post-1" });
    await authorized.operations.deletePost({ id: "post-1" });
    await expect(authorized.operations.sales()).resolves.toMatchObject({ totals: { NGN: 2500000 } });
    expect(mocks.createProductPost).toHaveBeenCalledWith(product);
    expect(mocks.updateProductPost).toHaveBeenCalledWith({ ...product, id: "post-1" });
    expect(mocks.deleteProductPost).toHaveBeenCalledWith("post-1");
  });
});
