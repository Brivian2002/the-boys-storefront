# LA GLITZ — Blogger-powered jewelry storefront

La Glitz is a premium jewelry storefront built around a **database-free product catalog**. Products are read by the server from Blogger, validated, classified, and exposed to the client through the application API. The browser never requests Blogger directly and never receives the API key.

## Deployment configuration

Set the following server environment variables in your hosting provider. In Vercel, add them under **Project Settings → Environment Variables** for each required environment. They must **not** be prefixed with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `BLOGGER_BLOG_ID` | Identifier of the public Blogger blog that publishes La Glitz products. |
| `BLOGGER_API_KEY` | Google API key restricted to the Blogger API. This is server-only and is never sent to the browser. |

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

The server makes a timed Blogger API request and caches successful catalog responses for 90 seconds, retaining the last valid catalog for up to 15 minutes if the upstream feed temporarily fails. No demo products, seed data, or shopper-visible Blogger references are included.

## Commands

```bash
pnpm test
pnpm check
pnpm build
```
