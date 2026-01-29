import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

export default function CourseLearn() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [completed, setCompleted] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || null,
    [lessons, activeLessonId]
  );

  useEffect(() => {
    async function loadData() {
      try {
        // We fetch course, lessons, AND my progress at the same time
        const [cRes, lRes, myCoursesRes] = await Promise.all([
          api.get(`/api/courses/${courseId}`),
          api.get(`/api/lessons/course/${courseId}`),
          api.get(`/api/courses/my`)
        ]);

        setCourse(cRes.data);
        const fetchedLessons = lRes.data || [];
        setLessons(fetchedLessons);

        // PERSISTENCE LOGIC: Pre-fill checkmarks based on saved progress
        const currentEnrollment = myCoursesRes.data.find(c => c.id === courseId);
        if (currentEnrollment && currentEnrollment.progress > 0) {
          const totalToMark = Math.floor((currentEnrollment.progress / 100) * fetchedLessons.length);
          const previouslyCompleted = new Set(
            fetchedLessons.slice(0, totalToMark).map(l => l.id)
          );
          setCompleted(previouslyCompleted);
        }

        if (fetchedLessons.length > 0) setActiveLessonId(fetchedLessons[0].id);
      } catch (e) {
        setMsg("Failed to load course content.");
      }
    }
    loadData();
  }, [courseId]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    setSaving(true);
    
    const newCompleted = new Set(completed).add(activeLesson.id);
    setCompleted(newCompleted);

    // Calculate progress based on number of lessons
    const progress = Math.round((newCompleted.size / lessons.length) * 100);

    try {
      await api.patch(`/api/courses/${courseId}/progress`, { progress });
      setMsg(`Progress updated to ${progress}%!`);
    } catch (e) {
      setMsg("Error saving progress.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar: Lesson List */}
      <div className="w-1/4 bg-white border-r flex flex-col h-full">
        <div className="p-4 border-b">
            <Link to="/student-dashboard" className="text-blue-500 text-sm mb-4 block hover:underline">← Back to Dashboard</Link>
            <h2 className="font-bold text-xl mb-2">{course?.title}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
                className="bg-green-500 h-2 rounded-full transition-all" 
                style={{ width: `${Math.round((completed.size / lessons.length) * 100) || 0}%` }}
            ></div>
            </div>
            <p className="text-xs text-gray-500 font-medium">COURSE PROGRESS: {Math.round((completed.size / lessons.length) * 100) || 0}%</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => {
                setActiveLessonId(lesson.id);
                setMsg(""); // Clear messages when switching
              }}
              className={`w-full text-left p-3 rounded-lg border transition ${
                activeLessonId === lesson.id ? "bg-blue-50 border-blue-500 shadow-sm font-semibold" : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
            >
              <span className="mr-2">{completed.has(lesson.id) ? "✅" : "📄"}</span>
              {lesson.title}
            </button>
          ))}

          {/* DAY 21 UPDATE: ASSESSMENT SECTION */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Assessments
            </h3>
            <Link
              to={`/courses/${courseId}/quizzes`}
              className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              🏆 Take Course Quiz
            </Link>
            
            {completed.size < lessons.length && (
              <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                Tip: Complete all lessons to be quiz-ready!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Viewer */}
      <div className="flex-1 p-8 overflow-y-auto bg-white">
        {msg && (
          <div className={`p-4 rounded-lg mb-6 shadow-sm border ${
            msg.includes("Error") 
                ? "bg-red-50 text-red-700 border-red-200" 
                : "bg-green-50 text-green-700 border-green-200"
          }`}>
            {msg}
          </div>
        )}

        {activeLesson ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{activeLesson.title}</h1>
            <div className="prose prose-lg max-w-none text-gray-700 mb-10 leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {activeLesson.content}
            </div>
            <hr className="mb-8" />
            <div className="flex justify-between items-center">
                <button
                onClick={handleMarkComplete}
                disabled={saving || completed.has(activeLessonId)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg disabled:bg-gray-300 disabled:shadow-none transition-all flex items-center gap-2"
                >
                {completed.has(activeLessonId) ? "✓ Lesson Completed" : saving ? "Saving Progress..." : "Mark as Complete"}
                </button>
                
                {completed.has(activeLessonId) && (
                    <span className="text-green-600 font-semibold animate-bounce">Next lesson unlocked!</span>
                )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-xl">Select a lesson from the sidebar to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
}