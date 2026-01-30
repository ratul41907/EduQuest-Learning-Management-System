import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../lib/api";

export default function QuizList() {
  const { courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get(`/api/quizzes/course/${courseId}`);
        setQuizzes(res.data || []);
      } catch (e) {
        setErr("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Course Quizzes</h1>
      {loading && <p>Loading quizzes...</p>}
      {err && <p className="text-red-500">{err}</p>}
      <div className="grid gap-4">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white border p-6 rounded-xl shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{q.title}</h2>
              <p className="text-gray-500">Pass Score: {q.passScore}% | Time: {q.timeLimit}s</p>
            </div>
            <Link to={`/quizzes/${q.id}`} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Start</Link>
          </div>
        ))}
      </div>
    </div>
  );
}