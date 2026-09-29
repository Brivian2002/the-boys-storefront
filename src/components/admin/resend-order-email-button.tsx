"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ResendOrderEmailButton({ deliveryId }: { deliveryId: string }) {
  const [loading, setLoading] = React.useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/email-history/${deliveryId}/resend`, {
        method: "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error ?? "Could not resend order email");
      }
      toast.success("Order email resent", {
        description: "A new delivery attempt was recorded in Email history.",
      });
      window.location.reload();
    } catch (error) {
      toast.error("Resend failed", {
        description: error instanceof Error ? error.message : "Could not resend order email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={resend} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {loading ? "Resending..." : "Resend email"}
    </Button>
  );
}
