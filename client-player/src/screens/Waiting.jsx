import React from "react";

export default function Waiting({ progress, gameState }) {
  const phase = gameState?.phase;
  const players = gameState?.players ?? [];
  const currentPlayerIndex = gameState?.currentPlayerIndex ?? 0;
  const currentPlayer = players[currentPlayerIndex];

  if (phase === "guessing" && currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cloud to-butter-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-6xl mb-4">😎</p>
        <h1 className="text-3xl font-black text-slate-800">This round is about you!</h1>
        <p className="text-slate-500 font-semibold mt-2">
          Sit back and watch everyone try to spot your lie
        </p>
      </div>
    );
  }

  const submittedCount = progress?.submittedCount ?? 0;
  const totalCount = progress?.totalCount ?? players.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-6 text-center">
      <p className="text-6xl mb-4 animate-bounce">⏳</p>
      <h1 className="text-3xl font-black text-slate-800">Hang tight!</h1>
      <p className="text-slate-500 font-semibold mt-2 mb-6">
        {phase === "lobby" ? "Waiting for the host to start..." : "Waiting for everyone to submit..."}
      </p>

      {totalCount > 0 && phase !== "lobby" && (
        <div className="flex gap-2 justify-center flex-wrap">
          {Array.from({ length: totalCount }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-all duration-300 ${
                i < submittedCount ? "bg-butter-400 scale-110" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
