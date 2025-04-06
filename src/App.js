import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

import Home from "./pages/Home";
import Layout from "./pages/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
