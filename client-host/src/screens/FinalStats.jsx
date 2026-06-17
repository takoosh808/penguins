import React from "react";

const statCards = [
  {
    key: "mostMysterious",
    label: "Most Mysterious",
    emoji: "🔮",
    bg: "bg-sky-100",
    border: "border-sky-300",
    badge: "bg-sky-200 text-sky-700",
    desc: (s) => `fooled ${s.incorrectCount} ${s.incorrectCount === 1 ? "person" : "people"}`,
  },
  {
    key: "easiestRead",
    label: "Easiest Read",
    emoji: "📖",
    bg: "bg-butter-50",
    border: "border-butter-300",
    badge: "bg-butter-300 text-slate-700",
    desc: (s) => `only fooled ${s.incorrectCount} ${s.incorrectCount === 1 ? "person" : "people"}`,
  },
  {
    key: "bestBluffer",
    label: "Best Bluffer",
    emoji: "🃏",
    bg: "bg-sky-50",
    border: "border-sky-200",
    badge: "bg-sky-200 text-sky-700",
    desc: (s) => `lie fooled ${s.incorrectCount} ${s.incorrectCount === 1 ? "person" : "people"}`,
  },
  {
    key: "mostPredictable",
    label: "Most Predictable",
    emoji: "😅",
    bg: "bg-butter-50",
    border: "border-butter-200",
    badge: "bg-butter-200 text-slate-700",
    desc: (s) => `lie only fooled ${s.incorrectCount} ${s.incorrectCount === 1 ? "person" : "people"}`,
  },
];

export default function FinalStats({ socket, roomCode, hostToken, gameState }) {
  const { stats } = gameState;

  function handlePlayAgain() {
    socket.emit("play_again", { roomCode, hostToken });
  }
  function handleEnd() {
    socket.emit("end_game", { roomCode, hostToken });
  }

  if (!stats) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400 text-xl font-semibold animate-pulse">Calculating stats...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-10">
        <p className="text-4xl mb-2">🎉</p>
        <h1 className="text-6xl font-black text-slate-800">Final Stats</h1>
        <p className="text-slate-500 text-xl mt-2 font-semibold">Here's how everyone did</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mb-10">
        {statCards.map(({ key, label, emoji, bg, border, badge, desc }) => {
          const s = stats[key];
          return (
            <div key={key} className={`card border-2 ${border} ${bg}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{emoji}</span>
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${badge}`}>
                  {label}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-800 mb-1">{s.playerName}</p>
              <p className="text-slate-500 text-sm font-medium italic mb-2">"{s.statementText}"</p>
              <p className="text-slate-400 text-xs font-semibold">{desc(s)}</p>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button onClick={handlePlayAgain} className="btn-primary text-lg px-10 py-3">
          Play Again
        </button>
        <button onClick={handleEnd} className="btn-secondary text-lg px-10 py-3">
          Back to Games
        </button>
      </div>
    </div>
  );
}
