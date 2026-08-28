import { ArrowDownRight, ArrowRight, Check, Circle, Gem, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { StoreShell } from "@/components/store/StoreShell";

export default function Home() {
  return (
    <StoreShell>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow reveal-text">La Glitz / direct jewelry store</p>
            <h1>Find the piece<br /><i>that feels like you.</i></h1>
            <p className="hero-lede">Browse fine jewelry by category, material, collection, and the details that matter to you. Add a piece to your bag when you are ready.</p>
            <div className="hero-actions"><Link className="primary-link" href="/shop">Shop all pieces <ArrowRight size={17} /></Link><Link className="text-link" href="/shop?badge=new">See new arrivals</Link></div>
          </div>
          <div className="hero-art" aria-label="An abstract golden jewelry composition">
            <div className="hero-sun" />
            <div className="hero-ring hero-ring-one"><Gem size={54} strokeWidth={0.8} /></div>
            <div className="hero-ring hero-ring-two"><Sparkles size={38} strokeWidth={0.8} /></div>
            <div className="hero-orbit" /><div className="hero-orbit inner" />
            <p className="hero-caption">SHOP DIRECTLY<br />DESIGNED TO ENDURE</p>
          </div>
          <div className="hero-scroll">Browse jewelry <ArrowDownRight size={17} /></div>
        </section>

        <section className="marketplace-discovery">
          <div className="marketplace-heading"><p className="eyebrow">Shop by department</p><h2>Start with what<br /><i>you want to wear.</i></h2><Link href="/shop" className="inline-link">Browse the full store <ArrowRight size={16} /></Link></div>
          <div className="marketplace-category-grid">
            <Link href="/shop?category=Rings" className="market-category-card"><Gem size={24} /><span>Rings</span><small>Settings and statements</small><ArrowRight size={15} /></Link>
            <Link href="/shop?category=Earrings" className="market-category-card"><Sparkles size={24} /><span>Earrings</span><small>Everyday to occasion</small><ArrowRight size={15} /></Link>
            <Link href="/shop?category=Necklaces" className="market-category-card"><Circle size={24} /><span>Necklaces</span><small>Close to the heart</small><ArrowRight size={15} /></Link>
            <Link href="/shop?category=Bracelets" className="market-category-card"><Heart size={24} /><span>Bracelets</span><small>Pieces for the wrist</small><ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="intro-section" id="store">
          <div><p className="eyebrow">Built for clear choices</p><h2>Everything you need<br />to choose <i>with confidence.</i></h2></div>
          <div className="intro-body"><p>Each product page gives you its price, category, materials, availability, and product-specific details before you add it to your bag. There are no blog posts to search through—only the jewelry you can shop.</p><Link className="inline-link" href="/shop">Start shopping <ArrowRight size={16} /></Link></div>
        </section>

        <section className="collection-callout">
          <div className="callout-image"><div className="callout-frame" /><p>CHOOSE WITH CLARITY<br />CHECK OUT WHEN READY</p></div>
          <div className="callout-copy"><p className="eyebrow">Ready to shop</p><h2>A direct path from<br /><i>discovery to bag.</i></h2><p>Use search and filters to narrow the store, review complete piece details, and check out securely through Paystack.</p><Link href="/shop" className="primary-link">Shop the store <ArrowRight size={17} /></Link></div>
        </section>

        <section className="promise-strip"><p>Clear product details</p><span>·</span><p>Secure hosted checkout</p><span>·</span><p>Signature wrapping</p></section>
      </main>
    </StoreShell>
  );
}
