import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import ProtectedRoute from './pages/ProtectedRoute';
import Multer from './pages/Multer';
import { ToastContainer} from 'react-toastify';


function App() {
  return (
    <Router>
          <ToastContainer/>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/multer" element={<Multer />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      

      </Routes>
    </Router>
  );
}

export default App;
