import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { registerSocketHandlers } from "./socketHandlers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

if (isProd) {
  // Serve player app at /play/*
  const playerDist = join(__dirname, "public/player");
  app.use("/play", express.static(playerDist));
  app.get("/play/*", (_req, res) => res.sendFile(join(playerDist, "index.html")));

  // Serve host app at /*
  const hostDist = join(__dirname, "public/host");
  app.use(express.static(hostDist));
  app.get("*", (_req, res) => res.sendFile(join(hostDist, "index.html")));
}

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (isProd) {
    console.log(`  Host:   http://localhost:${PORT}/`);
    console.log(`  Player: http://localhost:${PORT}/play`);
  }
});
