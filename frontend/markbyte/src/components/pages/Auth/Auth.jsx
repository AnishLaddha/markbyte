import React, { useState, useEffect } from "react";
import "./Auth.css";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { AlertCircle, User, Lock, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [lusername, setLusername] = useState("");
  const [lpassword, setLpassword] = useState("");
  const [semail, setSemail] = useState("");
  const [susername, setSusername] = useState("");
  const [spassword, setSpassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
          login({ name: lusername, time_loggedin: new Date().getTime() });
          navigate("/");
          setLusername("");
          setLpassword("");
        }, 2000);
      })
      .catch((error) => {
        setErrorMsg("Login failed. Please try again.");
        setTimeout(() => setErrorMsg(""), 3000);
        setLusername("");
        setLpassword("");
      });
  };

  const handleSignUp = (e) => {
    let signup_data = {
      username: susername,
      password: spassword,
      email: semail || "",
    };
    e.preventDefault();
    axios
      .post("http://localhost:8080/signup", signup_data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      })
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
            setIsLoading(true);
            setTimeout(() => {
              setIsLoading(false);
              login({ name: susername, time_loggedin: new Date().getTime() });
              navigate("/");
              setSusername("");
              setSpassword("");
              setSemail("");
            }, 2000);
          })
          .catch((error) => {
            setErrorMsg("Unable to login after sign up. Please try again.");
            setTimeout(() => setErrorMsg(""), 3000);
            setSusername("");
            setSpassword("");
            setSemail("");
          });
      })
      .catch((error) => {
        setErrorMsg("Sign up failed. Please try again.");
        setTimeout(() => setErrorMsg(""), 3000);
        setSusername("");
        setSpassword("");
        setSemail("");
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#022438] text-white p-4 overflow-hidden relative">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-100 rounded-[150px] bg-blue-500 opacity-15 blur-[150px] z-0"></div>
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-[120px] bg-blue-500 opacity-10 blur-[130px] z-0"></div>
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-40 rounded-[130px] bg-blue-500 opacity-10 blur-[140px] z-0"></div>

      <div className="mb-8 z-10">
        <motion.img
          src="/assets/markbytealt.png"
          alt="Logo"
          className="h-20 w-auto cursor-pointer"
          onClick={() => navigate("/")}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-[#011A29]/60 backdrop-blur-md border-[#0e3a56] shadow-xl transition duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-2xl font-bold text-white">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-auto"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#0e3a56]/50">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <Alert
                    variant="destructive"
                    className="bg-red-500/20 border-red-500/50 text-white"
                  >
                    <AlertDescription className="flex flex-row gap-2">
                      <AlertCircle className="h-5 w-5" /> {errorMsg}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              <TabsContent value="login">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <form className="space-y-4" onSubmit={handleLogin}>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white/90">
                        Username
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-white/60" />
                        </div>
                        <Input
                          id="username"
                          type="text"
                          value={lusername}
                          onChange={(e) => setLusername(e.target.value)}
                          placeholder="Enter your username"
                          required
                          className="pl-10 bg-[#0e3a56]/30 border-[#1e5b82] focus:border-[#1e88e5] text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/90">
                        Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="h-4 w-4 text-white/60" />
                        </div>
                        <Input
                          id="password"
                          type="password"
                          value={lpassword}
                          onChange={(e) => setLpassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="pl-10 bg-[#0e3a56]/30 border-[#1e5b82] focus:border-[#1e88e5] text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white hover:bg-gray-200 text-black transition-colors duration-300 ease-in-out"
                    >
                      Sign In{" "}
                      {isLoading && (
                        <div className="flex space-x-1">
                          <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse1"></span>
                          <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse2"></span>
                          <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse3"></span>
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              </TabsContent>

              <TabsContent value="signup">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <form className="space-y-4" onSubmit={handleSignUp}>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/90">
                        Email
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail className="h-4 w-4 text-white/60" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          value={semail}
                          onChange={(e) => setSemail(e.target.value)}
                          placeholder="Email (optional)"
                          className="pl-10 bg-[#0e3a56]/30 border-[#1e5b82] focus:border-[#1e88e5] text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white/90">
                        Username
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User className="h-4 w-4 text-white/60" />
                        </div>
                        <Input
                          id="username"
                          type="text"
                          value={susername}
                          onChange={(e) => setSusername(e.target.value)}
                          placeholder="Username"
                          required
                          className="pl-10 bg-[#0e3a56]/30 border-[#1e5b82] focus:border-[#1e88e5] text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white/90">
                        Password
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Lock className="h-4 w-4 text-white/60" />
                        </div>
                        <Input
                          id="password"
                          type="password"
                          value={spassword}
                          onChange={(e) => setSpassword(e.target.value)}
                          placeholder="Password"
                          required
                          className="pl-10 bg-[#0e3a56]/30 border-[#1e5b82] focus:border-[#1e88e5] text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-white hover:bg-gray-200 text-black transition-colors duration-300 ease-in-out"
                    >
                      Sign Up
                      {isLoading && (
                        <div className="flex space-x-1">
                          <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse1"></span>
                          <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse2"></span>
                          <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse3"></span>
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default Auth;
