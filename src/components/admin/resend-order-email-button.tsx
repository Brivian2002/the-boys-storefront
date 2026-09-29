"use client";

import * as React from "react";
import emailjs from "@emailjs/browser";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

type Order = {
  reference: string;
  customerEmail: string;
  deliveryName: string;
  deliveryPhone: string;
  deliveryRegion: string;
  deliveryAddress: string;
  amountMinor: number;
  currency: string;
  notes: string | null;
  items: { name: string; quantity: number; unitPrice: number }[];
};

export function ResendOrderEmailButton({ order }: { order: Order }) {
  const [loading, setLoading] = React.useState(false);

  const resend = async () => {
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      toast.error("EmailJS is not configured");
      return;
    }
    setLoading(true);
    const items = order.items.map((item) => `${item.name} x ${item.quantity} — ${order.currency} ${item.unitPrice.toFixed(2)}`).join("\n");
    const amount = `${order.currency} ${(order.amountMinor / 100).toFixed(2)}`;
    const message = [
      `A customer payment has been verified for order ${order.reference}.`,
      "",
      `Customer: ${order.deliveryName}`,
      `Customer email: ${order.customerEmail}`,
      `Phone: ${order.deliveryPhone}`,
      `Amount paid: ${amount}`,
      "",
      "Items:", items, "",
      `Delivery region: ${order.deliveryRegion}`,
      `Delivery address: ${order.deliveryAddress}`,
      `Order notes: ${order.notes || "None"}`,
    ].join("\n");

    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        name: order.deliveryName,
        email: order.customerEmail,
        phone: order.deliveryPhone,
        title: `[CUSTOMER ORDER] New Order — ${order.reference}`,
        subject: `[CUSTOMER ORDER] New Order — ${order.reference}`,
        message,
        from_name: order.deliveryName,
        from_email: order.customerEmail,
        reply_to: order.customerEmail,
        order_reference: order.reference,
        order_total: amount,
        order_items: items,
        delivery_region: order.deliveryRegion,
        delivery_address: order.deliveryAddress,
      }, PUBLIC_KEY);
      await fetch("/api/checkout/contact-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference }),
      });
      toast.success("Order email resent", { description: "Sent through the working Contact Form EmailJS path." });
      window.location.reload();
    } catch (error) {
      toast.error("Resend failed", { description: error instanceof Error ? error.message : "EmailJS could not send the message" });
    } finally {
      setLoading(false);
    }
  };

  return <Button type="button" variant="outline" size="sm" onClick={resend} disabled={loading}>
    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
    {loading ? "Resending..." : "Resend email"}
  </Button>;
}
