import { useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";

function useProfileData() {
  const [profileData, setProfileData] = useState(null);

  const fetchProfileData = useCallback(async () => {
    try {
      // Create an array of promises for all the requests
      const requests = [
        axios.get(`${API_URL}/user/style`, { withCredentials: true }),
      ];

      const [styleResponse] = await Promise.all(requests);

      // Combine all responses into a single object
      const combinedData = {
        style: styleResponse.data,
      };

      setProfileData(combinedData);
      return combinedData;
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  }, []);

  return {
    profileData,
    fetchProfileData,
  };
}

export default useProfileData;
