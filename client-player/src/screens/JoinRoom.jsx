import React, { useState, useEffect } from "react";

export default function JoinRoom({ socket, dispatch }) {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("room");
    if (code) setRoomCode(code.toUpperCase());
  }, []);

  useEffect(() => {
    socket.on("error", ({ message }) => setError(message));
    return () => socket.off("error");
  }, []);

  function handleJoin(e) {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    setError(null);
    dispatch({ type: "JOINED", roomCode: roomCode.toUpperCase(), sessionToken: null, playerName: name.trim() });
    socket.emit("join_room", { roomCode: roomCode.toUpperCase(), name: name.trim() });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🐧</p>
          <h1 className="text-4xl font-black text-slate-800">Icebreaker</h1>
          <p className="text-slate-500 font-semibold mt-1">Join the game</p>
        </div>

        <form onSubmit={handleJoin} className="card flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Room Code
            </label>
            <input
              className="input-field text-2xl font-black tracking-widest text-center uppercase"
              placeholder="FIRE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Your Name
            </label>
            <input
              className="input-field"
              placeholder="Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>

          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={!name.trim() || roomCode.length < 4}
          >
            Join Game →
          </button>
        </form>
      </div>
    </div>
  );
}
