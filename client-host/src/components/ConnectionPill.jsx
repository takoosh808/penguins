import React, { useState, useEffect } from "react";

export default function ConnectionPill({ socket }) {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [socket]);

  if (connected) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-300 text-red-600 text-sm font-bold px-4 py-2 rounded-full shadow-md z-50">
      ⚠ Reconnecting...
    </div>
  );
}
