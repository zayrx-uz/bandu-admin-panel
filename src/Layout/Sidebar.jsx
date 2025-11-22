import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Button, IconButton } from "@material-tailwind/react";
import { useAuth } from "../context/AuthContext";
import logo from "../../public/logo_img.png";

export default function Sidebar({
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
}) {
  // Load sidebar state from localStorage on mount
  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState !== null ? savedState === 'true' : true; // Default to true (open) if not saved
  });
  
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  // Create a wrapper function that saves to localStorage
  const handleSetIsOpen = (value) => {
    const currentValue = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const newValue = typeof value === 'function' ? value(currentValue) : value;
    
    if (controlledSetIsOpen) {
      controlledSetIsOpen(newValue);
    } else {
      setInternalIsOpen(newValue);
    }
    // Save to localStorage
    localStorage.setItem('sidebarOpen', newValue.toString());
  };
  
  const setIsOpen = handleSetIsOpen;
  
  // Save to localStorage whenever isOpen changes (for controlled mode)
  React.useEffect(() => {
    if (controlledIsOpen !== undefined) {
      localStorage.setItem('sidebarOpen', controlledIsOpen.toString());
    }
  }, [controlledIsOpen]);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [user?.profilePicture]);

  const hasValidProfilePicture =
    user?.profilePicture &&
    typeof user.profilePicture === "string" &&
    user.profilePicture.trim() !== "" &&
    !imageError;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
<<<<<<< Updated upstream
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/company", label: "Company", icon: "🏢" },
    { path: "/users", label: "Users", icon: "👥" },
=======
    { 
      path: "/", 
      label: "Home", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      path: "/company", 
      label: "Company", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      path: "/company-categories", 
      label: "C_Categories", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      )
    },
    { 
      path: "/resource", 
      label: "Resource", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    { 
      path: "/resource-categories", 
      label: "R_Categories", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    },
    { 
      path: "/floor", 
      label: "Floor", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    { 
      path: "/place", 
      label: "Place", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      path: "/coupon", 
      label: "Coupon", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      )
    },
    { 
      path: "/users", 
      label: "Users", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
>>>>>>> Stashed changes
  ];

  return (
    <div
<<<<<<< Updated upstream
      className={`fixed left-0 top-0 h-screen bg-gray-800 dark:bg-gray-900 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col z-50 overflow-hidden`}>
=======
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 text-gray-950 transition-all duration-300 ${
        isOpen ? "max-w-[250px] w-[250px]" : "w-20"
      } flex flex-col z-50 overflow-hidden shadow-sm`}>
>>>>>>> Stashed changes
      {/* Logo/Brand */}
      <div className={`p-4 border-b border-gray-700 flex items-center flex-shrink-0 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <Link
            to="/"
            className="text-2xl font-medium leading-[1.3] transition-colors duration-300 text-white">
            <img
              src={logo}
              alt="Bandu Logo"
              className="m-1 h-7"
            />
          </Link>
        )}
        <IconButton
          variant="text"
          onClick={() => setIsOpen(!isOpen)}
<<<<<<< Updated upstream
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
=======
          className="rounded-lg">
>>>>>>> Stashed changes
          {isOpen ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </IconButton>
      </div>

      {/* Navigation Menu */}
<<<<<<< Updated upstream
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
=======
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
>>>>>>> Stashed changes
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center ${isOpen ? 'gap-3' : 'justify-center'} p-[9px] rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }>
<<<<<<< Updated upstream
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
=======
            <span className="flex-shrink-0">{item.icon}</span>
            {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
>>>>>>> Stashed changes
          </NavLink>
        ))}
      </nav>

      {/* User Profile and Action Buttons Section */}
      {isAuthenticated && (
<<<<<<< Updated upstream
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10 rounded-full border-2 border-gray-600 overflow-hidden bg-blue-500 flex items-center justify-center flex-shrink-0">
              {hasValidProfilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user?.fullName || "User"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="text-white font-semibold text-sm">
                  {(
                    user?.fullName?.trim()?.charAt(0) ||
                    user?.username?.trim()?.charAt(0) ||
                    "U"
                  ).toUpperCase()}
                </span>
              )}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || user?.username || "User"}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.role || ""}
                </p>
=======
        <div className={`p-4 border-t border-gray-200 flex flex-col ${isOpen ? 'items-stretch' : 'items-center'} gap-2`}>
          {/* User Profile - Name and Logo */}
          <div
            onClick={() => navigate("/profile")}
            className={`flex items-center ${isOpen ? 'gap-3' : 'justify-center'} p-[9px] rounded-lg transition-colors cursor-pointer text-gray-600 hover:bg-gray-100 hover:text-gray-950 ${
              location.pathname === "/profile" ? "bg-gray-950 text-white font-medium" : ""
            }`}>
            <span className="flex-shrink-0">
              <div className="relative w-8  h-8 rounded-full border border-gray-300 overflow-hidden bg-gray-950 flex items-center justify-center">
                {hasValidProfilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.fullName || "User"}    
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-white font-semibold text-xs">
                    {(
                      user?.fullName?.trim()?.charAt(0) ||
                      user?.username?.trim()?.charAt(0) ||
                      "U"
                    ).toUpperCase()}
                  </span>
                )}
              </div>
            </span>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <span className="text-sm whitespace-nowrap block truncate">
                  {user?.fullName || user?.username || "User"}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap block truncate">
                  Role: {user?.role || "SUPER_ADMIN"}
                </span>
>>>>>>> Stashed changes
              </div>
            )}
          </div>

<<<<<<< Updated upstream
          {isOpen && (
            <div className="space-y-2">
              <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-2 rounded-lg text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors text-sm">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Log Out
              </button>
            </div>
          )}
=======
          {/* Action Buttons */}
          <div className={`flex flex-col ${isOpen ? 'gap-1' : 'gap-2'}`}>
            {/* Settings button */}
            <Button
              variant={location.pathname === "/settings" ? "filled" : "text"}
              color={location.pathname === "/settings" ? "gray" : "gray"}
              onClick={() => navigate("/settings")}
              className={`${isOpen ? 'w-full flex items-center gap-3 justify-start' : 'w-full flex items-center justify-center'} flex-shrink-0`}
              size="sm"
              title={!isOpen ? "Settings" : undefined}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {isOpen && <span>Settings</span>}
            </Button>
            
            {/* Logout button */}
            <Button
              variant="text"
              color="red"
              onClick={handleLogout}
              className={`${isOpen ? 'w-full flex items-center gap-3 justify-start' : 'w-full flex items-center justify-center'} flex-shrink-0`}
              size="sm"
              title={!isOpen ? "Log Out" : undefined}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {isOpen && <span>Log Out</span>}
            </Button>
          </div>
>>>>>>> Stashed changes
        </div>
      )}
    </div>
  );
}

