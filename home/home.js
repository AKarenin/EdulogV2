import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../login/login';
import SignUp from '../signup/signup';

function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Hello, Get Started</h1>
      <div className='button-container'>
        <button className='login' onClick={() => navigate('/login')}>
          Login
        </button>
        <button className='signup' onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Home;
