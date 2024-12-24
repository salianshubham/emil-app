import './App.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

import Home from './components/home/Home';
import Login from './components/login/Login';

function App() {
  const token = Cookies.get('jwt');
  const localStorageToken = window.localStorage.getItem("token");

  const navigate = useNavigate();

  // Use useEffect for navigation
  useEffect(() => {
    const currentToken = token || localStorageToken;

    if (currentToken) {
      window.localStorage.setItem("token", currentToken);
      navigate('/home');
    } else {
      navigate('/login');
    }
  }, [token, localStorageToken, navigate]);//useEffect function runs only when one of these values changes

  return (
   
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>

  );
}

export default App;
