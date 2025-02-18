import React, { useState } from "react";
import "./Signup.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSignUp = () => {
    axios
      .post(
        "http://localhost:8080/signup",
        {
          username: username,
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then(function (response) {
        axios
          .post(
            "http://localhost:8080/login",
            {
              username: username,
              password: password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          )
          .then(function (response) {
            login({ name: username });
            navigate("/");
          })
          .catch(function (error) {
            console.error("Error:", error);
          });
      })
      .catch(function (error) {
        console.error("Error:", error);
      });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    handleSignUp();
    setUsername("");
    setPassword("");
  };
  return (
    <div className="SignUp relative bg-[#011A29] text-white overflow-hidden">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-100 rounded-[150px] bg-blue-500 opacity-25 blur-[150px] z-0"></div>{" "}
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-[120px] bg-blue-500 opacity-20 blur-[130px] z-0"></div>{" "}
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-40 rounded-[130px] bg-blue-500 opacity-15 blur-[140px] z-0"></div>{" "}
      <div className="absolute left-1/3 top-0 h-[200px] w-[300px] rotate-20 rounded-[100px] bg-blue-500 opacity-10 blur-[120px] z-0"></div>{" "}
      <Link to="/">
        <img
          src="src/assets/MarkByte Logo.jpg"
          alt="Logo"
          className="page-logo"
        />
      </Link>
      <div className="signup-container">
        <div className="signup-box">
          <div className="icon-container">
            <FaUser className="user-icon" />
          </div>
          <h2>Sign Up</h2>
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="input-container">
              <FaUser className="icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div className="input-container">
              <FaLock className="icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>
          <p className="login-link">
            Already have an acccount? <a href="/login">Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
