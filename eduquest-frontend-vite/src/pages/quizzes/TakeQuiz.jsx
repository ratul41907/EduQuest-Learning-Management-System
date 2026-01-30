import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getToken } from "../../lib/api";

export default function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [remaining, setRemaining] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await api.get(`/api/quizzes/${quizId}`);
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions?.length || 0).fill(""));
      if (res.data.timeLimit) setRemaining(res.data.timeLimit);
    }
    load();
  }, [quizId]);

  useEffect(() => {
    if (remaining === 0) handleSubmit(true);
    if (!remaining) return;
    const t = setInterval(() => setRemaining(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const handleSubmit = async (isAuto = false) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/api/quizzes/${quizId}/attempt`, {
        answers: answers.map(a => a.toUpperCase())
      });
      navigate(`/quizzes/${quizId}/result`, { state: { result: res.data, title: quiz.title } });
    } catch (e) { alert("Submission failed"); }
  };

  if (!quiz) return <p className="p-10 text-center">Loading Quiz...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {remaining !== null && (
          <div className={`text-2xl font-mono ${remaining < 30 ? 'text-red-500 animate-pulse' : ''}`}>
            {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      {quiz.questions.map((q, idx) => (
        <div key={q.id} className="mb-8 p-6 bg-white border rounded-xl shadow-sm">
          <p className="font-bold text-lg mb-4">{idx + 1}. {q.prompt}</p>
          {['optionA', 'optionB', 'optionC', 'optionD'].map((opt, i) => (
            <label key={opt} className="block p-3 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50">
              <input 
                type="radio" 
                name={`q${idx}`} 
                className="mr-3" 
                onChange={() => {
                  const newAns = [...answers];
                  newAns[idx] = ['A','B','C','D'][i];
                  setAnswers(newAns);
                }}
              />
              {q[opt]}
            </label>
          ))}
        </div>
      ))}
      <button onClick={() => handleSubmit(false)} className="w-full bg-black text-white py-4 rounded-xl font-bold">
        {submitting ? "Processing..." : "Submit Quiz"}
      </button>
    </div>
  );
}