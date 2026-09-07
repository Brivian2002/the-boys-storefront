/**
 * Theme init script - server-safe.
 *
 * This module has NO "use client" so it can be imported and called from
 * the server-side root layout to inject an inline script that sets the
 * theme attributes before hydration (prevents flash of wrong theme).
 */

export const STORAGE_KEY = "laglitz-theme";

export function themeInitScript(): string {
  return `(function(){try{var raw=localStorage.getItem('${STORAGE_KEY}');var p='commerce',t='light';if(raw){var s=JSON.parse(raw);if(s.palette==='luxury')p='luxury';if(s.theme==='dark')t='dark';}var r=document.documentElement;r.setAttribute('data-palette',p);if(t==='dark')r.classList.add('dark');}catch(e){}})();`;
}
