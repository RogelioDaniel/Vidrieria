"use client";

/**
 * PRISMA Vidriería — Live chat widget (floating).
 *
 * Connects to the chat-service socket.io server on port 3003 via the
 * gateway: io("/?XTransformPort=3003").
 *
 * UX:
 *   - Floating copper circular button (bottom-right), with a pulsing
 *     green presence dot.
 *   - Click opens a frosted-glass chat panel with:
 *       Header  · "PRISMA · Atelier en vivo" + "en línea" dot + close btn
 *       Body    · scrollable message list, visitor bubbles right (copper),
 *                 atelier bubbles left (glass).
 *       Footer  · Input + send button, Enter to send.
 *   - Shows "Atelier escribiendo…" while waiting for the canned reply.
 *   - Mobile: full-width sheet-style panel anchored to bottom.
 *   - Respects prefers-reduced-motion.
 */

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  from: "visitor" | "atelier";
  text: string;
  name?: string;
  ts: number;
}

type PresencePayload = { count: number; peak: number };
type TypingPayload = { typing: boolean };

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  from: "atelier",
  text: "¡Hola! Soy el atelier en vivo de PRISMA. Cuéntame qué proyecto de vidrio tienes en mente y te asesoro al instante.",
  ts: Date.now(),
};

export function LiveChat() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = React.useState("");
  const [connected, setConnected] = React.useState(false);
  const [atelierTyping, setAtelierTyping] = React.useState(false);
  const [presence, setPresence] = React.useState<PresencePayload | null>(null);

  const listRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = !!useReducedMotion();

  // --- Socket lifecycle ----------------------------------------------------
  React.useEffect(() => {
    const sock = getSocket();
    if (!sock) return; // server-side render — nothing to do.

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMessage = (m: ChatMessage) => {
      setMessages((prev) => {
        // De-dup by id (history + live echo could overlap on a fresh socket).
        if (prev.some((p) => p.id === m.id)) return prev;
        // De-dup optimistic visitor echo: if the same visitor text was added
        // locally in the last 5s, the server echo is a duplicate — skip it.
        if (m.from === "visitor") {
          const now = Date.now();
          const dupe = prev.some(
            (p) => p.from === "visitor" && p.text === m.text && now - p.ts < 5000
          );
          if (dupe) return prev;
        }
        return [...prev, m];
      });
    };

    const onHistory = (hist: ChatMessage[] | null | undefined) => {
      if (!Array.isArray(hist) || hist.length === 0) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev, ...hist.filter((h) => !seen.has(h.id))];
        return merged;
      });
    };

    const onPresence = (p: PresencePayload) => setPresence(p ?? null);
    const onTyping = (t: TypingPayload) => setAtelierTyping(!!t?.typing);

    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);
    sock.on("chat:message", onMessage);
    sock.on("chat:history", onHistory);
    sock.on("presence:update", onPresence);
    sock.on("chat:typing", onTyping);

    // If the socket is already connected (singleton reused), flip state now.
    if (sock.connected) setConnected(true);

    // Ask for fresh history + announce ourselves.
    try {
      sock.emit("chat:history");
      sock.emit("chat:join", { name: undefined });
    } catch {
      /* swallow — socket not ready yet */
    }

    return () => {
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
      sock.off("chat:message", onMessage);
      sock.off("chat:history", onHistory);
      sock.off("presence:update", onPresence);
      sock.off("chat:typing", onTyping);
    };
  }, []);

  // --- Auto-scroll to latest message --------------------------------------
  React.useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
  }, [messages, atelierTyping, open, reduceMotion]);

  // --- Send a message ------------------------------------------------------
  const send = React.useCallback(() => {
    const text = input.trim();
    if (!text) return;
    const sock = getSocket();
    if (!sock) return;

    // Optimistic local echo so the visitor sees their message immediately,
    // even if the socket is mid-reconnect.
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      from: "visitor",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      sock.emit("chat:message", { text });
    } catch {
      /* ignore — socket may be reconnecting */
    }
  }, [input]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="fixed z-50 print:hidden"
      style={{
        right: "clamp(0.75rem, env(safe-area-inset-right, 0px) + 1rem, 1.5rem)",
        bottom: "clamp(0.75rem, env(safe-area-inset-bottom, 0px) + 1rem, 1.5rem)",
      }}
      aria-live="polite"
    >
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "glass-panel absolute overflow-hidden rounded-2xl",
              // Desktop: anchored above the FAB.
              "left-auto right-0 bottom-[4.5rem]",
              "w-[min(92vw,360px)] max-h-[70vh] flex flex-col",
              // Mobile: full-width sheet at the bottom of the screen.
              "max-sm:right-[-0.75rem] max-sm:left-[-0.75rem] max-sm:w-[calc(100%+1.5rem)] max-sm:max-h-[80vh] max-sm:rounded-b-none max-sm:bottom-[4.5rem]"
            )}
            role="dialog"
            aria-label="Chat en vivo con el atelier PRISMA"
            aria-modal="false"
          >
            {/* Header */}
            <header className="flex items-center gap-2 border-b border-white/40 px-4 py-3">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full opacity-70",
                    connected ? "bg-emerald-500" : "bg-amber-500",
                    !reduceMotion && connected && "animate-ping"
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex h-2.5 w-2.5 rounded-full",
                    connected ? "bg-emerald-500" : "bg-amber-500"
                  )}
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className="truncate text-[0.7rem] uppercase tracking-[0.18em] text-[var(--humo)]"
                  style={{ fontFamily: "var(--font-plex-mono)" }}
                >
                  PRISMA · Atelier en vivo
                </span>
                <span className="truncate text-[0.7rem] text-[var(--humo)]">
                  {connected ? "en línea" : "conectando…"}
                  {presence && presence.count > 0
                    ? ` · ${presence.count} ${presence.count === 1 ? "persona" : "personas"} viendo`
                    : ""}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 shrink-0 rounded-full text-card-foreground hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            {/* Message list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto px-3 py-3"
              style={{ scrollbarWidth: "thin" }}
            >
              <ul className="flex flex-col gap-2">
                {messages.map((m) => (
                  <ChatBubble key={m.id} m={m} />
                ))}

                {atelierTyping && (
                  <li className="flex items-end gap-2">
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cristal)] text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--obsidiana)]"
                      style={{ fontFamily: "var(--font-plex-mono)" }}
                    >
                      PR
                    </span>
                    <span className="glass-card rounded-2xl rounded-bl-md px-3 py-2 text-sm text-card-foreground">
                      <span className="flex items-center gap-1">
                        <Dot delay="0ms" />
                        <Dot delay="120ms" />
                        <Dot delay="240ms" />
                        <span className="ml-1 text-[0.7rem] text-[var(--humo)]">
                          Atelier escribiendo…
                        </span>
                      </span>
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Input row */}
            <footer className="border-t border-white/40 p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="Escribe tu mensaje…"
                  aria-label="Mensaje al atelier"
                  maxLength={1000}
                  className="h-11 flex-1 rounded-full border-black/10 bg-white/70 text-sm text-[var(--obsidiana)] placeholder:text-[var(--humo)] focus-visible:ring-[var(--cobre)]"
                />
                <Button
                  type="button"
                  onClick={send}
                  disabled={!input.trim()}
                  aria-label="Enviar mensaje"
                  className="h-11 w-11 shrink-0 rounded-full bg-[var(--cobre)] text-white hover:bg-[var(--cobre-bright)] disabled:opacity-40 disabled:hover:bg-[var(--cobre)]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p
                className="mt-2 px-1 text-[0.62rem] uppercase tracking-[0.16em] text-[var(--humo)]"
                style={{ fontFamily: "var(--font-plex-mono)" }}
              >
                Taller CDMX · Respuesta en segundos · Enter para enviar
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat en vivo" : "Abrir chat en vivo"}
        aria-expanded={open}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_18px_40px_-12px_rgba(184,115,51,0.6)]",
          "bg-[var(--cobre)] hover:bg-[var(--cobre-bright)] transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobre)]"
        )}
        whileHover={reduceMotion ? undefined : { scale: 1.05 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="x"
              initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="msg"
              initial={reduceMotion ? false : { rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={reduceMotion ? undefined : { rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulsing presence dot */}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center">
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75",
                !reduceMotion && "animate-ping"
              )}
            />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </span>
        )}
      </motion.button>
    </div>
  );
}

