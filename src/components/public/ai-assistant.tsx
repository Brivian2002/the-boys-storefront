"use client";

import * as React from "react";
import { ChevronDown, Loader2, Send, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What makes LaGlitz special?",
  "Who is Homeland Return Jewelry?",
  "How does delivery work?",
];

function LadyHeadsetIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <circle cx="24" cy="17" r="8" fill="white" />
      <path d="M10 39c1.7-8 6.2-12 14-12s12.3 4 14 12" fill="white" />
      <path d="M13 21v-3c0-7 4.8-12 11-12s11 5 11 12v3" fill="none" stroke="black" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M12.5 19.5v8.2c0 1.6 1.2 2.8 2.8 2.8h1.2v-9.5h-1.2c-1.1 0-2.1.7-2.8 1.7M35.5 19.5v8.2c0 1.6-1.2 2.8-2.8 2.8h-1.2v-9.5h1.2c1.1 0 2.1.7 2.8 1.7" fill="none" stroke="black" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 30.5h3.2c2.4 0 4.3 1.9 4.3 4.3v.8h-6.2" fill="none" stroke="black" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function cleanAssistantText(value: string) {
  return value
    .replace(/\*+/g, "")
    .replace(/_+/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-•]\s+/gm, "• ")
    .trim();
}

function ReadingLadyMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span className={`assistant-reading-mark ${className}`}>
      <span className="assistant-reading-beam" />
      <LadyHeadsetIcon className="relative z-10 h-[78%] w-[78%]" />
    </span>
  );
}

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
      setMessages((current) => [...current, { role: "assistant", content: cleanAssistantText(data.message) }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error && error.message.includes("not configured")
              ? "The assistant is being prepared. You can still browse the collection, read our policies, or message us on WhatsApp."
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
          className="fixed bottom-24 right-4 z-50 flex h-[min(500px,calc(100vh-8rem))] w-[min(340px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-teal-500/30 bg-card shadow-2xl"
          aria-label="LaGlitz AI assistant"
        >
          <header className="flex items-center justify-between border-b border-border bg-gradient-to-r from-teal-700 to-teal-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <ReadingLadyMark className="h-9 w-9 rounded-full bg-white/15" />
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
        {open ? <ChevronDown className="h-4 w-4" /> : <ReadingLadyMark className="h-7 w-7 rounded-full" />}
        <span className="hidden sm:inline">Ask LaGlitz</span>
      </button>
      <style jsx>{`
        .assistant-reading-mark {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(90deg, #ec4899, #ffffff, #14b8a6, #ffffff, #ec4899);
          background-size: 240% 100%;
          animation: assistant-spectrum 2.8s linear infinite;
        }
        .assistant-reading-beam {
          position: absolute;
          inset-block: 0;
          left: -45%;
          width: 34%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent);
          transform: skewX(-18deg);
          animation: assistant-reading 1.9s ease-in-out infinite;
        }
        @keyframes assistant-spectrum {
          from { background-position: 0% 50%; }
          to { background-position: 100% 50%; }
        }
        @keyframes assistant-reading {
          0%, 20% { left: -45%; }
          80%, 100% { left: 115%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .assistant-reading-mark, .assistant-reading-beam { animation: none; }
        }
      `}</style>
    </>
  );
}
