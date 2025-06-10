import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginRegister from "./components/LoginRegister/LoginRegister.jsx";
import LearnerDashboard from './components/LearnerDashboard/LearnerDashboard.js';
import LecturerDashboard from './components/LecturerDashboard/LecturerDashboard.js'; // Assuming this exists
import AdminDashboard from './components/AdminDashboard/AdminDashboard.js'; // Assuming this exists
import AssessmentPage from './components/AssessmentPage/AssessmentPage.jsx'; // NEW IMPORT


function App() {
  return (
    <Routes>
      {/* Authentication Routes */}
      <Route path="/" element={<LoginRegister />} />
      <Route path="/login" element={<LoginRegister />} />

      {/* Dashboard Routes */}
      <Route path="/dashboard/learner" element={<LearnerDashboard />} />
      <Route path="/dashboard/lecturer" element={<LecturerDashboard />} />
      <Route path="/dashboard/administrator" element={<AdminDashboard />} />

      {/* Assessment Page Route */}
      {/* :moduleId and :quizId are dynamic parameters that will be passed in the URL */}
      <Route path="/assessment/:moduleId/:quizId" element={<AssessmentPage />} />

      {/* Optional: A catch-all route for any undefined paths (404 Not Found) */}
      {/* import NotFoundPage from './components/NotFoundPage/NotFoundPage'; */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;