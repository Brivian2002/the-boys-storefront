import type { NextPageContext } from "next";

type ErrorProps = { statusCode?: number };

export default function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ letterSpacing: "0.18em", textTransform: "uppercase", fontSize: 12 }}>LA GLITZ</p>
        <h1>{statusCode ?? ""} — Something went wrong</h1>
        <p>Please return to the storefront and try again.</p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => ({
  statusCode: res?.statusCode ?? err?.statusCode ?? 500,
});
