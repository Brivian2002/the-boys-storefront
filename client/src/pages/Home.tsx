import { StoreShell } from "@/components/store/StoreShell";
import { ArrowDownRight, ArrowRight, Circle, Gem, Heart, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <StoreShell>
      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow reveal-text">The house of La Glitz</p>
            <h1>Where elegance<br /><i>meets brilliance.</i></h1>
            <p className="hero-lede">Considered jewelry for the quietly radiant. Made to gather meaning with every wear.</p>
            <div className="hero-actions"><Link className="primary-link" href="/shop">Explore the collection <ArrowRight size={17} /></Link><a className="text-link" href="#story">Discover our story</a></div>
          </div>
          <div className="hero-art" aria-label="An abstract golden jewelry composition">
            <div className="hero-sun" />
            <div className="hero-ring hero-ring-one"><Gem size={54} strokeWidth={0.8} /></div>
            <div className="hero-ring hero-ring-two"><Sparkles size={38} strokeWidth={0.8} /></div>
            <div className="hero-orbit" /><div className="hero-orbit inner" />
            <p className="hero-caption">EST. WITH INTENTION<br />DESIGNED TO ENDURE</p>
          </div>
          <div className="hero-scroll">Scroll to discover <ArrowDownRight size={17} /></div>
        </section>

        <section className="marketplace-discovery">
          <div className="marketplace-heading"><p className="eyebrow">Browse the atelier</p><h2>Discover by <i>jewelry kind.</i></h2><Link href="/shop" className="inline-link">View all pieces <ArrowRight size={16} /></Link></div>
          <div className="marketplace-category-grid">
            <Link href="/shop?category=Rings" className="market-category-card"><Gem size={24} /><span>Rings</span><small>Signature settings</small><ArrowRight size={15} /></Link>
            <Link href="/shop?category=Earrings" className="market-category-card"><Sparkles size={24} /><span>Earrings</span><small>Light-catching details</small><ArrowRight size={15} /></Link>
            <Link href="/shop?category=Necklaces" className="market-category-card"><Circle size={24} /><span>Necklaces</span><small>Close to the heart</small><ArrowRight size={15} /></Link>
            <Link href="/shop?category=Bracelets" className="market-category-card"><Heart size={24} /><span>Bracelets</span><small>Everyday ritual</small><ArrowRight size={15} /></Link>
          </div>
        </section>

        <section className="intro-section" id="story">
          <div><p className="eyebrow">A study in radiance</p><h2>Jewelry with a <i>lasting point of view.</i></h2></div>
          <div className="intro-body"><p>La Glitz is an ode to the objects that outlive a moment. We believe in exquisite restraint, tactile details, and pieces that become part of the wearer’s story.</p><Link className="inline-link" href="/shop">Meet the collection <ArrowRight size={16} /></Link></div>
        </section>

        <section className="collection-callout">
          <div className="callout-image"><div className="callout-frame" /><p>FOR THE MOMENTS<br />THAT BECOME MEMORIES</p></div>
          <div className="callout-copy"><p className="eyebrow">The collection</p><h2>Something beautiful is <i>on its way.</i></h2><p>Our first pieces will appear here as they are released. Until then, explore the house and return when the collection opens.</p><Link href="/shop" className="primary-link">Visit the atelier <ArrowRight size={17} /></Link></div>
        </section>

        <section className="promise-strip"><p>Thoughtful materials</p><span>·</span><p>Enduring design</p><span>·</span><p>Signature wrapping</p></section>
      </main>
    </StoreShell>
  );
}
