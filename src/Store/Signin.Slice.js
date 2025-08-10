// src/Store/signinSlice.js
import { createSlice } from "@reduxjs/toolkit";

const getInitialSignin = () => {
  const saved = sessionStorage.getItem("userData");
  try {
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error parsing userData from sessionStorage:", error);
    return null;
  }
};

const userData = getInitialSignin();

const initialState = {
  username: userData?.username || "",
  password: userData?.password || "",
  activeRole: userData?.activeRole || "",
  isAuthenticated: userData?.isAuthenticated || false,
  error: null,
};

const signinSlice = createSlice({
  name: "signin",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { username, password, activeRole } = action.payload;
      state.username = username;
      state.password = password;
      state.activeRole = activeRole;
      state.isAuthenticated = true;
      state.error = null;

      // Store in sessionStorage
      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          username,
          password,
          activeRole,
          isAuthenticated: true,
        })
      );
    },

    clearCredentials: (state) => {
      state.username = "";
      state.password = "";
      state.activeRole = "";
      state.isAuthenticated = false;
      state.error = null;

      sessionStorage.removeItem("userData");
    },
  },
});

export const { setCredentials, clearCredentials } = signinSlice.actions;
export default signinSlice.reducer;
