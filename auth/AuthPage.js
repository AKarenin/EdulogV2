import React, { useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { handleSignup, handleLogin } from "../../authFunctions";
import './AuthPage.css';

const AuthPage = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("student");

  const fetchUserRole = async (uid) => {
    const userDocRef = doc(db, "users", uid); // Reference to the user's document
    const userDoc = await getDoc(userDocRef); // Fetch the document
    if (userDoc.exists()) {
      return userDoc.data().role; // Return the role from Firestore
    } else {
      throw new Error("User document not found in Firestore.");
    }
  };

  const handleSubmit = async () => {
    try {
      let user;
      if (isLogin) {
        user = await handleLogin(email, password);
      } else {
        user = await handleSignup(email, password, role);
      }

      // Fetch the user's role from Firestore
      const userRole = await fetchUserRole(user.uid);

      // Add the role to the user object
      const userWithRole = { ...user, role: userRole };

      console.log("User after login/signup:", userWithRole);
      setUser(userWithRole); // Pass user with role to App.js
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <h1>Company Name</h1>
      </div>
      <div className="login-right">
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        <input
          className="login-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isLogin && (
          <select
            name="occupation"
            id="roles"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        )}
        <button className="login-button" onClick={handleSubmit}>
          {isLogin ? "Login" : "Sign Up"}
        </button>
        <button className="login-button" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create an Account" : "Already have an account?"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;