"use client";

import * as React from "react";
import { Bot, ChevronDown, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What makes The Boyz Store special?",
  "How does delivery work?",
  "Help me find a useful product",
];

function cleanAssistantText(value: string) {
  return value
    .replace(/\*+/g, "")
    .replace(/_+/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-•]\s+/gm, "• ")
    .trim();
}

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m your Boyz Store guide. Ask me about products, delivery, payments, returns, or finding the right department.",
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
      setMessages((current) => [...current, { role: "assistant", content: cleanAssistantText(data.message) }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error && error.message.includes("not configured")
              ? "The assistant is being prepared. You can still browse the marketplace or message us on WhatsApp."
              : error instanceof Error && (error.message.startsWith("Groq ") || error.message.startsWith("The assistant is busy"))
                ? error.message
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
          className="fixed bottom-24 right-4 z-50 flex h-[min(540px,calc(100vh-8rem))] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.5rem] border border-blue-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.25)] dark:border-blue-900 dark:bg-slate-950"
          aria-label="The Boyz Store AI assistant"
        >
          <header className="flex items-center justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-lg">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Boyz Store Guide</p>
                <p className="text-[0.68rem] text-blue-100">Fast help for smarter shopping</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-1.5 transition hover:bg-white/15"><X className="h-4 w-4" /></button>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3 dark:bg-slate-900/80">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${message.role === "user" ? "rounded-br-sm bg-blue-600 text-white" : "rounded-bl-sm border border-blue-100 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}>
                  {message.content}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                <p className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-blue-600"><Sparkles className="h-3.5 w-3.5" /> Try asking</p>
                {STARTERS.map((starter) => <button key={starter} type="button" onClick={() => void ask(starter)} className="block w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-left text-xs text-slate-600 transition hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">{starter}</button>)}
              </div>
            )}
            {loading && <div className="flex items-center gap-2 text-xs text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…</div>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); void ask(); }} className="border-t border-blue-100 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/70 p-1.5 focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-900">
              <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask the Boyz Store…" maxLength={1200} className="min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white" aria-label="Ask the Boyz Store assistant" />
              <button type="submit" disabled={loading || !input.trim()} aria-label="Send question" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </div>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close The Boyz Store assistant" : "Open The Boyz Store assistant"} className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-[0_12px_32px_rgba(37,99,235,0.42)] transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:border-slate-950">
        {open ? <ChevronDown className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
        <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-sky-300 dark:border-slate-950" />
      </button>
    </>
  );
}
