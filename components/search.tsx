"use client";
import { useState } from "react";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function handleSearch() {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
  }

  return (
    <div className="p-4">
      <input
        className="border p-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar canciones..."
      />
      <button className="ml-2 p-2 bg-blue-500 text-white" onClick={handleSearch}>
        Buscar
      </button>
      <ul>
        {results.map((track) => (
          <li key={track.id}>{track.title}</li>
        ))}
      </ul>
    </div>
  );
}