# Master Build Prompt: LA GLITZ Ghana Jewelry Store

You are a senior product designer, full-stack engineer, security engineer, and QA engineer. Build a complete, production-ready online jewelry store named **LA GLITZ** for the Ghanaian market.

## Important reference boundary

The site URL `https://la-glitz.vercel.app/` is provided only as the owner’s current deployment and routing context, especially for the `/admin` dashboard. **Do not copy, imitate, reproduce, reverse-engineer, or use the current site’s design style, layout, typography, color system, imagery, component arrangement, or visual language.** Create a fresh visual identity and a meaningfully different shopping experience from the requirements below.

The finished product is a **full jewelry e-commerce store**, not a blog, article site, Blogger front end, editorial journal, or publishing tutorial. Use the direct-store shopping efficiency of major marketplaces as research inspiration, but do not copy Jiji, AliExpress, eBay, Amazon, or any other company’s branding, layout, copy, assets, or distinctive interface.

## Core business context

The market is **Ghana**. Make the store feel premium, modern, and distinctly Ghanaian in tone, imagery, delivery language, currency presentation, and customer needs without using stereotypes or generic African visual clichés. Default to Ghanaian cedi display (`GHS` / `₵`) unless a product explicitly defines another supported currency. Design mobile-first because many shoppers will browse on mobile data and smaller screens.

Use a React + TypeScript frontend with a strong typed server architecture such as Express and tRPC, or an equally reliable full-stack architecture. Make the application accessible, responsive, fast, secure, and suitable for Vercel deployment. Do not add a product database, database URL, product fixtures, fake inventory, or seeded demo products. Blogger is the invisible catalog database and CMS source of truth.

## Blogger is the invisible product database

The owner must manage products through the private dashboard rather than opening Blogger.com. The dashboard talks to the Blogger API and creates, updates, publishes, unpublishes, and deletes the matching Blogger posts. The public storefront reads the published product posts through the server-side Blogger API and renders them as normal store products. Customers must never need to know Blogger is involved.

Use this source-of-truth flow:

```text
Owner in /admin → Blogger API → Blogger blog stores product records → server reads Blogger API → public storefront renders products
```

The public catalog must stay empty until valid Blogger product posts exist. Never invent or seed placeholder products. Ordinary non-product posts, incomplete posts, hidden posts, and malformed price labels must be excluded from the customer catalog.

All Blogger reads must happen server-side. Do not expose the Blogger API key, OAuth client secret, refresh token, or raw Blogger responses to browser JavaScript. Use a short cache with regular refresh and stale-data fallback. Refresh the catalog after dashboard saves so published products appear promptly without forcing every visitor request to call Blogger directly.

## Structured Blogger product records

Create a predictable product post structure. Use the Blogger post title, normalized labels, and a structured body that contains both machine-readable product data and a readable fallback presentation. Use image URLs from a controlled image host or Vercel-compatible object storage; do not rely on visitors opening Blogger image links directly.

A qualifying catalog post must contain `product` and a valid `price-*` label. Use labels such as:

| Field | Example | Purpose |
| --- | --- | --- |
| Product marker | `product` | Qualifies a Blogger post for the public catalog. |
| Price | `price-1250` | Stores the product price in the documented major-unit format. |
| Currency | `currency-ghs` | Identifies the display and payment currency. |
| Category | `category-rings` | Powers product departments and category pages. |
| Collection | `collection-heritage` | Groups products into collections. |
| Material | `material-18k-gold` | Powers material discovery. |
| Availability | `availability-in-stock` | Controls availability and sold-out states. |
| Badges | `featured`, `new-arrival`, `sale` | Adds controlled merchandising cues. |
| Hidden state | `hidden` | Keeps a record out of the public catalog. |

Define and enforce the price convention clearly. The browser must never be allowed to set authoritative price totals. Convert major currency units to Paystack minor units only on the server.

Add a flexible custom-property editor to the dashboard. The owner must be able to define arbitrary names and one or more values, including fields that did not exist when the site was built—for example `Ring size`, `Gemstone`, `Chain length`, `Finish`, `Weight`, `Setting`, `Origin`, `Care`, or any future product detail. Normalize values and encode them safely with a reserved-label-safe convention such as `attribute-name--value`. Do not let custom labels overwrite reserved system labels.

