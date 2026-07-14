/**
 * PRISMA Vidriería — Singleton socket.io client.
 *
 * Gateway contract (CRITICAL):
 *   The frontend MUST connect with io("/?XTransformPort=3003").
 *   Caddy reads the XTransformPort query and reverse-proxies to localhost:3003.
 *   NEVER use io("http://localhost:3003") or any direct port URL.
 *
 * Behaviour:
 *   - Lazy: the socket is created on first getSocket() call (not at import time).
 *   - SSR-safe: getSocket() returns null on the server.
 *   - Singleton: every caller gets the same Socket instance across the app.
 *   - Reuses the connection if already open; reconnects automatically.
 */

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns the singleton socket.io client, or null on the server.
 * The first call lazily opens the connection.
 */
export function getSocket(): Socket | null {
  if (typeof window === "undefined") return null;

  if (socket) return socket;

  socket = io("/?XTransformPort=3003", {
    path: "/", // gateway uses this to route — DO NOT change.
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
    timeout: 10000,
    autoConnect: true,
  });

  // Quietly log lifecycle events to the console for debugging.
  // (No-op in production builds — these are dev aids.)
  socket.on("connect", () => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[prisma:socket] connected", socket?.id);
    }
  });
  socket.on("disconnect", (reason: string) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[prisma:socket] disconnected:", reason);
    }
  });
  socket.on("connect_error", (err: Error) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[prisma:socket] connect_error:", err.message);
    }
  });

  return socket;
}

/**
 * Type re-export for components that want typed access to the socket
 * without forcing a connection at import time.
 */
export type { Socket };

