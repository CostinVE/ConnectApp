import { useState } from "react";
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
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";

import { getUserByUserID } from "../getUserByUsername";


export const fetchUserPosts = async () => {

  const usersCollectionRef = collection(database, "Users");
  const userID = auth.currentUser.uid;

  
  
  try {
      const formattedDate = (timestamp) => {
          const options = { hour: 'numeric', minute: 'numeric', hour12: true };
          const timeString = new Date(timestamp * 1000).toLocaleTimeString('en-US', options);
          const options2 = { day: '2-digit', month: '2-digit' };
          const dateString = new Date(timestamp * 1000).toLocaleDateString('en-US', options2);
          return `${timeString}, ${dateString}`;
      };

      const UserRef = doc(database, "Users", userID);
      const userDoc = await getDoc(UserRef);
      const userData = userDoc.data();
      const userPosts = [
        ...(userData?.Posts || []).reverse(), // Reverse the order of userData?.Posts
        ...(userData?.repostedTweets || []).reverse() // Reverse the order of userData?.repostedTweets
      ];
      console.log("User Posts:", userPosts);

      const postsHTML = userPosts.map(postID => {
        const username = userDoc.data().Username;
      
        return async () => {
            const PostRef = doc(database, "tweets", postID);
            const postDoc = await getDoc(PostRef);
    
            if (postDoc.exists()) {
                const postData = postDoc.data();
                const isRepost = userData?.repostedTweets && userData.repostedTweets.includes(postID);
    
                // Function to render additional information if it's a repost
                const renderRepostInfo = () => {
                    if (isRepost) {
                        return <p className="opacity-50">{username} reposted this</p>;
                    }
                    return null;
                };

    
        const addToReposts = async (userId, postID) => {
          try {
            const userDocRef = doc(usersCollectionRef, userId);
        
            // Check if user has already liked the tweet
            const userDocSnapshot = await getDoc(userDocRef);    
                    const userData = userDocSnapshot.data();
            if (userData && userData.repostedTweets && userData.repostedTweets.includes(postID)) {
              console.log("User has already liked this tweet.");
        
              // Remove the postID from user's liked tweets
              await updateDoc(userDocRef, {
                repostedTweets: arrayRemove(postID),
              });
      
              const tweetDocRef = doc(collection(database, "tweets"), postID);
              await updateDoc(tweetDocRef, {
                Reposts: increment(-1)
              })
        
              console.log("Tweet removed from user's liked tweets");
              
              return; // Exit the function
            }
        
            // Add the tweet to user's liked tweets
            await updateDoc(userDocRef, {
              repostedTweets: arrayUnion(postID),
            });
      
            const tweetDocRef = doc(collection(database, "tweets"), postID);
            await updateDoc(tweetDocRef, {
              Reposts: increment(1)
            })
          } catch (e) {
            console.error("Error adding tweet to user's liked tweets: ", e);
          }
        };
      
        const addToBookmarks = async (userId, postID) => {
          try {
            const userDocRef = doc(usersCollectionRef, userId);
        
            // Check if user has already liked the tweet
            const userDocSnapshot = await getDoc(userDocRef);
            const userData = userDocSnapshot.data();
            if (userData && userData.bookmarkedTweets && userData.bookmarkedTweets.includes(postID)) {
              console.log("User has already liked this tweet.");
        
              // Remove the postID from user's liked tweets
              await updateDoc(userDocRef, {
                bookmarkedTweets: arrayRemove(postID),
              });
      
              const tweetDocRef = doc(collection(database, "tweets"), postID);
              await updateDoc(tweetDocRef, {
                Bookmarks: increment(-1)
              })
        
              console.log("Tweet removed from user's liked tweets");
              
              return; // Exit the function
            }
        
            // Add the tweet to user's liked tweets
            await updateDoc(userDocRef, {
              bookmarkedTweets: arrayUnion(postID),
            });
      
            const tweetDocRef = doc(collection(database, "tweets"), postID);
            await updateDoc(tweetDocRef, {
              Bookmarks: increment(1)
            })
          } catch (e) {
            console.error("Error adding tweet to user's liked tweets: ", e);
          }
        };
      
      
        const addToLikes = async (userId, postID) => {
          try {
            const userDocRef = doc(usersCollectionRef, userId);
        
            // Check if user has already liked the tweet
            const userDocSnapshot = await getDoc(userDocRef);
            const userData = userDocSnapshot.data();
            if (userData && userData.likedTweets && userData.likedTweets.includes(postID)) {
              console.log("User has already liked this tweet.");
        
              // Remove the postID from user's liked tweets
              await updateDoc(userDocRef, {
                likedTweets: arrayRemove(postID),
              });
      
              const tweetDocRef = doc(collection(database, "tweets"), postID);
              await updateDoc(tweetDocRef, {
                Likes: increment(-1)
              })
        
              console.log("Tweet removed from user's liked tweets");
              
              return; // Exit the function
            }
        
            // Add the tweet to user's liked tweets
            await updateDoc(userDocRef, {
              likedTweets: arrayUnion(postID),
            });
      
            const tweetDocRef = doc(collection(database, "tweets"), postID);
            await updateDoc(tweetDocRef, {
              Likes: increment(1)
            })
          } catch (e) {
            console.error("Error adding tweet to user's liked tweets: ", e);
          }
        };
        
                  return (
                      <section key={postID} className="post">
                        <div className="flex-col p-3 Shadow">
                        {renderRepostInfo()}
                        <div className="flex flex-row my-5">
                        <p className="lato-bold">{postData.UserName}</p></div>
                        <p className="flex flex-col my-5">{postData.Post}</p>
                        <p className="opacity-50">{formattedDate(postData.Timestamp.seconds)}</p>
                        <div className="flex flex-row w-full justify-evenly">
                  <p>
                    <FontAwesomeIcon
                      icon={faRepeat}
                      rotation={90}
                      style={{ color: "#28d74b", cursor:"pointer" }}
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
          };
      });

      console.log(postsHTML);
      return Promise.all(postsHTML.map(async (postFunction) => await postFunction()));
  } catch (error) {
      console.error("Error fetching user posts:", error);
      return null;
  }
};



export const ProfileNavigation = () => {
  const [selectedOption, setSelectedOption] = useState('Posts');
  const userID = auth?.currentUser?.uid;

  const handleClick = (option) => {
    setSelectedOption(option);
    console.log(`Navigation switched to ${option}`);

    // Trigger FetchUserPosts only when 'Posts' is selected
    if (option === 'Posts') {
      fetchUserPosts();
    }
  };

  return (
    <div className="flex flex-row justify-evenly w-full">
      <p onClick={() => handleClick('Posts')} className={selectedOption === 'Posts' ? 'selected border-b-4 border-indigo-500 rounded-sm' : ''} style={{ cursor: "pointer" }}>Posts</p>
      <p onClick={() => handleClick('Following')} className={selectedOption === 'Following' ? 'selected border-b-4 border-indigo-500 rounded-sm' : ''} style={{ cursor: "pointer" }}>Following</p>
      <p onClick={() => handleClick('Media')} className={selectedOption === 'Media' ? 'selected border-b-4 border-indigo-500 rounded-sm' : ''} style={{ cursor: "pointer" }}>Media</p>
      <p onClick={() => handleClick('Bookmarks')} className={selectedOption === 'Bookmarks' ? 'selected border-b-4 border-indigo-500 rounded-sm' : ''} style={{ cursor: "pointer" }}>Bookmarks</p>
    </div>
  );
};