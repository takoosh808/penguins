export function computeStats(room) {
  const { players, guesses } = room;

  // guesses shape: { [guesserId]: { [statementId]: "truth" | "lie" } }
  // Build a map: statementId -> { player, statement, incorrectCount }
  const statMap = new Map();

  for (const player of players) {
    for (const stmt of player.statements) {
      statMap.set(stmt.id, {
        player,
        statement: stmt,
        incorrectCount: 0,
      });
    }
  }

  for (const [_guesserId, guessMap] of Object.entries(guesses)) {
    for (const [stmtId, guessedLabel] of Object.entries(guessMap)) {
      const entry = statMap.get(stmtId);
      if (!entry) continue;
      const correct = entry.statement.isLie ? "lie" : "truth";
      if (guessedLabel !== correct) {
        entry.incorrectCount++;
      }
    }
  }

  const allEntries = [...statMap.values()];
  const lieEntries = allEntries.filter((e) => e.statement.isLie);

  const mostMysterious = allEntries.reduce((a, b) =>
    b.incorrectCount > a.incorrectCount ? b : a
  );

  const easiestRead = allEntries.reduce((a, b) =>
    b.incorrectCount < a.incorrectCount ? b : a
  );

  const bestBluffer = lieEntries.reduce((a, b) =>
    b.incorrectCount > a.incorrectCount ? b : a
  );

  const mostPredictable = lieEntries.reduce((a, b) =>
    b.incorrectCount < a.incorrectCount ? b : a
  );

  return {
    mostMysterious: {
      playerName: mostMysterious.player.name,
      statementText: mostMysterious.statement.text,
      incorrectCount: mostMysterious.incorrectCount,
    },
    easiestRead: {
      playerName: easiestRead.player.name,
      statementText: easiestRead.statement.text,
      incorrectCount: easiestRead.incorrectCount,
    },
    bestBluffer: {
      playerName: bestBluffer.player.name,
      statementText: bestBluffer.statement.text,
      incorrectCount: bestBluffer.incorrectCount,
    },
    mostPredictable: {
      playerName: mostPredictable.player.name,
      statementText: mostPredictable.statement.text,
      incorrectCount: mostPredictable.incorrectCount,
    },
  };
}
