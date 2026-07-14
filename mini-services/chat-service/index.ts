/**
 * PRISMA Vidriería de Autor — Live chat + visitor presence service.
 *
 * Independent bun + socket.io mini-service.
 * Port: 3003 (hardcoded — required by the gateway).
 *
 * Gateway contract (CRITICAL):
 *   The frontend connects with io("/?XTransformPort=3003").
 *   Caddy matches the XTransformPort query and reverse-proxies to localhost:3003.
 *   We MUST keep path: "/" so Caddy can route correctly.
 *
 * Events:
 *   server -> client
 *     - presence:update   { count, peak }
 *     - chat:history      ChatMessage[]
 *     - chat:message      ChatMessage
 *     - chat:typing       { typing: boolean }
 *   client -> server
 *     - chat:join         { name? }
 *     - chat:message      { text, name? }
 *     - chat:history      (request, no payload)
 */

import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";

const PORT = 3003;
const LOBBY_ROOM = "lobby";
const HISTORY_LIMIT = 20;
const MAX_MESSAGE_LEN = 1000;
const MAX_NAME_LEN = 40;

interface Visitor {
  id: string;
  name?: string;
  joinedAt: number;
  location?: string;
}

interface ChatMessage {
  id: string;
  from: "visitor" | "atelier";
  text: string;
  name?: string;
  ts: number;
}

const visitors = new Map<string, Visitor>();
const messageHistory: ChatMessage[] = [];
let peak = 0;

// --- Helpers --------------------------------------------------------------

const genId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const clamp = (s: string, n: number): string =>
  typeof s === "string" ? s.slice(0, n) : "";

const broadcastPresence = (io: Server): void => {
  const count = visitors.size;
  if (count > peak) peak = count;
  io.to(LOBBY_ROOM).emit("presence:update", { count, peak });
};

/**
 * Contextual canned auto-replies in Spanish for a Mexican vidriería.
 * Picks based on simple keyword matching (case-insensitive).
 */
const pickAtelierReply = (text: string): string => {
  const t = text.toLowerCase();

  if (/(precio|precios|costo|cuesta|cu[aá]nto|cotizar|cotizaci[oó]n|presupuesto|presupuestar)/.test(t)) {
    return "Claro, te preparo una cotización. ¿Qué tipo de vidrio necesitas y las medidas aproximadas?";
  }
  if (/(cita|medir|medici[oó]n|agendar|visitar|visita|taller)/.test(t)) {
    return "Agenda tu medición en la sección de citas, o dime tu código postal y verifico cobertura.";
  }
  if (/(hola|buenas|buenos d[íi]as|buenas tardes|buenas noches|qu[eé] tal|saludos)/.test(t)) {
    return "¡Hola! Bienvenido a PRISMA. ¿En qué proyecto de vidrio te puedo asesorar?";
  }
  if (/(templado|mampara|barandal|espejo|puerta|ventana|vidrio|cristal|vitra|ducha|divisor)/.test(t)) {
    return "Tenemos ese tipo de vidrio. ¿Lo necesitas para interior o exterior? Con las medidas te doy una referencia exacta.";
  }
  if (/(gracias|thank|perfecto|ok$|okey)/.test(t)) {
    return "A ti. Quedo atento si quieres avanzar con la cotización o la cita de medición.";
  }

  return "Gracias por escribir. Un asesor del taller te responde en un momento, mientras tanto puedes usar el cotizador instantáneo.";
};

const pushHistory = (msg: ChatMessage): void => {
  messageHistory.push(msg);
  if (messageHistory.length > HISTORY_LIMIT * 2) {
    // Keep buffer modest (a bit more than the served window for context).
    messageHistory.splice(0, messageHistory.length - HISTORY_LIMIT * 2);
  }
};

const recentHistory = (): ChatMessage[] => messageHistory.slice(-HISTORY_LIMIT);

// Note on HTTP probes:
//   socket.io is configured with path: "/" (required by the gateway).
//   That means socket.io's engine intercepts ALL HTTP requests at the root,
//   so a plain curl to "/" returns its standard "Transport unknown" JSON
//   response. That is expected and benign — it confirms the engine is alive.

// --- Bootstrap ------------------------------------------------------------

