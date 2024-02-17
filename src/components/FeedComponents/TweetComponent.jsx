import avatarIMG from "../../assets/avatarIMG.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";


import React, { useState, useEffect } from "react";
import '../../index.css';
import { database, auth } from '../../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs} from 'firebase/firestore';
import { getUserByUserID } from "./getUserByUsername.jsx";


const TweetComponent = () => {
  const [tweetList, setTweetList] = useState([]);
  const tweetCollectionRef = collection(database, "tweets");
  const navigate = useNavigate()

  const getUserName = async (userID) => {
    try {
      const user = await getUserByUsername(userID);
      return user ? user.username : 'Unknown User';
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
        const filteredData = data.docs.map(doc => ({...doc.data(), id: doc.id,}));
        const tweetDocumentIds = data.docs.map(doc => doc.id);
        console.log("Document IDs associated with tweets:", tweetDocumentIds);
        setTweetList(filteredData)
      } catch (err) {
        console.error(err);
      }
      data.docs.forEach(doc => console.log("Document ID associated with this tweet:", doc.id));
    };
     
    getTweetList(); 
  }, []); 

  
  

  return (
    <>
      {tweetList.sort((a, b) => b.Timestamp.seconds - a.Timestamp.seconds).map((tweet) => (
        <div className="flex-col p-3 Shadow" key={tweet.id}>
          {/* Make sure to add a unique key for each rendered element */}
          <div className="flex flex-row my-5 S">
            <img
              src={avatarIMG}
              className="col-start-1 col-end-1 row-start-1 row-end-2"
              style={{ height: "32px", borderRadius: "50%" }}
              alt="User Avatar"
            />
            <p className="lato-bold">&nbsp;&nbsp;{tweet.UserName}</p>
          </div>
          <p className="flex flex-col my-5">{tweet.Post}</p>
          <p>{formattedDate(tweet.Timestamp?.seconds)}</p>
          <div className="flex flex-row w-full justify-evenly">
            <button type="button"><FontAwesomeIcon icon={faComment} style={{ color: "#3f44d9" }} /></button>
            <p><FontAwesomeIcon icon={faRepeat} rotation={90} style={{ color: "#28d74b" }} /></p>
            <p><FontAwesomeIcon icon={faHeart} style={{ color: "#e60f4f" }} /> {tweet.Likes}</p>
          </div>
          <p><FontAwesomeIcon icon={faBookmark} style={{ color: "#3f44d9" }} /></p>
        </div>
      ))}
    </>
  );
};

export default TweetComponent;
