import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogin } from "../../authFunctions";
import "./login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      setMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      const user = await handleLogin(email, password);
      console.log("User logged in successfully:", user);
      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/classroom"), 2000); // Redirect to classroom page
    } catch (error) {
      console.error("Login error:", error.message);
      setMessage(error.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Company Name</h1>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <h2 className="login-title">Login</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={loading}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
          />
          <button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
          {message && <p className="login-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
