# The Boyz Store Environment Setup

## Google Analytics

The site now loads Google Analytics through `NEXT_PUBLIC_GA_MEASUREMENT_ID`. In Vercel, add:

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-P8Z1FKBLLC
```

The existing `ANALYTICS_WEBSITE_ID` may also contain the same measurement ID for the admin configuration display. Redeploy after adding or changing environment variables.

## Blogger product catalog

`BLOGGER_BLOG_ID` identifies the Blogger blog containing product posts. `BLOGGER_API_KEY` is created in Google Cloud Console under **APIs & Services → Credentials → Create credentials → API key**. Restrict the key to the Blogger API and, where practical, restrict it to the production domain or server-side use.

The OAuth variables are required for product publishing and editing through the admin panel:

| Variable | How to obtain it |
|---|---|
| `GOOGLE_BLOGGER_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID. Use a Web application client. |
| `GOOGLE_BLOGGER_CLIENT_SECRET` | The secret shown for that OAuth client. |
| `GOOGLE_BLOGGER_REFRESH_TOKEN` | Use Google OAuth Playground with your own OAuth client, authorize Blogger API access, exchange the authorization code, and save the refresh token. |

Add `https://developers.google.com/oauthplayground` as an authorized redirect URI for the OAuth client. The OAuth Playground must use the Blogger API scope requested by the application. Keep the client secret and refresh token server-side only.

## Paystack

In the Paystack Dashboard, open **Settings → API Keys & Webhooks**. Use the test keys while testing and live keys only for production. Add:

```text
PAYSTACK_SECRET_KEY=...
PAYSTACK_PUBLIC_KEY=...
```

Set the webhook URL to:

```text
https://the-boys-store.vercel.app/api/paystack/webhook
```

Confirm that the webhook signature verification uses the secret key configured in the same Vercel environment.

## EmailJS

The three supplied EmailJS values belong in:

```text
NEXT_PUBLIC_EMAILJS_SERVICE_ID=...
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=...
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=...
```

In EmailJS, verify that the template expects the field names sent by the contact form and that the connected email service is active.

## Vercel Blob

Create a Blob store from the Vercel project dashboard under **Storage → Blob**, then connect it to the project. Vercel normally provisions `BLOB_READ_WRITE_TOKEN` automatically. If it does not, copy the token from the Blob store’s settings into the Production environment.

## Google Maps

Create or select a Google Cloud project, enable the Maps JavaScript API or the specific Maps API used by the application, and create an API key under **APIs & Services → Credentials**. Restrict it by API and, for browser-exposed usage, by the production domain. Add it as:

```text
MAPS_API_KEY=...
```

Do not reuse a browser-restricted Maps key as a server-side Blogger key. Use separate keys with separate restrictions.

## Vercel checklist

Set these values in **Production**, and add them to Preview or Development only when needed:

```text
DATABASE_URL
ADMIN_SESSION_SECRET
APP_BASE_URL
NEXT_PUBLIC_GA_MEASUREMENT_ID
BLOGGER_BLOG_ID
BLOGGER_API_KEY
GOOGLE_BLOGGER_CLIENT_ID
GOOGLE_BLOGGER_CLIENT_SECRET
GOOGLE_BLOGGER_REFRESH_TOKEN
PAYSTACK_SECRET_KEY
PAYSTACK_PUBLIC_KEY
NEXT_PUBLIC_EMAILJS_SERVICE_ID
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
BLOB_READ_WRITE_TOKEN
BLOG_BLOGGER_BLOG_ID
MAPS_API_KEY
```

After changing variables, redeploy. Vercel environment variables are only applied to new deployments; changing a value does not update an already-built deployment.

## Security note

Credentials pasted into chat or committed to a repository should be treated as exposed. Rotate the Neon database password, `ADMIN_SESSION_SECRET`, Google API key, Google OAuth client secret, and any other secret values that were shared. Never commit `.env`; this repository ignores it.
