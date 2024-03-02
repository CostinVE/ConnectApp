import avatarIMG from "../../assets/avatarIMG.png"; // Adjust the import path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import imageUploadPlaceholder from "../../assets/imageuploadplaceholder.png"


import React, { useState, useEffect} from "react";
import '../../index.css';
import { database, auth, storage } from '../../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, arrayUnion} from 'firebase/firestore';
import {ref, getDownloadURL, uploadBytes} from 'firebase/storage'
import { getUserByUserID } from "../getUserByUsername.jsx";




const ImageUploadForm = () => {
  const [newPost, setNewPost] = useState("");
  const [imageFile, setImageFile] = useState(null);
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




  const uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg, image/png';
    input.onchange = (event) => {
        const file = event.target.files[0];
        setImageFile(file);
        const imageUrl = URL.createObjectURL(file);
        document.getElementById("ImageUploadPlaceHolder").src = imageUrl;
    };
    input.click();
  };

  const handlePostClick = async () => {
    if (!imageFile) {
      console.error("No image selected.");
      return;
    }

    try {
      const userID = auth?.currentUser?.uid;
      const imageCollectionRef = collection(database, "imagetweets");
      const user = await getUserByUserID(userID);
  
      if (!imageFile) {
        alert("No image selected.");
        return;
      }
  
      const newPostData = {
        Post: newPost,
        Reposts: 0,
        Likes: 0,
        Bookmarks: 0,
        Timestamp: generateTimestamp(),
        UserId: userID,
        UserName: user.username,
        Image: '' // Placeholder for imageURL
      };
  
      const newPostRef = await addDoc(imageCollectionRef, newPostData);
      const newPostID = newPostRef.id;
  
      // Update the PostRef collection with the document ID
      const PostRef = doc(database, "Users", userID); // Reference to the document in the Users collection corresponding to the current user
      await updateDoc(PostRef, {
        ImagePosts: arrayUnion(newPostID)
      });
  
  
      // Upload image to storage
      const storageRef = ref(storage, `imageuploads/${newPostID}`);
      await uploadBytes(storageRef, imageFile);
  
      // Update the document to include the Image field with the value being the document ID
      await updateDoc(newPostRef, { Image: newPostID });
  
      // Clear the input field after posting
      setNewPost('');
      console.log("Image uploaded successfully.");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  
return (
  <section className="flex-none flex-col w-5/12 lato-regular">
  <div className="flex flex-row w-full justify-center my-4">
    <p className="text-lg">Upload an image</p>
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
        placeholder="What is happening?!"
        style={{ height: "52px", minWidth: "65%" }}
        value={newPost}
        onChange={(event) => setNewPost(event.target.value)}
      />
      <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full" onClick={handlePostClick}>Post</button>
      </div>
      
      <div className="flex my-8 justify-center">
      <img
            id="ImageUploadPlaceHolder"
            onClick={uploadImage}
            src={imageUploadPlaceholder}
            className="col-start-1 col-end-1 row-start-1 row-end-1"
            style={{
              height: "380px",
              width:"320px",
              borderRadius: "12%",
              cursor:"pointer"
            }}
            alt="User Avatar"
          />             
      </div>
    </section>
    {/* Feed space */}
  </section>
);
};

export default ImageUploadForm