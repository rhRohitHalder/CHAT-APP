import { BellIcon, LogOutIcon, ShipWheelIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { Link, useLocation } from "react-router";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const NavBar = () => {
  // User authentication and data
  const { authUserData } = useAuthUser();
  const user = authUserData?.user;
  const location = useLocation();

  // State to track browser zoom level for responsive scaling
  const [zoomLevel, setZoomLevel] = useState(1);

  // const isChatPage =
  //   location.pathname?.startsWith("/chat") || location.pathname === "/chat";

  const { logoutMutation } = useLogout();

  /**
   * Effect to handle browser zoom level changes
   * Updates the zoomLevel state when the user zooms in/out
   */
  useEffect(() => {
    const handleResize = () => {
      // Get the current device pixel ratio (accounts for zoom level)
      setZoomLevel(window.devicePixelRatio);
    };

    // Initial check on component mount
    handleResize();

    // Add event listener for window resize events
    window.addEventListener("resize", handleResize);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * Calculates responsive values based on the current zoom level
   * @param {number} base - Base size value
   * @param {number} multiplier - Multiplier for the base size
   * @returns {number} - Calculated responsive size
   */
  const getResponsiveValue = (base, multiplier = 1) => {
    // Scale down sizes when zoomed in to prevent UI elements from becoming too large
    return base * Math.min(1, 1 / zoomLevel) * multiplier;
  };

  // Responsive dimensions
  const navHeight = `${getResponsiveValue(4, 4)}rem`; // Navigation bar height
  const iconSize = getResponsiveValue(1.5, 1.5); // Base size for icons
  const textSize = getResponsiveValue(1.25, 1.25); // Base size for text

  return (
    <nav
      className="bg-base-200 border-b border-base-300 sticky top-0 z-30 w-full flex items-center"
      style={{
        height: navHeight,
        minHeight: "4rem",
        maxHeight: "6rem",
      }}
    >
      <div className="w-full px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {/* {isChatPage && (
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center gap-2">
                <ShipWheelIcon
                  className="text-primary"
                  style={{
                    width: `${iconSize * 1.5}rem`,
                    height: `${iconSize * 1.5}rem`,
                    minWidth: "1.5rem",
                    minHeight: "1.5rem",
                  }}
                />
                <span
                  className="font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider"
                  style={{
                    fontSize: `${textSize}rem`,
                    lineHeight: 1.2,
                  }}
                >
                  Streamify
                </span>
              </Link>
            </div>
          )} */}

          {/* 
            Mobile Logo Section - Only visible on small screens (hidden on lg and up)
            Shows the app logo and name on the left side of the navbar on mobile
          */}
          <div className="lg:hidden">
            <Link to="/" className="flex items-center gap-2 p-1">
              {/* App Logo Icon */}
              <ShipWheelIcon
                className="text-primary"
                style={{
                  width: `${iconSize * 1.8}rem`, // Responsive width based on zoom
                  height: `${iconSize * 1.8}rem`, // Responsive height based on zoom
                  minWidth: "1.8rem", // Minimum size to ensure visibility
                  minHeight: "1.8rem", // Minimum size to ensure visibility
                }}
              />
              {/* App Name */}
              <span
                className="text-xl font-bold font-mono text-base-content"
                style={{
                  fontSize: `${textSize * 3}rem`, // Slightly larger text for better visibility
                  lineHeight: 5, // Tighter line height for compact display
                }}
              >
                Streamify
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            <Link to={"/notification"} className="flex-shrink-0">
              <button
                className="btn btn-ghost btn-circle p-2"
                style={{
                  minHeight: "2.5rem",
                  height: "2.5rem",
                  width: "2.5rem",
                }}
              >
                <BellIcon
                  className="text-base-content opacity-90"
                  style={{
                    width: `${iconSize}rem`,
                    height: `${iconSize}rem`,
                    minWidth: "1.25rem",
                    minHeight: "1.25rem",
                  }}
                />
              </button>
            </Link>

            <div className="flex-shrink-0">
              <ThemeSelector zoomLevel={zoomLevel} />
            </div>

            {/* User Profile Avatar - Shows the logged-in user's profile picture */}
            <div className="avatar flex-shrink-0">
              <div
                className="rounded-full overflow-hidden"
                style={{
                  width: `${iconSize * 1.5}rem`, // Responsive size based on zoom
                  height: `${iconSize * 1.5}rem`, // Responsive size based on zoom
                  minWidth: "2.25rem", // Minimum size for touch targets
                  minHeight: "2.25rem", // Minimum size for touch targets
                }}
              >
                {/* User's profile picture with cover sizing */}
                <img
                  src={user?.profilePic}
                  alt="User Avatar"
                  className="w-full h-full object-cover" // Ensures image covers container
                />
              </div>
            </div>

            {/* Logout Button - Handles user logout */}
            <button
              className="btn btn-ghost btn-circle p-1 flex-shrink-0"
              onClick={logoutMutation}
              aria-label="Logout"
              style={{
                minHeight: "2.5rem", // Minimum height for touch targets
                height: "2.5rem", // Fixed height for consistency
                width: "2.5rem", // Fixed width for consistency
              }}
            >
              {/* Logout Icon with responsive sizing */}
              <LogOutIcon
                className="text-base-content opacity-90" // Uses theme colors
                style={{
                  width: `${iconSize}rem`, // Responsive icon size
                  height: `${iconSize}rem`, // Responsive icon size
                  minWidth: "1.25rem", // Ensure visibility at small sizes
                  minHeight: "1.25rem", // Ensure visibility at small sizes
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
