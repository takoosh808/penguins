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

  // Show a small reconnecting banner instead of blocking the full screen
  const reconnectBanner = !connected && (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-slate-800/90 text-white text-sm font-bold py-2 px-4">
      <span className="animate-pulse">📡</span> Reconnecting to server…
    </div>
  );

  return (
    <>
      {reconnectBanner}
      {screen === "picker"      && <><ConnectionPill socket={socket} /><GamePicker socket={socket} connected={connected} /></>}
      {screen === "lobby"       && <Lobby socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />}
      {screen === "guessing"    && <GuessingPhase socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />}
      {screen === "results"     && <ResultsPhase socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />}
      {screen === "final_stats" && <FinalStats socket={socket} roomCode={roomCode} hostToken={hostToken} gameState={gameState} />}
    </>
  );
}
