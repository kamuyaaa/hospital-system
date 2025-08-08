import React, { useState } from "react";
import "./LoginPage.css"; // we'll create this in a second
import { useNavigate } from "react-router-dom"; // for routing later

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // for redirection

  const handleLogin = async (e) => {
  e.preventDefault();

  if (username === "" || password === "") {
    setError("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();

    if (data.success) {
      // ✅ Backend says it's a valid login → redirect
      navigate(`/${role}`);
    } else {
      // ❌ Backend rejected login → show error
      setError(data.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    setError("Server error. Please try again later.");
  }

  fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        // 👇 Store user info in localStorage
        localStorage.setItem("user", JSON.stringify({ username, role }));

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/doctor");
        }
      } else {
        setError(data.message);
      }
    })
    .catch((err) => {
      setError("Something went wrong.");
    });

};

  return (
    <div className="login-container">
      <h2>FCB Medical Clinic Login</h2>
      <form className="login-form" onSubmit={handleLogin}>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin (Receptionist)</option>
          <option value="doctor">Doctor</option>
        </select>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
