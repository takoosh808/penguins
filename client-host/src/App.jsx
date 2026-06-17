import React, { useEffect, useReducer } from "react";
import socket from "./socket.js";
import GamePicker from "./screens/GamePicker.jsx";
import ConnectionPill from "./components/ConnectionPill.jsx";
import Lobby from "./screens/Lobby.jsx";
import GuessingPhase from "./screens/GuessingPhase.jsx";
import ResultsPhase from "./screens/ResultsPhase.jsx";
import FinalStats from "./screens/FinalStats.jsx";

const initialState = {
  screen: "picker",
  roomCode: null,
  hostToken: null,
  gameState: null,
  connected: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "CONNECTED":    return { ...state, connected: true };
    case "DISCONNECTED": return { ...state, connected: false };
    case "ROOM_CREATED":
      return { ...state, screen: "lobby", roomCode: action.roomCode, hostToken: action.hostToken };
    case "STATE_UPDATE":
      return { ...state, gameState: action.gameState, screen: screenFromPhase(action.gameState.phase) };
    case "RESET":
      return { ...initialState, connected: state.connected };
    default:
      return state;
  }
}

function screenFromPhase(phase) {
  switch (phase) {
    case "lobby":       return "lobby";
    case "input":       return "lobby";
    case "guessing":    return "guessing";
    case "results":     return "results";
    case "final_stats": return "final_stats";
    default:            return "picker";
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    socket.connect();

    socket.on("connect",    () => dispatch({ type: "CONNECTED" }));
    socket.on("disconnect", () => dispatch({ type: "DISCONNECTED" }));

    socket.on("room_created", ({ roomCode, hostToken }) => {
      dispatch({ type: "ROOM_CREATED", roomCode, hostToken });
    });

    socket.on("state_update", (gameState) => {
      dispatch({ type: "STATE_UPDATE", gameState });
    });

    return () => socket.disconnect();
  }, []);

  const { screen, roomCode, hostToken, gameState, connected } = state;

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4 animate-spin">🐧</p>
          <p className="text-slate-500 font-bold text-lg">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (screen === "picker")     return <><ConnectionPill socket={socket} /><GamePicker socket={socket} /></>;
  if (screen === "lobby")      return <Lobby socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />;
  if (screen === "guessing")   return <GuessingPhase socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />;
  if (screen === "results")    return <ResultsPhase socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />;
  if (screen === "final_stats") return <FinalStats socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />;
  return null;
}
