// main.jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css"; // Import your global CSS file
import Auth from "./components/auth";
import SignIn from "./components/signIn";
import { MainFeed } from "./components/FeedComponents/MainFeed"; // Update import path
import Layout from "./Layout";
import { Sidebar } from "./components/Sidebar";
import { ChooseUsername } from "./components/ChooseUsername"; // Update import path


const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello world!</div>,
  },
  {
    path: "/Register",
    element: <Auth />,
  },
  {
    path: "/SignIn",
    element: <SignIn />,
  },
  {
    path: "/ChooseUsername",
    element: <ChooseUsername />, // Update import path
  },
  {
    path: "/ConnectApp",
    element: <Layout><Sidebar/><MainFeed /></Layout>, // Update import path
  },
  {
    path: "/ConnectApp/Comment",
    element: <Layout><Sidebar/></Layout>, // Update import path
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
