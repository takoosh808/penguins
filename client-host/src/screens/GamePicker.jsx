import React from "react";

const games = [
  {
    id: "twoTruths",
    name: "Two Truths, One Lie",
    description: "Everyone submits 2 truths and 1 lie. Can your group spot the bluff?",
    emoji: "🤥",
    active: true,
  },
  {
    id: "wouldYouRather",
    name: "Would You Rather",
    description: "Coming soon",
    emoji: "🤔",
    active: false,
  },
  {
    id: "hotTakes",
    name: "Hot Takes",
    description: "Coming soon",
    emoji: "🔥",
    active: false,
  },
];

export default function GamePicker({ socket }) {
  function handleSelect(gameId) {
    socket.emit("create_room", { gameType: gameId });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-butter-100 via-cloud to-sky-100 flex flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black text-slate-800 tracking-tight mb-2">
          🐧 Icebreaker
        </h1>
        <p className="text-xl text-slate-500 font-semibold">Pick a game to get the party started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => game.active && handleSelect(game.id)}
            disabled={!game.active}
            className={`
              card text-left transition-all duration-200 group
              ${game.active
                ? "hover:shadow-xl hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-butter-400"
                : "opacity-50 cursor-not-allowed"
              }
            `}
          >
            <div className="text-5xl mb-4">{game.emoji}</div>
            <h2 className="text-xl font-black text-slate-800 mb-2 leading-tight">{game.name}</h2>
            <p className="text-slate-500 text-sm font-medium">{game.description}</p>
            {game.active && (
              <div className="mt-4 inline-block bg-butter-400 text-slate-800 text-sm font-bold px-4 py-1.5 rounded-full group-hover:bg-butter-500 transition-colors">
                Open Lobby →
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
