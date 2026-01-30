import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/client"; // Import the axios client created in Step 4

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Use the 'api' client - it handles the Authorization header automatically
        const response = await api.get("/api/courses/my");
        setCourses(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching your courses");
      }
    };
    fetchCourses();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>My Enrolled Courses</h1>
      <Link to="/courses" style={{ color: "#2563eb", textDecoration: "underline" }}>
        Browse More Courses
      </Link>
      <hr style={{ margin: "20px 0" }} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {courses.length === 0 ? (
        <p>You are not enrolled in any courses yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {courses.map((course) => (
            <li 
              key={course.id} 
              style={{ 
                marginBottom: "15px", 
                padding: "15px", 
                border: "1px solid #ddd", 
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>
                <strong style={{ fontSize: "1.1rem" }}>{course.title}</strong>
                <p style={{ margin: "5px 0 0", color: "#666" }}>{course.description}</p>
              </div>

              {/* Day 20 NEW: Link to the Lesson Viewer */}
              <Link 
                to={`/learn/${course.id}`} 
                style={{ 
                  backgroundColor: "#22c55e", 
                  color: "white", 
                  padding: "8px 16px", 
                  borderRadius: "5px", 
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Continue
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyCourses;