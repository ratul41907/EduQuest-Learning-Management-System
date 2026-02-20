import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

export default function Reviews() {
  const { id: courseId } = useParams();
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setMsg("");
        const res = await api.get(`/api/reviews/course/${courseId}`);
        setData(res.data);
      } catch (e) {
        console.error(e);
        setMsg(e?.response?.data?.message || "Failed to load reviews.");
      }
    }
    load();
  }, [courseId]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link to={`/courses/${courseId}`} className="text-indigo-600 font-bold hover:underline">
        ← Back to Course
      </Link>

      <h1 className="text-2xl font-black mt-4 mb-2">Course Reviews</h1>

      {msg && <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{msg}</div>}

      {!data ? (
        <p className="mt-4 text-gray-500">Loading...</p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="p-4 rounded border bg-white">
            <div className="font-bold">Avg Rating: {data.avgRating} ⭐</div>
            <div className="text-gray-600">Total: {data.count}</div>
          </div>

          {data.reviews?.length ? (
            data.reviews.map((r) => (
              <div key={r.id} className="p-4 rounded border bg-white">
                <div className="font-bold">
                  {r.user?.fullName || "Anonymous"} — {r.rating} ⭐
                </div>
                <div className="text-gray-700 mt-1">{r.comment || "(No comment)"}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
