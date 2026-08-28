# Payment and Blogger Operations Notes

## Verified integration requirements

The public La Glitz catalog can continue reading published product posts with the Blogger API key. Creating, updating, or deleting Blogger posts requires an OAuth 2.0 access token with the `https://www.googleapis.com/auth/blogger` scope. The private operations server will refresh that access using Vercel-managed Google OAuth client and refresh-token environment variables.

Paystack checkout initialization and transaction verification must occur server-side with `PAYSTACK_SECRET_KEY`. The checkout amount will always be repriced from the current server-side Blogger catalog rather than accepting a browser-provided amount. Payment confirmation will accept only webhook events whose `x-paystack-signature` is a matching HMAC SHA512 of the raw request payload; Paystack recommends webhooks for payment confirmation.

## Official references

1. Google, [Blogger API: Using the API](https://developers.google.com/blogger/docs/3.0/using).
2. Google, [Blogger Posts: insert](https://developers.google.com/blogger/docs/3.0/reference/posts/insert).
3. Paystack, [Transactions API](https://paystack.com/docs/api/transaction/).
4. Paystack, [Webhooks](https://paystack.com/docs/payments/webhooks/).
5. Paystack, [Verify Payments](https://paystack.com/docs/payments/verify-payments/).
