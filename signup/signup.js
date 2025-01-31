import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { handleSignup, handleLogin } from "../../authFunctions";

import { auth } from '../../firebase';
import './signup.css';
import JoinRoom from '../joinroom/joinroom';
import { setUserId } from 'firebase/analytics';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const user = await handleSignup(email, password);
      console.log("User signed up successfully:", user);
      setMessage("Signup successful! Redirecting...");
      setTimeout(() => navigate("/classroom"), 2000); // Redirect to classroom page
    } catch (error) {
      console.error("Signup error:", error.message);
      setMessage(error.message || "An error occurred during signup.");
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <h1>Company Name</h1>
      </div>
      <div className="signup-right">
        <form className="signup-form" onSubmit={(e) => e.preventDefault()}>
          <button type="button" className="back-button" onClick={handleBack}>
            &larr; Back
          </button>
          <h2 className="signup-title">Sign Up</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="USERNAME or EMAIL"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="PASSWORD"
            disabled={loading}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="CONFIRM PASSWORD"
            disabled={loading}
          />
          <button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Signing Up...' : 'SIGNUP'}
          </button>
          <div className="google-login">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              alt="Google Logo"
            />
            Continue with Google
          </div>
          {message && <p className="signup-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default SignUp;
