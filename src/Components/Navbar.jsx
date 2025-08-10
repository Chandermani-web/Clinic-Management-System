import React, { useState } from "react";
import { Link } from "react-router-dom";
import "remixicon/fonts/remixicon.css";
import { useDispatch } from "react-redux";
import { clearCredentials } from "../Store/Signin.Slice.js";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../Firebase/Firebase.js";

const auth = getAuth(app);

const Navbar = () => {
  const [isActive, setIsActive] = useState(
    JSON.parse(sessionStorage.getItem("ActiveNavLink")) || "dashboard"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
    signOut(auth);
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    {
      path: "/Clinic-Management/dashboard",
      name: "dashboard",
      label: "Dashboard",
    },
    {
      path: "/Clinic-Management/assign-token",
      name: "assign-token",
      label: "Assign Token",
    },
    {
      path: "/Clinic-Management/create-bill",
      name: "create-bill",
      label: "Create Bill",
    },
    {
      path: "/Clinic-Management/patient-records",
      name: "patient-records",
      label: "Patient Records",
    },
  ];

  return (
    <nav className="bg-white text-black shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl md:text-xl font-bold text-black">
              <i className="ri-nurse-fill text-blue-700 text-3xl"></i>
              Clinic Management
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <div className="flex space-x-4 lg:space-x-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-[13px] font-medium ${
                    isActive === link.name
                      ? "bg-blue-700 text-white"
                      : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                  onClick={() => {
                    setIsActive(link.name);
                    sessionStorage.setItem("ActiveNavLink", JSON.stringify(link.name));
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <button
            className="ml-4 bg-gray-100 text-black border-2 border-gray-300 py-1 px-2 rounded-sm hover:bg-red-700 hover:text-white transition duration-200 flex items-center text-[13px]"
            onClick={handleLogout}
          >
            <i className="ri-logout-box-line mr-1"></i>Log Out
          </button>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="bg-gray-100 text-black border-2 py-1 px-3 rounded-xl hover:bg-red-700 hover:text-white transition duration-200 flex items-center mr-2"
              onClick={handleLogout}
            >
              <i className="ri-logout-box-line"></i>
            </button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-white hover:bg-gray-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <i
                className={`ri-${
                  isMenuOpen ? "close-line" : "menu-line"
                } text-2xl`}
              ></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive === link.name
                  ? "bg-blue-700 text-white"
                  : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              }`}
              onClick={() => {
                setIsActive(link.name);
                setIsMenuOpen(false);
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
