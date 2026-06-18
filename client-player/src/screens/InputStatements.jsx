import React, { useState } from "react";

const empty = () => ({ text: "", isLie: false });

export default function InputStatements({ socket, roomCode, sessionToken }) {
  const [statements, setStatements] = useState([empty(), empty(), empty()]);
  const [submitted, setSubmitted] = useState(false);

  function update(index, field, value) {
    setStatements((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  function handleLieToggle(index) {
    setStatements((prev) =>
      prev.map((s, i) => ({ ...s, isLie: i === index }))
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    socket.emit("submit_statements", { roomCode, sessionToken, statements });
    setSubmitted(true);
  }

  const lieCount = statements.filter((s) => s.isLie).length;
  const allFilled = statements.every((s) => s.text.trim().length > 0);
  const valid = allFilled && lieCount === 1;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-slate-800">Submitted!</h1>
        <p className="text-slate-500 font-semibold mt-2">Waiting for everyone else...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-800">Your Statements</h1>
          <p className="text-slate-500 font-semibold mt-1 text-sm">
            Write 2 truths and 1 lie — tap the star to mark your lie
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {statements.map((s, i) => (
            <div
              key={i}
              className={`card flex items-start gap-3 border-2 transition-colors ${
                s.isLie ? "border-butter-400 bg-butter-50" : "border-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => handleLieToggle(i)}
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all mt-0.5 ${
                  s.isLie
                    ? "bg-butter-400 text-white shadow-md scale-110"
                    : "bg-slate-100 text-slate-400"
                }`}
                title="Mark as lie"
              >
                LIE
              </button>
              <textarea
                className="input-field resize-none text-sm leading-snug"
                rows={2}
                placeholder={`Statement ${i + 1}`}
                value={s.text}
                onChange={(e) => update(i, "text", e.target.value)}
              />
            </div>
          ))}

          {lieCount !== 1 && allFilled && (
            <p className="text-center text-amber-600 text-sm font-semibold">
              Tap LIE to mark exactly one statement as your lie
            </p>
          )}

          <button type="submit" disabled={!valid} className="btn-primary mt-2">
            Submit →
          </button>
        </form>
      </div>
    </div>
  );
}
