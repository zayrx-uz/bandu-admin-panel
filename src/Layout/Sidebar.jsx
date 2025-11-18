import React, { useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import logo from "../../public/logo_img.png";

export default function Sidebar({
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;
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
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/company", label: "Company", icon: "🏢" },
    { path: "/users", label: "Users", icon: "👥" },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gray-800 dark:bg-gray-900 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col z-50 overflow-hidden`}>
      {/* Logo/Brand */}
      <div className={`p-4 border-b border-gray-700 flex items-center flex-shrink-0 ${isOpen ? 'justify-between' : 'justify-center'}`}>
        {isOpen && (
          <Link
            to="/"
            className="text-2xl font-medium leading-[1.3] transition-colors duration-300 text-white">
            <img
              src={logo}
              alt="Bandu Logo"
              className="m-1 h-6"
            />
          </Link>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
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
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }>
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      {isAuthenticated && (
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
              </div>
            )}
          </div>

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
              <div className="flex items-center justify-between p-2">
                <span className="text-sm text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
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
        </div>
      )}
    </div>
  );
}

