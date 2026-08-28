# LA GLITZ — Blogger-powered jewelry storefront

La Glitz is a premium jewelry storefront built around a **database-free product catalog**. Products are read by the server from Blogger, validated, classified, and exposed to the client through the application API. The browser never requests Blogger directly and never receives the API key.

## Vercel environment configuration

Add the following server-only variables in **Vercel → Project Settings → Environment Variables**. Select **Production**, and select **Preview** too if you want to test the full integration before launch. Do not add a `VITE_` prefix and do not set a catalog database URL.

| Variable | Source and responsibility |
| --- | --- |
| `BLOGGER_BLOG_ID` | ID of the Blogger blog holding La Glitz product posts. |
| `BLOGGER_API_KEY` | Google Cloud API key restricted to the Blogger API; it powers the public catalog read. |
| `GOOGLE_BLOGGER_CLIENT_ID` | OAuth client ID from the Google Cloud project that has the Blogger API enabled. |
| `GOOGLE_BLOGGER_CLIENT_SECRET` | OAuth client secret for the same Google client. |
| `GOOGLE_BLOGGER_REFRESH_TOKEN` | Refresh token authorized with `https://www.googleapis.com/auth/blogger` for the Blogger owner account. |
| `PAYSTACK_SECRET_KEY` | Test or live Paystack secret key; used only by checkout, payment verification, sales records, and webhook validation. |
| `APP_BASE_URL` | Canonical HTTPS storefront address, such as `https://shop.example.com`. |
| `ADMIN_DASHBOARD_PASSWORD` | A strong, unique password for the unlinked `/atelier` operations area. Never use `Github` in production. |
| `JWT_SECRET` | Long, unique application signing secret; use the Vercel-generated value or a fresh private value. |

In Paystack, register `https://YOUR_DOMAIN/api/paystack/webhook` as the webhook URL. The handler validates Paystack’s signed event and returns quickly. The customer remains on Paystack’s hosted payment page; the secret key is never sent to the browser.

The private `/atelier` workspace writes structured Blogger product posts automatically, so no publishing tutorial is shown on the customer-facing storefront. It uses Google OAuth server-side for authorized Blogger post management and retrieves successful Paystack transactions only after password-based private access succeeds.

## Reliability and security

The server makes a timed Blogger API request and caches successful catalog responses for 15 seconds, retaining the last valid catalog for up to 15 minutes if the upstream feed temporarily fails. The open shop also refreshes every 15 seconds, so newly published qualifying posts appear as professional product cards without presenting any blog interface. No demo products, seed data, or shopper-visible Blogger references are included.

## Paystack checkout

The browser only sends product IDs, quantities, and delivery contact details. The server reloads the current Blogger catalog, validates availability, recalculates the total, and creates the Paystack hosted checkout request in minor currency units. The return page server-verifies the reference, while the signed webhook is the preferred asynchronous payment confirmation path. Successful Paystack transactions are visible only in the private operations workspace.

## Commands

```bash
pnpm test
pnpm check
pnpm build
```
