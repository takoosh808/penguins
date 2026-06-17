import React, { useEffect, useReducer } from "react";
import socket from "./socket.js";
import JoinRoom from "./screens/JoinRoom.jsx";
import InputStatements from "./screens/InputStatements.jsx";
import Waiting from "./screens/Waiting.jsx";
import GuessScreen from "./screens/GuessScreen.jsx";
import ResultsScreen from "./screens/ResultsScreen.jsx";

const initialState = {
  screen: "join",
  roomCode: null,
  sessionToken: null,
  playerName: null,
  gameState: null,
  submissionProgress: null,
  connected: false,
  hostLeft: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "CONNECTED":    return { ...state, connected: true, hostLeft: false };
    case "DISCONNECTED": return { ...state, connected: false };
    case "HOST_LEFT":    return { ...state, hostLeft: true };
    case "JOINED":
      return { ...state, roomCode: action.roomCode, sessionToken: action.sessionToken, playerName: action.playerName };
    case "SESSION_TOKEN":
      return { ...state, sessionToken: action.sessionToken };
    case "STATE_UPDATE":
      return { ...state, gameState: action.gameState, screen: deriveScreen({ ...state, sessionToken: state.sessionToken }, action.gameState) };
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

    socket.on("connect",    () => dispatch({ type: "CONNECTED" }));
    socket.on("disconnect", () => dispatch({ type: "DISCONNECTED" }));

    socket.on("joined_room", ({ roomCode, sessionToken }) => {
      dispatch({ type: "SESSION_TOKEN", sessionToken });
    });

    socket.on("state_update", (gameState) => {
      dispatch({ type: "STATE_UPDATE", gameState });
    });

    socket.on("submission_progress", (progress) => {
      dispatch({ type: "SUBMISSION_PROGRESS", progress });
    });

    socket.on("host_disconnected", () => {
      dispatch({ type: "HOST_LEFT" });
    });

    return () => socket.disconnect();
  }, []);

  const { screen, roomCode, sessionToken, gameState, submissionProgress, connected, hostLeft } = state;

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-5xl mb-4 animate-pulse">📡</p>
          <p className="text-slate-500 font-bold text-lg">Reconnecting...</p>
        </div>
      </div>
    );
  }

  if (hostLeft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-5xl mb-4">😢</p>
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

  if (screen === "join")    return <JoinRoom socket={socket} dispatch={dispatch} />;
  if (screen === "input")   return <InputStatements socket={socket} roomCode={roomCode} sessionToken={sessionToken} />;
  if (screen === "waiting") return <Waiting progress={submissionProgress} gameState={gameState} />;
  if (screen === "guess")   return <GuessScreen socket={socket} roomCode={roomCode} sessionToken={sessionToken} gameState={gameState} />;
  if (screen === "results") return <ResultsScreen gameState={gameState} sessionToken={sessionToken} />;
  return null;
}
