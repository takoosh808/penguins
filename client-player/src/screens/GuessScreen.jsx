import React, { useState } from "react";

export default function GuessScreen({ socket, roomCode, sessionToken, gameState }) {
  const { players, currentPlayerIndex } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const [guesses, setGuesses] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function toggle(stmtId, label) {
    setGuesses((prev) => ({ ...prev, [stmtId]: label }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    socket.emit("submit_guess", { roomCode, sessionToken, guesses });
    setSubmitted(true);
  }

  const allGuessed = currentPlayer.statements.every((s) => guesses[s.id]);

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cloud to-butter-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-5xl mb-4">🤞</p>
        <h1 className="text-3xl font-black text-slate-800">Guesses locked in!</h1>
        <p className="text-slate-500 font-semibold mt-2">Waiting for the reveal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-cloud to-butter-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-1">
            Guess the lie
          </p>
          <h1 className="text-3xl font-black text-slate-800">{currentPlayer.name}</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {currentPlayer.statements.map((s, i) => (
            <div key={s.id} className="card border-2 border-transparent">
              <p className="font-semibold text-slate-700 text-sm mb-3 leading-snug">
                <span className="text-slate-400 font-black mr-2">{i + 1}.</span>
                {s.text}
              </p>
              <div className="flex gap-2">
                {["truth", "lie"].map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggle(s.id, label)}
                    className={`flex-1 py-2 rounded-2xl text-sm font-black transition-all duration-150 ${
                      guesses[s.id] === label
                        ? label === "truth"
                          ? "bg-sky-300 text-sky-800 shadow-md scale-105"
                          : "bg-butter-400 text-slate-800 shadow-md scale-105"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {label === "truth" ? "✓ Truth" : "🤥 Lie"}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button type="submit" disabled={!allGuessed} className="btn-primary mt-2">
            Lock in Guesses →
          </button>
        </form>
      </div>
    </div>
  );
}
