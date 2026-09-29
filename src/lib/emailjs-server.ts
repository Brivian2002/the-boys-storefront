import "server-only";
import { db } from "@/lib/db";

export interface OrderEmailInput {
  reference: string;
  customerEmail: string;
  customerName: string;
  phone: string;
  amount: number;
  currency: string;
  items: string;
  deliveryRegion: string;
  deliveryAddress: string;
  notes: string;
}

/**
 * Sends a paid-order notification through the same EmailJS service/template
 * used by the public contact form. The recipient remains configured inside
 * EmailJS, so no seller email address is exposed in browser code.
 */
export async function sendPaidOrderEmail(input: OrderEmailInput): Promise<boolean> {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim();
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim();

  if (!serviceId || !templateId || !publicKey) {
    console.warn("Paid-order email skipped: EmailJS is not configured");
    return false;
  }

  const message = [
    `A payment has been confirmed for order ${input.reference}.`,
    "",
    `Customer: ${input.customerName}`,
    `Customer email: ${input.customerEmail}`,
    `Phone: ${input.phone}`,
    `Amount paid: ${input.currency} ${input.amount.toFixed(2)}`,
    "",
    "Items:",
    input.items,
    "",
    `Delivery region: ${input.deliveryRegion}`,
    `Delivery address: ${input.deliveryAddress}`,
    `Order notes: ${input.notes || "None"}`,
  ].join("\n");

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: input.customerName,
        from_email: input.customerEmail,
        phone: input.phone,
        subject: `Paid order ${input.reference}`,
        message,
        order_reference: input.reference,
        order_total: `${input.currency} ${input.amount.toFixed(2)}`,
        order_items: input.items,
        delivery_region: input.deliveryRegion,
        delivery_address: input.deliveryAddress,
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`EmailJS order notification failed: ${response.status} ${detail.slice(0, 180)}`);
  }
  return true;
}

export async function sendPaidOrderEmailOnce(
  orderId: string,
  input: OrderEmailInput
): Promise<boolean> {
  const markerKey = `paid-order-email:${orderId}`;
  try {
    await db.siteSetting.create({
      data: { key: markerKey, value: new Date().toISOString() },
    });
  } catch {
    // A marker already exists, so this order has already triggered its email.
    return false;
  }

  try {
    return await sendPaidOrderEmail(input);
  } catch (error) {
    // Allow a later verification retry if EmailJS was temporarily unavailable.
    await db.siteSetting.delete({ where: { key: markerKey } }).catch(() => undefined);
    throw error;
  }
}
