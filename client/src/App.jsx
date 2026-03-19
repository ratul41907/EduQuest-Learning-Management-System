import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Leaderboard from './pages/Leaderboard';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import QuizResults from './pages/QuizResults';
import Certificates from './pages/Certificates';
import CreateCourse from './pages/CreateCourse';
import ManageCourse from './pages/ManageCourse';
import AddLesson from './pages/AddLesson';
import AddQuiz from './pages/AddQuiz';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p style={{ color: '#8892b0', marginTop: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        user ? (
          user.role === 'STUDENT' ? <StudentDashboard /> :
          user.role === 'INSTRUCTOR' ? <InstructorDashboard /> :
          user.role === 'ADMIN' ? <AdminDashboard /> :
          <Navigate to="/login" />
        ) : <Navigate to="/login" />
      } />

      <Route path="/courses" element={user ? <Courses /> : <Navigate to="/login" />} />
      <Route path="/courses/:id" element={user ? <CourseDetails /> : <Navigate to="/login" />} />
      <Route path="/leaderboard" element={user ? <Leaderboard /> : <Navigate to="/login" />} />
      <Route path="/badges" element={user ? <Badges /> : <Navigate to="/login" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/quiz-results/:attemptId" element={user ? <QuizResults /> : <Navigate to="/login" />} />
      <Route path="/certificates" element={user ? <Certificates /> : <Navigate to="/login" />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      <Route path="/instructor/create-course" element={user?.role === 'INSTRUCTOR' ? <CreateCourse /> : <Navigate to="/login" />} />
      <Route path="/instructor/course/:id" element={user?.role === 'INSTRUCTOR' ? <ManageCourse /> : <Navigate to="/login" />} />
      <Route path="/instructor/course/:id/add-lesson" element={user?.role === 'INSTRUCTOR' ? <AddLesson /> : <Navigate to="/login" />} />
      <Route path="/instructor/course/:id/add-quiz" element={user?.role === 'INSTRUCTOR' ? <AddQuiz /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;