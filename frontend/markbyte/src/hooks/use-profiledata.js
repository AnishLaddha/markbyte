import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";

function useProfileData() {
  const [profileData, setProfileData] = useState(null);

  const fetchProfileData = useCallback(async () => {
    try {
      // Create an array of promises for all the requests

      const profileResponse = await axios.get(`${API_URL}/user/info`, {
        withCredentials: true,
      });

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
