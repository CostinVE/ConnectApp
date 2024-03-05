import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  arrayUnion, arrayRemove,
  updateDoc, getDoc , increment, FieldValue
} from "firebase/firestore";
import { auth, storage, database} from '../../config/firebase'; // Import auth from firebase config


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark, faEllipsis, faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";

import { getUserByUserID } from "../getUserByUsername";

export const BookmarksFeed = () => {
    const userID = auth?.currentUser?.uid;
    const [username, setUsername] = useState()
    const [userBookmarksHTML, setUserBookmarksHTML] = useState([]); // State variable to hold the HTML elements of user bookmarks

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const user = await getUserByUserID(auth?.currentUser?.uid);
                if (user) {
                    setUsername(user.username);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserName();
    }, []); // Empty dependency array to run only once on component mount

    const navigate = useNavigate()

    const handleGoBack = () => {
        navigate(-1);
      };


  
    useEffect(() => {
      const fetchUserBookmarks = async () => {
        const usersCollectionRef = collection(database, "Users");
        try {
          const UserRef = doc(database, "Users", userID);
          const userDoc = await getDoc(UserRef);
          const userData = userDoc.data();
          const userBookmarks = userData?.bookmarkedTweets || [];
          console.log("User Bookmarks:", userBookmarks);
  
          const formattedDate = (timestamp) => {
            const options = { hour: 'numeric', minute: 'numeric', hour12: true };
            const timeString = new Date(timestamp * 1000).toLocaleTimeString('en-US', options);
            const options2 = { day: '2-digit', month: '2-digit' };
            const dateString = new Date(timestamp * 1000).toLocaleDateString('en-US', options2);
            return `${timeString}, ${dateString}`;
          };
  
          const addToReposts = async (userId, postID) => {
            try {
              const userDocRef = doc(collection(database, "Users"), userId);
              const tweetDocRef = doc(collection(database, "tweets"), postID);
              
              await togglePostRepost(userDocRef, tweetDocRef);
            } catch (e) {
              console.error("Error adding tweet to user's reposted tweets: ", e);
            }
          };
  
          const addToBookmarks = async (userId, postID) => {
            try {
              const userDocRef = doc(collection(database, "Users"), userId);
              const tweetDocRef = doc(collection(database, "tweets"), postID);
              
              await togglePostBookmark(userDocRef, tweetDocRef);
            } catch (e) {
              console.error("Error adding tweet to user's bookmarked tweets: ", e);
            }
          };
  
          const addToLikes = async (userId, postID) => {
            try {
              const userDocRef = doc(collection(database, "Users"), userId);
              const tweetDocRef = doc(collection(database, "tweets"), postID);
              
              await togglePostLike(userDocRef, tweetDocRef);
            } catch (e) {
              console.error("Error adding tweet to user's liked tweets: ", e);
            }
          };
  
          const postsHTML = await Promise.all(userBookmarks.map(async (postID) => {
            const PostRef = doc(database, "tweets", postID);
            const postDoc = await getDoc(PostRef);
  
            if (postDoc.exists()) {
              const postData = postDoc.data();
              console.log(postData);
  
              return (
                <section key={postID} className="post">
                  <div className="flex-col p-3 my-3 rounded-lg Shadow">
                    <div className="flex flex-row my-5">
                      <p className="lato-bold">{postData.UserName}</p>
                    </div>
                    <p className="flex flex-col my-5">{postData.Post}</p>
                    <p className="opacity-50">{formattedDate(postData.Timestamp.seconds)}</p>
                    <div className="flex flex-row w-full justify-evenly">
                      <p>
                        <FontAwesomeIcon
                          icon={faRepeat}
                          rotation={90}
                          style={{ color: "#28d74b", cursor: "pointer" }}
                          onClick={() => addToReposts(userID, postID)} // Call addToReposts
                        />{" "}
                        {postData.Reposts}
                      </p>
                      <p>
                        <FontAwesomeIcon
                          icon={faHeart}
                          style={{ color: "#e60f4f", cursor: "pointer" }}
                          onClick={() => addToLikes(userID, postID)} // Call addToLikes with tweet id
                        />{" "}
                        {postData.Likes}
                      </p>
                      <p>
                        <FontAwesomeIcon
                          icon={faBookmark}
                          style={{ color: "#3f44d9", cursor: "pointer" }}
                          onClick={() => addToBookmarks(userID, postID)} // Call addToBookMarks
                        />{" "}
                        {postData.Bookmarks}
                      </p>
                    </div>
                  </div>
                </section>
              );
            } else {
              console.log("Post not found for ID:", postID);
              return null;
            }
          }));
  
          setUserBookmarksHTML(postsHTML); // Filter out null values
        } catch (error) {
          console.error("Error fetching user bookmarks:", error);
        }
      };
  
      fetchUserBookmarks();
    }, []);
  
    return (
        <div className="flex-none flex-col w-5/12 lato-regular ">
        <div className='flex flex-col w-full h-14 mb-8 justify-between'>
            <div className='flex flex-row w-full justify-between mt-4'><FontAwesomeIcon icon={faLeftLong} style={{fontSize:"22px", cursor:"pointer"}} onClick={handleGoBack} />
             <p className=''>Bookmarks</p> <p className='w-fit p-2 rounded-lg lato-regular lato-regular cursor-pointer'><FontAwesomeIcon icon={faEllipsis} style={{fontSize:"24px"}}/></p>
             </div>
            <p className='opacity-50'>@{username}</p>
            </div>
        {userBookmarksHTML}
      </div>
    );
  };

