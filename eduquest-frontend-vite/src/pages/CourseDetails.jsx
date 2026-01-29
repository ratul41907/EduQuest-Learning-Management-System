import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// Use the Day 23 API helper to ensure authToken is included
import { api } from "../lib/api"; 

const CourseDetails = () => {
  const { id } = useParams(); 
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]); // Separate state for lessons
  const [error, setError] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course metadata and lesson list in parallel
        const [courseRes, lessonsRes] = await Promise.all([
          api.get(`/api/courses/${id}`),
          api.get(`/api/lessons/course/${id}`) // This fixes the 404 error
        ]);
        
        setCourse(courseRes.data);
        setLessons(lessonsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching course details");
      }
    };
    fetchCourseData();
  }, [id]);

  const handleMarkComplete = async (lessonId) => {
    try {
      setLoadingId(lessonId);
      // Day 24 logic: Mark specific lesson as done and get updated progress
      const res = await api.post(`/api/lessons/${lessonId}/complete`);
      alert(`Lesson completed! Current progress: ${res.data.progress}%`);
      
      // Refresh course data to reflect new progress percentage
      const updatedCourse = await api.get(`/api/courses/${id}`);
      setCourse(updatedCourse.data);
    } catch (err) {
      alert("Failed to complete lesson: " + (err.response?.data?.message || "Check console"));
    } finally {
      setLoadingId(null);
    }
  };

  if (error) return (
    <div style={{padding: "20px"}}>
      <p style={{color: "red"}}>{error}</p>
      <Link to="/courses">Back to Courses</Link>
    </div>
  );
  
  if (!course) return <p style={{padding: "20px"}}>Loading course details...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Link to="/courses" style={{ color: "#4f46e5", textDecoration: "none" }}>← Back to All Courses</Link>
      
      <div style={{ marginTop: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
        <h1 style={{ marginBottom: "5px" }}>{course.title}</h1>
        <p><strong>Description:</strong> {course.description}</p>
        {/* Progress Display added for Day 24 */}
        <div style={{ marginTop: "10px" }}>
           <span style={{ fontSize: "14px", fontWeight: "bold" }}>Your Progress: {course.progress || 0}%</span>
           <div style={{ width: "100%", height: "8px", background: "#e5e7eb", borderRadius: "4px", marginTop: "5px" }}>
             <div style={{ width: `${course.progress || 0}%`, height: "100%", background: "#111827", borderRadius: "4px", transition: "width 0.3s ease" }}></div>
           </div>
        </div>
      </div>

      <h3 style={{ marginTop: "20px" }}>Lessons</h3>
      {lessons.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {lessons.map((lesson) => (
            <li key={lesson.id} style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "12px", 
              border: "1px solid #f0f0f0", 
              marginBottom: "8px",
              borderRadius: "6px"
            }}>
              <span>{lesson.title}</span>
              <button 
                onClick={() => handleMarkComplete(lesson.id)}
                disabled={loadingId === lesson.id}
                style={{
                  backgroundColor: "#111827",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: loadingId === lesson.id ? "not-allowed" : "pointer",
                  fontSize: "12px"
                }}
              >
                {loadingId === lesson.id ? "Saving..." : "Mark Complete"}
              </button>
            </li>
          ))}
        </ul>
      ) : <p>No lessons yet.</p>}

      <h3 style={{ marginTop: "20px" }}>Quizzes</h3>
      {course.quizzes?.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {course.quizzes.map((quiz) => (
            <li key={quiz.id} style={{ 
              padding: "10px", 
              border: "1px solid #f0f0f0", 
              marginBottom: "5px",
              borderRadius: "4px",
              backgroundColor: "#f9fafb"
            }}>
              <Link to={`/quizzes/${quiz.id}`} style={{ textDecoration: "none", color: "#111827", fontWeight: "bold" }}>
                {quiz.title}
              </Link>
              <span style={{ fontSize: "12px", color: "#6b7280", marginLeft: "10px" }}>
                ({quiz.timeLimit} mins)
              </span>
            </li>
          ))}
        </ul>
      ) : <p>No quizzes yet.</p>}
    </div>
  );
};

export default CourseDetails;