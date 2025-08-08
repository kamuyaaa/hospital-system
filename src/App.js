import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminHome from "./pages/AdminHome";
import DoctorHome from "./pages/DoctorHome";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/doctor" element={<DoctorHome />} />
      </Routes>
    </Router>
  );
}

export default App;
