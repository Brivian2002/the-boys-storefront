# The Boys Store setup notes

The storefront has been duplicated from `Brivian2002/la-glitz-storefront` and rebranded for Joshua Nasi Words.

## Current direction

- White-first professional marketplace UI.
- Broad shopping departments: Electronics, Fashion & Apparel, Home & Living, Beauty & Wellness, Gadgets & Accessories, Services, Bundles & Deals, and New Arrivals.
- Existing catalog, cart, checkout, admin, reviews, newsletter, contact, blog, and delivery flows are preserved.
- Product/service data still comes from the existing Blogger-as-CMS integration, so replace or seed the catalog for The Boys Store before launch.

## Required Vercel environment values

Configure a production database, admin secret, Paystack keys, EmailJS values, catalog/Blogger values, and the real contact/social details. The `.env.example` file lists the required variables.
