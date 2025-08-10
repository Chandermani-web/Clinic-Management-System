import { configureStore } from "@reduxjs/toolkit";
import signinReducer from "../Store/Signin.Slice.js";
import AssignTokenSliceReducer from '../Store/AssignToken.Slice.js';

const Store = configureStore({
  reducer: {
    signin: signinReducer,
    token: AssignTokenSliceReducer
  },
});

export default Store;