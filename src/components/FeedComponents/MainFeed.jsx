import avatarIMG from "../../assets/avatarIMG.png"; // Adjust the import path
import gifPNG from "../../assets/gif.png"; // Adjust the import path
import emojiPNG from "../../assets/smile.png"; // Adjust the import path
import pollPNG from "../../assets/polling.png"; // Adjust the import path
import imagePNG from "../../assets/imageupload.png"; // Adjust the import path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";



import React, { useState, useEffect} from "react";
import '../../index.css';
import { database, auth, storage } from '../../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, arrayUnion} from 'firebase/firestore';
import {ref, getDownloadURL} from 'firebase/storage'
import { getUserByUserID } from "../getUserByUsername.jsx";
import TweetComponent from "./TweetComponent.jsx";
import { useNavigate } from "react-router-dom";
import { EmojiHolder } from "../../assets/EmojiHolder.jsx";


export const MainFeed = () => {
  
  const [tweetList, setTweetList] = useState([])
  const [newPost, setNewPost] = useState('');
  
  
  const navigate = useNavigate()

  const handleUploadImage = () => {
    navigate("/ConnectApp/ImagePost");
  }

  const handlePoolUpload= () => {
    navigate("/ConnectApp/PoolPost");
  }



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
      console.log(userID)
  
      // Get the user data based on the UID
      const user = await getUserByUserID(userID);
  
      // Check if the user data is available
      if (user) {
        // Add the post to the tweet collection
        const newPostRef = await addDoc(tweetCollectionRef, {
          Post: newPost,
          Reposts: 0,
          Likes: 0,
          Bookmarks: 0,
          Timestamp: generateTimestamp(),
          UserId: userID,
          UserName: user.username,
        })
  
         // Retrieve the ID of the newly created post
         const newPostID = newPostRef.id;

         // Update the PostRef collection with the document ID
         const userRef = doc(database, "Users", userID); // Reference to the document in the Users collection corresponding to the current user
         await updateDoc(userRef, {
             Posts: arrayUnion(newPostID)
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
  
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Refresh only the specified part after 1.5 seconds
      const userID = auth?.currentUser?.uid;
      console.log(userID);
      getDownloadURL(ref(storage, `profileimages/${userID}`))
        .then((url) => {
          const img = document.getElementById('ProfileIMG');
          img.setAttribute('src', url);
        })
        .catch((error) => {
          console.error('Error setting image source:', error);
        });
    }, 500);

    // Cleanup the timeout to prevent memory leaks
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array ensures this effect runs only once

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prevState => !prevState);
  };

  const handleEmojiClick = (emoji) => {
    setNewPost((prevPost) => prevPost + emoji);
  };
  

  
  
  return (
    <div className="flex-none flex-col w-5/12 lato-regular my-10 overflow-y-auto ">
     

    {/* Tweet form */}
      <section className="grid grid-cols-4 gap-2 Shadow">
        <img
          id="ProfileIMG"
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

        <div className="col-start-2 col-end-4 row-start-2 row-end-2 flex items-center relative">
          <img src={imagePNG} onClick={handleUploadImage} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Image Icon" />
          <img src={gifPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="GIF Icon" />
          <img src={emojiPNG} onClick={toggleEmojiPicker} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Emoji Icon" />
          <img src={pollPNG} onClick={handlePoolUpload} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Poll Icon" />
        </div>
        {showEmojiPicker && <EmojiHolder onEmojiClick={handleEmojiClick} />}
        <div className="col-start-4 col-end-5 row-start-2 row-end-3">
          <button className="bg-indigo-600 hover:bg-indigo-500 w-2/3 text-white font-bold py-2 px-5 rounded-full" onClick={onPost}>Post</button>
        </div>
        <div
                className="commentDiv"
                id={`commentDiv`}
                style={{
                  display: "none",
                  top: "100%",
                  left: "0",
                  backgroundColor: "white",
                  padding: "10px",
                }}
              ></div>
      </section>
      {/* Feed space */}
      <section className="flex-col w-full">
      <TweetComponent />
      </section>
    </div>
  );
};


