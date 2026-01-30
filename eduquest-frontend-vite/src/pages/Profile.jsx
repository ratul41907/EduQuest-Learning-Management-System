// Path: src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

function calcNextLevelInfo(totalPoints) {
  const points = Number(totalPoints || 0);
  const level = Math.floor(points / 100) + 1;
  const currentLevelStart = (level - 1) * 100;
  const nextLevelAt = level * 100;
  const progress = points - currentLevelStart;
  const toNext = nextLevelAt - points;
  const percent = Math.round((progress / 100) * 100);
  return { level, progress, toNext, percent, nextLevelAt };
}

export default function Profile() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setError("");
        const res = await api.get("/api/auth/me");
        setMe(res.data.user);
      } catch (e) {
        setError(e?.response?.data?.message || e.message);
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-3">Profile</h1>
        <div className="p-3 border rounded bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-sm text-gray-700 mt-2">
            Fix: Login first so token is saved in localStorage.
          </p>
        </div>
      </div>
    );
  }

  if (!me) return <div className="max-w-3xl mx-auto p-4">Loading...</div>;

  const { level, progress, toNext, percent, nextLevelAt } = calcNextLevelInfo(me.totalPoints);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="border rounded p-4 bg-white space-y-2">
        <div className="text-lg font-semibold">{me.fullName}</div>
        <div className="text-sm text-gray-600">{me.email}</div>
        <div className="text-sm">Role: <b>{me.role}</b></div>

        <hr className="my-3" />

        <div className="text-sm">
          Total Points: <b>{me.totalPoints}</b>
        </div>
        <div className="text-sm">
          Level: <b>{me.level}</b> (Calculated Level: <b>{level}</b>)
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress to next level</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded">
            <div
              className="h-3 bg-gray-900 rounded"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {progress}/100 points • {toNext} points left (Next level at {nextLevelAt})
          </div>
        </div>
      </div>
    </div>
  );
}
