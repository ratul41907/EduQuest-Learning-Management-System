import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function QuizResult() {
  const { state } = useLocation();
  const attempt = state?.result?.attempt;

  if (!attempt) return <div className="p-10 text-center"><Link to="/">Return Home</Link></div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className={`text-6xl mb-4`}>{attempt.passed ? "🎉" : "❌"}</div>
        <h1 className="text-3xl font-bold mb-2">{attempt.passed ? "Passed!" : "Try Again"}</h1>
        <p className="text-gray-500 mb-6">{state.title}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Score</p>
            <p className="text-2xl font-bold">{attempt.score}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Percentage</p>
            <p className="text-2xl font-bold">{attempt.percent}%</p>
          </div>
        </div>

        <Link to="/student-dashboard" className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold mb-3">Dashboard</Link>
        <Link to={`/courses`} className="text-blue-600 font-medium">Browse More Courses</Link>
      </div>
    </div>
  );
}