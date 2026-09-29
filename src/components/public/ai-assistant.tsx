"use client";

import * as React from "react";
import { Bot, ChevronDown, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What makes LaGlitz special?",
  "Who is Homeland Return Jewelry?",
  "How does delivery work?",
];

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to LaGlitz. I can tell you about our Afrocentric jewelry, story, delivery, payments, care, and the relationship between our public brand and registered business.",
    },
  ]);

  const ask = async (question?: string) => {
    const content = (question ?? input).trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Assistant unavailable");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error && error.message.includes("not configured")
              ? "The assistant is being prepared. You can still browse the collection, read our policies, or message us on WhatsApp."
              : "I’m having trouble connecting right now. Please try again or contact us on WhatsApp.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section
          className="fixed bottom-24 right-4 z-50 flex h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-teal-500/30 bg-card shadow-2xl"
          aria-label="LaGlitz AI assistant"
        >
          <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Bot className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">LaGlitz Guide</p>
                <p className="text-[0.68rem] text-white/75">Story, products, delivery & business info</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 hover:bg-white/15"><X className="h-4 w-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-sm bg-teal-600 text-white" : "rounded-bl-sm bg-muted text-foreground"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">Try asking</p>
                {STARTERS.map((starter) => <button key={starter} type="button" onClick={() => ask(starter)} className="block w-full rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-teal-500/50 hover:text-foreground">{starter}</button>)}
              </div>
            )}
            {loading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…</div>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); void ask(); }} className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1.5 focus-within:border-teal-500/60">
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about LaGlitz…" maxLength={1200} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" aria-label="Ask the LaGlitz assistant" />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send question" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close LaGlitz assistant" : "Open LaGlitz assistant"} className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-transform hover:scale-105 hover:bg-teal-600">
        {open ? <ChevronDown className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
        <span className="hidden sm:inline">Ask LaGlitz</span>
        <Sparkles className="h-3.5 w-3.5 text-amber-200" />
      </button>
    </>
  );
}
