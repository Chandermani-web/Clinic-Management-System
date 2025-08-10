// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrIkXYAKV7LALtawsgXMrOu40ArE_ycvo",
  authDomain: "clinic-management-system-eb56e.firebaseapp.com",
  projectId: "clinic-management-system-eb56e",
  storageBucket: "clinic-management-system-eb56e.appspot.com",
  messagingSenderId: "362264215134",
  appId: "1:362264215134:web:fd5fc7eed8e4ecbf9c3ecf",
  measurementId: "G-HXY8PRXWD6",
  databaseURL: "https://clinic-management-system-eb56e-default-rtdb.firebaseio.com"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);