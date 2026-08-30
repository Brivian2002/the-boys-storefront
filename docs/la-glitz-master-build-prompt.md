# Master Build Prompt: LA GLITZ Direct Jewelry Marketplace

You are a senior product designer, full-stack engineer, security engineer, and QA engineer. Build and maintain **LA GLITZ**, a polished luxury jewelry storefront with a direct marketplace shopping experience. The result must feel like a real online store rather than a blog, editorial site, or publishing tutorial. Use marketplace discovery principles such as strong search, category navigation, filters, product cards, clear pricing, availability, and a short path from discovery to checkout. You may study the efficiency of Jiji, AliExpress, eBay, and Amazon, but do not copy their branding, layouts, text, visual identity, or distinctive interface patterns.

## Product and architecture requirements

Use a React + TypeScript + Vite frontend with an Express server and tRPC API, or an equally strong typed full-stack architecture. Keep the project production-ready, responsive, accessible, and suitable for Vercel deployment. Blogger is the catalog source of truth. Do not require or introduce a catalog database, database URL, local product fixtures, fake products, or seeded demo inventory. The public product catalog must remain empty until qualifying Blogger product posts exist.

All Blogger access must happen server-side. Never expose the Blogger API key, Google OAuth client secret, Google refresh token, Paystack secret key, or dashboard password to browser JavaScript. Cache the Blogger catalog briefly for performance, refetch regularly so newly published products appear automatically, and use a stale fallback when the upstream service temporarily fails. Do not expose Blogger as a blog or show Blogger URLs, post feeds, publishing tutorials, or customer-facing authoring instructions.

## Blogger product model

Create a private operations dashboard that writes structured product posts to Blogger. The dashboard must manage the product name, description, price, currency, category, collection, materials, availability, image URLs, badges, featured status, new-arrival status, sale status, and publication state. A qualifying catalog post must contain the `product` label and a valid `price-*` label. Ignore ordinary Blogger posts, malformed products, hidden products, and posts without valid product labels.

Use normalized labels so the server can classify products without manual database mapping. Support labels such as `product`, `price-25000`, `currency-ngn`, `category-rings`, `collection-solstice`, `material-18k-gold`, `availability-in-stock`, `featured`, `new-arrival`, `sale`, and `hidden`. Define clearly whether prices are stored in major currency units in the catalog and converted to Paystack minor units only on the server.

Add a flexible custom-property editor in the private dashboard. Operators must be able to enter any property name and one or more values, including fields that were not predicted in advance—for example `Ring size`, `Gemstone`, `Chain length`, `Finish`, `Weight`, `Setting`, or a future custom field. Encode these safely into Blogger labels using a documented convention such as `attribute-name--value`. Normalize whitespace, casing, punctuation, duplicate values, and unsafe characters. Never allow custom labels to overwrite reserved system labels.

Parse custom attributes back from Blogger posts into the shared catalog type. Display them on product pages and include them in server-derived discovery facets. The shop search must be able to match product names, descriptions, materials, collections, categories, and custom attribute names and values. Custom facets should appear only when they exist in published catalog data; do not show empty or invented filters.

## Public storefront experience

Design LA GLITZ as a direct store with a distinctive luxury marketplace feel. Use the requested palette: deep green, gold, warm cream, white, yellow, black, and an orange commerce accent. Support persistent light and dark modes with readable contrast in both themes. Use the faceted LA GLITZ logo and a matching favicon.

The public header should prioritize shopping. Include clear links for Shop, New Arrivals, Collections or category discovery, Delivery, Policies, and Contact. Include a prominent search field, category shortcuts, bag access, and theme switching. Do not include an Atelier, Admin, Dashboard, Blogger, publishing, or operations link in the normal public navigation.

The home page must be product-first rather than editorial. Lead with a clear shopping value proposition, direct calls to action such as `Shop all pieces` and `See new arrivals`, category departments, search/discovery guidance, product benefits, and a direct path to the bag. Avoid blog-like language such as posts, articles, stories, journals, authoring, or publishing. Brand storytelling may exist only as supporting copy and must never overpower shopping.

The shop page must support:

- Search by product name, description, material, collection, category, and custom attributes.
- Category, collection, material, availability, badge, and dynamically discovered custom-property filters.
- Sorting by newest, price ascending, and price descending.
- Product count and useful empty, loading, and error states.
- Responsive product cards with image, name, category, price, availability, badges, and relevant attribute cues.
- A mobile filter control that is easy to use and keyboard accessible.
- No fake inventory, reviews, ratings, testimonials, social proof, or demo products.

The product detail page must show the product image gallery, title, price, description, category, collection, materials, availability, badges, custom properties, quantity controls, and an `Add to bag` action. Product details should feel like commerce data, not a Blogger article. The cart must support quantity changes, removal, clear empty state, and a clear checkout CTA.

Include dedicated Delivery, Policies, and Contact pages. Keep these pages customer-facing and practical. Do not put product publishing instructions or Blogger setup documentation on the public site.

## Paystack checkout

Use Paystack hosted checkout. The browser may send only product IDs, quantities, and required customer contact or delivery information. The server must reload the current Blogger catalog, validate that each product is still qualifying and available, calculate the authoritative total, and initialize the Paystack transaction using the server-only `PAYSTACK_SECRET_KEY`. Never trust browser-supplied prices, totals, product names, or payment status.

