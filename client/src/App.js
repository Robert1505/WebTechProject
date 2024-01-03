import './App.css';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AppBar from './pages/AppBar';
import AddActivity from './pages/AddActivity';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const data = jwtDecode(token);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  return (
    <>
      <AppBar />
      <Routes>
        {/* Home */}
        <Route path="/" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/home" element={isLoggedIn ? <Home /> : <Login />} />
        <Route path="/activities" element={<AddActivity />} />

        {/* Auth */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default App;
