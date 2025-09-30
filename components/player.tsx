"use client";
import React, { useEffect, useState } from "react";

export default function Player({ trackKey }: { trackKey: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadUrl() {
      const resp = await fetch(`/api/play?key=${encodeURIComponent(trackKey)}`);
      const data = await resp.json();
      setUrl(data.url);
    }
    loadUrl();
  }, [trackKey]);

  return (
    <div className="p-4">
      {url ? (
        <audio controls src={url} className="w-full" />
      ) : (
        <p>Cargando pista...</p>
      )}
    </div>
  );
}