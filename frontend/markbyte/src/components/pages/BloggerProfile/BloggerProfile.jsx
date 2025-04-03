import DashboardHeader from "@/components/ui/dashboardheader";
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
} from "lucide-react";

function BloggerProfile() {
  const { user, fetchUserInfo } = useAuth();
  const { toast } = useToast();
  const { profileData, fetchProfileData } = useProfileData();
  const [usercssStyle, setUserCssStyle] = useState("");
  const [cssStyle, setCssStyle] = useState("");
  const [usersName, setUsersName] = useState("");
  const [Name, setName] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const inputRef = useRef(null);
  const checkRef = useRef(null);
  const options = [
    { value: "default", label: "Default", icon: Sparkles },
    { value: "old", label: "Classic", icon: History },
    { value: "futuristic", label: "Futuristic", icon: CircuitBoard },
  ];
  const handleSaveName = () => {
    if (Name.trim() === usersName.trim()) {
      setIsEditingName(false);
      setName(usersName);
      return;
    }

    axios
      .post(`${API_URL}/user/name`, { name: Name }, { withCredentials: true })
      .then((response) => {
        // Ensure the profile data is fetched and state is updated after the name change
        fetchProfileData();
        fetchUserInfo();

        setUsersName(Name);
        setName(Name);

        toast({
          title: "Success",
          description: "Name updated successfully.",
          variant: "success",
          action: <CheckCircle size={30} color="green" />,
          className: "bg-green-100 text-green-800",
          duration: 3000,
        });
        setIsEditingName(false);
      })
      .catch((error) => {
        // Handle error case here
        console.error("Error updating name:", error);
      });
  };

  // on page mount, fetch the css style from the server
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

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

  useEffect(() => {
    if (profileData && profileData.style) {
      setUserCssStyle(profileData.style);
      setCssStyle(profileData.style);
    }
    if (profileData && profileData.name) {
      setName(profileData.name);
      setUsersName(profileData.name);
    }
    if (profileData && profileData.profilepicture) {
      setProfilePicture(profileData.profilepicture);
      setUserProfilePicture(profileData.profilepicture);
    }
  }, [profileData]);

  function handleStyleChange(value) {
    setCssStyle(value);
  }

  function handleUpdateStyle() {
    axios
      .post(
        `${API_URL}/user/style`,
        { style: cssStyle },
        { withCredentials: true }
      )
      .then((response) => {
        fetchProfileData();
        setUserCssStyle(cssStyle);
        setCssStyle(cssStyle);
        toast({
          title: "Success",
          description: "Style updated successfully.",
          variant: "success",
          action: <CheckCircle size={30} color="green" />,
          className: "bg-green-100 text-green-800",
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error("Error updating style:", error);
      });
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
                <Avatar className="h-28 w-28 border-[5px] border-white shadow-xl">
                  <AvatarImage
                    src={
                      userProfilePicture ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${usersName}&backgroundType=gradientLinear`
                    }
                    alt="Profile preview"
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback>{usersName?.charAt(0)}</AvatarFallback>
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
                  <div className="text-sm font-normal text-gray-500 mt-1">
                    @{user.name}
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
    </div>
  );
}

export default BloggerProfile;
