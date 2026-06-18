import React from "react";

export default function ResultsPhase({ socket, roomCode, hostToken, gameState }) {
  const { players, currentPlayerIndex, guesses } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const isLast = currentPlayerIndex === players.length - 1;

  // Build vote counts per statement
  const voteCounts = {};
  for (const stmt of currentPlayer.statements) {
    voteCounts[stmt.id] = { truth: 0, lie: 0 };
  }
  for (const guessMap of Object.values(guesses)) {
    for (const [stmtId, label] of Object.entries(guessMap)) {
      if (voteCounts[stmtId]) voteCounts[stmtId][label]++;
    }
  }

  const totalVoters = players.length - 1;

  function handleNext() {
    socket.emit("next_player", { roomCode, hostToken });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-8">

      <div className="text-center mb-8">
        <p className="text-slate-500 font-bold text-lg uppercase tracking-widest mb-1">Results</p>
        <h1 className="text-6xl font-black text-slate-800">{currentPlayer.name}</h1>
      </div>

      <div className="grid gap-5 w-full max-w-2xl mb-10">
        {currentPlayer.statements.map((s, i) => {
          const votes = voteCounts[s.id] ?? { truth: 0, lie: 0 };
          const lieVotes = votes.lie;
          const truthVotes = votes.truth;
          const total = totalVoters || 1;
          const liePercent = Math.round((lieVotes / total) * 100);

          return (
            <div
              key={s.id}
              className={`card border-2 ${s.isLie ? "border-butter-400 bg-butter-50" : "border-sky-200"}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600 flex-shrink-0">
                  {i + 1}
                </span>
                <p className="text-lg font-semibold text-slate-700 leading-snug">{s.text}</p>
                <span className={`ml-auto flex-shrink-0 text-sm font-black px-3 py-1 rounded-full ${
                  s.isLie
                    ? "bg-butter-400 text-white"
                    : "bg-sky-200 text-sky-700"
                }`}>
                  {s.isLie ? "LIE" : "TRUTH"}
                </span>
              </div>

              {/* Vote bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Truth ({truthVotes})</span>
                  <span>Lie ({lieVotes})</span>
                </div>
                <div className="h-3 bg-sky-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-butter-400 rounded-full transition-all duration-700"
                    style={{ width: `${liePercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleNext} className="btn-primary text-xl px-16 py-4">
        {isLast ? "See Final Stats →" : "Next Player →"}
      </button>
    </div>
  );
}
