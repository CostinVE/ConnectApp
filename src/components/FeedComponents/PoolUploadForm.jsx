import React, {useState} from 'react'

import '../../index.css';
import { database, auth, storage } from '../../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, arrayUnion} from 'firebase/firestore';
import {ref, getDownloadURL, uploadBytes} from 'firebase/storage'
import { getUserByUserID } from "../getUserByUsername.jsx";


import avatarIMG from "../../assets/avatarIMG.png"; // Adjust the import path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import imageUploadPlaceholder from "../../assets/imageuploadplaceholder.png"

 const PoolUploadForm = () => {
   
  const [newPost, setNewPost] = useState('');
  const [Option1, setOption1] = useState('');
  const [Option2, setOption2] = useState('');
  const [Option3, setOption3] = useState('');
  const [Option4, setOption4] = useState('');

  const tweetCollectionRef = collection(database, "pooltweets");
  


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
          FirstOption: Option1,
          SecondOption: Option2,
          ThirdOption: Option3,
          FourthOption: Option4,
          TotalVotesCounter: 0,
          Option1Votes: 0,
          Option2Votes: 0,
          Option3Votes: 0,
          Option4Votes: 0,
          Reposts: 0,
          Likes: 0,
          Bookmarks: 0,
          Timestamp: generateTimestamp(),
          UserId: userID,
          UserName: user.username,
        })
  
        // Update the PostRef collection with the document ID
        const PostRef = doc(database, "Users", userID); // Reference to the document in the Users collection corresponding to the current user
        await updateDoc(PostRef, {
          Posts: arrayUnion(newPostID)
        });
  
        // Clear the input field after posting
        setNewPost('');
  setOption1('');
  setOption2('');
  setOption3('');
  setOption4('');

      } else {
        console.error('User not found');
      }
    } catch (err) {
      console.error(err);
    }
  };

    return (
        <section className="flex-none flex-col w-5/12 lato-regular">
        <div className="flex flex-row w-full justify-center my-4">
          <p className="text-lg">Create a pool</p>
        </div>
       
          <section className="flex flex-col rounded-lg Shadow">
            <div className="flex flex-row mx-2 my-4 justify-between">
           <img
              id="CommentIMG"
              src={avatarIMG}
              className="col-start-1 col-end-1 row-start-1 row-end-2"
              style={{ height: "42px", borderRadius: "50%", marginLeft: "1em",}}
              alt="User Avatar"
            />
            <input
              className="col-start-2 col-end-4 row-start-1 w-80 row-end-3 border-none"
              placeholder="What should others vote ?"
              value={newPost}
              style={{ height: "52px", minWidth: "65%" }}
              onChange={(event) => setNewPost(event.target.value)}
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full" onClick={onPost}>Post</button>
            </div>
            <input id="Option1" value={Option1} className="w-100 row-end-3 border-none mx-2 my-1" onChange={(event) => setOption1(event.target.value)} placeholder='First option'/>
            <input id="Option2" value={Option2} className="w-100 row-end-3 border-none mx-2 my-1" onChange={(event) => setOption2(event.target.value)} placeholder='Seccond option'/>
            <input id="Option3" value={Option3} className="w-100 row-end-3 border-none mx-2 my-1" onChange={(event) => setOption3(event.target.value)} placeholder='Third option'/>
            <input id="Option4" value={Option4} className="w-100 row-end-3 border-none mx-2 my-1" onChange={(event) => setOption4(event.target.value)} placeholder='Fourth option'/>
            <div className="flex my-8 justify-center">

            </div>
          </section>
          {/* Feed space */}
        </section>
      );
}

export default PoolUploadForm
