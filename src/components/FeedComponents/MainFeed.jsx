import avatarIMG from "../../assets/avatarIMG.png"; // Adjust the import path
import gifPNG from "../../assets/gif.png"; // Adjust the import path
import emojiPNG from "../../assets/smile.png"; // Adjust the import path
import pollPNG from "../../assets/polling.png"; // Adjust the import path
import imagePNG from "../../assets/imageupload.png"; // Adjust the import path


import React, { useState,} from "react";
import '../../index.css';
import { database, auth } from '../../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs} from 'firebase/firestore';
import { getUserByUserID } from "../getUserByUsername.jsx";
import TweetComponent from "./TweetComponent.jsx";

export const MainFeed = () => {
  
  const [tweetList, setTweetList] = useState([])
  const [newPost, setNewPost] = useState('');

  const tweetCollectionRef = collection(database, "tweets");

  

  const generateTimestamp = () => {
    return Timestamp.now(); // This will give you the current timestamp
  };

  const formattedDate = (timestamp) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = new Date(timestamp * 1000).toLocaleTimeString('en-US', options);
    
    const options2 = { day: '2-digit', month: '2-digit' };
    const dateString = new Date(timestamp * 1000).toLocaleDateString('en-US', options2);
    
    return `${timeString}, ${dateString}`;
  };
  
  
  const onPost = async () => {
    try {
      // Get the current user's UID
      const userID = auth?.currentUser?.uid;
  
      // Get the user data based on the UID
      const user = await getUserByUserID(userID);
  
      // Check if the user data is available
      if (user) {
        // Add the post to the tweet collection
        await addDoc(tweetCollectionRef, {
          Post: newPost,
          Likes: 0,
          Timestamp: generateTimestamp(),
          UserId: userID,
          UserName: user.username // Use user.username directly
        });
  
        // Clear the input field after posting
        setNewPost('');
      } else {
        console.error('User not found');
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  
  
  return (
    <div className="flex-none flex-col w-5/12 lato-regular ">
      <div className="grid w-9/12 grid-cols-2 gap-x-2 my-5">
        <p className="lato-bold ">For you</p>
        <p className="lato-bold opacity-50">Following</p>
      </div>

    {/* Tweet form */}
      <section className="grid grid-cols-4 gap-2 Shadow">
        <img
          src={avatarIMG}
          className="col-start-1 col-end-1 row-start-1 row-end-2"
          style={{ height: "42px", borderRadius: "50%", marginLeft: "2em" }}
          alt="User Avatar"
        />
        <input
          className="col-start-2 col-end-4 row-start-1 w-80 row-end-3 border-none"
          placeholder="What is happening?!"
          style={{ height: "52px", minWidth: "150%" }}
          value={newPost}
          onChange={(event) => setNewPost(event.target.value)}
        />

        <div className="col-start-2 col-end-4 row-start-2 row-end-2 flex items-center">
          <img src={imagePNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Image Icon" />
          <img src={gifPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="GIF Icon" />
          <img src={emojiPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Emoji Icon" />
          <img src={pollPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Poll Icon" />
        </div>
        <div className="col-start-4 col-end-5 row-start-2 row-end-3">
          <button className="bg-indigo-600 hover:bg-indigo-500 w-2/3 text-white font-bold py-2 px-5 rounded-full" onClick={onPost}>Post</button>
        </div>
      </section>
      {/* Feed space */}
      <section className="flex-col w-full">
      <TweetComponent />
      </section>
    </div>
  );
};

