import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  User,
  Lock,
  Mail,
  IdCard,
  Upload,
  X,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signup } from "@/services/authService";
import { uploadProfilePicture, updateName } from "@/services/userService";

function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [lusername, setLusername] = useState("");
  const [lpassword, setLpassword] = useState("");
  const [semail, setSemail] = useState("");
  const [susername, setSusername] = useState("");
  const [spassword, setSpassword] = useState("");
  const [sname, setSname] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [profilePic, setProfilePic] = useState(null);
  const [imagefile, setimageFile] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { login, fetchUserInfo } = useAuth();
  const [api, setApi] = useState(null);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(lusername, lpassword);
      if (success) {
        setTimeout(() => {
          setIsLoading(false);
          navigate("/");
          setLusername("");
          setLpassword("");
        }, 2000);
      } else {
        setIsLoading(false);
        setErrorMsg("Login failed. Please try again.");
        setTimeout(() => setErrorMsg(""), 3000);
        setLusername("");
        setLpassword("");
      }
    } catch (error) {
      setIsLoading(false);
      setErrorMsg("Login error. Please try again.");
      setTimeout(() => setErrorMsg(""), 3000);
      setLusername("");
      setLpassword("");
    }
  };

  const continueSignUp = async (e) => {
    e.preventDefault();
    api?.scrollNext();
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Sign up
      const signup_data = {
        username: susername,
        password: spassword,
        email: semail || "",
      };

      await signup(susername, spassword, semail);

      // Step 2: Login after signup
      const loginSuccess = await login(susername, spassword);

      if (loginSuccess) {
        // Step 3: Prepare requests for user data updates
        const requests = [];

        // Add name update request
        if (sname) {
          requests.push(updateName(sname));
        }

        if (imagefile) {
          requests.push(uploadProfilePicture(imagefile));
        }

        if (requests.length > 0) {
          await Promise.all(requests);
        }
        // Force a refresh of user info
        await fetchUserInfo();
        setSusername("");
        setSpassword("");
        setSemail("");
        setSname("");
        setProfilePic(null);
        setimageFile(null);
        navigate("/");
      } else {
        throw new Error("Login after signup failed");
      }
    } catch (error) {
      api?.scrollPrev();
      setErrorMsg("Sign up failed. Please try again.");
      setTimeout(() => setErrorMsg(""), 3000);
      setSusername("");
      setSpassword("");
      setSemail("");
      setSname("");
      setProfilePic(null);
      setimageFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setimageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePic(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    setimageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
      <Carousel className="w-full max-w-md" setApi={setApi}>
        <CarouselContent>
          <CarouselItem className="w-full h-auto">
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
                        <form className="space-y-4" onSubmit={continueSignUp}>
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
                                placeholder="Email"
                                required
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
                                value={spassword}
                                onChange={(e) => setSpassword(e.target.value)}
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
                            Continue to Sign Up{" "}
                          </Button>
                        </form>
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </CarouselItem>
          <CarouselItem className="w-full h-auto">
            <Card className="bg-[#011A29]/60 backdrop-blur-md border-[#0e3a56] shadow-xl transition duration-300">
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
                onClick={() => {
                  api?.scrollPrev();
                  setProfilePic(null);
                  setimageFile(null);
                  setSname("");
                }}
              >
                <ArrowLeft size={16} className="text-gray-600" />
                <span className="font-medium">Back</span>
              </Button>
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-2xl font-bold text-white">
                  Account Set Up
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/90">
                      Name
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <IdCard className="h-4 w-4 text-white/60" />
                      </div>
                      <Input
                        id="name"
                        type="text"
                        value={sname}
                        onChange={(e) => setSname(e.target.value)}
                        placeholder="Enter your name"
                        required
                        className="pl-10 bg-[#0e3a56]/30 border-[#1e5b82] focus:border-[#1e88e5] text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-pic" className="text-white/90">
                      Profile Picture
                    </Label>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        {profilePic ? (
                          <div className="relative">
                            <Avatar className="w-24 h-24 border-2 border-[#1e88e5]">
                              <AvatarImage
                                src={
                                  profilePic ||
                                  `https://api.dicebear.com/9.x/initials/svg?seed=${susername}&backgroundType=gradientLinear`
                                }
                                alt="Profile preview"
                                className="object-cover w-full h-full"
                              />
                              <AvatarFallback>
                                {susername?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <button
                              type="button"
                              onClick={removeProfilePic}
                              className="absolute -top-2 -right-2 bg-[#0a2c42] rounded-full p-1 border border-[#1e5b82]"
                            >
                              <X className="h-4 w-4 text-white/80" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group">
                            <Avatar className="w-24 h-24">
                              <AvatarImage
                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${
                                  sname || "User"
                                }&backgroundType=gradientLinear`}
                                alt="Default profile"
                                className="object-cover w-full h-full"
                              />
                              <AvatarFallback>
                                {(sname || "User").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -top-2 -right-2 bg-[#0a2c42] text-white text-xs font-medium px-2 py-1 rounded-full border border-[#1e88e5] shadow-md">
                              Default
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-white mt-1">
                        JPG, JPEG or PNG. Max 5MB.
                      </p>

                      <div className="w-full">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                          accept="image/jpg, image/jpeg, image/png"
                        />
                        <Button
                          type="button"
                          onClick={triggerFileInput}
                          className="w-full bg-[#0e3a56] hover:bg-[#1e5b82] text-white border border-[#1e5b82] transition-colors duration-300 ease-in-out"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {profilePic ? "Change Picture" : "Upload Picture"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-white hover:bg-gray-200 text-black transition-colors duration-300 ease-in-out"
                  >
                    Sign Up{" "}
                    {isLoading && (
                      <div className="flex space-x-1">
                        <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse1"></span>
                        <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse2"></span>
                        <span className="dot w-2 h-2 bg-black rounded-full inline-block animate-pulse3"></span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}

export default Auth;
