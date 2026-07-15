"use client";

/**
 * PRISMA Vidriería — Live visitor presence pill.
 *
 * Subscribes to the chat-service `presence:update` event and shows a small
 * mono pill like "● 23 personas viendo ahora". Falls back to "● en vivo"
 * if the socket fails or hasn't reported a count yet.
 *
 * Inline (not floating) — drop it anywhere in the layout.
 */

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

type PresencePayload = { count: number; peak: number };

interface LivePresenceProps {
  /** Optional className to tweak sizing / colour from the call site. */
  className?: string;
  /** Visual variant — "solid" sits on dark backgrounds, "ghost" on light. */
  variant?: "solid" | "ghost";
}

export function LivePresence({
  className,
  variant = "ghost",
}: LivePresenceProps) {
  const [count, setCount] = React.useState<number | null>(null);
  const [connected, setConnected] = React.useState(false);
  const [realtimeAvailable, setRealtimeAvailable] = React.useState(true);
  const reduceMotion = !!useReducedMotion();

  React.useEffect(() => {
    const sock = getSocket();
    if (!sock) {
      setRealtimeAvailable(false);
      return;
    }

    const onPresence = (p: PresencePayload | null) => {
      if (p && typeof p.count === "number") setCount(p.count);
    };
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    sock.on("presence:update", onPresence);
    sock.on("connect", onConnect);
    sock.on("disconnect", onDisconnect);

    if (sock.connected) setConnected(true);

    return () => {
      sock.off("presence:update", onPresence);
      sock.off("connect", onConnect);
      sock.off("disconnect", onDisconnect);
    };
  }, []);

  const showLive = connected && count !== null && count > 0;
  const label = !realtimeAvailable
    ? "atención disponible"
    : showLive
      ? `${count} ${count === 1 ? "persona" : "personas"} viendo ahora`
      : "en vivo";

  const palette =
    variant === "solid"
      ? "bg-white/10 text-white border-white/20"
      : "border-border bg-card/85 text-card-foreground";

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] tracking-[0.12em] backdrop-blur",
        palette,
        className
      )}
      style={{ fontFamily: "var(--font-plex-mono)" }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-70",
            showLive ? "bg-emerald-500" : "bg-amber-500",
            !reduceMotion && "animate-ping"
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            showLive ? "bg-emerald-500" : "bg-amber-500"
          )}
        />
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={label}
          initial={reduceMotion ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
          transition={{ duration: 0.18 }}
          className="tnum"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default LivePresence;
