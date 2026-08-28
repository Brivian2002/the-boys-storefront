import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Eye, FilePenLine, LockKeyhole, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import React, { FormEvent, useMemo, useState } from "react";
import { useLocation } from "wouter";

type DraftAttribute = { name: string; values: string };
type ProductDraft = {
  id?: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  collection: string;
  materials: string;
  attributes: DraftAttribute[];
  availability: "in-stock" | "out-of-stock" | "preorder" | "hidden";
  imageUrls: string;
  featured: boolean;
  newArrival: boolean;
  sale: boolean;
  publishNow: boolean;
};

const blankDraft = (): ProductDraft => ({
  title: "",
  description: "",
  price: "",
  currency: "NGN",
  category: "",
  collection: "",
  materials: "",
  attributes: [],
  availability: "in-stock",
  imageUrls: "",
  featured: false,
  newArrival: true,
  sale: false,
  publishNow: true,
});

function labelValue(labels: string[] = [], prefix: string) {
  return labels.find(label => label.startsWith(prefix))?.slice(prefix.length) ?? "";
}

function readable(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function attributesToDraft(labels: string[] = []): DraftAttribute[] {
  const attributes = new Map<string, string[]>();

  labels.filter(label => label.startsWith("attribute-")).forEach(label => {
    const pair = label.slice("attribute-".length);
    const separator = pair.indexOf("--");
    if (separator < 1 || separator >= pair.length - 2) return;

    const name = readable(pair.slice(0, separator));
    const value = readable(pair.slice(separator + 2));
    attributes.set(name, [...(attributes.get(name) ?? []), value]);
  });

  return Array.from(attributes.entries()).map(([name, values]) => ({
    name,
    values: Array.from(new Set(values)).join(", "),
  }));
}

function postToDraft(post: { id: string; title: string; content: string; labels: string[] }): ProductDraft {
  const images = Array.from(post.content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi))
    .map(match => match[1])
    .join("\n");
  const description = post.content
    .replace(/<img[^>]*>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: post.id,
    title: post.title,
    description,
    price: labelValue(post.labels, "price-"),
    currency: labelValue(post.labels, "currency-").toUpperCase() || "NGN",
    category: readable(labelValue(post.labels, "category-")),
    collection: readable(labelValue(post.labels, "collection-")),
    materials: post.labels
      .filter(label => label.startsWith("material-"))
      .map(label => readable(label.slice("material-".length)))
      .join(", "),
    attributes: attributesToDraft(post.labels),
    availability: (labelValue(post.labels, "availability-") || "in-stock") as ProductDraft["availability"],
    imageUrls: images,
    featured: post.labels.includes("featured"),
    newArrival: post.labels.includes("new-arrival"),
    sale: post.labels.includes("sale"),
    publishNow: true,
  };
}

export default function Atelier() {
  const status = trpc.operations.status.useQuery(undefined, { retry: false });

  if (status.isLoading) return <div className="ops-loading">Preparing protected workspace…</div>;
  if (!status.data?.authenticated) {
    return <OpsLogin configured={Boolean(status.data?.configured)} onSuccess={() => status.refetch()} />;
  }

  return <ProtectedOperations />;
}

function OpsLogin({ configured, onSuccess }: { configured: boolean; onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const login = trpc.operations.login.useMutation({ onSuccess });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    login.mutate({ password });
  };

  return (
    <main className="ops-login">
      <section>
        <div className="ops-lock"><LockKeyhole size={23} /></div>
        <p className="eyebrow">La Glitz / management</p>
        <h1>Operations<br /><i>atelier.</i></h1>
        <p>Enter the private dashboard password to manage the Blogger catalog and review payment activity.</p>
        {configured ? (
          <form onSubmit={submit}>
            <label>Password
              <input type="password" autoFocus autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} />
            </label>
            {login.error && <p className="form-error">{login.error.message}</p>}
            <button disabled={login.isPending}>{login.isPending ? "Checking access…" : "Enter private workspace"}</button>
          </form>
        ) : <p className="ops-setup">Set `ADMIN_DASHBOARD_PASSWORD` in Vercel to activate this workspace.</p>}
      </section>
    </main>
  );
}

function ProtectedOperations() {
  const [location, navigate] = useLocation();
  const view = new URLSearchParams(location.split("?")[1] ?? "").get("view") ?? "overview";
  const logout = trpc.operations.logout.useMutation({ onSuccess: () => navigate("/") });

  return (
    <DashboardLayout
      accessMode="password"
      identity={{ name: "La Glitz Atelier", email: "Private operations" }}
      onSignOut={() => logout.mutate()}
    >
      <div className="ops-dashboard">
        {view === "products" ? <ProductsPanel /> : view === "sales" ? <SalesPanel /> : <OverviewPanel />}
      </div>
    </DashboardLayout>
  );
}

