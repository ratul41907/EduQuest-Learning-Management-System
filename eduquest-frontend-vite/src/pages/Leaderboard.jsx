import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Leaderboard() {
  const [mode, setMode] = useState("all-time"); 
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const url =
        mode === "weekly"
          ? `${API_BASE}/api/leaderboard/weekly`
          : `${API_BASE}/api/leaderboard/all-time`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load leaderboard");

      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(String(e.message || e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [mode]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded border ${mode === "all-time" ? "bg-black text-white" : "bg-white"}`}
            onClick={() => setMode("all-time")}
          >
            All-time
          </button>
          <button
            className={`px-4 py-2 rounded border ${mode === "weekly" ? "bg-black text-white" : "bg-white"}`}
            onClick={() => setMode("weekly")}
          >
            Weekly
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p className="text-red-600">Error: {err}</p>}

      {!loading && !err && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Level</th>
                {mode === "weekly" ? <th className="p-3">Weekly Points</th> : <th className="p-3">Total Points</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td className="p-3" colSpan={4}>No data yet.</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 font-medium">{r.rank}</td>
                    <td className="p-3">{r.fullName}</td>
                    <td className="p-3">{r.level}</td>
                    <td className="p-3 font-bold">{mode === "weekly" ? r.weeklyPoints : r.totalPoints}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}