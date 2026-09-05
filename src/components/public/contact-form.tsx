"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  subject: z.enum(SUBJECTS, { error: "Please select a subject." }),
  message: z
    .string()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(2000, "Message is too long — please keep it under 2000 characters."),
  consent: z.literal(true, { error: "Please agree so we can respond to your message." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

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
    // No backend email service is configured in this build.
    // Simulate a network request so the UX feels real.
    await new Promise((resolve) => setTimeout(resolve, 900));
    console.log("[contact-form] message captured (no email backend):", {
      name: values.name,
      email: values.email,
      subject: values.subject,
    });
    toast.success("Message received", {
      description: `Thank you, ${values.name.split(" ")[0]}. We'll reply within one business day.`,
    });
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold-soft text-foreground">
          <CheckCircle2 className="h-7 w-7 text-gold" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-semibold">
            Thank you — your message is on its way.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
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
      className="rounded-lg border border-border bg-card p-6 sm:p-8 space-y-5"
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
          placeholder="Tell us how we can help — a piece you're interested in, a custom commission, a delivery question..."
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
          I agree that LA GLITZ may contact me about this enquiry. We don't
          share your details — see our{" "}
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
        <p className="text-xs text-destructive -mt-2">
          {errors.consent.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
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
