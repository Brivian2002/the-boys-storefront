import type { Metadata } from "next";
import { PublicShell } from "@/components/public/shell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "FAQ · The Boyz Store",
  description: "Answers about shopping, delivery, payments, returns, and support at The Boyz Store.",
};

const FAQS = [
  ["How do I place an order?", "Browse the marketplace, open a listing, choose any available options, add it to your bag, and continue to checkout. Your order is confirmed after payment and fulfilment details are reviewed."],
  ["What payment options are available?", "Checkout is secured by Paystack. Available payment methods are shown at checkout based on your location and the options enabled for the order."],
  ["How does delivery work?", "Delivery timing and cost are confirmed for each order based on the destination, product, and fulfilment partner. Check the delivery page or contact the team before ordering if you need help."],
  ["Can I return an item?", "Start with our Returns & Policies page and contact the team as soon as possible. Return eligibility depends on the product type, condition, and the timeframe stated for the order."],
  ["Can I ask a question before buying?", "Yes. Use the Boyz Store guide in the bottom-right corner, the contact page, or WhatsApp once the owner has added the live business number."],
  ["Can I sell products or services here?", "The marketplace is designed to grow across products, services, and useful everyday finds. Contact the team to discuss listings and marketplace requirements."],
];

export default function FAQPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <p className="text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">Help centre</p>
        <h1 className="mt-3 font-serif text-5xl font-semibold tracking-tight">Frequently asked questions</h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">Straight answers for shopping on The Boyz Store. If you cannot find what you need, contact the team before placing your order.</p>
        <Accordion type="single" collapsible className="mt-10 w-full">
          {FAQS.map(([question, answer], index) => (
            <AccordionItem key={question} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-base">{question}</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">{answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicShell>
  );
}
