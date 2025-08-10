import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Store from "./Store/Store.js";
import { Provider } from "react-redux";

// Lazy loaded components
const Signin = lazy(() => import("./Pages/Signin.jsx"));
const Signup = lazy(() => import("./Pages/Signup.jsx"));
const Dashboard = lazy(() => import("./Pages/Dashboard.jsx"));
const AssignToken = lazy(() => import("./Pages/AssignToken.jsx"));
const CreateBill = lazy(() => import("./Pages/CreateBill.jsx"));
const PatientRecords = lazy(() => import("./Pages/PatientRecords.jsx"));
const PatientDetails = lazy(()=>import("./Pages/PatientDetails.jsx"));
const SignUpDetails = lazy(() => import("./Pages/SignUpDetails.jsx"));

// Routing configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Signup />,
  },
  {
    path: "/complete-profile",
    element: <SignUpDetails />
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/Clinic-Management",
    element: <App />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "assign-token",
        element: <AssignToken />,
      },
      {
        path: "create-bill",
        element: <CreateBill />,
      },
      {
        path: "patient-records",
        element: <PatientRecords />,
      },{
        path: "patientdetails",
        element: <PatientDetails />
      }
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={Store}>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  </StrictMode>
);
