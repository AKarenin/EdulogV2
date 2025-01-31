import React from 'react';
import { auth } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './google_login.css'; 

function GoogleLogin() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Logged in user:', result.user);
    } catch (error) {
      console.error('Error during Google sign-in:', error);
    }
  };

  return (
    <div className="google-login-container">
      <button className="google-login-btn" onClick={signInWithGoogle}>
        <img
          src="../../images/google_logo.png"
          alt="Google Logo"
          className="temp-logo"
        />
        Continue with Google
      </button>
    </div>
  );
}

export default GoogleLogin;
