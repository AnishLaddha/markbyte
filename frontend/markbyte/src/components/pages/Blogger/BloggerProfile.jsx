/* This component is used to display the user's profile information, including their name, email, and profile picture. 
It also allows the user to update their profile information, including their name, profile picture, style, and about page */
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
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  User,
  Download,
  FileText,
  Flower,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateName,
  uploadProfilePicture,
  updateStyle,
  uploadUserAbout,
} from "@/services/userService";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import useUserAbout from "@/hooks/use-userabout";

function BloggerProfile() {
  const { user, name, profilepicture, email, style, fetchUserInfo } = useAuth();
  const { about, error, fetchAbout } = useUserAbout(user.name);
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
  const [aboutFileName, setAboutFileName] = useState(null);
  const aboutFileRef = useRef(null);
  const inputRef = useRef(null);
  const checkRef = useRef(null);
  const fileInputRef = useRef(null);
  const options = [
    { value: "default", label: "Default", icon: Sparkles },
    { value: "old", label: "Classic", icon: History },
    { value: "futuristic", label: "Futuristic", icon: CircuitBoard },
    { value: "pink", label: "Flowery Pink", icon: Flower },
  ];

  // Handles a change to the user's name input field
  const handleSaveName = async () => {
    if (Name.trim() === usersName.trim()) {
      setIsEditingName(false);
      setName(usersName);
      return;
    }

    try {
      await updateName(Name);
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

  // Handles the upload of the profile picture
  const handlePfpUpload = async () => {
    if (!imagefile) return;
    try {
      await uploadProfilePicture(imagefile);
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

  // Handles the update of the user's style preference
  const handleUpdateStyle = async () => {
    try {
      await updateStyle(cssStyle);
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

  // Handles the upload of the about page file
  const handleUploadAboutPage = async () => {
    if (!aboutFileName) return;
    try {
      const file = aboutFileRef.current.files[0];
      if (!file) return;
      await uploadUserAbout(file);
      // call fetchAbout to refresh the about page data
      await fetchAbout();
      setAboutFileName(null);
      if (aboutFileRef.current) aboutFileRef.current.value = "";
      toast({
        title: "Success",
        description: "About page uploaded successfully.",
        variant: "success",
        action: <CheckCircle size={30} color="green" />,
        className: "bg-green-100 text-green-800",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload about page.",
        variant: "destructive",
        className: "bg-red-100 text-red-800",
        duration: 3000,
      });
    }
  };

  // Handles the file upload for the profile picture
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

  // Handles the file change for the about page upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAboutFileName(file.name);
    }
  };

  // Handles the removal of the about page file name
  const handleRemoveAboutFile = () => {
    setAboutFileName(null);
    if (aboutFileRef.current) aboutFileRef.current.value = "";
  };

  // Triggers the file input for profile picture upload
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Removes the profile picture preview
  const removeProfilePic = () => {
    setPreviewPicture(null);
    setimageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handles the click outside to close the name editing input
  useEffect(() => {
    function handleClickOutside(event) {
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
          className="w-13/14 max-w-2xl border border-gray-200 shadow-xl rounded-xl overflow-hidden bg-white"
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
            {/* Style selection and about page upload section */}
            <CardContent className="py-8 space-y-6">
              {/* Style Selection Section */}
              <div className="space-y-6">
                <div className="flex flex-col items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-[#003b5c]" />
                    Styles
                  </h3>
                  <p className="text-sm text-gray-500">
                    Choose your preferred style for your posts, landing page,
                    and about page.
                  </p>
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
                            onClick={() => setCssStyle(value)}
                            className={`cursor-pointer flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                              cssStyle === value
                                ? "bg-blue-50 border border-blue-200"
                                : "border border-gray-200"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem
                                value={value}
                                id={value}
                                className="border-[#003b5c] pointer-events-none" // prevent double-handling
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

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                      <Carousel key={cssStyle} className="w-full max-w-3xl">
                        <CarouselContent>
                          <CarouselItem className="basis-full">
                            <div className="aspect-[3/2] w-full overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md relative group">
                              <img
                                src={
                                  cssStyle === "default"
                                    ? "/assets/defaultview.png"
                                    : cssStyle === "old"
                                    ? "/assets/classicview.png"
                                    : cssStyle === "futuristic"
                                    ? "/assets/futuristicview.png"
                                    : cssStyle === "pink"
                                    ? "/assets/pinkview.png"
                                    : ""
                                }
                                alt="Interface preview"
                                className="w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-105"
                              />
                              <div className="absolute bottom-2 left-3 bg-white text-black text-sm px-3 py-1 rounded-full opacity-60">
                                Post Preview
                              </div>
                            </div>
                          </CarouselItem>
                          <CarouselItem className="basis-full">
                            <div className="aspect-[3/2] w-full overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md relative group">
                              <img
                                src={
                                  cssStyle === "default"
                                    ? "/assets/defaultlanding.png"
                                    : cssStyle === "old"
                                    ? "/assets/classiclanding.png"
                                    : cssStyle === "futuristic"
                                    ? "/assets/futuristiclanding.png"
                                    : cssStyle === "pink"
                                    ? "/assets/pinklanding.png"
                                    : ""
                                }
                                alt="Interface preview"
                                className="w-full h-full object-cover object-center transform transition-transform duration-300 hover:scale-105"
                              />
                              <div className="absolute bottom-2 left-3 bg-white text-black text-sm px-3 py-1 rounded-full opacity-60">
                                Landing Preview
                              </div>
                            </div>
                          </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full shadow p-2" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full shadow p-2" />
                      </Carousel>
                      <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                        <InfoIcon className="h-3 w-3 min-w-[1rem] flex-shrink-0" />

                        {cssStyle === "default"
                          ? "Modern, clean interface"
                          : cssStyle === "old"
                          ? "Classic interface"
                          : cssStyle === "futuristic"
                          ? "Futuristic interface with neon accents and holographic effects"
                          : cssStyle === "pink"
                          ? "Flowery pink interface with floral elements and soft colors"
                          : ""}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Separator />
              {/* About page upload section */}
              <div className="space-y-6">
                <div className="flex flex-col items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#003b5c]" />
                    About Page
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload your .md file for the about page.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex flex-col space-y-4">
                    {about ? (
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-gray-800 font-medium">
                              About page uploaded
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs bg-white hover:bg-gray-50"
                              onClick={() =>
                                window.open(`/${user.name}/about`, "_blank")
                              }
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Preview
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <InfoIcon className="h-5 w-5 text-amber-500" />
                          <span className="text-gray-800 font-medium">
                            No about page uploaded yet
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 relative border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all duration-200 hover:border-blue-400 bg-white">
                      {aboutFileName && (
                        <button
                          className="absolute -top-3 -right-3 z-10 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-all duration-200"
                          onClick={() => {
                            handleRemoveAboutFile();
                          }}
                        >
                          ✕
                        </button>
                      )}
                      <Input
                        type="file"
                        id="about-file"
                        ref={aboutFileRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".md"
                        onChange={(e) => {
                          handleFileChange(e);
                        }}
                      />
                      {!aboutFileName && (
                        <div className="flex flex-col items-center justify-center text-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700">
                            Drag and drop your markdown file here
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            or click to browse
                          </p>
                          <p className="text-xs text-gray-400 mt-3">
                            Supports .md files up to 1MB
                          </p>
                        </div>
                      )}
                      {aboutFileName && (
                        <div className="flex flex-col items-center justify-center text-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700">
                            {aboutFileName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click to change file
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center mt-2">
                      <Button
                        disabled={!aboutFileName}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200
                          ${
                            !aboutFileName
                              ? "text-gray-400 cursor-not-allowed bg-gray-100"
                              : "text-white bg-[#005a7a] hover:bg-[#084464]"
                          }`}
                        onClick={() => {
                          handleUploadAboutPage();
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        {about ? "Update About Page" : "Upload About Page"}
                      </Button>
                    </div>
                    <div className="flex flex-col items-center mt-4">
                      <div className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-500" />
                            <div>
                              <span className="text-gray-800 font-medium block">
                                About Page Template
                              </span>
                              <span className="text-xs text-gray-500">
                                Get started with our pre-formatted template
                              </span>
                            </div>
                          </div>
                          <a href="/assets/abouttemplate.md" download>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-[#005a7a] border-[#005a7a] hover:text-[#084464]"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Profile Picture Upload Dialog */}
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
