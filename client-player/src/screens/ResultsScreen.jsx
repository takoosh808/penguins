import React from "react";

export default function ResultsScreen({ gameState, sessionToken }) {
  const { players, currentPlayerIndex, guesses, phase, stats } = gameState;

  if (phase === "final_stats") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="text-3xl font-black text-slate-800">Game Over!</h1>
        <p className="text-slate-500 font-semibold mt-2">Check the big screen for the final stats</p>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const me = players.find((p) => p.sessionToken === sessionToken);
  const myGuesses = me ? guesses[me.id] : null;

  const correctCount = myGuesses
    ? currentPlayer.statements.filter((s) => {
        const correct = s.isLie ? "lie" : "truth";
        return myGuesses[s.id] === correct;
      }).length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">Results</p>
          <h1 className="text-3xl font-black text-slate-800">{currentPlayer.name}</h1>
          {myGuesses && (
            <p className="text-slate-500 font-semibold mt-1 text-sm">
              You got <span className="text-slate-800 font-black">{correctCount} / 3</span> correct
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {currentPlayer.statements.map((s, i) => {
            const correct = s.isLie ? "lie" : "truth";
            const myGuess = myGuesses?.[s.id];
            const wasRight = myGuess === correct;

            return (
              <div
                key={s.id}
                className={`card border-2 ${
                  s.isLie ? "border-butter-400 bg-butter-50" : "border-sky-200 bg-sky-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-700 leading-snug flex-1">
                    <span className="text-slate-400 font-black mr-1">{i + 1}.</span>
                    {s.text}
                  </p>
                  <span className={`flex-shrink-0 text-xs font-black px-2 py-1 rounded-full ${
                    s.isLie ? "bg-butter-400 text-slate-800" : "bg-sky-200 text-sky-700"
                  }`}>
                    {s.isLie ? "🤥 LIE" : "✓ TRUTH"}
                  </span>
                </div>
                {myGuess && (
                  <p className={`text-xs font-bold mt-1 ${wasRight ? "text-green-600" : "text-red-500"}`}>
                    {wasRight ? "✓ You got it!" : `✗ You guessed ${myGuess}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-400 text-sm font-semibold animate-pulse">
          Waiting for host to continue...
        </p>
      </div>
    </div>
  );
}
