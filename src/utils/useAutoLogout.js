import { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

const useAutoLogout = (timeoutDuration = 10 * 10000) => {
  const navigate = useNavigate();
  const [hasLoggedOut, setHasLoggedOut] = useState(false); // Track if logged out
  let timeoutId;

  const logoutUser = useCallback(() => {
    if (!hasLoggedOut) {
      // Show the alert only once before logging out
      alert("You have been logged out due to inactivity.");
      setHasLoggedOut(true); // Mark as logged out to prevent further alerts
    }

    // Clear the access_token from localStorage
    localStorage.removeItem("access_token");

    // Perform logout logic (e.g., clear tokens or session)
    navigate("/login");
  }, [navigate, hasLoggedOut]);

  const handleUserActivity = useCallback(() => {
    // Clear and reset the inactivity timer on user activity
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      logoutUser();
    }, timeoutDuration);
  }, [logoutUser, timeoutDuration]);

  useEffect(() => {
    // Add event listeners for user activity
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    // Start the inactivity timer
    timeoutId = setTimeout(() => {
      logoutUser();
    }, timeoutDuration);

    // Cleanup: Remove event listeners and clear timeout
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, [handleUserActivity, logoutUser, timeoutDuration]);

  return null; // This component doesn't need to render anything
};

export default useAutoLogout;