function OverviewPanel() {
  const posts = trpc.operations.posts.useQuery(undefined, { retry: false });
  const sales = trpc.operations.sales.useQuery(undefined, { retry: false });
  const totals = sales.data?.totals ?? {};

  return (
    <>
      <header className="ops-page-head">
        <p className="eyebrow">Private operations</p>
        <h1>Good morning,<br /><i>atelier.</i></h1>
        <p>Manage Blogger-backed products and review Paystack payment activity in one protected workspace.</p>
      </header>
      <section className="ops-metrics">
        <article><span>Managed Blogger posts</span><b>{posts.data?.length ?? "—"}</b><small>Product posts are the catalog source of truth</small></article>
        <article><span>Successful payments</span><b>{sales.data?.sales.length ?? "—"}</b><small>Latest 50 successful Paystack transactions</small></article>
        <article><span>Collected</span><b>{Object.entries(totals).map(([currency, amount]) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100)).join(" · ") || "—"}</b><small>Payment provider records, in real time</small></article>
      </section>
      <section className="ops-note">
        <FilePenLine size={20} />
        <div>
          <b>How catalog management works</b>
          <p>The dashboard writes each product’s name, price, category, material, availability, images, and optional custom properties into Blogger. The store refreshes from Blogger shortly after publication.</p>
        </div>
      </section>
    </>
  );
}