// --- Chat bubble ----------------------------------------------------------

function ChatBubble({ m }: { m: ChatMessage }) {
  const isVisitor = m.from === "visitor";
  const time = new Date(m.ts).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isVisitor) {
    return (
      <li className="flex flex-col items-end">
        <div className="flex items-end gap-2">
          <div className="flex max-w-[78%] flex-col items-end">
            <span
              className="rounded-2xl rounded-br-md bg-[var(--cobre)] px-3 py-2 text-sm text-white shadow-sm"
              style={{ wordBreak: "break-word" }}
            >
              {m.text}
            </span>
            <span
              className="mt-0.5 pr-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--humo)]"
              style={{ fontFamily: "var(--font-plex-mono)" }}
            >
              {m.name ? `${m.name} · ` : ""}{time}
            </span>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col items-start">
      <div className="flex items-end gap-2">
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--cristal)] text-[0.6rem] font-semibold uppercase tracking-wide text-[var(--obsidiana)]"
          style={{ fontFamily: "var(--font-plex-mono)" }}
        >
          PR
        </span>
        <div className="flex max-w-[78%] flex-col items-start">
          <span
            className="glass-card rounded-2xl rounded-bl-md px-3 py-2 text-sm text-card-foreground"
            style={{ wordBreak: "break-word" }}
          >
            {m.text}
          </span>
          <span
            className="mt-0.5 pl-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--humo)]"
            style={{ fontFamily: "var(--font-plex-mono)" }}
          >
            Atelier · {time}
          </span>
        </div>
      </div>
    </li>
  );
}

// --- Typing dot -----------------------------------------------------------

function Dot({ delay }: { delay: string }) {
  const reduceMotion = !!useReducedMotion();
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full bg-[var(--humo)]",
        !reduceMotion && "animate-bounce"
      )}
      style={reduceMotion ? undefined : { animationDelay: delay }}
    />
  );
}

export default LiveChat;
