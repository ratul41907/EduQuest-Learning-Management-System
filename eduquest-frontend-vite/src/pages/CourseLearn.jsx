import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/client";

export default function CourseLearn() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || null,
    [lessons, activeLessonId]
  );

  const currentProgress = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completedLessonIds.length / lessons.length) * 100);
  }, [lessons, completedLessonIds]);

  const showError = (e, fallback = "Something went wrong.") => {
    const status = e?.response?.status;
    const apiMsg = e?.response?.data?.message;
    if (status === 401) return "Unauthorized. Please login again.";
    if (status === 403) return apiMsg || "Forbidden. You must enroll to view lessons.";
    if (status === 404) return apiMsg || "Not found.";
    return apiMsg || fallback;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setMsg("");

      const [courseRes, lessonRes] = await Promise.all([
        api.get(`/api/courses/${courseId}`),
        api.get(`/api/lessons/course/${courseId}`),
      ]);

      setCourse(courseRes.data);

      // ✅ SUPPORT BOTH BACKEND SHAPES:
      // A) res.json(lessonsArray)
      // B) res.json({ lessons: [], completedLessonIds: [] })
      const data = lessonRes.data;

      const lessonList = Array.isArray(data) ? data : (data?.lessons || []);
      const completedIds = Array.isArray(data) ? [] : (data?.completedLessonIds || []);

      setLessons(lessonList);
      setCompletedLessonIds(completedIds);

      if (lessonList.length > 0) {
        setActiveLessonId((prev) => prev || lessonList[0].id);
      } else {
        setActiveLessonId(null);
      }
    } catch (e) {
      console.error("Load Error:", e);
      setMsg(showError(e, "Failed to load course content. Verify enrollment and backend routes."));
      setLessons([]);
      setCompletedLessonIds([]);
      setActiveLessonId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleMarkComplete = async () => {
    if (!activeLesson || saving) return;

    if (completedLessonIds.includes(activeLesson.id)) {
      setMsg("This lesson is already completed.");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      // ✅ MUST be POST /api/lessons/:lessonId/complete
      await api.post(`/api/lessons/${activeLesson.id}/complete`);

      // optimistic local update
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);

      setMsg("Lesson completed. Progress updated.");
    } catch (e) {
      console.error("Save Error:", e);
      setMsg(showError(e, "Error saving progress. Please refresh and try again."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-semibold text-indigo-600 animate-pulse">
          Loading Course Material...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}
      className="bg-gray-100"
    >
      {/* SIDEBAR */}
      <div
        style={{ width: "25%", minWidth: "300px", borderRight: "1px solid #e5e7eb" }}
        className="bg-white flex flex-col h-full shadow-lg"
      >
        <div className="p-6 border-b bg-gray-50">
          <Link
            to={`/courses/${courseId}`}
            className="text-indigo-600 text-sm mb-4 block hover:underline font-bold"
          >
            ← Back to Details
          </Link>

          <h2 className="font-bold text-xl mb-3 text-gray-800">{course?.title || "Course"}</h2>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">
            Course Completion: {currentProgress}%
          </p>
        </div>

        {/* Lesson List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lessons.length > 0 ? (
            lessons.map((lesson) => {
              const isActive = activeLessonId === lesson.id;
              const done = completedLessonIds.includes(lesson.id);

              return (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setActiveLessonId(lesson.id);
                    setMsg("");
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-sm"
                      : "bg-white border-gray-100 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate pr-2">{lesson.title}</span>
                    {done && <span className="text-green-500 font-bold">✓</span>}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">
                No lessons found. (Instructor needs to add lessons to this course.)
              </p>
            </div>
          )}

          {/* Quiz Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Assessment</h3>
            <button
              onClick={() => navigate(`/courses/${courseId}/quizzes`)}
              className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95"
            >
              🏆 View Quizzes
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEWER */}
      <div style={{ flex: 1 }} className="p-10 overflow-y-auto bg-white">
        {msg && (
          <div
            className={`p-4 rounded-xl mb-8 border-l-4 shadow-sm transition-all ${
              msg.toLowerCase().includes("error") ||
              msg.toLowerCase().includes("failed") ||
              msg.toLowerCase().includes("unauthorized") ||
              msg.toLowerCase().includes("forbidden")
                ? "bg-red-50 text-red-700 border-red-500"
                : "bg-green-50 text-green-700 border-green-500"
            }`}
          >
            {msg}
          </div>
        )}

        {activeLesson ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">
                Active Lesson
              </span>
              <h1 className="text-4xl font-black text-gray-900 mt-2 leading-tight">
                {activeLesson.title}
              </h1>
            </div>

            <div className="prose prose-indigo prose-lg max-w-none text-gray-700 mb-12 bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-inner min-h-[300px]">
              {activeLesson.content}
            </div>

            <div className="flex justify-center border-t pt-10">
              <button
                onClick={handleMarkComplete}
                disabled={saving || completedLessonIds.includes(activeLessonId)}
                className={`px-10 py-4 rounded-full font-black text-lg shadow-xl transition-all transform ${
                  completedLessonIds.includes(activeLessonId)
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-indigo-600 text-white hover:scale-105 active:scale-95"
                }`}
              >
                {completedLessonIds.includes(activeLessonId)
                  ? "Lesson Completed ✅"
                  : saving
                  ? "Saving..."
                  : "Mark as Complete"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300">
            <div className="text-9xl mb-6 opacity-20">📖</div>
            <p className="text-2xl font-medium text-gray-400">
              Select a lesson from the sidebar to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