Parse those custom attributes back from Blogger into a shared catalog model. Show them on product pages, allow shoppers to search them, and create dynamic facets only when real values exist. The dashboard must not require code changes for a new custom property.

## Public direct-store experience

Build a direct shopping experience with a fresh, premium visual identity. The site should feel like a complete store where a shopper can quickly move from discovery to bag to checkout. Do not make the layout feel like blog posts, article cards, editorial feeds, or a content-management interface.

The initial design should use a clean luxury base with black and gold as dominant accents, orange and cream as controlled highlights, and optional sea/turquoise blue-green or deep green supporting tones. Provide a theme system that allows the owner to preview and switch between at least two approved palettes without a developer:

| Palette | Direction |
| --- | --- |
| Bright commerce | Bright orange, sea/turquoise blue-green, white, black, and gold accent. |
| Light luxury | Clean white base, black and gold dominance, with orange and cream used sparingly. |

Both palettes must maintain premium restraint, generous whitespace, strong product photography, readable typography, and accessible contrast. Support persistent light and dark modes if compatible with the visual system. Redesign the logo and favicon as part of the identity; do not reuse the current site’s visual style merely because the URL was provided.

### Store navigation

The public header should prioritize shopping. Include clean routes for:

- `/shop`
- `/shop/:slug` or an equivalent product route
- `/about`
- `/delivery`
- `/policies`
- `/contact`
- `/cart`
- `/checkout`
- `/checkout/verify`

Use clear Shop, New Arrivals, Collections or Departments, Delivery, Policies, About, and Contact destinations. The private `/admin` route must not appear in navigation, footer link lists, sitemap entries, public copy, or customer search results. Add `noindex` and appropriate robots rules for `/admin`.

### Home page

Make the home page a shopping entrance rather than a brand essay. Use product-first language, strong search, direct category paths, New Arrivals, best available merchandising sections based only on real Blogger data, and clear calls to action such as `Shop all jewelry`, `Browse new arrivals`, and `Shop by category`.

When no qualifying products exist, show a polished empty-store state that explains that the collection is preparing without inventing products. Do not show fake “best sellers”, fake testimonials, fake reviews, fake ratings, fake stock, or fake customer activity.

### Shop and category pages

The shop and category pages must feel modern and efficient, not like a plain list. Use a responsive grid with large, clean product imagery, subtle hover effects, readable gold or accent price treatments, clear availability, and helpful badges. Include a category bar or sidebar with departments appropriate to jewelry, such as Rings, Earrings, Necklaces, Bracelets, Sets, and New Arrivals, but derive actual values from Blogger when possible.

Support search across product name, description, category, collection, material, availability, and custom property names and values. Support filtering by category, price range, collection, material, availability, badges, and any real dynamic custom attributes. Support sorting by newest, price low-to-high, price high-to-low, and—only when an authoritative real signal exists—most popular. Never fabricate popularity data.

Allow a short category description at the top of each category page. Store those descriptions through the same invisible Blogger-backed administration model or another explicitly documented server-side configuration; do not create a product database just for this content. The owner must be able to edit them from `/admin` without changing code.

Product cards should show an image, product name, price, currency, category or collection cue, availability, and only real badges. Product pages must show an image gallery, title, price, description, material, category, collection, availability, badges, custom properties, quantity controls, and `Add to bag`.

### Cart and customer information

Implement a browser cart with quantity adjustment, item removal, clear cart, empty state, order summary, delivery details, and a clear Paystack checkout action. Preserve the bag appropriately across page navigation. Do not require a customer account unless there is a clear later requirement.

Include delivery information tailored to Ghana, with clear expectations for regions, timing, fees, and customer support. If exact delivery policy details are unknown, provide editable configuration fields or clearly marked owner-supplied content instead of inventing promises.

## Private `/admin` dashboard

The admin dashboard must live at:

```text
https://la-glitz.vercel.app/admin
```

Use the owner’s site URL only to identify this deployment and route. Do not copy the current site design. Keep `/admin` out of every public navigation element and search index. A hidden route is not sufficient security; enforce authentication server-side.

### Authentication

