import { v4 as uuidv4 } from "uuid";

const rooms = new Map();

const ROOM_CLEANUP_DELAY_MS = 5 * 60 * 1000;
const cleanupTimers = new Map();

function generateRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code;
  do {
    code = Array.from({ length: 4 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");
  } while (rooms.has(code));
  return code;
}

export function createRoom(gameType) {
  const roomCode = generateRoomCode();
  const hostToken = uuidv4();

  rooms.set(roomCode, {
    roomCode,
    hostToken,
    gameType,
    phase: "lobby",
    players: [],
    currentPlayerIndex: 0,
    guesses: {},
    guessesSubmittedCount: 0,
    stats: null,
  });

  return { roomCode, hostToken };
}

export function getRoom(roomCode) {
  return rooms.get(roomCode) ?? null;
}

export function deleteRoom(roomCode) {
  rooms.delete(roomCode);
  clearCleanupTimer(roomCode);
}

export function scheduleRoomCleanup(roomCode) {
  clearCleanupTimer(roomCode);
  const timer = setTimeout(() => {
    rooms.delete(roomCode);
    cleanupTimers.delete(roomCode);
    console.log(`Room ${roomCode} cleaned up after inactivity.`);
  }, ROOM_CLEANUP_DELAY_MS);
  cleanupTimers.set(roomCode, timer);
}

export function getAllRooms() {
  return rooms;
}

export function clearCleanupTimer(roomCode) {
  const existing = cleanupTimers.get(roomCode);
  if (existing) {
    clearTimeout(existing);
    cleanupTimers.delete(roomCode);
  }
}
