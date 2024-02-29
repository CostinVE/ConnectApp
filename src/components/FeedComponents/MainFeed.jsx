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


  const [isImageUploadForm, setImageUploadForm] = useState(false);
  
  const openImageUploadForm = () => {
    setImageUploadForm(true);
  };

  const closeImageUploadForm = () => {
    setImageUploadForm(false);
  };

  const handleDivClick = (event) => {
    // Check if the clicked element is the div itself
    if (event.target === event.currentTarget) {
      // Call closeImageUploadForm only when clicking on the div itself
      closeImageUploadForm();
    }
  };

  const handleShowDivClick = (id) => {
    const commentDiv = document.getElementById(`commentDiv-${id}`);
    if (commentDiv) {
      commentDiv.style.display = "block";
    }
  };

  const handleHideDivClick = (id) => {
    const commentDiv = document.getElementById(`commentDiv-${id}`);
    if (commentDiv) {
      commentDiv.style.display = "none";
    }
  };

  


  const ImageUploadForm = () => {
    const [newPost, setNewPost] = useState("");
    const [user, setUser] = useState(null); // State to store user data

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const userID = auth?.currentUser?.uid;
          const userData = await getUserByUserID(userID);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      };

      fetchUserData(); // Fetch user data when component mounts
    }, []);

    const addImageToTweet = async () => {
      try {
        // Add the comment only to the tweet that is currently being interacted with
        const parentDocRef = doc(database, "tweets", tweetList[0].id); // Change the index as needed
        await addDoc(collection(parentDocRef, "comments"), {
          commentText: newPost,
          Likes: 0,
          Username: user ? user.username : "Unknown",
        });
      } catch (error) {
        console.error("Error adding comment to tweet:", error);
      }
    };
    return (
      <div
        id="commentform"
        className="fixed h-full w-full inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10"
        onClick={handleDivClick}
      >
        <div className="flex-col w-1/3 h-2/4 p-5 bg-white rounded-xl">
          <FontAwesomeIcon
            icon={faXmark}
            style={{ color: "#3658dd", fontSize: "24px", cursor: "pointer" }}
            onClick={closeImageUploadForm}
          />
          <div className="grid grid-cols-6 gap-2 my-8">
            <img
              id="ProfileIMG"
              src={avatarIMG}
              className="col-start-1 col-end-1 row-start-1 row-end-1"
              style={{
                height: "42px",
                borderRadius: "50%",
                marginLeft: "1.5em",
                marginTop: "1.5em",
              }}
              alt="User Avatar"
            />
            <input
              className="col-start-2 col-end-4 row-start-1 w-80 row-end-1 border-none"
              placeholder="What is happening?!"
              style={{ height: "200px", minWidth: "100%", border: "none" }}
              onChange={(event) => setNewPost(event.target.value)}
            />

            <div className="col-start-2 col-end-2 row-start-7 row-end-7 flex items-center">
              <img
                src={imagePNG}
                style={{
                  height: "20px",
                  marginRight: "40px",
                  cursor: "pointer",
                }}
                alt="Image Icon"
              />
              <img
                src={gifPNG}
                style={{
                  height: "20px",
                  marginRight: "40px",
                  cursor: "pointer",
                }}
                alt="GIF Icon"
              />
              <img
                src={emojiPNG}
                style={{
                  height: "20px",
                  marginRight: "40px",
                  cursor: "pointer",
                }}
                alt="Emoji Icon"
              />
            </div>
            <div className="col-start-5 col-end-5 row-start-7 row-end-7">
              <button
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-2  rounded-full"
                onClick={addImageToTweet}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
          UserName: user.username // Use user.username directly
        });
  
        // Get the document ID of the newly added post
        const newPostID = newPostRef.id;
  
        // Update the PostRef collection with the document ID
        const PostRef = doc(database, "Users", userID); // Reference to the document in the Users collection corresponding to the current user
        await updateDoc(PostRef, {
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
          const img = document.getElementById('CommentIMG');
          img.setAttribute('src', url);
        })
        .catch((error) => {
          console.error('Error setting image source:', error);
        });
    }, 500);

    // Cleanup the timeout to prevent memory leaks
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array ensures this effect runs only once

  
  
  
  return (
    <div className="flex-none flex-col w-5/12 lato-regular ">
      <div className="grid w-9/12 grid-cols-2 gap-x-2 my-5">
        <p className="lato-bold ">For you</p>
        <p className="lato-bold opacity-50">Following</p>
      </div>

    {/* Tweet form */}
      <section className="grid grid-cols-4 gap-2 Shadow">
        <img
          id="CommentIMG"
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
          <img src={imagePNG} onClick={openImageUploadForm} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Image Icon" />
          <img src={gifPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="GIF Icon" />
          <img src={emojiPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Emoji Icon" />
          <img src={pollPNG} style={{ height: '20px', marginRight: "40px", cursor: "pointer" }} alt="Poll Icon" />
        </div>
        <div className="col-start-4 col-end-5 row-start-2 row-end-3">
          <button className="bg-indigo-600 hover:bg-indigo-500 w-2/3 text-white font-bold py-2 px-5 rounded-full" onClick={onPost}>Post</button>
        </div>
        {isImageUploadForm && <ImageUploadForm />}
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

