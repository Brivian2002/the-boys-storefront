import React from "react";

type LogoProps = { footer?: boolean };

/** A custom line-art facet mark inspired by a jewel setting and the La Glitz monogram. */
export function Logo({ footer = false }: LogoProps) {
  return <span className={`la-glitz-logo${footer ? " footer-logo" : ""}`} aria-label="La Glitz">
    <svg className="logo-facet" viewBox="0 0 42 42" aria-hidden="true" fill="none">
      <path d="M21 3.5 35.5 13.2 30.1 32.7 11.9 32.7 6.5 13.2 21 3.5Z" />
      <path d="m6.5 13.2 14.5 8.5 14.5-8.5M21 21.7v11M11.9 32.7 21 21.7l9.1 11M12.4 9.2 21 21.7l8.6-12.5" />
      <path className="logo-initial" d="M17.2 15.1v10.2h7.4" />
    </svg>
    <span className="logo-wordmark"><b>LA</b> GLITZ</span>
  </span>;
}
