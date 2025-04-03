import DashboardHeader from "@/components/ui/dashboardheader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState, useRef } from "react";
import useProfileData from "@/hooks/use-profiledata";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  Palette,
  Save,
  Sparkles,
  Eye,
  InfoIcon,
  History,
  CircuitBoard,
  Pencil,
  Check,
  Mail,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function BloggerProfile() {
  const { user, name, profilepicture, email, style, fetchUserInfo } = useAuth();
  const { toast } = useToast();
  const [usercssStyle, setUserCssStyle] = useState(style);
  const [cssStyle, setCssStyle] = useState(style);
  const [usersName, setUsersName] = useState(name);
  const [Name, setName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [profilePicture, setProfilePicture] = useState(profilepicture);
  const [previewPicture, setPreviewPicture] = useState(null);
  const [imagefile, setimageFile] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const inputRef = useRef(null);
  const checkRef = useRef(null);
  const fileInputRef = useRef(null);
  const options = [
    { value: "default", label: "Default", icon: Sparkles },
    { value: "old", label: "Classic", icon: History },
    { value: "futuristic", label: "Futuristic", icon: CircuitBoard },
  ];

  const handleSaveName = async () => {
    if (Name.trim() === usersName.trim()) {
      setIsEditingName(false);
      setName(usersName);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/user/name`,
        { name: Name },
        { withCredentials: true }
      );

      const newData = await fetchUserInfo();
      setUsersName(newData.name);
      setName(newData.name);

      toast({
        title: "Success",
        description: "Name updated successfully.",
        variant: "success",
        action: <CheckCircle size={30} color="green" />,
        className: "bg-green-100 text-green-800",
        duration: 3000,
      });

      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
    }
  };

  const handlePfpUpload = async () => {
    if (!imagefile) return;
    const formData = new FormData();
    formData.append("profile_picture", imagefile);
    try {
      await axios.post(`${API_URL}/user/pfp`, formData, {
        withCredentials: true,
      });

      const newData = await fetchUserInfo();
      const cacheBustedUrl = `${newData.profilepicture}?t=${Date.now()}`;

      // Update only one state variable
      setProfilePicture(cacheBustedUrl);

      // Reset the preview and file input
      setPreviewPicture(null);
      setimageFile(null);
      setImageDialogOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
        variant: "success",
        action: <CheckCircle size={30} color="green" />,
        className: "bg-green-100 text-green-800",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleUpdateStyle = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/user/style`,
        { style: cssStyle },
        { withCredentials: true }
      );
      const newData = await fetchUserInfo();

      setUserCssStyle(newData.style);
      setCssStyle(newData.style);

      toast({
        title: "Success",
        description: "Style updated successfully.",
        variant: "success",
        action: <CheckCircle size={30} color="green" />,
        className: "bg-green-100 text-green-800",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating style:", error);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setimageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        // Set preview instead of changing the actual profile picture
        setPreviewPicture(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeProfilePic = () => {
    // Reset preview only, not the actual profile picture
    setPreviewPicture(null);
    setimageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  useEffect(() => {
    function handleClickOutside(event) {
      // Make sure the click is not on input or check icon
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        checkRef.current &&
        !checkRef.current.contains(event.target)
      ) {
        setIsEditingName(false);
        setName(usersName);
        document.removeEventListener("mousedown", handleClickOutside);
      }
    }

    if (isEditingName) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingName]);

  function handleStyleChange(value) {
    setCssStyle(value);
  }

  return (
    <div className="BloggerProfile min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 text-gray-200 overflow-hidden transition-colors duration-300">
      <DashboardHeader />
      <div className="flex-1 flex justify-center items-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="w-11/12 max-w-xl border border-gray-200 shadow-xl rounded-xl overflow-hidden bg-white"
        >
          <Card className="border-none shadow-none">
            <div className="h-24 bg-gradient-to-r from-[#084464] to-[#011522] relative">
              <div className="absolute -bottom-14 left-6">
                <Avatar
                  className="h-28 w-28 border-[5px] border-white shadow-xl cursor-pointer"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onClick={() => {
                    setImageDialogOpen(true);
                  }}
                >
                  <AvatarImage
                    src={
                      profilePicture
                        ? `${profilePicture}`
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${usersName}&backgroundType=gradientLinear`
                    }
                    alt="Profile preview"
                    className="object-cover w-full h-full"
                  />

                  <AvatarFallback>{usersName?.charAt(0)}</AvatarFallback>

                  {/* Overlay with image icon on hover */}
                  <div
                    className={`absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold transition-opacity duration-300 rounded-full ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <ImageIcon className="h-6 w-6" />
                  </div>
                </Avatar>
              </div>
            </div>
            <CardHeader className="pt-16 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {!isEditingName && (
                      <span className="text-gray-800">{usersName}</span>
                    )}
                    {isEditingName ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="text"
                          value={Name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-40"
                          ref={inputRef}
                        />

                        <button
                          onClick={() => {
                            handleSaveName();
                          }}
                          className="h-5 w-5 cursor-pointer"
                          ref={checkRef}
                        >
                          <Check color="green" />
                        </button>
                      </div>
                    ) : (
                      <Pencil
                        className="h-4 w-4 cursor-pointer"
                        onClick={() => setIsEditingName(true)}
                      />
                    )}
                  </CardTitle>
                  <div className="text-sm font-normal text-gray-500 mt-1 flex items-center">
                    <span>@{user.name}</span>
                    {userEmail && (
                      <>
                        <span className="mx-2">|</span>{" "}
                        {/* Add the separator here */}
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4"></Mail>
                          <span>{userEmail}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="py-8 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-[#003b5c]" />
                    Post Styles
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                      <RadioGroup
                        value={cssStyle}
                        onValueChange={handleStyleChange}
                        className="flex flex-col space-y-4"
                      >
                        {options.map(({ value, label, icon: Icon }) => (
                          <div
                            key={value}
                            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                              cssStyle === value
                                ? "bg-blue-50 border border-blue-200"
                                : "border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value={value}
                                id={value}
                                className="border-[#003b5c] "
                              />
                              <Label
                                htmlFor={value}
                                className="text-gray-800 font-medium cursor-pointer flex items-center gap-2"
                              >
                                <Icon className="h-4 w-4 text-[#003b5c]" />
                                {label}
                              </Label>
                            </div>
                            {usercssStyle === value && (
                              <div className="flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {usercssStyle !== cssStyle && (
                      <div className="flex justify-start">
                        <Button
                          className="group relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600"
                          onClick={() => {
                            handleUpdateStyle();
                          }}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <span className="relative flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-[#003b5c]" />
                      <span>Preview</span>
                      <div className="h-px flex-1 bg-gray-100"></div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="aspect-video w-full overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md relative group">
                        <img
                          src={
                            cssStyle === "default"
                              ? "/assets/defaultview.png"
                              : cssStyle === "old"
                              ? "/assets/oldview.png"
                              : cssStyle === "futuristic"
                              ? "/assets/futuristicview.png"
                              : ""
                          }
                          alt="Interface preview"
                          className="w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                        <InfoIcon className="h-3 w-3 min-w-[1rem] flex-shrink-0" />

                        {cssStyle === "default"
                          ? "Modern, clean interface, with table of contents"
                          : cssStyle === "old"
                          ? "Classic interface with neutral gray tones"
                          : cssStyle === "futuristic"
                          ? "Futuristic interface with neon accents and holographic effects"
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Dialog
        open={imageDialogOpen}
        onOpenChange={(open) => {
          setImageDialogOpen(open);
          if (!open) {
            // Reset preview when dialog closes
            setPreviewPicture(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px] rounded-xl p-0 overflow-hidden bg-slate-50">
          <div className="bg-gradient-to-r from-[#003b5c] to-[#0a5a7c] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-3xl font-bold font-['DM Sans'] flex items-center justify-center gap-2">
                <ImageIcon className="h-6 w-6 inline-block mr-2" />
                Upload Profile Picture
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex flex-row items-center justify-center p-8 bg-slate-50 rounded-lg shadow-sm">
            <div className="flex flex-col items-center gap-6 w-full max-w-xs">
              {/* Profile Picture Preview */}
              <div className="relative group">
                <Avatar className="w-48 h-48 border-4 border-white shadow-lg transition-all duration-300 hover:shadow-xl">
                  <AvatarImage
                    src={
                      previewPicture
                        ? previewPicture
                        : profilePicture ||
                          `https://api.dicebear.com/9.x/initials/svg?seed=${
                            usersName || "User"
                          }&backgroundType=gradientLinear`
                    }
                    alt="Profile preview"
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="bg-blue-600 text-white text-4xl">
                    {usersName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {!previewPicture ? (
                  <div className="absolute -top-1 -right-1 bg-[#0e3a56] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    Current
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={removeProfilePic}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-1.5 shadow-md transition-colors duration-200"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col items-center gap-3 w-full">
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  accept="image/jpg, image/jpeg, image/png"
                />

                <Button
                  type="button"
                  onClick={triggerFileInput}
                  className="w-full bg-[#0e3a56] hover:bg-[#1e5b82] text-white font-medium py-2.5 rounded-md transition-all duration-200 shadow-sm hover:shadow"
                >
                  {previewPicture
                    ? "Choose Different Picture"
                    : "Select New Picture"}
                </Button>

                {previewPicture && (
                  <Button
                    type="button"
                    className="w-full bg-white hover:bg-gray-50 text-blue-600 font-medium py-2.5 border border-blue-200 rounded-md flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
                    onClick={handlePfpUpload}
                  >
                    <Upload className="h-4 w-4" />
                    Save as Profile Picture
                  </Button>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  JPG, JPEG or PNG. Max 5MB.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BloggerProfile;
