// main.jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css"; // Import your global CSS file
import Auth from "./components/auth";
import SignIn from "./components/signIn";
import { MainFeed } from "./components/MainFeed";
import Layout from "./Layout";
import { Sidebar } from "./components/Sidebar";
import { ChooseUsername } from "./components/ChooseUsername";

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
    element: <ChooseUsername />,
  },
  {
    path: "/ConnectApp",
    element: <Layout><Sidebar/><MainFeed /></Layout>
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
