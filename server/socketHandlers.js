import { v4 as uuidv4 } from "uuid";
import {
  createRoom,
  getRoom,
  deleteRoom,
  getAllRooms,
  scheduleRoomCleanup,
  clearCleanupTimer,
} from "./rooms.js";
import {
  resetGameState,
  allStatementsSubmitted,
  advanceToFinalStats,
} from "./games/twoTruths/state.js";

// socketId -> roomCode, for fast disconnect lookup
const hostSockets = new Map();

function broadcastState(io, room) {
  const { hostToken, ...publicState } = room;
  io.to(room.roomCode).emit("state_update", publicState);
}

export function registerSocketHandlers(io, socket) {
  // ── Host: create room ──────────────────────────────────────────────────────
  socket.on("create_room", ({ gameType }) => {
    const { roomCode, hostToken } = createRoom(gameType ?? "twoTruths");
    socket.join(roomCode);
    hostSockets.set(socket.id, roomCode);
    socket.emit("room_created", { roomCode, hostToken });
  });

  // ── Player: join room ──────────────────────────────────────────────────────
  socket.on("join_room", ({ roomCode, name }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit("error", { message: "Room not found." });
    if (room.phase !== "lobby")
      return socket.emit("error", { message: "Game already in progress." });

    const sessionToken = uuidv4();
    const player = {
      id: socket.id,
      sessionToken,
      name,
      statements: [],
      hasSubmittedStatements: false,
      connected: true,
    };
    room.players.push(player);
    clearCleanupTimer(roomCode);
    clearDisconnectTimer(sessionToken);

    socket.join(roomCode);
    socket.emit("joined_room", { sessionToken, roomCode });

    io.to(roomCode).emit("player_joined", { players: room.players.map((p) => ({ id: p.id, name: p.name })) });
    broadcastState(io, room);
  });

  // ── Player: rejoin room after reconnect ────────────────────────────────────
  socket.on("rejoin_room", ({ roomCode, sessionToken }) => {
    const room = getRoom(roomCode);
    if (!room) return socket.emit("error", { message: "Room not found or expired." });

    const player = room.players.find((p) => p.sessionToken === sessionToken);
    if (!player) return socket.emit("error", { message: "Session expired. Please rejoin." });

    // Cancel the deferred removal timer and restore the player
    clearDisconnectTimer(sessionToken);
    player.id = socket.id;
    player.connected = true;

    socket.join(roomCode);
    socket.emit("joined_room", { sessionToken, roomCode });
    broadcastState(io, room);
  });

  // ── Host: start game ───────────────────────────────────────────────────────
  socket.on("start_game", ({ roomCode, hostToken }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostToken !== hostToken) return;
    if (room.players.length < 2) return socket.emit("error", { message: "Need at least 2 players." });

    room.phase = "input";
    broadcastState(io, room);
  });

  // ── Player: submit statements ──────────────────────────────────────────────
  socket.on("submit_statements", ({ roomCode, sessionToken, statements }) => {
    const room = getRoom(roomCode);
    if (!room) return;

    const player = room.players.find((p) => p.sessionToken === sessionToken);
    if (!player) return;
    if (player.hasSubmittedStatements) return;

    player.statements = statements.map((s, i) => ({
      id: `${player.id}-s${i}`,
      text: s.text,
      isLie: s.isLie,
    }));
    player.hasSubmittedStatements = true;

    const submittedCount = room.players.filter((p) => p.hasSubmittedStatements).length;
    io.to(roomCode).emit("submission_progress", {
      submittedCount,
      totalCount: room.players.length,
    });

    if (allStatementsSubmitted(room)) {
      room.phase = "guessing";
      room.currentPlayerIndex = 0;
      room.guesses = {};
      room.guessesSubmittedCount = 0;
      broadcastState(io, room);
    }
  });

  // ── Player: submit guess ───────────────────────────────────────────────────
  socket.on("submit_guess", ({ roomCode, sessionToken, guesses }) => {
    const room = getRoom(roomCode);
    if (!room || room.phase !== "guessing") return;

    const guesser = room.players.find((p) => p.sessionToken === sessionToken);
    if (!guesser) return;

    const currentTarget = room.players[room.currentPlayerIndex];
    if (guesser.id === currentTarget.id) return; // can't guess own statements

    if (room.guesses[guesser.id]) return; // already guessed this round

    room.guesses[guesser.id] = guesses; // { statementId: "truth" | "lie" }
    room.guessesSubmittedCount++;

    const eligibleGuessers = room.players.filter((p) => p.id !== currentTarget.id).length;
    io.to(roomCode).emit("submission_progress", {
      submittedCount: room.guessesSubmittedCount,
      totalCount: eligibleGuessers,
    });

    if (room.guessesSubmittedCount >= eligibleGuessers) {
      room.phase = "results";
      broadcastState(io, room);
    }
  });

  // ── Host: advance to results (manual override) ─────────────────────────────
  socket.on("advance_to_results", ({ roomCode, hostToken }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostToken !== hostToken) return;
    room.phase = "results";
    broadcastState(io, room);
  });

  // ── Host: next player ──────────────────────────────────────────────────────
  socket.on("next_player", ({ roomCode, hostToken }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostToken !== hostToken) return;

    const nextIndex = room.currentPlayerIndex + 1;
    if (nextIndex >= room.players.length) {
      advanceToFinalStats(room);
    } else {
      room.currentPlayerIndex = nextIndex;
      room.phase = "guessing";
      room.guesses = {};
      room.guessesSubmittedCount = 0;
    }
    broadcastState(io, room);
  });

  // ── Host: play again ───────────────────────────────────────────────────────
  socket.on("play_again", ({ roomCode, hostToken }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostToken !== hostToken) return;
    resetGameState(room);
    broadcastState(io, room);
  });

  // ── Host: end game ─────────────────────────────────────────────────────────
  socket.on("end_game", ({ roomCode, hostToken }) => {
    const room = getRoom(roomCode);
    if (!room || room.hostToken !== hostToken) return;
    room.phase = "lobby";
    for (const player of room.players) {
      player.statements = [];
      player.hasSubmittedStatements = false;
    }
    room.currentPlayerIndex = 0;
    room.guesses = {};
    room.guessesSubmittedCount = 0;
    room.stats = null;
    broadcastState(io, room);
  });

  // ── Disconnect handling ────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    // Host disconnect
    if (hostSockets.has(socket.id)) {
      const roomCode = hostSockets.get(socket.id);
      hostSockets.delete(socket.id);
      const room = getRoom(roomCode);
      if (room) {
        io.to(roomCode).emit("host_disconnected");
        scheduleRoomCleanup(roomCode);
      }
      return;
    }

    // Player disconnect — mark disconnected, remove after grace period
    for (const [roomCode, room] of getAllRooms()) {
      const player = room.players.find((p) => p.id === socket.id);
      if (!player) continue;

      player.connected = false;
      broadcastState(io, room);

      // Give the player 30 s to reconnect before removing them
      schedulePlayerDisconnect(player.sessionToken, () => {
        const r = getRoom(roomCode);
        if (!r) return;
        const idx = r.players.findIndex((p) => p.sessionToken === player.sessionToken);
        if (idx === -1 || r.players[idx].connected) return; // reconnected in time

        r.players.splice(idx, 1);
        if (r.players.length === 0) {
          scheduleRoomCleanup(roomCode);
        } else {
          broadcastState(io, r);
        }
      });
      break;
    }
  });
}

// ── Deferred player removal timers ────────────────────────────────────────────
const playerDisconnectTimers = new Map(); // sessionToken -> timeoutId

function schedulePlayerDisconnect(sessionToken, fn) {
  clearDisconnectTimer(sessionToken);
  playerDisconnectTimers.set(sessionToken, setTimeout(fn, 30_000));
}

function clearDisconnectTimer(sessionToken) {
  if (playerDisconnectTimers.has(sessionToken)) {
    clearTimeout(playerDisconnectTimers.get(sessionToken));
    playerDisconnectTimers.delete(sessionToken);
  }
}
