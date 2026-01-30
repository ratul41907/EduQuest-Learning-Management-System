import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  // We check if the authToken exists in the browser's memory
  const token = localStorage.getItem("authToken");

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists, show the requested page (children)
  return children;
};

export default PrivateRoute;