function ProductsPanel() {
  const posts = trpc.operations.posts.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const [draft, setDraft] = useState<ProductDraft>(blankDraft);
  const create = trpc.operations.createPost.useMutation({ onSuccess: () => { setDraft(blankDraft()); utils.operations.posts.invalidate(); } });
  const update = trpc.operations.updatePost.useMutation({ onSuccess: () => { setDraft(blankDraft()); utils.operations.posts.invalidate(); } });
  const remove = trpc.operations.deletePost.useMutation({ onSuccess: () => utils.operations.posts.invalidate() });
  const busy = create.isPending || update.isPending;

  const save = (event: FormEvent) => {
    event.preventDefault();
    const attributes = draft.attributes
      .map(attribute => ({
        name: attribute.name.trim(),
        values: attribute.values.split(",").map(value => value.trim()).filter(Boolean),
      }))
      .filter(attribute => attribute.name && attribute.values.length);
    const input = {
      title: draft.title,
      description: draft.description,
      price: Number(draft.price),
      currency: draft.currency.toUpperCase(),
      category: draft.category,
      collection: draft.collection,
      materials: draft.materials.split(",").map(value => value.trim()).filter(Boolean),
      attributes,
      availability: draft.availability,
      imageUrls: draft.imageUrls.split("\n").map(value => value.trim()).filter(Boolean),
      featured: draft.featured,
      newArrival: draft.newArrival,
      sale: draft.sale,
      publishNow: draft.publishNow,
    };

    if (draft.id) update.mutate({ ...input, id: draft.id });
    else create.mutate(input);
  };

  const updateAttribute = (index: number, updateValue: Partial<DraftAttribute>) => {
    setDraft({
      ...draft,
      attributes: draft.attributes.map((attribute, attributeIndex) => attributeIndex === index ? { ...attribute, ...updateValue } : attribute),
    });
  };

  return (
    <>
      <header className="ops-page-head compact">
        <p className="eyebrow">Blogger product management</p>
        <h1>{draft.id ? <>Edit <i>piece.</i></> : <>New <i>piece.</i></>}</h1>
        <p>Save a draft or publish directly. The dashboard writes structured product fields and custom properties that power the storefront.</p>
      </header>
      <div className="ops-product-layout">
        <form className="ops-product-form" onSubmit={save}>
          <div className="ops-fields">
            <label>Piece name<input required value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label>
            <label>Price<input required type="number" min="0.01" step="0.01" value={draft.price} onChange={event => setDraft({ ...draft, price: event.target.value })} /></label>
            <label>Currency<select value={draft.currency} onChange={event => setDraft({ ...draft, currency: event.target.value })}><option value="NGN">NGN</option><option value="GHS">GHS</option><option value="USD">USD</option></select></label>
            <label>Category<input placeholder="Rings, earrings, necklaces…" value={draft.category} onChange={event => setDraft({ ...draft, category: event.target.value })} /></label>
            <label>Collection<input placeholder="Signature, Solstice…" value={draft.collection} onChange={event => setDraft({ ...draft, collection: event.target.value })} /></label>
            <label>Availability<select value={draft.availability} onChange={event => setDraft({ ...draft, availability: event.target.value as ProductDraft["availability"] })}><option value="in-stock">In stock</option><option value="preorder">Preorder</option><option value="out-of-stock">Out of stock</option><option value="hidden">Hidden</option></select></label>
            <label className="span-two">Materials<input placeholder="18k gold, pearl, silver" value={draft.materials} onChange={event => setDraft({ ...draft, materials: event.target.value })} /></label>
            <section className="ops-attribute-editor span-two">
              <div className="ops-attribute-heading">
                <div><b>Custom product properties</b><p>Add any detail without a fixed field, such as ring size, gemstone, clasp, length, or occasion.</p></div>
                <button type="button" onClick={() => setDraft({ ...draft, attributes: [...draft.attributes, { name: "", values: "" }] })}><Plus size={15} /> Add property</button>
              </div>
              {draft.attributes.length ? (
                <div className="ops-attribute-list">
                  {draft.attributes.map((attribute, index) => (
                    <div className="ops-attribute-row" key={`${index}-${attribute.name}`}>
                      <label>Property name<input placeholder="e.g. Ring size" value={attribute.name} onChange={event => updateAttribute(index, { name: event.target.value })} /></label>
                      <label>Value or values<input placeholder="e.g. 6, 7, 8" value={attribute.values} onChange={event => updateAttribute(index, { values: event.target.value })} /></label>
                      <button type="button" aria-label={`Remove custom property ${index + 1}`} onClick={() => setDraft({ ...draft, attributes: draft.attributes.filter((_, attributeIndex) => attributeIndex !== index) })}><X size={16} /></button>
                    </div>
                  ))}
                </div>
              ) : <p className="ops-attribute-empty">No custom properties yet. Add one whenever a piece needs a new descriptive field.</p>}
            </section>
            <label className="span-two">Description<textarea required value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
            <label className="span-two">Image URLs<textarea placeholder="One HTTPS image URL per line" value={draft.imageUrls} onChange={event => setDraft({ ...draft, imageUrls: event.target.value })} /></label>
          </div>
          <div className="ops-switches">
            <label><input type="checkbox" checked={draft.featured} onChange={event => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label>
            <label><input type="checkbox" checked={draft.newArrival} onChange={event => setDraft({ ...draft, newArrival: event.target.checked })} /> New arrival</label>
            <label><input type="checkbox" checked={draft.sale} onChange={event => setDraft({ ...draft, sale: event.target.checked })} /> Sale</label>
            <label><input type="checkbox" checked={draft.publishNow} onChange={event => setDraft({ ...draft, publishNow: event.target.checked })} /> Publish now</label>
          </div>
          {(create.error || update.error) && <p className="form-error">{create.error?.message ?? update.error?.message}</p>}
          <div className="ops-form-actions">
            <button type="submit" disabled={busy}><Save size={16} /> {busy ? "Saving…" : draft.id ? "Update piece" : "Save piece"}</button>
            {draft.id && <button type="button" className="button-muted" onClick={() => setDraft(blankDraft())}><RotateCcw size={16} /> New piece</button>}
          </div>
        </form>
        <aside className="ops-post-list">
          <div className="ops-list-head"><b>Managed Blogger posts</b><span>{posts.data?.length ?? "—"}</span></div>
          {posts.isLoading ? <p>Loading posts…</p> : posts.error ? <p className="form-error">{posts.error.message}</p> : posts.data?.length ? posts.data.map(post => (
            <article key={post.id}>
              <div><b>{post.title}</b><span>{post.labels.includes("product") ? "Product post" : "Standard post"}</span></div>
              <div>
                <button aria-label={`Edit ${post.title}`} onClick={() => setDraft(postToDraft(post))}><Eye size={15} /></button>
                <button aria-label={`Delete ${post.title}`} className="delete-button" onClick={() => { if (window.confirm(`Delete “${post.title}” from Blogger?`)) remove.mutate({ id: post.id }); }}><Trash2 size={15} /></button>
              </div>
            </article>
          )) : <p>No posts have been returned from Blogger.</p>}
        </aside>
      </div>
    </>
  );
}

function SalesPanel() {
  const sales = trpc.operations.sales.useQuery(undefined, { retry: false });
  const formatted = useMemo(() => (amount: number, currency: string) => new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "NGN" }).format(amount / 100), []);

  return (
    <>
      <header className="ops-page-head compact"><p className="eyebrow">Paystack sales</p><h1>Payment <i>activity.</i></h1><p>Successful transactions are retrieved privately from your Paystack integration. No payment data is visible in the storefront.</p></header>
      {sales.isLoading ? <p className="ops-loading-inline">Retrieving secure records…</p> : sales.error ? <section className="ops-error"><b>Sales are not available yet.</b><p>{sales.error.message}</p></section> : <section className="sales-table"><div className="sales-row sales-heading"><span>Reference</span><span>Customer</span><span>Channel</span><span>Amount</span><span>Paid</span></div>{sales.data?.sales.length ? sales.data.sales.map(sale => <div className="sales-row" key={sale.reference}><span>{sale.reference}</span><span>{sale.customerEmail ?? "—"}</span><span>{sale.channel ?? "—"}</span><b>{formatted(sale.amount, sale.currency)}</b><span>{sale.paidAt ? new Date(sale.paidAt).toLocaleString() : "—"}</span></div>) : <p className="ops-empty">No successful Paystack transactions have been returned.</p>}</section>}
    </>
  );
}
