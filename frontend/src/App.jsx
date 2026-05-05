import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CalorieTracker from './pages/CalorieTracker.jsx';
import Workouts from './pages/Workouts.jsx';
import MealPlans from './pages/MealPlans.jsx';
import Pricing from './pages/Pricing.jsx';
import Profile from './pages/Profile.jsx';
import Layout from './components/Layout.jsx';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-muted)' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/calories" element={<PrivateRoute><Layout><CalorieTracker /></Layout></PrivateRoute>} />
          <Route path="/workouts" element={<PrivateRoute><Layout><Workouts /></Layout></PrivateRoute>} />
          <Route path="/meal-plans" element={<PrivateRoute><Layout><MealPlans /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
