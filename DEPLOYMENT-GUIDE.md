# Afrocentric Jewelry by LaGlitz — Deployment Guide

## Part 1: Blogger Setup (Product Database + Blog)

### Step 1: Create a Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create a new project (e.g., "LaGlitz Store")
3. Enable the Blogger API v3: APIs & Services → Library → search "Blogger API v3" → Enable

### Step 2: Create OAuth Credentials
1. APIs & Services → Credentials → "Create Credentials" → "OAuth client ID"
2. Application type: Web application
3. Name: "LaGlitz Blogger"
4. Authorized redirect URIs: add `https://developers.google.com/oauthplayground`
5. Copy the Client ID and Client Secret

### Step 3: Get Your Refresh Token (one-time)
1. Go to https://developers.google.com/oauthplayground/
2. Click gear icon → check "Use your own OAuth credentials"
3. Paste your Client ID and Client Secret
4. Select "Blogger API v3" → `https://www.googleapis.com/auth/blogger`
5. Click "Authorize APIs" → sign in with your Google account
6. Click "Exchange authorization code for tokens"
7. Copy the Refresh Token

### Step 4: Get Your Blog ID
1. Go to https://www.blogger.com/
2. Open your blog — the Blog ID is in the URL: `blogger.com/blog/posts/XXXXXXXXX`

### Step 5: Get Your API Key
1. APIs & Services → Credentials → "Create Credentials" → "API key"

### Step 6: Blog for Journal Posts (optional)
1. Create a second Blogger blog (or use the same one)
2. Get its Blog ID

---

## Part 2: Vercel Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Framework preset: Next.js (auto-detected)
4. Click Deploy

### Step 3: Set Environment Variables
Go to Vercel project → Settings → Environment Variables. Add each for Production, Preview, and Development:

#### Required
| Variable | Value |
|---|---|
| `DATABASE_URL` | Postgres connection string (see Step 4) |
| `ADMIN_SESSION_SECRET` | Run `openssl rand -hex 32` |
| `APP_BASE_URL` | `https://your-app.vercel.app` |

#### Blogger (Product Database)
| Variable | Value |
|---|---|
| `BLOGGER_BLOG_ID` | Your Blog ID |
| `BLOGGER_API_KEY` | Your API key |
| `GOOGLE_BLOGGER_CLIENT_ID` | OAuth Client ID |
| `GOOGLE_BLOGGER_CLIENT_SECRET` | OAuth Client Secret |
| `GOOGLE_BLOGGER_REFRESH_TOKEN` | Refresh token |

#### Blog
| Variable | Value |
|---|---|
| `BLOG_BLOGGER_BLOG_ID` | Blog Blog ID (can be same) |

#### Paystack
| Variable | Value |
|---|---|
| `PAYSTACK_SECRET_KEY` | From https://dashboard.paystack.com/ → Settings → API |
| `PAYSTACK_PUBLIC_KEY` | Same page |

#### EmailJS
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | From https://dashboard.emailjs.com/ |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | From EmailJS templates |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | From EmailJS → Account → API Keys |

#### Image Uploads
| Variable | Value |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob |

### Step 4: Set Up Postgres Database
1. Vercel → your project → Storage → Create Database → Postgres (Neon)
2. Copy the connection string
3. Set as `DATABASE_URL`
4. Run: `bun run db:push` then `bun prisma/seed.ts`

### Step 5: Redeploy
After setting all env vars: Vercel → Deployments → ⋯ → Redeploy

---

## Part 3: After Deployment

### First Login
1. Visit `https://your-app.vercel.app/admin`
2. Sign in with `laglitz@gmail.com` / `LAGLITZ`
3. Change password via Admins page

### Publishing Products
1. `/admin/products` → "Add product"
2. Fill name, price, category, description, images
3. Click "Publish" — dashboard creates Blogger post automatically
4. Product appears on storefront within 1 minute

### Managing the Blog
1. Blog posts are written in Blogger directly
2. They appear on `/blog` automatically
3. Uses separate `BLOG_BLOGGER_BLOG_ID`

### Checking Integration Status
1. `/admin/configuration` — shows green "Connected" for each service
2. `/admin/blogger` — shows Blogger connection status
3. All amber warnings disappear when all env vars are set

---

## Quick Checklist
- [ ] Google Cloud project created + Blogger API enabled
- [ ] OAuth Client ID + Secret created
- [ ] Refresh token obtained
- [ ] Blog ID copied
- [ ] API key created
- [ ] Vercel project deployed
- [ ] All environment variables set
- [ ] Postgres database created
- [ ] `db:push` + `seed.ts` run
- [ ] First login works
- [ ] Paystack test transaction completed
- [ ] Contact form email received
- [ ] First product published
