# La Glitz private operations: Vercel setup

This guide is **not presented on the customer storefront**. It is the private deployment checklist for the owner who configures Blogger operations, Paystack payments, and the protected La Glitz operations workspace.

## 1. Add variables in Vercel

Open **Vercel → your project → Settings → Environment Variables**. Add each item below with no `VITE_` prefix. Select **Production**; select **Preview** as well only if you want payment and Blogger management to work on preview deployments.

| Variable | Value to enter | Why it is needed |
| --- | --- | --- |
| `BLOGGER_BLOG_ID` | Your Blogger blog ID | Gives the store and private dashboard the target blog. |
| `BLOGGER_API_KEY` | A Google Cloud API key restricted to Blogger API | Reads published catalog products server-side. |
| `GOOGLE_BLOGGER_CLIENT_ID` | Google OAuth 2.0 web-app client ID | Refreshes authorized Blogger management access. |
| `GOOGLE_BLOGGER_CLIENT_SECRET` | Secret for the same Google OAuth client | Used only for OAuth token refresh on the server. |
| `GOOGLE_BLOGGER_REFRESH_TOKEN` | Blogger-authorized refresh token | Allows `/atelier` to create, update, and delete posts. |
| `PAYSTACK_SECRET_KEY` | Paystack **test** secret for testing, then **live** secret for production | Creates secure checkout sessions, verifies payment, reads sales, and validates webhooks. |
| `APP_BASE_URL` | Your deployed HTTPS URL, for example `https://shop.example.com` | Builds the fixed Paystack verification return address. |
| `ADMIN_DASHBOARD_PASSWORD` | A long, unique password | Protects the unlinked `/atelier` private operations workspace. Do not use `Github`. |
| `JWT_SECRET` | A long, unique random string | Signs the secure, HTTP-only private dashboard session. |

Save the variables and redeploy so every serverless function receives the new configuration.

## 2. Authorize Blogger management

In Google Cloud, enable **Blogger API v3** for the project that owns the OAuth client. Create OAuth consent configuration appropriate for the Blogger owner account. The refresh token must grant the `https://www.googleapis.com/auth/blogger` scope. The private dashboard uses it to refresh a short-lived Google access token server-side; neither token is exposed to visitors.

## 3. Configure Paystack

In **Paystack Dashboard → Settings → Developer**, add the webhook URL:

```
https://YOUR_DOMAIN/api/paystack/webhook
```

Use the same Paystack environment as `PAYSTACK_SECRET_KEY`: test key with Paystack test mode and live key with live mode. The webhook validates Paystack’s `x-paystack-signature` HMAC SHA512 before acknowledging any event. The normal payment return path is `https://YOUR_DOMAIN/checkout/verify` and is created automatically by the application.

## 4. Private dashboard access

After deployment, select the small blinking orange indicator at the lower right of the customer footer, or enter `https://YOUR_DOMAIN/atelier` directly. The indicator has no visible management label and is not part of the customer navigation. Use `ADMIN_DASHBOARD_PASSWORD` to create a 12-hour HTTP-only session. The private workspace can create or save Blogger product posts, edit or delete returned Blogger posts, define custom product-property names and values, and view successful Paystack transaction records.

## References

Google’s Blogger API requires OAuth 2.0 authorization for post-management operations and documents the Blogger authorization scope. Paystack documents server-side transaction initialization and verification, and recommends signed webhooks for payment confirmation. [1] [2] [3]

[1]: https://developers.google.com/blogger/docs/3.0/using "Blogger API: Using the API"
[2]: https://paystack.com/docs/api/transaction/ "Paystack Transactions API"
[3]: https://paystack.com/docs/payments/webhooks/ "Paystack Webhooks"
