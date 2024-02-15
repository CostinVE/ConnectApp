import avatarIMG from "../assets/avatarIMG.png";
import gifPNG from "../assets/gif.png";
import emojiPNG from "../assets/smile.png";
import pollPNG from "../assets/polling.png";
import imagePNG from "../assets/imageupload.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";


import React, { useState, useEffect } from "react";
import '../index.css';
import { database, auth } from '../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs} from 'firebase/firestore';

export const MainFeed = () => {
  
  const [tweetList, setTweetList] = useState([])
  const [newPost, setNewPost] = useState('');

  const tweetCollectionRef = collection(database, "tweets");

  const getUserName = async (userID) => {
    try {
      const userDoc = await doc(database, 'users', userID).get();
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.name || userData.email; // Use username if available, otherwise use email
      } else {
        return 'Unknown User';
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return 'Unknown User';
    }
  };
  

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
  

  useEffect(() => {
    const getTweetList = async () => {
       const userName = await getUserName(auth?.currentUser?.uid);
      try {
        const data = await getDocs(tweetCollectionRef);
        const filteredData = data.docs.map(doc => ({...doc.data(), id: doc.id}));
        console.log(filteredData);
        setTweetList(filteredData)
      } catch (err) {
        console.error(err);
      }
    };

    getTweetList(); 
  }, []); 



  const onPost = async () => {
    const userName = await getUserName(auth?.currentUser?.uid);
    try {
      await addDoc(tweetCollectionRef, {
        Post: newPost,
        Likes: 0,
        Timestamp: generateTimestamp(), // Get the current timestamp
        UserId: auth?.currentUser?.uid,
        UserName: userName
      });
      setNewPost(''); // Clear the input field after posting
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
      {tweetList.map((tweet) => (
        <div className="flex-col" key={tweet.id}> {/* Make sure to add a unique key for each rendered element */}
        <div className="flex flex-row my-5">
         <img
          src={avatarIMG}
          className="col-start-1 col-end-1 row-start-1 row-end-2"
          style={{ height: "32px", borderRadius: "50%",}}
          alt="User Avatar"
        />
        <p className="lato-bold"> &nbsp; {tweet.Username}</p>
        </div>
        <p className="flex flex-col my-5">{tweet.Post}</p>
        <p>{formattedDate(tweet.Timestamp?.seconds)}</p>
        <div className="flex flex-row w-full justify-evenly ">
          <p><FontAwesomeIcon icon={faComment} style={{color: "#3f44d9",}} /></p>
          <p><FontAwesomeIcon icon={faRepeat} rotation={90} style={{color: "#28d74b",}} /></p>
          <p><FontAwesomeIcon icon={faHeart} style={{color: "#e60f4f",}} /> {tweet.Likes}</p></div>
          <p><FontAwesomeIcon icon={faBookmark} style={{color: "#3f44d9",}}/></p>
        </div>))}
      </section>
    </div>
  );
};

