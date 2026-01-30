// Path: src/pages/Badges.jsx
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Badges() {
  const [allBadges, setAllBadges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const [allRes, myRes] = await Promise.all([
          api.get("/api/badges"),
          api.get("/api/badges/my"),
        ]);
        setAllBadges(allRes.data || []);
        setMyBadges(myRes.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      }
    }
    load();
  }, []);

  const earnedCodes = new Set(myBadges.map((x) => x.badge.code));

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Badges</h1>

      {error && (
        <div className="p-3 mb-4 border rounded bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Earned */}
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3">My Earned Badges</h2>
          {myBadges.length === 0 ? (
            <p className="text-sm text-gray-600">
              No badges earned yet. Pass a quiz to earn badges.
            </p>
          ) : (
            <ul className="space-y-2">
              {myBadges.map((b) => (
                <li key={b.id} className="border rounded p-3">
                  <div className="font-semibold">{b.badge.name}</div>
                  <div className="text-sm text-gray-600">{b.badge.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Code: {b.badge.code} • Bonus: +{b.badge.pointsBonus} • Awarded:{" "}
                    {new Date(b.awardedAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* All */}
        <div className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-3">All Badges</h2>
          {allBadges.length === 0 ? (
            <p className="text-sm text-gray-600">No badges found in DB.</p>
          ) : (
            <ul className="space-y-2">
              {allBadges.map((b) => {
                const earned = earnedCodes.has(b.code);
                return (
                  <li key={b.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{b.name}</div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          earned ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        {earned ? "Earned" : "Locked"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{b.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Code: {b.code} • Bonus: +{b.pointsBonus}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
