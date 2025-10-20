import React from "react";
import {Link} from "react-router-dom";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";

import WeatherApp from "./bai1/Weather";
import StudentDetail from "./bai2/StudentDetail";
import StudentList from "./bai2/StudentList";
import News from "./bai3/News";

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/bai1">Bài 1</Link>
        <Link to="/bai2">Bài 2</Link>
        <Link to="/bai3">Bài 3</Link>
      </nav>

      <div>
        <Routes>
          <Route path="/bai1" element={<WeatherApp />} />
          <Route path="/bai2" element={<StudentList />} />
          <Route path="/bai2/:id" element={<StudentDetail />} />
          <Route path="/bai3" element={<News/>} />
        </Routes>
      </div>
    </Router>
  );
}