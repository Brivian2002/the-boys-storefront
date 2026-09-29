"use client";

import * as React from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export interface PaidOrderContactEmailProps {
  reference: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  amount: string;
  items: string;
  deliveryRegion: string;
  deliveryAddress: string;
  notes: string;
}

export function PaidOrderContactEmail(props: PaidOrderContactEmailProps) {
  React.useEffect(() => {
    const marker = `paid-order-contact-email:${props.reference}`;
    if (window.localStorage.getItem(marker)) return;
    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return;

    let cancelled = false;
    const message = [
      `A customer payment has been verified for order ${props.reference}.`,
      "",
      `Customer: ${props.customerName}`,
      `Customer email: ${props.customerEmail}`,
      `Phone: ${props.phone}`,
      `Amount paid: ${props.amount}`,
      "",
      "Items:",
      props.items,
      "",
      `Delivery region: ${props.deliveryRegion}`,
      `Delivery address: ${props.deliveryAddress}`,
      `Order notes: ${props.notes || "None"}`,
    ].join("\n");

    emailjs
      .send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          name: props.customerName,
          email: props.customerEmail,
          phone: props.phone,
          title: `[CUSTOMER ORDER] New Order — ${props.reference}`,
          subject: `[CUSTOMER ORDER] New Order — ${props.reference}`,
          message,
          from_name: props.customerName,
          from_email: props.customerEmail,
          reply_to: props.customerEmail,
          order_reference: props.reference,
          order_total: props.amount,
          order_items: props.items,
          delivery_region: props.deliveryRegion,
          delivery_address: props.deliveryAddress,
        },
        PUBLIC_KEY
      )
      .then(async () => {
        if (cancelled) return;
        window.localStorage.setItem(marker, "sent");
        await fetch("/api/checkout/contact-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: props.reference }),
        }).catch(() => undefined);
      })
      .catch((error) => {
        console.warn("[paid-order-contact-email] EmailJS send failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [props]);

  return null;
}
