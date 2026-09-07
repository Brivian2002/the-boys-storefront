/**
 * Env validation + configuration status.
 *
 * Server-safe: importing this module does NOT execute any code that touches
 * process.env at import time beyond reading values into typed accessors.
 * Call `env()` inside the function that needs a value so the error surfaces
 * at the call site instead of at module load.
 */

export interface EnvShape {
  DATABASE_URL: string;
  NODE_ENV: "development" | "production" | "test";
  ADMIN_SESSION_SECRET: string;

  // Blogger (product CMS)
  BLOGGER_BLOG_ID?: string;
  BLOGGER_API_KEY?: string;
  GOOGLE_BLOGGER_CLIENT_ID?: string;
  GOOGLE_BLOGGER_CLIENT_SECRET?: string;
  GOOGLE_BLOGGER_REFRESH_TOKEN?: string;

  // Blogger (editorial blog - may be a different blog)
  BLOG_BLOGGER_BLOG_ID?: string;

  // Paystack
  PAYSTACK_SECRET_KEY?: string;
  PAYSTACK_PUBLIC_KEY?: string;

  // EmailJS (contact form - client-side)
  NEXT_PUBLIC_EMAILJS_SERVICE_ID?: string;
  NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?: string;
  NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?: string;
  CONTACT_INBOX_EMAIL?: string;

  // Vercel Blob (image uploads)
  BLOB_READ_WRITE_TOKEN?: string;

  // App + maps + analytics
  APP_BASE_URL?: string;
  MAPS_API_KEY?: string;
  ANALYTICS_ENDPOINT?: string;
  ANALYTICS_WEBSITE_ID?: string;
}

export function env(): EnvShape {
  const e = process.env as unknown as EnvShape;
  if (!e.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env");
  }
  if (!e.ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env");
  }
  return e;
}

export interface ConfigStatus {
  blogger: boolean;
  bloggerRead: boolean;
  bloggerWrite: boolean;
  paystack: boolean;
  emailjs: boolean;
  blob: boolean;
  appBaseUrl: boolean;
  maps: boolean;
  analytics: boolean;
  blog: boolean;
  database: boolean;
  sessionSecret: boolean;
}

/**
 * Returns a status map for every external integration. Used by the admin
 * "Configuration" tab to render a health dashboard.
 */
export function configStatus(): ConfigStatus {
  const e = process.env;
  const bloggerRead = Boolean(
    e.BLOGGER_BLOG_ID && (e.BLOGGER_API_KEY || e.GOOGLE_BLOGGER_REFRESH_TOKEN)
  );
  const bloggerWrite = Boolean(
    e.GOOGLE_BLOGGER_CLIENT_ID &&
      e.GOOGLE_BLOGGER_CLIENT_SECRET &&
      e.GOOGLE_BLOGGER_REFRESH_TOKEN
  );
  return {
    blogger: Boolean(e.BLOGGER_BLOG_ID),
    bloggerRead,
    bloggerWrite,
    paystack: Boolean(e.PAYSTACK_SECRET_KEY && e.PAYSTACK_PUBLIC_KEY),
    emailjs: Boolean(
      e.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
        e.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
        e.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    ),
    blob: Boolean(e.BLOB_READ_WRITE_TOKEN),
    appBaseUrl: Boolean(e.APP_BASE_URL),
    maps: Boolean(e.MAPS_API_KEY),
    analytics: Boolean(e.ANALYTICS_ENDPOINT && e.ANALYTICS_WEBSITE_ID),
    blog: Boolean(e.BLOG_BLOGGER_BLOG_ID),
    database: Boolean(e.DATABASE_URL),
    sessionSecret: Boolean(e.ADMIN_SESSION_SECRET),
  };
}