Use a server-generated reference, a configured HTTPS callback URL, and a public verification page such as `/checkout/verify`. Verify the transaction server-side before displaying success. Mount the Paystack webhook using the raw request body before JSON parsing, validate the `x-paystack-signature` HMAC-SHA512 signature, and accept only valid successful events. Do not mark orders as paid based solely on browser redirects. Display provider-sourced successful payment activity only inside the protected operations dashboard unless a future order-persistence feature is explicitly added.

## Private operations workspace

Create a protected workspace at `/atelier` and optionally an alias at `/admin` within the same Vercel deployment. The routes must not appear in the public header, footer navigation, sitemap copy, or customer-facing content. A small orange blinking indicator may be placed at the lower-right footer as an accessible link to the private workspace. The indicator should be visually discreet, have an accessible label, support keyboard focus, and contain no visible management text.

Protect the workspace with a server-enforced password session. Read the password only from `ADMIN_DASHBOARD_PASSWORD`. Store the session in a secure HTTP-only cookie, sign it using `JWT_SECRET`, use a 12-hour expiry, use secure and SameSite settings, and invalidate it on logout. Add rate limiting or progressive delay to password attempts. Never hard-code the password. Treat the hidden URL as discoverability control, not as the security boundary.

Use the existing dashboard shell or an equivalent responsive admin layout. Provide these private views:

1. **Overview:** Blogger product-post count, successful Paystack sales count, provider-sourced totals, configuration status, and a concise explanation of the source-of-truth architecture.
2. **Products:** list managed Blogger posts; create a product; edit a product; publish or save as draft; delete a post; edit price/category/collection/materials/availability/images/badges; and add, remove, or edit repeatable custom property names and values.
3. **Sales:** show successful Paystack provider transactions, reference, amount, currency, date, channel, and customer email only within the authenticated workspace. Clearly label these as provider-sourced sales rather than locally persisted order history.
4. **Security and configuration:** show safe configuration status such as configured/not configured, but never display secret values.

Validate every operation server-side with typed schemas. Restrict Blogger create, update, and delete operations to authenticated dashboard sessions. Escape or sanitize Blogger content and image URLs. Do not add customer reviews, ratings, testimonials, or invented sales data.

## Vercel environment variables

Use these exact server-side variable names. The owner will enter the values in Vercel; do not request or commit secret values in source control.

| Variable | Purpose |
| --- | --- |
| `BLOGGER_BLOG_ID` | Target Blogger blog ID used by the public catalog and operations dashboard. |
| `BLOGGER_API_KEY` | Server-side Google/Blogger read access for catalog retrieval. |
| `GOOGLE_BLOGGER_CLIENT_ID` | Google OAuth web-client ID for Blogger management. |
| `GOOGLE_BLOGGER_CLIENT_SECRET` | Secret for the same Google OAuth web client. |
| `GOOGLE_BLOGGER_REFRESH_TOKEN` | Blogger-authorized refresh token with Blogger API scope for create/update/delete operations. |
| `PAYSTACK_SECRET_KEY` | Server-only Paystack transaction initialization, verification, sales retrieval, and webhook validation. |
| `APP_BASE_URL` | Deployed HTTPS site URL used to build the Paystack callback URL. |
| `ADMIN_DASHBOARD_PASSWORD` | Strong unique human password for the private operations workspace. |
| `JWT_SECRET` | Long random signing secret for the HTTP-only dashboard session. |

Do not substitute `BLOG_ID` for `BLOGGER_BLOG_ID` or `LIVE_CALLBACK_URL` for `APP_BASE_URL` unless the application is deliberately changed to support those aliases. Do not assume `GOOGLE_API_KEY` and `GOOGLE_PROJECT_ID` replace the required Blogger OAuth variables. Environment changes apply only to new deployments, so require a fresh Vercel Production redeploy after variables are added or updated.

## Security and deployment requirements

Keep `.env` files, secret values, access tokens, and payment credentials out of GitHub. Add security headers, sensible CORS behavior, input validation, timeout handling, safe error messages, and request logging that never records secrets or full payment credentials. Rotate any credential that is accidentally exposed in chat, logs, screenshots, or source control.

Provide a Vercel-ready configuration. Do not deploy from the assistant; leave publishing to the owner. Document the exact environment setup, Google Cloud Blogger API and OAuth authorization sequence, Paystack webhook URL, callback URL, dashboard URL, and redeploy requirement in private documentation only.

## Testing and acceptance criteria

Write and maintain Vitest coverage for catalog qualification, label classification, custom-attribute parsing, dynamic facets, stale cache fallback, dashboard authorization, password-session expiry, Blogger payload creation, route protection, Paystack amount validation, callback verification, HMAC webhook validation, sales mapping, empty catalog rendering, checkout redirect behavior, product-detail attributes, responsive navigation, and the discreet `/atelier` or `/admin` access indicator.

Before delivery, run the type checker, full Vitest suite, and production build. Verify desktop and mobile screenshots for the home page, shop page, empty catalog, product detail, cart, checkout, checkout verification, and protected workspace. Confirm that the public site contains no Blogger publishing tutorial, no visible dashboard navigation, no fake products, no fake reviews, and no exposed secrets. State accurately when live Blogger or Paystack integration cannot be exercised because the owner has not supplied or deployed the required environment values.

The finished product should make the following flow obvious to a shopper: **open store → search or browse department → refine results → inspect product details → add to bag → pay through hosted Paystack checkout**. It should make the following flow obvious to the owner: **open the protected workspace → sign in → create or edit Blogger product → publish → product appears in the store after the short catalog refresh interval → review provider-sourced sales privately**.
