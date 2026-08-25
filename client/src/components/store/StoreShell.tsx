import { useCart } from "@/components/store/CartProvider";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "wouter";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "New arrivals", href: "/shop?badge=new" },
  { label: "Collections", href: "/shop" },
  { label: "Our story", href: "/#story" },
];

export function StoreShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f5ef] text-[#171513]">
      <header className="store-header">
        <div className="announcement">Complimentary signature wrapping on every La Glitz order</div>
        <div className="store-nav">
          <button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <Link href="/" className="brand-mark" aria-label="La Glitz home"><span>LA</span> GLITZ</Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navLinks.map(link => <Link key={link.label} href={link.href}>{link.label}</Link>)}
          </nav>
          <div className="nav-actions">
            <Link className="icon-button desktop-search" href="/shop" aria-label="Search jewelry"><Search size={18} /></Link>
            <Link className="bag-link" href="/cart" aria-label={`Shopping bag with ${itemCount} items`}><ShoppingBag size={19} /><span>Bag</span><b>{itemCount}</b></Link>
          </div>
        </div>
      </header>

      <div className={`mobile-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="drawer-panel">
          <button className="icon-button drawer-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={21} /></button>
          <Link href="/" className="brand-mark" onClick={() => setOpen(false)}><span>LA</span> GLITZ</Link>
          <nav aria-label="Mobile navigation">
            {navLinks.map(link => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
            <Link href="/cart" onClick={() => setOpen(false)}>Bag · {itemCount}</Link>
          </nav>
        </div>
        <button className="drawer-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />
      </div>
      {children}
      <footer className="store-footer">
        <div className="footer-brand"><p className="eyebrow">LA GLITZ</p><p>Pieces to keep close.</p></div>
        <div className="footer-links"><Link href="/shop">Shop</Link><a href="#story">About</a><a href="mailto:hello@laglitz.com">Contact</a></div>
        <p className="footer-note">© {new Date().getFullYear()} La Glitz. Crafted with quiet intention.</p>
      </footer>
    </div>
  );
}