Protect `/admin` with Google Sign-In using OAuth. Only pre-approved Google account(s), such as the owner’s account, may enter. Everyone else must be denied even if Google authentication succeeds. Keep OAuth client credentials in Vercel environment variables and never in source control. Use secure, HTTP-only, SameSite session cookies or a secure stateless signed session. Add short expiry, logout, CSRF protection where applicable, safe error messages, rate limiting, and audit-safe logs that never contain secrets.

If a password step is also retained as defense in depth, read it only from `ADMIN_DASHBOARD_PASSWORD`; never hard-code it. The dashboard must not activate or authenticate from a browser-only flag.

### Dashboard views and controls

Use a professional responsive admin layout with these private areas:

1. **Overview:** product count, publication status, successful Paystack sales count, provider-sourced totals, catalog refresh status, and safe configuration status without exposing secret values.
2. **Products:** a normal product table or grid, never a raw blog editor. Allow create, edit, publish, unpublish, delete, availability changes, image URL management, category selection, price editing, badge editing, and custom-property editing.
3. **Product composer:** fields for product name, description, GHS price, currency, category, collection, materials, availability, images, badges, featured/new-arrival/sale flags, and repeatable arbitrary custom-property names and values.
4. **Category and page content:** edit short category descriptions and approved store content without exposing Blogger tutorials to customers.
5. **Sales:** show successful Paystack transactions privately with reference, amount, currency, timestamp, channel, and customer email as permitted. Clearly call these provider-sourced sales unless a future order database is explicitly approved.
6. **Theme and brand settings:** preview the approved palette options and change theme colors through validated settings without allowing unreadable combinations. Persist these settings through the approved server-side configuration model without introducing a product database.
7. **Delivery and location:** manage delivery-area copy, region guidance, support contact details, and map settings.

All dashboard inputs must be validated server-side. Sanitize descriptions and image URLs. Use optimistic UI only where safe; use explicit loading, success, and error states for Blogger mutations and payment-related operations.

## Paystack payments

Integrate Paystack hosted checkout. The browser may send product IDs, quantities, customer email, and delivery details, but not trusted prices or totals. The server must reload the current Blogger products, validate availability, recalculate totals, generate a reference, and initialize Paystack using the server-only `PAYSTACK_SECRET_KEY`.

Use a configured HTTPS callback such as `/checkout/verify`. Verify the transaction server-side before presenting success, and never mark payment successful based only on a browser redirect. Mount the webhook with raw-body handling before JSON parsing, validate Paystack’s HMAC-SHA512 signature, accept only valid successful events, and keep secret keys out of browser code and logs. Display payment activity only inside the authenticated `/admin` area.

Use `PAYSTACK_PUBLIC_KEY` only if a public client-side Paystack flow genuinely requires it; hosted server-initialized checkout should not expose a secret key. Test Paystack in test mode before switching to live credentials.

## Ghana delivery and maps

Add a delivery/location experience suitable for Ghana. If a maps provider is used for delivery areas, pickup points, route estimates, or tracking, keep its key in Vercel and never hard-code it. Make the map feature optional and graceful when its configuration is absent. Do not imply real-time order tracking unless a real provider and order-state system exist.

The required map variable may be named `MAPS_API_KEY` or another documented exact name. Explain the provider, scope, quota, and safe browser/server exposure model. Do not request a database URL just to support the map.

## Exact Vercel environment variables

Use exact variable names and keep all values in Vercel. Never put secret values in the prompt, codebase, GitHub, screenshots, test fixtures, or chat.

| Variable | Required use |
| --- | --- |
| `BLOGGER_BLOG_ID` | Blog ID used as the catalog storage target. |
| `BLOGGER_API_KEY` | Server-side Blogger catalog read access. |
| `GOOGLE_BLOGGER_CLIENT_ID` | OAuth client ID for Blogger management. |
| `GOOGLE_BLOGGER_CLIENT_SECRET` | OAuth client secret for Blogger management. |
| `GOOGLE_BLOGGER_REFRESH_TOKEN` | Refresh token authorized for the Blogger scope and product post management. |
| `PAYSTACK_PUBLIC_KEY` | Optional public Paystack key only if the selected checkout path needs it. |
| `PAYSTACK_SECRET_KEY` | Server-only Paystack initialization, verification, sales, and webhook validation. |
| `APP_BASE_URL` | Deployed HTTPS base URL for payment callbacks and canonical links. |
| `ADMIN_DASHBOARD_PASSWORD` | Optional second-factor dashboard password if password defense in depth is enabled. |
| `JWT_SECRET` | Random server-side session-signing key. |
| `GOOGLE_CLIENT_ID` | Google Sign-In client ID if separate from Blogger OAuth. |
| `GOOGLE_CLIENT_SECRET` | Google Sign-In client secret if separate from Blogger OAuth. |
| `ADMIN_EMAIL_ALLOWLIST` | Comma-separated approved Google account emails, or use a secure equivalent. |
| `MAPS_API_KEY` | Optional maps provider key for Ghana delivery/location features. |

