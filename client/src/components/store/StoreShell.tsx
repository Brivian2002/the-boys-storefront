import { useCart } from "@/components/store/CartProvider";
import { Logo } from "@/components/store/Logo";
import { useTheme } from "@/contexts/ThemeContext";
import { Menu, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import React, { useState } from "react";
import { FormEvent } from "react";
import { Link, useLocation } from "wouter";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "New arrivals", href: "/shop?badge=new" },
  { label: "Collections", href: "/shop" },
  { label: "Our story", href: "/#story" },
];

export function StoreShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [, navigate] = useLocation();
  const { itemCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/shop${searchTerm.trim() ? `?search=${encodeURIComponent(searchTerm.trim())}` : ""}`);
  };
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ef] text-[#171513]">
      <header className="store-header">
        <div className="announcement"><span>Complimentary signature wrapping on every La Glitz order</span><span className="announcement-detail">Discover pieces published directly from the atelier</span></div>
        <div className="store-nav">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <Link href="/" className="brand-mark" aria-label="La Glitz home"><Logo /></Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navLinks.map(link => <Link key={link.label} href={link.href}>{link.label}</Link>)}
          </nav>
          <div className="nav-actions">
            <Link className="icon-button desktop-search" href="/shop" aria-label="Search jewelry"><Search size={18} /></Link>
            <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button>
            <Link className="bag-link" href="/cart" aria-label={`Shopping bag with ${itemCount} items`}><ShoppingBag size={19} /><span>Bag</span><b>{itemCount}</b></Link>
          </div>
        </div>
        <div className="discovery-bar">
          <div className="discovery-categories"><span className="desktop-category-label">Explore</span><Link href="/shop?category=Rings">Rings</Link><Link href="/shop?category=Earrings">Earrings</Link><Link href="/shop?category=Necklaces">Necklaces</Link><Link href="/shop?category=Bracelets">Bracelets</Link></div>
          <form className="market-search" onSubmit={submitSearch}><Search size={16} /><input aria-label="Search La Glitz pieces" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search pieces, materials, collections" /><button type="submit">Search</button></form>
          <Link className="discovery-cta" href="/shop?badge=new">New arrivals</Link>
        </div>
      </header>

      <div className={`mobile-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="drawer-panel">
          <button className="icon-button drawer-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={21} /></button>
          <Link href="/" className="brand-mark" onClick={() => setOpen(false)}><Logo /></Link>
          <nav aria-label="Mobile navigation">
            {navLinks.map(link => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
            <Link href="/cart" onClick={() => setOpen(false)}>Bag · {itemCount}</Link>
          </nav>
          <button className="drawer-theme" onClick={() => { toggleTheme?.(); setOpen(false); }}><span>{theme === "light" ? "Moonlit mode" : "Daylight mode"}</span>{theme === "light" ? <Moon size={17} /> : <Sun size={17} />}</button>
        </div>
        <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />
      </div>
      {children}
      <footer className="store-footer">
        <div className="footer-brand"><Logo footer /><p>Pieces to keep close.</p></div>
        <div className="footer-links"><Link href="/shop">Shop</Link><Link href="/delivery">Delivery</Link><Link href="/policies">Policies</Link><Link href="/contact">Contact</Link></div>
        <p className="footer-note">© {new Date().getFullYear()} La Glitz. Crafted with quiet intention.</p>
      </footer>
    </div>
  );
}
