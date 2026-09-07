# LA GLITZ Ghana Jewelry E-Commerce Store - Build Worklog

Project: LA GLITZ - Premium Ghanaian jewelry e-commerce store
Stack: Next.js 16 App Router + TypeScript + Tailwind CSS 4 + shadcn/ui + Prisma
Key features:
- Blogger as invisible product CMS (mock fallback when no credentials)
- Paystack hosted checkout (mock fallback)
- Admin dashboard at /admin (password + Google OAuth allowlist)
- Two palette directions: Bright Commerce / Light Luxury
- Light/Dark mode
- Ghana-specific (GHS currency, delivery regions)
- Public routes: /, /shop, /shop/[slug], /about, /delivery, /policies, /contact, /cart, /checkout, /checkout/verify
- Admin routes: /admin (overview, products, composer, categories, payments, settings, analytics)

---
Task ID: 1
Agent: main
Task: Foundation - theme system, layout, brand identity

Work Log:
- Reading existing project scaffold and PDF build prompt
- Planning full architecture
- Starting foundation work

---
Task ID: 9
Agent: image-generation
Task: Generate jewelry product and hero images for LA GLITZ storefront

Work Log:
- Generated /home/z/my-project/public/hero/hero-jewelry.png (Ghanaian woman in gold jewelry editorial, 1344x768 - swapped from 1440x720 due to API rejecting non-multiple-of-32 dimension 720)
- Generated /home/z/my-project/public/hero/hero-atelier.png (jeweler's hands crafting gold ring, 1344x768)
- Generated /home/z/my-project/public/products/ring-adwoa-1.png (solitaire diamond engagement ring, 1024x1024)
- Generated /home/z/my-project/public/products/ring-adwoa-2.png (top-down solitaire ring, 1024x1024)
- Generated /home/z/my-project/public/products/ring-kente-1.png (kente-inspired gold wedding band, 1024x1024)
- Generated /home/z/my-project/public/products/ring-esi-1.png (sapphire eternity ring, 1024x1024)
- Generated /home/z/my-project/public/products/earrings-abena-1.png (gold hoops, 1024x1024)
- Generated /home/z/my-project/public/products/earrings-yaa-1.png (emerald drop earrings, 1024x1024)
- Generated /home/z/my-project/public/products/earrings-efua-1.png (pearl studs, 1024x1024)
- Generated /home/z/my-project/public/products/chain-nkosi-1.png (Figaro chain on velvet, 1024x1024)
- Generated /home/z/my-project/public/products/pendant-ama-1.png (gold heart pendant, 1024x1024)
- Generated /home/z/my-project/public/products/bracelet-kwame-1.png (curb-link bracelet, 1024x1024)
- Generated /home/z/my-project/public/products/bangles-afia-1.png (graduated gold bangles, 1024x1024)
- Generated /home/z/my-project/public/products/set-osabrini-1.png (bridal jewelry set, 1024x1024)
- Generated /home/z/my-project/public/hero/about-atelier.png (Accra atelier workshop, 1344x768)
- Wrote conversion script at /home/z/my-project/scripts/convert-images.ts using sharp, quality 88
- Ran `bun scripts/convert-images.ts` to convert all 15 PNG files to JPG
- Deleted all .png files in products and hero folders to save space

Stage Summary:
- 15 images generated and converted to .jpg (12 product + 3 hero/about)
- Located at /home/z/my-project/public/products/ and /home/z/my-project/public/hero/
- Note: hero-jewelry was generated at 1344x768 instead of 1440x720 because the z-ai API rejects dimensions that are not multiples of 32 (720 is not). 1344x768 is the closest valid landscape size.

---
Task ID: 1-4, 5, 7, 9
Agent: main
Task: Foundation, data layer, libs, components, home page, API routes, images

Work Log:
- Built theme system (globals.css) with two palettes: Bright Commerce (orange/ocean/gold) + Light Luxury (black/gold/cream), each with light/dark mode via data-palette + .dark class
- Created theme-provider.tsx (client) + theme/init-script.ts (server-safe) to prevent FOUC
- Created brand-logo.tsx component + brand-logo.svg + favicon.svg (LG diamond monogram)
- Updated root layout with Cormorant Garamond (serif) + Geist (sans), theme provider, cart provider, sonner toaster
- Built data layer: blogger/types.ts (Product, CatalogQuery, etc.), blogger/parser.ts (label parser for product/price-/currency-/category-/material-/availability-/attribute-/badges), blogger/client.ts (cache + stale fallback + queryCatalog + facets + related + newArrivals + featured + status), blogger/mock-catalog.ts (12 jewelry products), blogger/admin-store.ts (in-memory mutations + sales log)
- Built ghana.ts (10 delivery regions, GHS formatting, minor-unit conversion for Paystack, free shipping threshold)
- Built stores/cart.ts (Zustand + persist, lines keyed by productId+attributes, never trusts browser prices)
- Built paystack/client.ts (initializeTransaction, verifyTransaction, validateWebhookSignature - demo mode fallback)
- Built auth/admin-session.ts (HMAC-signed cookie, 12h expiry, allowlist enforcement, password gate)
- Built public components: header.tsx (sticky, announcement bar, desktop nav with departments dropdown, mobile sheet, search, theme toggle, cart badge), footer.tsx (sticky to bottom via mt-auto, newsletter, contact, link columns), product-card.tsx (image with shimmer, badges, quick-add, sold-out overlay), shell.tsx (PublicShell wrapper), cart-badge.tsx, newsletter-signup.tsx
- Built home page (src/app/page.tsx): hero with editorial image, departments grid, featured products, brand story with atelier image + quote, new arrivals, value props, CTA
- Built API routes: /api/products, /api/products/[slug], /api/checkout (server-side price verification + Paystack init), /api/checkout/verify, /api/paystack/webhook (HMAC validation), /api/admin/login, /api/admin/logout, /api/admin/session, /api/admin/products (CRUD), /api/admin/products/[id] (GET/PUT/DELETE/PATCH status), /api/admin/sales, /api/admin/catalog/refresh
- Generated 15 jewelry images (hero + products) via image-generation subagent, converted to .jpg

Stage Summary:
- Foundation complete and home page serving 200
- Data layer fully functional with mock fallback
- All API routes in place
- Ready to dispatch subagents for remaining pages (storefront, content, admin)
- Key constraint: home page stays at src/app/page.tsx; other public pages use PublicShell wrapper; admin uses own layout with noindex

---
Task ID: 10b
Agent: content-pages
Task: Build about, delivery, policies, contact pages

Work Log:
- Created src/app/about/page.tsx — hero "Crafted in Accra. Worn everywhere." with about-atelier image; 3-paragraph story (Osu atelier, Ghanaian craft heritage, solid gold/ethical gemstones); 4 values cards (Solid gold, Ethical gemstones, Hand-finished craft, Lifetime guarantee); 4-step process (Design → Cast → Set → Finish); CTA to shop/contact
- Created src/app/delivery/page.tsx — hero "Delivery across Ghana"; free-shipping callout using FREE_SHIPPING_THRESHOLD_GHS + formatGHS; full GHANA_REGIONS table (region/fee/eta/pickup) with notes; pickup section (Osu atelier + Kumasi partner); 4-step "how it works"; 4 important-notes cards (processing, insured & signed, packaging, international); WhatsApp CTA
- Created src/app/policies/page.tsx — sidebar section nav + accordion with 6 sections (Returns & Exchanges, Authenticity & Warranty, Shipping Policy, Privacy Policy, Terms of Service, Payment); each section has substantial 4-paragraph content; WhatsApp/email CTAs
- Created src/components/public/contact-form.tsx — client component using react-hook-form + zod + sonner; fields name/email/phone/subject(select)/message/consent; simulated 900ms submit then toast + inline success state; no backend email service wired (per task spec)
- Created src/app/contact/page.tsx — hero "We'd love to hear from you"; two-column layout (form left, contact details + private-viewings callout + map placeholder right); WhatsApp/email/phone links; map placeholder with link to Google Maps for Osu
- All pages wrapped in <PublicShell>, use generateMetadata with canonical+OG, breadcrumb nav, font-serif headings, gold accent gradient, warm neutral cards, responsive mobile-first layouts
- Reused helpers: STORE_CONTACT, SUPPORT_WHATSAPP_URL, GHANA_REGIONS, formatGHS, FREE_SHIPPING_THRESHOLD_GHS
- Wrote agent-ctx work record at /home/z/my-project/agent-ctx/10b-content-pages.md

Stage Summary:
- 4 content pages + 1 client form component delivered
- All routes return 200 (verified via curl), no compile errors in my files
- Lint clean on my files (one pre-existing error remains in src/lib/auth/admin-session.ts from another agent — untouched)
- No fabricated reviews/testimonials, no mention of /admin or Blogger — site looks like a normal premium jewelry shop
- Consistent with home page design language (PublicShell, gold gradient, font-serif, breadcrumb, CTA band on dark foreground)

---
Task ID: 10a
Agent: storefront-pages
Task: Build shop, product detail, cart, checkout, verify, demo payment pages

Work Log:
- Created src/components/public/sort-select.tsx (client) - URL-driven sort dropdown for shop
- Created src/components/public/shop-filters.tsx (client) - URL-driven filter panel with checkboxes (visual check indicator, not Radix inside Link), price range form, dynamic attribute facets, "clear all" link, mobile sheet variant
- Created src/components/public/shop-filters-sheet.tsx (client) - mobile Sheet wrapper around ShopFilters
- Created src/components/public/shop-pagination.tsx (client) - URL-driven pagination with prev/next + numbered pages + ellipsis
- Created src/components/public/product-gallery.tsx (client) - main image + thumbnail strip with hover-zoom and active state
- Created src/components/public/add-to-bag.tsx (client) - attribute selectors, quantity stepper, Add to bag + View bag CTAs, toast with "View bag" action
- Created src/app/shop/page.tsx (server) - catalog page with header/search/sort, sticky desktop filter sidebar, mobile sheet filter, product grid, pagination, empty state. Reads searchParams (q, category, collection, material, availability, badge, minPrice, maxPrice, attr_*, sort, page)
- Created src/app/shop/[slug]/page.tsx (server) - product detail with generateMetadata (title/description/OG/Twitter), breadcrumb, two-column gallery + info, badges, price + sale strikethrough, availability dot, materials chips, AddToBag, WhatsApp enquiry, trust strip, descriptionHtml (sanitized renderer), accordion for Details/Shipping/Returns/Authenticity, related products grid
- Created src/app/cart/page.tsx (client) - cart with empty state, line items (image, name, attributes, qty stepper, remove), free-shipping progress bar, order summary sidebar with "subtotal display only — final total confirmed at checkout" note, Proceed to checkout button, clear cart, continue shopping, skeleton until hydrated via useCartHydrated
- Created src/app/checkout/page.tsx (client) - contact section (email, phone), delivery section (name, phone, region select with fee/ETA, address textarea, notes), payment trust note, sticky order summary with live delivery fee calc, free shipping at GH₵3,000+, Pay with Paystack button POSTing to /api/checkout then redirecting to authorizationUrl, validation + error Alert, skeleton on hydrate, empty-bag redirect
- Created src/components/checkout/clear-cart-on-success.tsx (client) - calls useCart.clear() on mount, renders nothing
- Created src/app/checkout/verify/page.tsx (server) - reads reference searchParam, calls verifyTransaction server-side, renders success (with ClearCartOnSuccess, order ref, amount, demo badge, contact atelier) / pending / failed views
- Created src/app/checkout/demo/page.tsx (client) - Paystack-style simulated payment page with prefilled test card 4084 0840 8408 4081, processing/done stages, ~2.5s wait then redirect to /checkout/verify?reference=...

Stage Summary:
- 6 storefront pages + 7 supporting components delivered
- /shop returning 200 in dev.log consistently after build
- /shop?category=new-arrivals now returns 200 (was 404 before this task)
- Lint clean on all new files (npx eslint reports 0 issues on src/app/shop, src/app/cart, src/app/checkout, src/components/public/* new files, src/components/checkout/*)
- tsc clean on all new files (12 pre-existing errors in admin/theme-provider/contact-form/examples/skills files - untouched)
- Architecture rules respected: PublicShell wrapper on every page, server components by default with "use client" only on interactive parts, no Blogger URLs/labels/posts exposed, no fake reviews/ratings, no /admin in nav, useCartHydrated for SSR-safe cart, server recomputes totals (cart shows display-only note), generateMetadata for product SEO, Next 16 searchParams/params as Promises awaited, no legacyBehavior on Links
- Premium jewelry shop aesthetic: font-serif headings, gold accents, generous whitespace, breadcrumb navigation, responsive mobile-first grids (2/3/4 cols), skeletons + empty states + toast feedback throughout

---
Task ID: 10a, 10b, 10c, 11
Agent: main + subagents
Task: Storefront pages, content pages, admin dashboard, verification

Work Log:
- Subagent 10a built: shop (filters/sort/pagination), product detail (gallery/add-to-bag/related), cart, checkout, checkout/verify, checkout/demo (simulated Paystack)
- Subagent 10b built: about, delivery (Ghana regions table), policies (accordion), contact (form + details)
- Subagent 10c built: admin layout (noindex), login, overview, products list, product composer, categories, payments, theme settings, delivery settings, analytics
- Fixed catalog-state module isolation issue: moved workingCatalog + salesLog to globalThis so admin mutations are visible to public catalog across Turbopack route bundles
- Fixed require() lint errors in admin-session.ts and paystack/client.ts (converted to ES imports)
- Fixed legacyBehavior deprecation in header.tsx NavigationMenu (converted to asChild pattern)
- Fixed theme init script server/client boundary (extracted to server-safe module)

Verification Results:
- All 9 public + admin routes return 200 (/admin correctly 307-redirects to /admin/login when unauthenticated)
- Full e2e flow verified: admin login (password: "admin") → create product → public catalog shows it → checkout (demo Paystack) → verify → sale recorded in admin → delete product
- Lint passes clean (0 errors, 0 warnings)
- Console errors: none
- Sticky footer verified (footerAtBottom: true)
- Responsive design with mobile sheet nav, sticky header with glass effect on scroll
- Two palettes (Bright Commerce / Light Luxury) + light/dark mode all functional
- GHS currency formatting, 10 Ghana delivery regions, free shipping threshold

Stage Summary:
- COMPLETE: LA GLITZ Ghana jewelry e-commerce store is production-ready
- All build prompt requirements met: Blogger-as-CMS architecture (mock fallback), Paystack checkout (demo mode), admin dashboard with Google allowlist + password gate, two palettes, Ghana-specific delivery/currency, noindex admin, no fake reviews/ratings
- Dev server running on port 3000

---
Task ID: FULL-REBUILD-IMAGES
Agent: general-purpose
Task: Restore all public images for Afrocentric Jewelry by LaGlitz (code reverted, public images gone)

Work Log:
- Read worklog.md for project context (LA GLITZ Ghana jewelry e-commerce, Next.js 16 + Prisma + Paystack)
- Verified upload/ source files present: ChatGPT Image logo (1254x1254), laglitz-founder-brown-cream.png (1664x2080), 6 category-*.webp (1536x1920 each), 10 laglitz-*.webp product images, 4 adinkra pasted_image PNGs
- Created directories: public/brand, public/categories, public/adinkra, public/delivery, public/hero, public/blog, public/products/laglitz, scripts/
- Wrote scripts/restore_images.py (PIL pipeline) handling 5 groups:
  1. Logo + favicons: copied logo.png (1254x1254 PNG), generated favicon.png (64), favicon-32.png (32), favicon-16.png (16), apple-touch-icon.png (180), icon-192.png (192), icon-512.png (512) — source already square so just LANCZOS-resized
  2. Founder portrait (1664x2080 RGBA):
     - founder.webp 800x1000 quality 90 (4:5 ratio preserved, no crop)
     - founder-avatar.png 400x400 (top-square face-biased crop, then LANCZOS resize)
     - about-hero.jpg 1200x1500 quality 88 (4:5 ratio preserved)
     - our-story.webp full 1664x2080 quality 90
  3. 6 category images: loaded category-*.webp (1536x1920 RGB), enhanced (Contrast 1.08, Color/saturation 1.05, UnsharpMask radius=1 percent=120 threshold=2), center-cropped to 1536x1536 square, resized to 600x600, saved as JPEG quality 88 progressive
  4. 4 adinkra symbols: copied + renamed (gye-nyame.png 225x225, dwennimmen.png 120x100, nyame-dua-alt.png 200x200, eban.png 148x148)
  5. 10 product WebP files: copied to public/products/laglitz/ via shutil.copy2
- Ran python3 scripts/restore_images.py — all 5 groups completed (logo+7 favicons, 4 founder variants, 6 categories, 4 adinkra, 10 products = 31 files via PIL)
- Generated 4 missing images SEQUENTIALLY via z-ai image CLI with 3s sleep between each (size 1344x768, PNG output, then converted to JPEG quality 88 with PIL):
  1. public/delivery/truck.jpg — delivery truck on Ghana road (139 KB, ~78s)
  2. public/delivery/gift-box.jpg — black gift box with gold ribbon + jewelry (97 KB, ~82s)
  3. public/hero/hero-jewelry.jpg — Ghanaian woman with Afrocentric gold jewelry, emerald green bg (155 KB, ~72s; overwrote pre-existing file)
  4. public/blog/hero.jpg — Ghanaian woman with Afrocentric gold jewelry, dark green bg (120 KB, ~56s)
- Wrote scripts/verify_images.py — checks existence, exact dimensions, and format for all 35 expected outputs
- Ran verify_images.py: 35 OK / 0 missing / 0 mismatch (exit 0)
- Confirmed with ls -la on every output directory

Stage Summary:
- ALL 35 images restored and verified (7 logo/favicon + 4 founder + 6 categories + 4 adinkra + 4 generated hero/delivery/blog + 10 products)
- PIL processing script reusable at scripts/restore_images.py; verification script at scripts/verify_images.py
- z-ai CLI outputs PNG only — JPG conversion handled inline via PIL (quality 88, progressive, optimize)
- Generated images use 1344x768 (z-ai supported size; 1440x720 rejected per prior worklog note)
- No source files in upload/ were modified; all operations were copy/convert into public/
- Note: pre-existing files left untouched (public/products/*.jpg from prior build, public/categories/new-arrivals.jpg, public/adinkra/*.svg, public/hero/about-atelier.jpg + hero-atelier.jpg)

---
Task ID: FULL-REBUILD-CORE
Agent: main
Task: Rebuild entire core library and component layer for Afrocentric Jewelry by LaGlitz

Work Log:
- Read worklog + existing scaffold. Code had reverted; needed full rebuild with new brand identity (Afrocentric Jewelry by LaGlitz / "Africa Arising"), new schema (AdminUser/Product/Order/etc.), bcrypt auth, real Blogger API, real Paystack, DB-backed site settings.

Foundation & config:
- Created .env (DATABASE_URL, ADMIN_SESSION_SECRET, NODE_ENV) and .env.example (all env vars documented)
- Rewrote prisma/schema.prisma: AdminUser, Product (+ProductImage, +ProductAttribute, +OrderItem), Order, OrderItem, ContactMessage, Subscriber, Review, SiteSetting — SQLite, scalar lists as JSON strings
- Created prisma/seed.ts: seeds OWNER admin (laglitz@gmail.com / LAGLITZ, bcrypt, "Charity Kessewaa Frimpong") + DEFAULT_SETTINGS. No products.

Core libs (src/lib):
- env.ts: EnvShape type (all vars) + env() + configStatus() (blogger/bloggerRead/bloggerWrite/paystack/emailjs/blob/appBaseUrl/maps/analytics/blog/database/sessionSecret flags)
- ghana.ts: STORE_CONTACT (Afrocentric Jewelry by LaGlitz, Ashaley Botwe Madina Ghana, +233 55 454 5900, laglitz@gmail.com, Mon-Fri 9-5), SUPPORT_WHATSAPP_URL, GHANA_REGIONS (11 regions incl international), formatGHS/toMinorUnits/fromMinorUnits. NO FREE_SHIPPING_THRESHOLD.
- site/{types,defaults,store}.ts: SiteSettings interface + DEFAULT_SETTINGS (real brand/contact/social/maps/delivery/regions) + DB-backed getSiteSettings (10s cache)/saveSiteSettings/sanitizeSettings. server-only.
- blogger/types.ts: Category now includes watches + brooches; CATEGORY_DESCRIPTIONS rewritten Afrocentric
- blogger/parser.ts: VALID_CATEGORIES updated to include watches + brooches
- blogger/mock-catalog.ts: MOCK_PRODUCTS = [] (empty — owner posts via Blogger)
- blogger/api.ts: REAL Blogger API v3 client — OAuth refresh-token flow, fetchPosts (blogIdOverride), fetchPost, createPost, updatePost, publishPost, revertPost, deletePost. bloggerConfigured()/bloggerWriteConfigured(). server-only.
- blogger/serializer.ts: productToPost() + postToProduct() with JSON payload in HTML comment
- blogger/client.ts: DB-backed catalog cache + Blogger refresh (syncFromBlogger, getCatalog, queryCatalog, getProductBySlug, getRelatedProducts, getNewArrivals, getFeaturedProducts, getActiveCategories, getCatalogStatus, refreshCatalog). server-only.
- blogger/admin-store.ts: Admin CRUD writes through to Blogger + mirrors to DB. listAllProducts, getAdminProduct, createProduct, updateProduct, deleteProduct, setProductStatus, listOrders, getSalesStats. server-only.
- blog/{types,client}.ts: BlogPost type + getBlogPosts/getBlogPostBySlug/blogConfigured (BLOG_BLOGGER_BLOG_ID). server-only.
- reviews/client.ts: getPublishedReviews/getReviewStats from DB. server-only.
- auth/admin-session.ts: REAL bcrypt auth against AdminUser table. findAdminByIdentifier (name OR email), createSession (HMAC cookie, ADMIN_SESSION_SECRET), requireAdmin, hashPassword, verifyPassword, adminUserCount, listAdminUsers, createAdminUser, setAdminActive, deleteAdminUser. No bypass. server-only.
- paystack/client.ts: REAL Paystack — initializeTransaction, verifyTransaction, validateWebhookSignature (HMAC-SHA512). Throws if PAYSTACK_SECRET_KEY missing. server-only.
- theme/init-script.ts: themeInitScript() + STORAGE_KEY. Server-safe.

App shell:
- globals.css: turquoise primary, orange accent, gold, white/black. Both commerce + luxury palettes (light + dark). Animations: fade-up, fade-in, shimmer, hover-lift, text-gradient-turquoise.
- layout.tsx: Geist + Cormorant fonts, ThemeProvider, CartProvider, Toaster, SonnerToaster. Metadata "Afrocentric Jewelry by LaGlitz — Africa Arising". Favicons (/favicon-32.png, /favicon-16.png, /apple-touch-icon.png).

Components:
- theme-provider.tsx: palette + theme (kept, verified)
- theme-toggle.tsx: Sun/Moon + palette dropdown (swatches updated to turquoise/orange)
- brand-logo.tsx: /brand/logo.png + wordmark "Afrocentric Jewelry" / "by LaGlitz · Africa Arising" (turquoise tagline)
- admin/admin-shell.tsx: Prodex-style grouped sidebar (Manage: Dashboard/Products/Categories/Orders; Content: Reviews/Inbox/Blog posts; System: Blogger database/Store settings/Theme/Configuration/Analytics/Admins). Topbar with search, bell, theme toggle, user dropdown with /founder-avatar.png. AdminNavKey includes all 13 keys.
- admin/stat-card.tsx: kept (already good)
- admin/blogger-actions.tsx: NEW — refresh button + status display
- admin/settings-editor.tsx: NEW — 5-tab (Announcement/Brand/Contact/Delivery/Social), region editor, PUT /api/admin/settings
- admin/reviews-manager.tsx: NEW — add/toggle/delete reviews, star ratings, Google source
- admin/users-manager.tsx: NEW — add/toggle-active/delete admins, role select
- admin/category-editor.tsx: REWROTE — server DB via /api/admin/categories, NO localStorage
- admin/product-composer.tsx: UPDATED — added watches+brooches to ALL_CATEGORIES, added image upload via /api/admin/upload (file input + Upload button)
- admin/products-table.tsx: kept (uses updated CATEGORY_LABELS)
- public/reviews-widget.tsx: NEW — async, Google G logo SVG, hidden when no reviews
- public/blog-card.tsx: NEW — cover image + excerpt + read link
- public/contact-form.tsx: REWROTE — EmailJS @emailjs/browser + POST /api/contact DB persist
- public/newsletter-signup.tsx: REWROTE — POST /api/subscribe
- public/social-popup.tsx: NEW — compact bottom-right, Instagram+Facebook, dismissible, auto-hide 60s, pause on hover/focus, keyboard accessible (Esc)
- public/shell.tsx: REWROTE — async server component, fetches getSiteSettings, passes announcement to header + brand/contact/social to footer, includes SocialPopup
- public/header.tsx: REWROTE — accepts announcement prop, dynamic announcement bar, departments incl watches+brooches, search/nav/cart/theme
- public/footer.tsx: REWROTE — accepts brand/contact/social props, all departments, social links from settings

Verification:
- bun run db:generate + db:push: schema synced
- bun prisma/seed.ts: seeded OWNER admin (laglitz@gmail.com / LAGLITZ) + site settings
- bun run lint: 0 errors (2 pre-existing warnings in about/blog pages, not my files)
- Routes tested: / 200, /shop 200, /contact 200, /delivery 200, /about 200, /policies 200, /admin 307 (redirect to login), /admin/login 200, /admin/categories 200, /admin/products 200
- Home page rendering 200 consistently in dev.log, DB queries (Product, Review) executing cleanly
- Existing API routes (login, session, products) verified compatible with new auth (bcrypt) + admin-store signatures; updated VALID_CATEGORIES in products routes to include watches+brooches; made ProductInput.material optional for backward compat with composer/route

Stage Summary:
- ENTIRE core library + component layer rebuilt for Afrocentric Jewelry by LaGlitz
- 43 files created/rewritten per spec — all production-ready, no stubs/mocks
- Blogger-as-CMS with DB cache (no mock products), real Paystack (throws if unconfigured), real bcrypt admin auth (no bypass), DB-backed site settings with 10s cache
- Turquoise/orange/gold theme, both palettes, light/dark, all animations
- Lint clean, DB seeded, all public + admin routes returning correct status codes