Do not silently substitute `BLOG_ID` for `BLOGGER_BLOG_ID`, `LIVE_CALLBACK_URL` for `APP_BASE_URL`, or `GOOGLE_API_KEY` / `GOOGLE_PROJECT_ID` for the Blogger OAuth credentials. If compatibility aliases are intentionally supported, document and validate them explicitly.

The owner enters all values in Vercel. Enable the variables for the correct deployment environment, especially Production, and trigger a fresh Production redeploy after adding or changing them. A saved Vercel variable does not change an already-built deployment.

## Security and content rules

Never fabricate products, inventory, customer reviews, ratings, testimonials, orders, sales, popularity, customer accounts, or analytics. If reviews are added later, they must come from real customer-submitted data and must include moderation, consent, and safe storage. Do not ship demo credentials or a default dashboard password.

Add secure headers, input validation, request timeouts, rate limiting, safe CORS, route protection, noindex behavior for `/admin`, server-only secret access, and sanitized error messages. Rotate any payment or OAuth credential that is exposed in chat, logs, screenshots, or source control. Do not log secret values or full authorization headers.

Keep Blogger setup, OAuth authorization, Paystack webhook instructions, deployment notes, and dashboard documentation in private documentation only. The customer-facing site must not teach visitors how to publish products.

## Intelligent but honest store features

Implement smart features only when they are based on real data. Good candidates include typo-tolerant search, automatic classification from Blogger labels and descriptions, related products based on shared real attributes, recently viewed products stored in the browser, restock or price-change indicators from Blogger changes, a real wishlist stored in the browser, a WhatsApp contact/order option for Ghanaian shoppers, a delivery fee calculator based on configured regions, newsletter or SMS signup, and image optimization for mobile data.

Do not label a product `Best Seller`, show a star rating, or produce recommendations unless the underlying signal is real and documented. Do not add review or rating fixtures for visual demonstrations.

## Testing and acceptance criteria

Write Vitest and integration coverage for:

- Blogger qualification, reserved labels, automatic classification, custom-property parsing, dynamic facets, and stale-cache fallback.
- Server-side price recalculation and Paystack amount conversion.
- Paystack callback verification and raw-body HMAC webhook validation.
- Google allowlist authentication, optional password defense in depth, session expiry, logout, rate limiting, and private route protection.
- Blogger create/update/delete payloads and custom property round trips.
- Admin theme/content settings validation if implemented.
- Empty catalog rendering, shop filters, search, sorting, product detail attributes, cart behavior, and checkout redirect behavior.
- Ghana delivery content and graceful maps configuration fallback.
- `/admin` noindex behavior and the absence of admin links in public navigation, footer, sitemap, and search results.

Before delivery, run the type checker, full test suite, linting if configured, and production build. Verify desktop and mobile screenshots for the home page, shop, category page, product page, cart, checkout, payment verification, delivery, policies, contact, and protected `/admin` page. Test Blogger and Paystack in their intended test environments where credentials are available. If live integration cannot be tested, say so clearly instead of claiming success.

## Required end-to-end flows

The shopper flow must be:

```text
Open store → search or browse jewelry → filter or sort → inspect details → add to bag → provide delivery information → pay through hosted Paystack checkout → verify payment
```

The owner flow must be:

```text
Open /admin → authenticate with approved Google account → create or edit a product → save to Blogger → publish or unpublish → storefront refreshes from Blogger → review provider-sourced Paystack sales
```

The final result must be a complete, credible Ghana-focused jewelry online store whose public users see a normal premium shopping experience and whose owner manages catalog data through a private dashboard backed by Blogger, without relying on a product `DATABASE_URL`.