try {
  const httpServer = createServer();

  const io = new Server(httpServer, {
    // Path MUST be "/" so the gateway (Caddy) can route by XTransformPort.
    path: "/",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e5, // 100 KB — more than enough for chat text
  });

  io.on("connection", (socket: Socket) => {
    const visitor: Visitor = {
      id: socket.id,
      joinedAt: Date.now(),
    };

    try {
      visitors.set(socket.id, visitor);
      socket.join(LOBBY_ROOM);
      console.log(
        `[+] connect ${socket.id} · total=${visitors.size} peak=${peak}`
      );

      // Send recent history + initial presence to the newcomer only.
      socket.emit("chat:history", recentHistory());
      socket.emit("presence:update", {
        count: visitors.size,
        peak,
      });
      // Then broadcast updated presence to everyone in the lobby.
      broadcastPresence(io);
    } catch (err) {
      console.error(`[!] connection handler error (${socket.id}):`, err);
    }

    // --- chat:join ---
    socket.on("chat:join", (payload: unknown) => {
      try {
        const v = visitors.get(socket.id);
        if (!v) return;
        const name =
          payload && typeof payload === "object" && "name" in payload
            ? clamp(String((payload as { name?: unknown }).name ?? ""), MAX_NAME_LEN)
            : "";
        if (name) v.name = name;
      } catch (err) {
        console.error(`[!] chat:join error (${socket.id}):`, err);
      }
    });

    // --- chat:history (request) ---
    socket.on("chat:history", () => {
      try {
        socket.emit("chat:history", recentHistory());
      } catch (err) {
        console.error(`[!] chat:history error (${socket.id}):`, err);
      }
    });

    // --- chat:message ---
    socket.on("chat:message", (payload: unknown) => {
      try {
        if (!payload || typeof payload !== "object") return;
        const p = payload as { text?: unknown; name?: unknown };
        const rawText = typeof p.text === "string" ? p.text : "";
        const text = clamp(rawText.trim(), MAX_MESSAGE_LEN);
        if (!text) return;

        const v = visitors.get(socket.id);
        const name =
          typeof p.name === "string" && p.name.trim()
            ? clamp(p.name.trim(), MAX_NAME_LEN)
            : v?.name;

        if (v && name && !v.name) v.name = name;

        const visitorMsg: ChatMessage = {
          id: genId(),
          from: "visitor",
          text,
          name: name || undefined,
          ts: Date.now(),
        };
        pushHistory(visitorMsg);
        io.to(LOBBY_ROOM).emit("chat:message", visitorMsg);

        // Atelier "typing…" indicator while we craft a reply.
        socket.emit("chat:typing", { typing: true });

        // Reply after a humane delay (900–1600 ms).
        const delay = 900 + Math.floor(Math.random() * 700);
        setTimeout(() => {
          try {
            socket.emit("chat:typing", { typing: false });
            const reply: ChatMessage = {
              id: genId(),
              from: "atelier",
              text: pickAtelierReply(text),
              ts: Date.now(),
            };
            pushHistory(reply);
            // Send the reply to the sender (and lobby, so other tabs sync).
            io.to(LOBBY_ROOM).emit("chat:message", reply);
          } catch (innerErr) {
            console.error(`[!] atelier reply error (${socket.id}):`, innerErr);
          }
        }, delay);
      } catch (err) {
        console.error(`[!] chat:message error (${socket.id}):`, err);
      }
    });

    // --- disconnect ---
    socket.on("disconnect", (reason: string) => {
      try {
        visitors.delete(socket.id);
        console.log(
          `[-] disconnect ${socket.id} (${reason}) · total=${visitors.size} peak=${peak}`
        );
        broadcastPresence(io);
      } catch (err) {
        console.error(`[!] disconnect handler error (${socket.id}):`, err);
      }
    });

    // --- error (per-socket) ---
    socket.on("error", (err: Error) => {
      console.error(`[!] socket error (${socket.id}):`, err.message);
    });
  });

  // Top-level error guard — never crash the service.
  io.engine.on("connection_error", (err: unknown) => {
    const e = err as { code?: string; message?: string };
    // Code "0" = "Transport unknown" — benign noise from non-socket probes.
    if (e?.code !== "0") {
      console.error("[!] engine connection_error:", e?.code, e?.message);
    }
  });

  process.on("uncaughtException", (err: Error) => {
    console.error("[!!] uncaughtException:", err.message);
  });
  process.on("unhandledRejection", (reason: unknown) => {
    console.error("[!!] unhandledRejection:", reason);
  });

  process.on("SIGTERM", () => {
    console.log("[shutdown] SIGTERM received, closing chat-service…");
    io.close(() => {
      httpServer.close(() => process.exit(0));
    });
  });
  process.on("SIGINT", () => {
    console.log("[shutdown] SIGINT received, closing chat-service…");
    io.close(() => {
      httpServer.close(() => process.exit(0));
    });
  });

  httpServer.listen(PORT, () => {
    console.log(
      `PRISMA chat-service listening on :${PORT} (socket.io path "/")`
    );
    console.log(`Frontend connects via io("/?XTransformPort=${PORT}")`);
  });
} catch (fatal) {
  console.error("[FATAL] chat-service bootstrap failed:", fatal);
  process.exit(1);
}
