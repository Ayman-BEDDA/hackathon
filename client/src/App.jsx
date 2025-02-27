import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Room from "./pages/Room";
import TextToSpeech from "./components/TextToSpeech";
import WaitingRoom from './pages/WaitingRoom';
import PatientsList from "./pages/PatientsList";

function App() {
  return (
      <Router>
          <div className="App font-poppins">
              <Navbar/>
              <div className="bg-orange-50 min-h-screen pt-20">
                  <Routes>
                      <Route path="/" element={<Home/>}/>
                      <Route path="/register" element={<Register/>}/>
                      <Route path="/login" element={<Login/>}/>
                      <Route path="/waiting-room/:id" element={<WaitingRoom/>}/>
                      <Route path="/room/:id" element={<Room/>}/>
                      <Route path="/logout" element={<Navigate to="/" replace />} />
                      <Route path="*" element={<Navigate to="/" replace/>}/>
                      <Route path="/response-vocal" element={<TextToSpeech/>}/>
                      <Route path="/patients" element={<PatientsList/>}/>
                  </Routes>
              </div>
          </div>
      </Router>
  );
}

export default App;