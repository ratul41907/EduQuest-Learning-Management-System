import React from 'react';

const InstructorDashboard = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Instructor Dashboard</h1>
      <p>Welcome! This is where you will manage your courses and see student progress.</p>
      <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed #ccc' }}>
        <h3>Upcoming Features:</h3>
        <ul>
          <li>Create New Course</li>
          <li>View Enrolled Students</li>
          <li>Revenue Analytics</li>
        </ul>
      </div>
    </div>
  );
};

export default InstructorDashboard;