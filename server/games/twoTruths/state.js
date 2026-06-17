import { computeStats } from "./stats.js";

export function resetGameState(room) {
  room.phase = "input";
  room.currentPlayerIndex = 0;
  room.guesses = {};
  room.guessesSubmittedCount = 0;
  room.stats = null;
  for (const player of room.players) {
    player.statements = [];
    player.hasSubmittedStatements = false;
  }
}

export function allStatementsSubmitted(room) {
  return room.players.length > 0 && room.players.every((p) => p.hasSubmittedStatements);
}

export function advanceToFinalStats(room) {
  room.stats = computeStats(room);
  room.phase = "final_stats";
}
