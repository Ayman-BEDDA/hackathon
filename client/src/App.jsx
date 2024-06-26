import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Room from "./pages/Room";
import TextToSpeech from "./components/TextToSpeech";

function App() {
  return (
      <Router>
          <div className="App">
              <Navbar/>
              <div className="bg-orange-50 min-h-screen pt-20">
                  <Routes>
                      <Route path="/" element={<Home/>}/>
                      <Route path="/register" element={<Register/>}/>
                      <Route path="/login" element={<Login/>}/>
                      <Route path="/room/:id" element={<Room/>}/>
                      <Route path="/logout" element={<Navigate to="/" replace />} />
                      <Route path="*" element={<Navigate to="/" replace/>}/>
                      <Route path="/response-vocal" element={<TextToSpeech/>}/>
                  </Routes>
              </div>
          </div>
      </Router>
  );
}

export default App;