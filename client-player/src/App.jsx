import React, { useEffect, useReducer } from "react";
import socket from "./socket.js";
import JoinRoom from "./screens/JoinRoom.jsx";
import InputStatements from "./screens/InputStatements.jsx";
import Waiting from "./screens/Waiting.jsx";
import GuessScreen from "./screens/GuessScreen.jsx";
import ResultsScreen from "./screens/ResultsScreen.jsx";

const SESSION_KEY = "ib_player_session";

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
function saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

const initialState = {
  screen: "join",
  roomCode: null,
  sessionToken: null,
  playerName: null,
  gameState: null,
  submissionProgress: null,
  connected: false,
  hostLeft: false,
  rejoining: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "CONNECTED":    return { ...state, connected: true, hostLeft: false };
    case "DISCONNECTED": return { ...state, connected: false };
    case "HOST_LEFT":    return { ...state, hostLeft: true };
    case "REJOINING":    return { ...state, rejoining: true };
    case "JOINED":
      return { ...state, roomCode: action.roomCode, sessionToken: action.sessionToken, playerName: action.playerName, rejoining: false };
    case "SESSION_TOKEN":
      return { ...state, sessionToken: action.sessionToken, rejoining: false };
    case "STATE_UPDATE":
      return { ...state, gameState: action.gameState, rejoining: false, screen: deriveScreen({ ...state, sessionToken: action.sessionToken ?? state.sessionToken }, action.gameState) };
    case "SUBMISSION_PROGRESS":
      return { ...state, submissionProgress: action.progress };
    default:
      return state;
  }
}

function deriveScreen(state, gameState) {
  const { phase, players, currentPlayerIndex } = gameState;
  const sessionToken = state.sessionToken;

  if (phase === "lobby") return sessionToken ? "waiting" : "join";

  if (phase === "input") {
    const me = players.find((p) => p.sessionToken === sessionToken);
    return me?.hasSubmittedStatements ? "waiting" : "input";
  }

  if (phase === "guessing") {
    const currentTarget = players[currentPlayerIndex];
    const me = players.find((p) => p.sessionToken === sessionToken);
    if (!me || me.id === currentTarget?.id) return "waiting";
    if (state.screen === "waiting" && gameState.guesses?.[me.id]) return "waiting";
    return "guess";
  }

  if (phase === "results")     return "results";
  if (phase === "final_stats") return "results";
  return "join";
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      dispatch({ type: "CONNECTED" });

      // Attempt to restore session on every (re)connect
      const saved = loadSession();
      if (saved?.sessionToken && saved?.roomCode) {
        dispatch({ type: "REJOINING" });
        socket.emit("rejoin_room", { roomCode: saved.roomCode, sessionToken: saved.sessionToken });
      }
    });

    socket.on("disconnect", () => dispatch({ type: "DISCONNECTED" }));

    socket.on("joined_room", ({ roomCode, sessionToken }) => {
      dispatch({ type: "SESSION_TOKEN", sessionToken });
      // Merge with any existing saved name
      const saved = loadSession();
      saveSession({ roomCode, sessionToken, playerName: saved?.playerName ?? null });
    });

    socket.on("state_update", (gameState) => {
      dispatch({ type: "STATE_UPDATE", gameState });
    });

    socket.on("submission_progress", (progress) => {
      dispatch({ type: "SUBMISSION_PROGRESS", progress });
    });

    socket.on("host_disconnected", () => {
      clearSession();
      dispatch({ type: "HOST_LEFT" });
    });

    socket.on("error", ({ message }) => {
      // If rejoin failed (room expired), clear saved session and show join screen
      if (message.includes("expired") || message.includes("not found")) {
        clearSession();
        dispatch({ type: "DISCONNECTED" }); // trigger a re-render back to join
      }
    });

    return () => socket.disconnect();
  }, []);

  const { screen, roomCode, sessionToken, gameState, submissionProgress, connected, hostLeft, rejoining } = state;

  // Overlay shown only when we lose connection mid-game (not on initial load)
  const showReconnecting = !connected && (screen !== "join" || rejoining);

  if (hostLeft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Host left the game</h1>
          <p className="text-slate-500 font-semibold mt-2">The room has been closed.</p>
          <button
            className="btn-primary mt-6 w-auto px-10"
            onClick={() => window.location.reload()}
          >
            Back to Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showReconnecting && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-3xl px-8 py-6 text-center shadow-xl">
            <p className="text-slate-700 font-bold text-lg">
              {rejoining ? "Reconnecting…" : "Connection lost…"}
            </p>
            <p className="text-slate-400 text-sm mt-1">Hang tight, trying to get you back in</p>
          </div>
        </div>
      )}

      {screen === "join"    && <JoinRoom socket={socket} dispatch={dispatch} saveSession={saveSession} />}
      {screen === "input"   && <InputStatements socket={socket} roomCode={roomCode} sessionToken={sessionToken} />}
      {screen === "waiting" && <Waiting progress={submissionProgress} gameState={gameState} />}
      {screen === "guess"   && <GuessScreen socket={socket} roomCode={roomCode} sessionToken={sessionToken} gameState={gameState} />}
      {screen === "results" && <ResultsScreen gameState={gameState} sessionToken={sessionToken} />}
    </div>
  );
}
