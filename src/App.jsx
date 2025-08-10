import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { app } from "./Firebase/Firebase.js";
import Signup from './Pages/Signup.jsx';

const auth = getAuth(app);

const App = () => {
  const [isUserLoggedIn, setisUserLoggedIn] = useState(null);

  useEffect(()=>{
    onAuthStateChanged(auth , (user) => {
      if(user){
        setisUserLoggedIn(user);
      }else{
        console.log('Logged Out');
        setisUserLoggedIn(null);
      }
    })
  },[])

  if(isUserLoggedIn === null) {
    return(
      <div className="bg-gray-50 min-h-screen">
        <Signup />
      </div>
    )
  }

  return (
      <div>
        <Navbar />
        <Outlet  />
        <Footer />
      </div>
  );
};

export default App;
