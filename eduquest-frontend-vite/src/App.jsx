import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Auth & Profiles
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import Profile from "./pages/Profile"; 

// Dashboards
import StudentDashboard from "./pages/student/StudentDashboard"; 
import InstructorDashboard from "./pages/instructor/InstructorDashboard"; 

// Course Management
import CoursesList from "./pages/CoursesList";
import CourseDetails from "./pages/CourseDetails";
import MyCourses from "./pages/MyCourses"; 

// Day 20/25: The Learning Interface
import CourseLearn from "./pages/CourseLearn"; 

// Day 21: Quiz System
import QuizList from "./pages/quizzes/QuizList";
import TakeQuiz from "./pages/quizzes/TakeQuiz";
import QuizResult from "./pages/quizzes/QuizResult";

// Day 22: Leaderboard
import Leaderboard from "./pages/Leaderboard"; 

// Day 23: Badges
import Badges from "./pages/Badges"; 

// Security
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Profile */}
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      
      {/* Protected Dashboards */}
      <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
      <Route path="/instructor-dashboard" element={<PrivateRoute><InstructorDashboard /></PrivateRoute>} />
      
      {/* Protected Course Routes */}
      <Route path="/courses" element={<PrivateRoute><CoursesList /></PrivateRoute>} />
      
      {/* FIXED: Changed /course/:id to /courses/:id to match your UI links */}
      <Route path="/courses/:id" element={<PrivateRoute><CourseDetails /></PrivateRoute>} />
      
      <Route path="/my-courses" element={<PrivateRoute><MyCourses /></PrivateRoute>} />
      
      {/* Day 20/25: The Learning Interface (Sidebar Player) */}
      <Route path="/learn/:id" element={<PrivateRoute><CourseLearn /></PrivateRoute>} />

      {/* Day 21: The Quiz System */}
      <Route path="/courses/:courseId/quizzes" element={<PrivateRoute><QuizList /></PrivateRoute>} />
      <Route path="/quizzes/:quizId" element={<PrivateRoute><TakeQuiz /></PrivateRoute>} />
      <Route path="/quizzes/:quizId/result" element={<PrivateRoute><QuizResult /></PrivateRoute>} />

      {/* Day 22: The Leaderboard */}
      <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />

      {/* Day 23: The Badges Page */}
      <Route path="/badges" element={<PrivateRoute><Badges /></PrivateRoute>} />
      
      {/* Fallbacks */}
      <Route path="/dashboard" element={<Navigate to="/student-dashboard" />} />
      <Route path="*" element={<Navigate to="/student-dashboard" />} />
    </Routes>
  );
};

export default App;