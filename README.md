# LA GLITZ — Blogger-powered jewelry storefront

La Glitz is a premium jewelry storefront built around a **database-free product catalog**. Products are read by the server from Blogger, validated, classified, and exposed to the client through the application API. The browser never requests Blogger directly and never receives the API key.

## Deployment configuration

Set the following server environment variables in your hosting provider. In Vercel, add them under **Project Settings → Environment Variables** for each required environment. They must **not** be prefixed with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `BLOGGER_BLOG_ID` | Identifier of the public Blogger blog that publishes La Glitz products. |
| `BLOGGER_API_KEY` | Google API key restricted to the Blogger API. This is server-only and is never sent to the browser. |
| `PAYSTACK_SECRET_KEY` | Paystack test or live secret key. Used only by Vercel server routes to initialize and verify payments; never expose it as `VITE_` variable. |

The app needs no catalog database URL. `vercel.json` builds the Vite storefront and preserves both the serverless API path and client-side page routing. If either Blogger value is not set, unavailable, or returns no qualifying posts, the customer sees the intentional empty-catalog experience.

## Blogger product convention

Only posts labelled `product` **and** `price-{amount}` enter the shop. All other Blogger posts remain invisible to the storefront. Labels may be entered with or without a leading `#`; labels are normalized by the server.

| Label pattern | Example | Behaviour |
| --- | --- | --- |
| `product` | `product` | Required product gate. |
| `price-{amount}` | `price-1250` | Required. Sets the product price. |
| `currency-{ISO}` | `currency-USD` | Optional. Defaults to USD. |
| `category-{name}` | `category-earrings` | Adds automatic category filtering. Defaults to All Jewelry. |
| `collection-{name}` | `collection-bridal` | Adds automatic collection filtering. Defaults to Signature. |
| `material-{name}` | `material-18k-gold` | May be repeated for materials. |
| `availability-{state}` | `availability-in-stock` | Accepts `in-stock`, `out-of-stock`, `preorder`, or `hidden`. Defaults to in stock. |
| `featured`, `new-arrival`, `sale` | `new-arrival` | Adds a product badge. |

Posts labelled `availability-hidden` are explicitly excluded. Missing category, collection, material, availability, image, or description use graceful display fallbacks; posts missing the explicit product label, ID, title, or valid price are excluded.

## Reliability and security

The server makes a timed Blogger API request and caches successful catalog responses for 15 seconds, retaining the last valid catalog for up to 15 minutes if the upstream feed temporarily fails. The open shop also refreshes every 15 seconds, so newly published qualifying posts appear as professional product cards without presenting any blog interface. No demo products, seed data, or shopper-visible Blogger references are included.

## Paystack checkout

The browser sends only the selected product IDs, quantities, and delivery contact details to the app server. The server reloads the qualifying Blogger products, recalculates the price from the published catalog, and creates a hosted Paystack checkout session. A successful redirect is verified server-side before the completion screen is shown. Configure `https://YOUR_DOMAIN/api/paystack/webhook` in the Paystack dashboard so signed `charge.success` events can be acknowledged in production.

Use a Blogger `currency-{ISO}` label that is supported by the configured Paystack account. Paystack payment confirmation, transaction records, and payment receipts remain the payment source of record.

## Commands

```bash
pnpm test
pnpm check
pnpm build
```
