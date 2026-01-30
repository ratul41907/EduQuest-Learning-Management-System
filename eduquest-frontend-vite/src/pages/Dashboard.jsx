import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear the token
    navigate("/login"); // Send back to login
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="mt-2 text-gray-600">You are successfully authenticated!</p>
      <button 
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;