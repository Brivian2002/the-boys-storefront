import { StoreShell } from "@/components/store/StoreShell";
import { ArrowRight, Mail, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import React from "react";
import { Link, useRoute } from "wouter";

const deliverySections = [
  ["Preparing your piece", "After payment is confirmed, each order is carefully checked, wrapped, and prepared for dispatch. We will contact you if an item needs additional time or a delivery detail requires clarification."],
  ["Delivery updates", "When your order is dispatched, we will share the courier and tracking details through your designated customer-support channel. Delivery timing depends on destination, courier service, and the availability recorded for the published piece."],
  ["A considered arrival", "Please ensure that your name, phone number, city, and delivery address are accurate at checkout. Changes are best requested before dispatch so every piece reaches you with care."],
];

const policySections = [
  ["Orders and payment", "An order is accepted after Selar confirms successful payment. Product details, price, and availability are sourced from the published collection, while Selar securely handles the hosted purchase step."],
  ["Availability", "Every piece is released from the La Glitz collection with its current availability. If a product becomes unavailable before payment confirmation, it cannot be completed through checkout."],
  ["Returns and care", "Because jewelry requires considered handling, return eligibility and care arrangements should be confirmed with La Glitz support before an item is sent back. Keep any order reference and original presentation materials available when you contact us."],
  ["Privacy", "Checkout contact and delivery details are used only to prepare payment and delivery. Card and payment credentials are entered on Selar’s secure hosted checkout, not on this storefront."],
];

function PageHeader({ eyebrow, title, lead }: { eyebrow: string; title: React.ReactNode; lead: string }) {
  return <section className="info-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{lead}</p></section>;
}

function LongFormPage({ kind }: { kind: "delivery" | "policies" }) {
  const delivery = kind === "delivery";
  const sections = delivery ? deliverySections : policySections;
  return <StoreShell><main className="info-page"><PageHeader eyebrow={delivery ? "Delivery information" : "Store policies"} title={delivery ? <>Every detail,<br /><i>considered.</i></> : <>A clear and<br /><i>considered promise.</i></>} lead={delivery ? "From preparation to arrival, our aim is a delivery experience worthy of the piece inside." : "These customer-facing store policies explain how orders, payments, delivery details, and collection availability are handled."} /><section className="info-list">{sections.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><div><h2>{title}</h2><p>{text}</p></div></article>)}</section><aside className="info-callout"><PackageCheck size={23} /><div><p className="eyebrow">Need a hand?</p><p>For a question about delivery or an existing order, keep your Selar order confirmation close when you contact La Glitz.</p></div><Link href="/contact"><ArrowRight size={19} /></Link></aside></main></StoreShell>;
}

function ContactPage() {
  return <StoreShell><main className="info-page contact-page"><PageHeader eyebrow="Contact La Glitz" title={<>A conversation<br /><i>worth having.</i></>} lead="For assistance with a piece, a delivery question, or a collection enquiry, we are here to help with thoughtful direction." /><section className="contact-grid"><article><Mail size={22} /><p className="eyebrow">Email</p><h2>hello@laglitz.com</h2><p>For product, order, or delivery questions, please include your Selar order confirmation for completed orders.</p><a className="inline-link" href="mailto:hello@laglitz.com">Send an email <ArrowRight size={16} /></a></article><article><MapPin size={22} /><p className="eyebrow">Delivery support</p><h2>Details, thoughtfully handled.</h2><p>Provide your name, the Selar order reference, and the delivery city so the team can guide you accurately.</p><Link className="inline-link" href="/delivery">Read delivery information <ArrowRight size={16} /></Link></article><article><ShieldCheck size={22} /><p className="eyebrow">Store care</p><h2>Clear from first look to final payment.</h2><p>For policies around payment, availability, returns, and privacy, visit our dedicated store guide.</p><Link className="inline-link" href="/policies">Read store policies <ArrowRight size={16} /></Link></article></section></main></StoreShell>;
}

export default function InformationPages() {
  const [isDelivery] = useRoute("/delivery");
  const [isPolicies] = useRoute("/policies");
  if (isDelivery) return <LongFormPage kind="delivery" />;
  if (isPolicies) return <LongFormPage kind="policies" />;
  return <ContactPage />;
}
