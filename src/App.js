// src/App.js
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Validation from "./components/Validation"; // Import the Validation component
import Dashboard from "./components/Dashboard"; // Import the Dashboard component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Validation />} />{" "}
        {/* Set Validation as the landing page */}
        <Route path="/dashboard" element={<Dashboard />} />{" "}
        {/* Dashboard route */}
        <Route path="/validation" element={<Validation />} />{" "}
        {/* Validation route */}
      </Routes>
    </Router>
  );
}

export default App;
