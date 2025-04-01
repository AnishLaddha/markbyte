import DashboardHeader from "@/components/ui/dashboardheader";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useEffect } from "react";
import useProfileData from "@/hooks/use-profiledata";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

function BloggerProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, fetchProfileData } = useProfileData();
  const [usercssStyle, setUserCssStyle] = useState("");
  const [cssStyle, setCssStyle] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name);
  const handleSaveName = () => {
    setIsEditingName(false);
  };

  // on page mount, fetch the css style from the server
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
    if (profileData && profileData.style) {
      setUserCssStyle(profileData.style);
      setCssStyle(profileData.style);
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
        fetchProfileData(); // Refresh the profile data after updating
        setUserCssStyle(cssStyle); // Update the local state with the new style
        setCssStyle(cssStyle); // Update the local state with the new style
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
          className="w-11/12 max-w-lg border border-gray-200 shadow-xl rounded-xl overflow-hidden"
        >
          <Card>
            <div className="h-24 bg-gradient-to-r from-[#084464] to-[#011522] relative">
              <div className="absolute -bottom-12 left-6">
                <Avatar className="cursor-pointer bg-gray-200 mr-3 h-20 w-20 rounded-full border-2 border-white shadow-lg">
                  <AvatarImage
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}&backgroundType=gradientLinear`}
                  />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardHeader className="pt-16">
              <CardTitle className="text-2xl font-bold text-gray-800">
                {user.name}
                <div className="text-sm font-normal text-gray-500">
                  {user.name}
                </div>
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="py-8 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Post Styles
                  </h3>
                  <div className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                    Appearance
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                      <RadioGroup
                        value={cssStyle}
                        onValueChange={handleStyleChange}
                        className="flex flex-col space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <RadioGroupItem
                            value="default"
                            id="default"
                            className="border-gray-300"
                          />
                          <Label
                            htmlFor="default"
                            className="text-gray-700 font-medium cursor-pointer flex items-center gap-2"
                          >
                            Default
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <RadioGroupItem
                            value="old"
                            id="old"
                            className="border-gray-300"
                          />
                          <Label
                            htmlFor="old"
                            className="text-gray-700 font-medium cursor-pointer"
                          >
                            Classic
                          </Label>
                        </div>
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

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span>Preview</span>
                      <div className="h-px flex-1 bg-gray-100"></div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="aspect-video w-full overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md">
                        <img
                          src={
                            cssStyle === "default"
                              ? "/assets/defaultview.png"
                              : "/assets/oldview.png"
                          }
                          alt="Interface preview"
                          className="w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-[1.02]"
                        />
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        {cssStyle === "default"
                          ? "Modern, clean interface"
                          : "Classic interface with neutral gray tones"}
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
