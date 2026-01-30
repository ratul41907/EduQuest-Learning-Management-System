import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/courses");
        const data = await response.json();
        if (response.status === 200) {
          setCourses(data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Error fetching courses");
      }
    };
    fetchCourses();
  }, []);

  const enrollCourse = async (courseId) => {
    const token = localStorage.getItem("authToken"); // Using authToken from Day 16

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Sending JWT for authentication
        },
      });

      if (response.status === 201) {
        alert("Successfully enrolled in the course!");
      } else {
        const data = await response.json();
        alert(data.message || "Enrollment failed");
      }
    } catch (err) {
      alert("Error enrolling in the course");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Available Courses</h1>
      <Link to="/my-courses">View My Enrolled Courses</Link>
      <hr />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {courses.map((course) => (
          <li key={course.id} style={{ marginBottom: "15px" }}>
            <Link to={`/course/${course.id}`}>{course.title}</Link>
            <button 
              onClick={() => enrollCourse(course.id)} 
              style={{ marginLeft: "15px", cursor: "pointer" }}
            >
              Enroll
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoursesList;