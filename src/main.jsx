// main.jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css"; // Import your global CSS file
import Auth from "./components/auth";
import SignIn from "./components/signIn";
import { MainFeed } from "./components/FeedComponents/MainFeed"; 
import Layout from "./Layout";
import { Sidebar } from "./components/Sidebar";
import { ChooseUsername } from "./components/ChooseUsername"; 
import { ProfilePage } from "./components/Profile/ProfilePage";
import { BookmarksFeed } from "./components/Profile/BookmarksFeed";
import ImageUploadForm from "./components/FeedComponents/ImageUploadForm";
import PoolUploadForm from "./components/FeedComponents/PoolUploadForm";

let reloadFlag = localStorage.getItem('reloadProfilePage');

window.addEventListener('beforeunload', () => {
    if (!reloadFlag) {
        localStorage.setItem('reloadProfilePage', 'true');
    }
});

if (reloadFlag === 'true') {
    localStorage.removeItem('reloadProfilePage');
    window.location.reload(); // Reload the page
}


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
    path: "/ConnectApp/Profile",
    element:  <Layout>
      <Sidebar/>
      <ProfilePage />
      </Layout>
    
  },
  {
    path: "/ConnectApp",
    element: <Layout><Sidebar/><MainFeed /></Layout>, // Update import path
  },
  {
    path: "/ConnectApp/Comment",
    element: <Layout><Sidebar/></Layout>, // Update import path
  },
  {
    path: "/ConnectApp/Bookmarks",
    element: <Layout><Sidebar/><BookmarksFeed/></Layout>, // Update import path
  },
  {
    path: "/ConnectApp/ImagePost",
    element: <Layout><Sidebar/><ImageUploadForm/></Layout>, // Update import path
  },
  {
    path: "/ConnectApp/PoolPost",
    element: <Layout><Sidebar/><PoolUploadForm/></Layout>, // Update import path
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
