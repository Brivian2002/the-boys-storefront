# EmailJS template setup

The storefront uses the same EmailJS service and template for contact enquiries and paid-order notifications.

## Dashboard template settings

Use these settings in the EmailJS template editor:

- **To Email:** `laglitz@gmail.com`
- **Subject:** `Contact Us: {{title}}`
- **From Name:** `{{name}}`
- **From Email:** **Use Default Email Address**
- **Reply To:** `{{email}}`

The HTML template can use these variables:

```text
{{name}}
{{email}}
{{phone}}
{{title}}
{{subject}}
{{message}}
{{reply_to}}
{{order_reference}}
{{order_total}}
{{order_items}}
{{delivery_region}}
{{delivery_address}}
```

Your supplied HTML is compatible with these fields:

- `{{name}}` — customer or recipient name
- `{{email}}` — customer email; the reply button can use `mailto:{{email}}`
- `{{phone}}` — customer/recipient phone
- `{{title}}` — contact subject or `Paid order LGL-...`
- `{{message}}` — enquiry text or full paid-order summary

## Important

1. Keep the EmailJS **To Email** set to `laglitz@gmail.com` in the EmailJS dashboard.
2. Keep **From Email** set to **Use Default Email Address**. Do not put a visitor's email in the From Email field.
3. Set **Reply To** to `{{email}}`, so clicking Reply goes to the customer.
4. The app sends `title` and `email` for both contact and paid-order messages. This fixes templates that previously received `subject` or `from_email` only.
5. The app still needs these Vercel environment variables:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key
```

`EMAILJS_PRIVATE_KEY` is required only by the server-side Paystack order notification and is sent to EmailJS as `accessToken`. It is never exposed to the browser or used by the public contact form.

In Vercel, add it under **Project Settings → Environment Variables** for **Production**, then redeploy. Get the value from EmailJS under **Account → General → API keys → Private Key**. If EmailJS strict mode is enabled but this variable is missing, the admin resend history will show a 403 error saying that no Private Key was provided.

Never commit the actual values to GitHub or paste them into chat.
