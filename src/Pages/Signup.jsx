import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Required to style toast notifications
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { ToastContainer } from "react-toastify";
import { app } from "../Firebase/Firebase"; // Adjust the import path as necessary
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../Store/Signin.Slice.js";
import { useDispatch } from "react-redux";

const auth = getAuth(app);
const googleprovider = new GoogleAuthProvider();
const githubprovider = new GithubAuthProvider();

const Signup = () => {
  const [activeRole, setActiveRole] = useState("doctor");
  const [loading, setloading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);

    if (!formData.username.trim() || !formData.password) {
      toast.error("Please fill in all fields");
      setloading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.username,
        formData.password
      );
      const user = userCredential.user;

      dispatch(
        setCredentials({
          username: formData.username,
          password: formData.password,
          activeRole: activeRole,
          isAuthenticated: true,
        })
      );

      toast.success(
        `Welcome ${user.email}! You are signed in as ${activeRole}.`,
        {
          position: "top-right",
          autoClose: 1000,
          onClose: () => {
            navigate("/complete-profile", { state: { role: activeRole } });
          },
        }
      );

      setFormData({ username: "", password: "" });
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Error signing up:", error);
    } finally {
      setloading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signInWithPopup(auth, googleprovider)
      .then((result) => {
        const user = result.user;
        toast.success(
          `Welcome ${user.email}! You are signed in as ${activeRole}.`,
          {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeButton: true,
            closeOnClick: true,
            pauseOnFocusLoss: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            onClose: () => {
              // after successful createUserWithEmailAndPassword or OAuth login
              navigate("/complete-profile", { state: { role: activeRole } });
            },
          }
        );
        console.log("User signed in with Google:", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(`Error: ${errorMessage}`);
        console.error("Error signing in with Google:", errorCode, errorMessage);
      });
  };

  const handleGithubSignUp = () => {
    signInWithPopup(auth, githubprovider)
      .then((result) => {
        const user = result.user;
        toast.success(
          `Welcome ${user.email}! You are signed in as ${activeRole}.`,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeButton: true,
            closeOnClick: true,
            pauseOnFocusLoss: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            onClose: () => {
              // after successful createUserWithEmailAndPassword or OAuth login
              navigate("/complete-profile", { state: { role: activeRole } });
            },
          }
        );
        console.log("User signed in with Google:", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        toast.error(`Error: ${errorMessage}`);
        console.error("Error signing in with Google:", errorCode, errorMessage);
      });
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-sm shadow-lg w-96 xl:w-150 flex flex-col">
        <div className="flex flex-col items-center mb-10 leading-0">
          <h2 className="text-4xl font-bold mb-6 text-center text-blue-800">
            Clinic Management System
          </h2>
          <p>Create an account to access the clinic management system</p>
        </div>

        <div className="flex p-1 gap-1 bg-zinc-300 rounded-sm mb-6">
          <button
            type="button"
            className={`flex-1 rounded-2xl text-gray-500 py-2 transition ${
              activeRole === "doctor"
                ? "bg-gray-100 text-gray-900 font-bold"
                : "hover:bg-gray-200"
            }`}
            onClick={() => handleRoleChange("doctor")}
          >
            <i className="ri-user-line mr-2"></i>
            Doctor
          </button>
          <button
            type="button"
            className={`flex-1 rounded-2xl text-gray-500 py-2 transition ${
              activeRole === "receptionist"
                ? "bg-gray-100 text-gray-900 font-bold"
                : "hover:bg-gray-200"
            }`}
            onClick={() => handleRoleChange("receptionist")}
          >
            <i className="ri-shield-line mr-2"></i>
            Receptionist
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="email"
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username or email"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 transition duration-200"
            type="submit"
          >
            {loading
              ? "Sign Up..."
              : `Sign Up As ${
                  activeRole.charAt(0).toUpperCase() + activeRole.slice(1)
                }`}
          </button>
        </form>
        <ToastContainer />
        <p className="text-center mt-4 font-semibold">
          If you already have an account, please{" "}
          <Link
            to={"/signin"}
            className="text-blue-400 font-semibold hover:text-shadow-blue-800 transition duration-300"
          >
            Sign In
          </Link>
          .
        </p>
        <div className="flex justify-center mt-5">
          <button>
            <img
              src="https://cdn3.iconfinder.com/data/icons/logos-brands-3/24/logo_brand_brands_logos_google-1024.png"
              alt="Google"
              onClick={handleGoogleSignUp}
              className="w-10 h-10 ml-2 border-2 rounded-full p-2 hover:scale-110 hover:shadow-2xl hover:p-1 transition duration-300"
            />
          </button>
          <button>
            <img
              src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-social-github-1024.png"
              alt="GitHub"
              className="w-10 h-10 ml-2 border-2 rounded-full p-2 hover:scale-110 hover:shadow-2xl hover:p-1 transition duration-300"
              onClick={handleGithubSignUp}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
