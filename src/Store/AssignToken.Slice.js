import { createSlice } from "@reduxjs/toolkit";

// Get tokens from sessionStorage on load
const getInitialToken = () => {
  try {
    const tokenData = sessionStorage.getItem("tokens");
    return tokenData ? JSON.parse(tokenData) : [];
  } catch (error) {
    console.error("Error parsing Token from sessionStorage:", error);
    return [];
  }
};

const initialState = {
  token: getInitialToken(),
};

const AssignTokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    // Add new token
    assigntokens: (state, action) => {
      const { Assigntokendetails, TokenNumber } = action.payload;

      const Data = {
        ...Assigntokendetails,
        TokenNumber,
        date: new Date().toLocaleDateString(),
        time: new Date(Date.now()).toLocaleTimeString(),
        active: true,
      };

      state.token.push(Data);
    },

    // Set tokens from Firebase directly
    setTokensFromFirebase: (state, action) => {
      state.token = action.payload;

      // Sync with sessionStorage
      sessionStorage.setItem("tokens", JSON.stringify(action.payload));
    },

    // Clear all tokens
    removetoken: (state) => {
      state.token = [];
      sessionStorage.removeItem("tokens");
    },
  },
});

export const { assigntokens, removetoken, setTokensFromFirebase } =
  AssignTokenSlice.actions;

export default AssignTokenSlice.reducer;