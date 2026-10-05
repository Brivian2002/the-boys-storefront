"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBJECTS = [
  "General enquiry",
  "Custom commission",
  "Delivery question",
  "Press",
  "Other",
] as const;

const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your name.")
    .max(80, "Name is too long."),
  email: z
    .string()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address."),
  phone: z
    .string()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  subject: z.enum(SUBJECTS, {
    errorMap: () => ({ message: "Please select a subject." }),
  }),
  message: z
    .string()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(2000, "Message is too long — please keep it under 2000 characters."),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "Please agree so we can respond to your message.",
    }),
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      subject: undefined,
    },
  });

  const subjectValue = useWatch({ control, name: "subject" });

  const onSubmit = async (values: ContactFormValues) => {
    // 1. Persist to the DB so the admin Inbox has a record.
    // 2. Fire EmailJS to deliver to the owner's inbox (client-side).
    // Either can fail without blocking the other — we always have the DB record.
    const dbPromise = fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }).then(async (res) => {
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? "Could not save message");
      }
      return res.json();
    });

    const emailPromise =
      SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY
        ? emailjs
            .send(
              SERVICE_ID,
              TEMPLATE_ID,
              {
                name: values.name,
                email: values.email,
                phone: values.phone ?? "",
                title: values.subject,
                subject: values.subject,
                message: values.message,
                from_name: values.name,
                from_email: values.email,
                reply_to: values.email,
              },
              PUBLIC_KEY
            )
            .catch((err) => {
              // EmailJS failure is non-fatal — the DB record still exists.
              console.warn("[contact-form] EmailJS send failed:", err);
            })
        : Promise.resolve();

    try {
      await Promise.all([dbPromise, emailPromise]);
      toast.success("Message received", {
        description: `Thank you, ${values.name.split(" ")[0]}. We'll reply within one business day.`,
      });
      setSubmitted(true);
      reset();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not send message";
      toast.error("Could not send message", { description: msg });
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-foreground">
          <CheckCircle2 className="h-7 w-7 text-gold" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-semibold">
            Thank you — your message is on its way.
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            We've received your note and one of our team will reply within one
            business day. For urgent enquiries, please message us on WhatsApp.
          </p>
        </div>
        <Button variant="outline" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-lg border border-border bg-card p-6 sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Your full name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+233 ..."
            autoComplete="tel"
            aria-invalid={!!errors.phone}
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">
            Subject <span className="text-destructive">*</span>
          </Label>
          <Select
            value={subjectValue}
            onValueChange={(v) =>
              setValue("subject", v as ContactFormValues["subject"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger
              id="subject"
              className="w-full"
              aria-invalid={!!errors.subject}
            >
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="text-xs text-destructive">
              {errors.subject.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell us how we can help — a item you're interested in, a custom commission, a delivery question..."
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          id="consent"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-border accent-[var(--ring)]"
          {...register("consent")}
        />
        <Label
          htmlFor="consent"
          className="text-xs font-normal leading-relaxed text-muted-foreground"
        >
          I agree that The Boys Store may contact me about this
          enquiry. We don't share your details — see our{" "}
          <a
            href="/policies#privacy"
            className="text-foreground underline underline-offset-4 hover:text-gold"
          >
            privacy policy
          </a>
          .
        </Label>
      </div>
      {errors.consent && (
        <p className="-mt-2 text-xs text-destructive">
          {errors.consent.message}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send message
            <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        We typically reply within one business day. For urgent questions,
        WhatsApp is fastest.
      </p>
    </form>
  );
}
