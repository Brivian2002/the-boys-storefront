# Groq assistant setup

The storefront now includes a server-side **Ask LaGlitz** assistant. Visitors can ask about the brand story, jewelry, delivery, payments, policies, and the relationship between the public brand and registered business.

The Groq key is used only by `/api/assistant` on the server. It is never sent to the browser.

## 1. Create a Groq API key

1. Open [Groq Console](https://console.groq.com/).
2. Sign in or create an account.
3. Open **API Keys**.
4. Create a key and copy it once. Treat it like a password.

## 2. Add it locally

In the project root, add this to `.env` (do not commit `.env`):

```env
GROQ_API_KEY=your_groq_key_here
# Optional: change the model without changing code
GROQ_MODEL=llama-3.3-70b-versatile
```

Restart the development server after changing environment variables.

## 3. Add it to Vercel

1. Open the **la-glitz** project in Vercel.
2. Go to **Settings → Environment Variables**.
3. Add:
   - Name: `GROQ_API_KEY`
   - Value: your Groq key
   - Environments: **Production**, and **Preview** if you want to test previews
4. Optionally add `GROQ_MODEL` with value `llama-3.3-70b-versatile`.
5. Save and redeploy the latest production deployment.

The admin configuration screen will show whether **Groq AI assistant** is configured, but it will never display the key.

## 4. Confirm it works

- Visit the storefront.
- Click **Ask LaGlitz** in the lower-right corner.
- Ask: `Who is Homeland Return Jewelry?`
- If the key is missing, the assistant will politely say it is being prepared; the rest of the storefront remains usable.

## Security notes

- Never put `GROQ_API_KEY` in a `NEXT_PUBLIC_*` variable.
- Never paste the key into chat, source code, GitHub, screenshots, or the browser console.
- If the key is exposed, revoke it in Groq Console and create a replacement.
- The assistant is informational only; visitors should contact the business for final product availability, order, payment, or legal decisions.
