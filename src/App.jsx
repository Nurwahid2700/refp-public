import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/main/Home';
import EventDetail from './pages/main/EventDetail';
import History from './pages/user/History';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main App Routes with Layout Wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="event/:eventId" element={<EventDetail />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;