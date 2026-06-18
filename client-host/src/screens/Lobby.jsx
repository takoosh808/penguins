import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function Lobby({ socket, roomCode, hostToken, gameState, onBack }) {
  const canvasRef = useRef(null);
  const isProd = import.meta.env.PROD;
  const joinUrl = isProd
    ? `${window.location.origin}/play?room=${roomCode}`
    : `${window.location.protocol}//${window.location.hostname}:5174?room=${roomCode}`;
  const players = gameState?.players ?? [];
  const phase = gameState?.phase ?? "lobby";

  useEffect(() => {
    if (canvasRef.current && roomCode) {
      QRCode.toCanvas(canvasRef.current, joinUrl, {
        width: 180,
        margin: 2,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
    }
  }, [roomCode, joinUrl]);

  function handleStart() {
    socket.emit("start_game", { roomCode, hostToken });
  }

  function handleBack() {
    socket.emit("close_room", { roomCode, hostToken });
    onBack();
  }

  const canStart = players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-8">

      {/* Back button */}
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Game Select
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-slate-500 font-bold text-lg uppercase tracking-widest mb-1">Two Truths, One Lie</p>
        <h1 className="text-7xl font-black text-slate-800 tracking-tight">
          {phase === "input" ? "Get Ready!" : "Join the Room"}
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl items-start justify-center">

        {/* QR + code card */}
        <div className="card flex flex-col items-center gap-4 min-w-64">
          <canvas ref={canvasRef} className="rounded-2xl" />
          <div className="text-center">
            <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-1">Room Code</p>
            <p className="text-5xl font-black text-slate-800 tracking-widest">{roomCode}</p>
          </div>
          <p className="text-slate-400 text-xs text-center break-all">{joinUrl}</p>
        </div>

        {/* Player list card */}
        <div className="card flex-1 min-w-72">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-700">Players</h2>
            <span className="bg-sky-200 text-sky-700 text-sm font-bold px-3 py-1 rounded-full">
              {players.length} joined
            </span>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-semibold">Waiting for players to join...</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {players.map((p) => (
                <li key={p.id} className="flex items-center gap-3 bg-sky-50 rounded-2xl px-4 py-3">
                  <span className="w-8 h-8 rounded-full bg-butter-300 flex items-center justify-center text-sm font-black text-slate-700">
                    {p.name[0].toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-700">{p.name}</span>
                </li>
              ))}
            </ul>
          )}

          {phase === "input" && (
            <div className="mt-4 p-3 bg-butter-100 rounded-2xl text-center">
              <p className="text-slate-600 font-semibold text-sm">
                Players are now entering their statements...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Start button */}
      {phase === "lobby" && (
        <div className="mt-10 flex flex-col items-center gap-2">
          <button onClick={handleStart} disabled={!canStart} className="btn-primary text-xl px-16 py-4">
            Start Game
          </button>
          {!canStart && (
            <p className="text-slate-400 text-sm font-medium">Need at least 2 players to start</p>
          )}
        </div>
      )}
    </div>
  );
}
