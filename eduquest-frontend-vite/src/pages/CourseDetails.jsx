import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api"; 

const CourseDetails = () => {
  const { id } = useParams(); 
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // Fetch course info (This now includes lessons and quizzes from the backend)
        const response = await api.get(`/api/courses/${id}`);
        setCourse(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching course details");
      }
    };
    fetchCourseData();
  }, [id]);

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
      
      <div style={{ marginTop: "20px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
        <h1 style={{ marginBottom: "10px" }}>{course.title}</h1>
        <p style={{ color: "#4b5563", fontSize: "16px", marginBottom: "20px" }}>{course.description}</p>
        
        {/* Progress Display */}
        <div style={{ marginBottom: "20px" }}>
           <span style={{ fontSize: "14px", fontWeight: "bold" }}>Your Progress: {course.progress || 0}%</span>
           <div style={{ width: "100%", height: "10px", background: "#e5e7eb", borderRadius: "5px", marginTop: "5px" }}>
             <div style={{ 
               width: `${course.progress || 0}%`, 
               height: "100%", 
               background: "#4f46e5", 
               borderRadius: "5px", 
               transition: "width 0.5s ease-in-out" 
             }}></div>
           </div>
        </div>

        {/* DAY 25: ACTION BUTTON - Directs to the Learning Page */}
        <Link 
          to={`/learn/${id}`} 
          style={{ 
            display: "inline-block",
            backgroundColor: "#111827",
            color: "white",
            padding: "12px 24px",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}
        >
          {course.progress > 0 ? "Continue Learning →" : "Start Learning →"}
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "30px" }}>
        {/* Curriculum Preview Section */}
        <div>
          <h3>Curriculum</h3>
          {course.lessons?.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {course.lessons.map((lesson, index) => (
                <li key={lesson.id} style={{ 
                  padding: "12px", 
                  borderBottom: "1px solid #f0f0f0",
                  color: "#374151",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center"
                }}>
                  <span style={{ marginRight: "10px", color: "#9ca3af" }}>{index + 1}.</span>
                  {lesson.title}
                </li>
              ))}
            </ul>
          ) : <p>No lessons yet.</p>}
        </div>

        {/* Quizzes Section */}
        <div>
          <h3>Quizzes</h3>
          {course.quizzes?.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {course.quizzes.map((quiz) => (
                <li key={quiz.id} style={{ 
                  padding: "12px", 
                  border: "1px solid #f0f0f0", 
                  marginBottom: "8px",
                  borderRadius: "6px",
                  backgroundColor: "#f9fafb"
                }}>
                  <Link to={`/quizzes/${quiz.id}`} style={{ textDecoration: "none", color: "#111827", fontWeight: "bold" }}>
                    {quiz.title}
                  </Link>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    Time Limit: {quiz.timeLimit} mins
                  </div>
                </li>
              ))}
            </ul>
          ) : <p>No quizzes yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;