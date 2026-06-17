import React from "react";

export default function GuessingPhase({ socket, roomCode, hostToken, gameState }) {
  const { players, currentPlayerIndex, guessesSubmittedCount } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const eligibleCount = players.length - 1;
  const allGuessed = guessesSubmittedCount >= eligibleCount;

  function handleAdvance() {
    socket.emit("advance_to_results", { roomCode, hostToken });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cloud to-butter-100 flex flex-col items-center justify-center p-8">

      <div className="text-center mb-8">
        <p className="text-slate-500 font-bold text-lg uppercase tracking-widest mb-1">
          Player {currentPlayerIndex + 1} of {players.length}
        </p>
        <h1 className="text-6xl font-black text-slate-800">
          {currentPlayer.name}
        </h1>
        <p className="text-slate-500 text-xl mt-2 font-semibold">Which one is the lie?</p>
      </div>

      {/* Statements */}
      <div className="grid gap-4 w-full max-w-2xl mb-10">
        {currentPlayer.statements.map((s, i) => (
          <div key={s.id} className="card flex items-start gap-4">
            <span className="w-10 h-10 rounded-full bg-butter-300 flex items-center justify-center font-black text-slate-700 text-lg flex-shrink-0">
              {i + 1}
            </span>
            <p className="text-xl font-semibold text-slate-700 leading-snug pt-1">{s.text}</p>
          </div>
        ))}
      </div>

      {/* Guess tracker */}
      <div className="card w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="font-black text-slate-700 text-lg">Guesses</p>
          <span className="text-2xl font-black text-slate-800">
            {guessesSubmittedCount} / {eligibleCount}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: eligibleCount }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full transition-all duration-300 ${
                i < guessesSubmittedCount
                  ? "bg-butter-400 scale-110"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleAdvance}
        className={`btn-secondary text-lg px-12 py-3 ${allGuessed ? "opacity-100" : "opacity-70"}`}
      >
        {allGuessed ? "Reveal Answers →" : "Reveal Early (override)"}
      </button>
    </div>
  );
}
