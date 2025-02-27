import React, { useState, useEffect } from "react";
import "./Auth.css";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import { CiWarning } from "react-icons/ci";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";

function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [lusername, setLusername] = useState("");
  const [lpassword, setLpassword] = useState("");
  const [semail, setSemail] = useState("");
  const [susername, setSusername] = useState("");
  const [spassword, setSpassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleTabChange = (value) => {
    setActiveTab(value);
    navigate(`/auth?tab=${value}`);
    setErrorMsg("");

    if (value === "login") {
      setLusername("");
      setLpassword("");
    } else {
      setSusername("");
      setSpassword("");
      setSemail("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:8080/login",
        { username: lusername, password: lpassword },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((response) => {
        login({ name: lusername });
        navigate("/");
        setLusername("");
        setLpassword("");
      })
      .catch((error) => {
        setErrorMsg("Login failed. Please try again.");
        setTimeout(() => setErrorMsg(""), 3000);
      });
  };

  const handleSignUp = (e) => {
    let signup_data = {
      username: susername,
      password: spassword,
      email: semail || "",
    }
    e.preventDefault();
    axios
      .post(
        "http://localhost:8080/signup",
        signup_data,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      .then((response) => {
        axios
          .post(
            "http://localhost:8080/login",
            { username: susername, password: spassword },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          )
          .then((response) => {
            login({ name: susername });
            navigate("/");
            setSusername("");
            setSpassword("");
          })
          .catch((error) => {
            console.error("Auto-login error:", error);
          });
      })
      .catch((error) => {
        console.error("Signup error:", error);
      });
  };

  return (
    <div className="Login relative bg-[#011A29] text-white overflow-hidden">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-100 rounded-[150px] bg-blue-500 opacity-15 blur-[150px] z-0"></div>
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-[120px] bg-blue-500 opacity-10 blur-[130px] z-0"></div>
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-40 rounded-[130px] bg-blue-500 opacity-10 blur-[140px] z-0"></div>
      <Link to="/">
        <img
          src="/assets/markbytealt.png"
          alt="Logo"
          className="page-logo"
        />
      </Link>
      <div className="login-container">
        <div className="login-box">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <div className="icon-container">
                <FaUser className="user-icon" />
              </div>
              <h2>Login</h2>
              {errorMsg && (
                <div className="error-message">
                  <CiWarning />
                  {errorMsg}
                </div>
              )}
              <form className="login-form" onSubmit={handleLogin}>
                <div className="input-container">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    value={lusername}
                    onChange={(e) => setLusername(e.target.value)}
                    placeholder="Username"
                    required
                  />
                </div>

                <div className="input-container">
                  <FaLock className="icon" />
                  <input
                    type="password"
                    value={lpassword}
                    onChange={(e) => setLpassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>

                <button type="submit">Login</button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="icon-container">
                <FaUser className="user-icon" />
              </div>
              <h2>Sign Up</h2>
              <form className="signup-form" onSubmit={handleSignUp}>
                <div className="input-container">
                  <FaEnvelope className="icon" />
                  <input
                    type="email"
                    value={semail}
                    onChange={(e) => setSemail(e.target.value)}
                    placeholder="Email (optional)"
                  />
                </div>
                <div className="input-container">
                  <FaUser className="icon" />
                  <input
                    type="text"
                    value={susername}
                    onChange={(e) => setSusername(e.target.value)}
                    placeholder="Username"
                    required
                  />
                </div>

                <div className="input-container">
                  <FaLock className="icon" />
                  <input
                    type="password"
                    value={spassword}
                    onChange={(e) => setSpassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>

                <button type="submit">Sign Up</button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default Auth;
