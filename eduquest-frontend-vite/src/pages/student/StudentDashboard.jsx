import React from "react";
import { useNavigate, Link } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); 
    navigate("/login"); 
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Student Dashboard</h1>
          <div className="space-x-4">
            <Link to="/profile" className="text-blue-500 hover:underline">View Profile</Link>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-700 font-medium">Welcome back, Student! Ready to continue your learning journey?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
            <h3 className="font-bold text-lg">My Courses</h3>
            <p className="text-gray-600 text-sm">View and manage your enrolled courses.</p>
            <Link to="/my-courses" className="inline-block mt-2 text-blue-600 font-semibold">Go to My Courses →</Link>
          </div>
          
          <div className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
            <h3 className="font-bold text-lg">Explore New Skills</h3>
            <p className="text-gray-600 text-sm">Browse all available courses in the catalog.</p>
            <Link to="/courses" className="inline-block mt-2 text-blue-600 font-semibold">Browse Catalog →</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;