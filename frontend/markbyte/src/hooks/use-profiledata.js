/* This custom hook fetches the user's profile data from the server and transforms it into a format suitable for display.*/
import { useState, useCallback, useEffect } from "react";
import { getUserInfo } from "@/services/userService";

function useProfileData() {
  const [profileData, setProfileData] = useState(null);

  const fetchProfileData = useCallback(async () => {
    try {
      // Create an array of promises for all the requests
      const profileResponse = await getUserInfo();
      // Combine all responses into a single object
      const combinedData = {
        style: profileResponse.data.style || "default",
        name: profileResponse.data.name || "User",
        profilepicture: profileResponse.data.profile_picture
          ? `${profileResponse.data.profile_picture}?t=${Date.now()}`
          : null,
        email: profileResponse.data.email || null,
      };

      setProfileData(combinedData);
      return combinedData;
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  }, []);
  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  return {
    profileData,
    fetchProfileData,
  };
}

export default useProfileData;
