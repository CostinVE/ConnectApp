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
import { ref, getDownloadURL } from "firebase/storage";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark, faEllipsis, faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";
import avatarIMG from "../../assets/avatarIMG.png"
import imageUploadPlaceholder from "../../assets/imageuploadplaceholder.png"

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
                    const userDocRef = doc(usersCollectionRef, userId);
            
                    // Check if user has already bookmarked the tweet
                    const userDocSnapshot = await getDoc(userDocRef);
                    const userData = userDocSnapshot.data();
            
                    if (userData && userData.repostedTweets && userData.repostedTweets.includes(postID)) {
                        console.log("User has already reposted this tweet.");
            
                        // Remove the postID from user's reposted tweets
                        await updateDoc(userDocRef, {
                            repostedTweets: arrayRemove(postID),
                        });
            
                        // Decrease the bookmark count for all tweet types
                        const decrementCounter = {
                            Reposts: increment(-1)
                        };
                        await Promise.all([
                            updateDoc(doc(collection(database, "tweets"), postID), decrementCounter),
                            updateDoc(doc(collection(database, "imagetweets"), postID), decrementCounter),
                            updateDoc(doc(collection(database, "pooltweets"), postID), decrementCounter)
                        ]);
            
                        console.log("Tweet removed from user's reposted tweets");
                    } else {
                        // Add the tweet to user's reposted tweets
                        await updateDoc(userDocRef, {
                            repostedTweets: arrayUnion(postID),
                        });
            
                        // Increase the bookmark count for all tweet types
                        const incrementCounter = {
                            Reposts: increment(1)
                        };
                        await Promise.all([
                            updateDoc(doc(collection(database, "tweets"), postID), incrementCounter),
                            updateDoc(doc(collection(database, "imagetweets"), postID), incrementCounter),
                            updateDoc(doc(collection(database, "pooltweets"), postID), incrementCounter)
                        ]);
            
                        console.log("Tweet added to user's reposted tweets");
                    }
                } catch (e) {
                    console.error("Error bookmarking tweet: ", e);
                }
            };
              const addToBookmarks = async (userId, postID) => {
                try {
                    const userDocRef = doc(usersCollectionRef, userId);
            
                    // Check if user has already bookmarked the tweet
                    const userDocSnapshot = await getDoc(userDocRef);
                    const userData = userDocSnapshot.data();
            
                    if (userData && userData.bookmarkedTweets && userData.bookmarkedTweets.includes(postID)) {
                        console.log("User has already bookmarked this tweet.");
            
                        // Remove the postID from user's bookmarked tweets
                        await updateDoc(userDocRef, {
                            bookmarkedTweets: arrayRemove(postID),
                        });
            
                        // Decrease the bookmark count for all tweet types
                        const decrementCounter = {
                            Bookmarks: increment(-1)
                        };
                        await Promise.all([
                            updateDoc(doc(collection(database, "tweets"), postID), decrementCounter),
                            updateDoc(doc(collection(database, "imagetweets"), postID), decrementCounter),
                            updateDoc(doc(collection(database, "pooltweets"), postID), decrementCounter)
                        ]);
            
                        console.log("Tweet removed from user's bookmarked tweets");
                    } else {
                        // Add the tweet to user's bookmarked tweets
                        await updateDoc(userDocRef, {
                            bookmarkedTweets: arrayUnion(postID),
                        });
            
                        // Increase the bookmark count for all tweet types
                        const incrementCounter = {
                            Bookmarks: increment(1)
                        };
                        await Promise.all([
                            updateDoc(doc(collection(database, "tweets"), postID), incrementCounter),
                            updateDoc(doc(collection(database, "imagetweets"), postID), incrementCounter),
                            updateDoc(doc(collection(database, "pooltweets"), postID), incrementCounter)
                        ]);
            
                        console.log("Tweet added to user's bookmarked tweets");
                    }
                } catch (e) {
                    console.error("Error bookmarking tweet: ", e);
                }
            };
  
            const addToLikes = async (userId, postID) => {
              try {
                  const userDocRef = doc(usersCollectionRef, userId);
          
                  // Check if user has already bookmarked the tweet
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
          
                  if (userData && userData.likedTweets && userData.likedTweets.includes(postID)) {
                      console.log("User has already liked this tweet.");
          
                      // Remove the postID from user's liked tweets
                      await updateDoc(userDocRef, {
                          likedTweets: arrayRemove(postID),
                      });
          
                      // Decrease the bookmark count for all tweet types
                      const decrementCounter = {
                          Likes: increment(-1)
                      };
                      await Promise.all([
                          updateDoc(doc(collection(database, "tweets"), postID), decrementCounter),
                          updateDoc(doc(collection(database, "imagetweets"), postID), decrementCounter),
                          updateDoc(doc(collection(database, "pooltweets"), postID), decrementCounter)
                      ]);
          
                      console.log("Tweet removed from user's liked tweets");
                  } else {
                      // Add the tweet to user's liked tweets
                      await updateDoc(userDocRef, {
                          likedTweets: arrayUnion(postID),
                      });
          
                      // Increase the bookmark count for all tweet types
                      const incrementCounter = {
                          Likes: increment(1)
                      };
                      await Promise.all([
                          updateDoc(doc(collection(database, "tweets"), postID), incrementCounter),
                          updateDoc(doc(collection(database, "imagetweets"), postID), incrementCounter),
                          updateDoc(doc(collection(database, "pooltweets"), postID), incrementCounter)
                      ]);
          
                      console.log("Tweet added to user's liked tweets");
                  }
              } catch (e) {
                  console.error("Error bookmarking tweet: ", e);
              }
          };
  
              const postsHTML = await Promise.all(userBookmarks.map(async (postID) => {
                  try {
                      const tweetRef = doc(database, "tweets", postID);
                      const imageTweetRef = doc(database, "imagetweets", postID);
  
                      const tweetDoc = await getDoc(tweetRef);
                      const imageTweetDoc = await getDoc(imageTweetRef);
  
                      if (tweetDoc.exists()) {
                          const tweetData = tweetDoc.data();
                          console.log("Tweet data:", tweetData);
                          return (
                              <section key={postID} className="post">
                                  <div className="flex-col p-3 my-3 rounded-lg Shadow">
                                      <div className="flex flex-row my-5">
                                          <img
                                              className={`ProfileIMG-${postID}`}
                                              src={avatarIMG}
                                              style={{ height: "32px", borderRadius: "50%" }}
                                              alt="User Avatar"
                                          />
                                          <p className="lato-bold">{tweetData.UserName}</p>
                                      </div>
                                      <p className="flex flex-col my-5">{tweetData.Post}</p>
                                      <p className="opacity-50">{formattedDate(tweetData.Timestamp.seconds)}</p>
                                      <div className="flex flex-row w-full justify-evenly">
                                          <p>
                                              <FontAwesomeIcon
                                                  icon={faRepeat}
                                                  rotation={90}
                                                  style={{ color: "#28d74b", cursor: "pointer" }}
                                                  onClick={() => addToReposts(userID, postID)} // Call addToReposts
                                              />{" "}
                                              {tweetData.Reposts}
                                          </p>
                                          <p>
                                              <FontAwesomeIcon
                                                  icon={faHeart}
                                                  style={{ color: "#e60f4f", cursor: "pointer" }}
                                                  onClick={() => addToLikes(userID, postID)} // Call addToLikes with tweet id
                                              />{" "}
                                              {tweetData.Likes}
                                          </p>
                                          <p>
                                              <FontAwesomeIcon
                                                  icon={faBookmark}
                                                  style={{ color: "#3f44d9", cursor: "pointer" }}
                                                  onClick={() => addToBookmarks(userID, postID)} // Call addToBookMarks
                                              />{" "}
                                              {tweetData.Bookmarks}
                                          </p>
                                      </div>
                                  </div>
                              </section>
                          );
                          
                      } else if (imageTweetDoc.exists()) {
                          const imageTweetData = imageTweetDoc.data();
                          const tweetIMGRef = ref(storage, `imageuploads/${postID}`);
            const tweetImgId = `tweetIMG-${postID}`;

// Step 3: Use getDownloadURL to fetch the URL of the image
getDownloadURL(tweetIMGRef)
  .then((url) => {
    // Step 4: Update the src attribute of the img tag with the downloaded URL
    const imgElement = document.getElementById(tweetImgId);
    if (imgElement) {
      imgElement.src = url;
    }
  })
  .catch((error) => {
    console.error("Error getting download URL:", error);
  });
                          console.log("Image tweet data:", imageTweetData);
                          return (
                              <section key={postID} className="post">
                                  <div className="flex-col p-3 my-3 rounded-lg Shadow">
                                      <div className="flex flex-row my-5">
                                          <img
                                              className={`ProfileIMG-${postID}`}
                                              src={avatarIMG}
                                              style={{ height: "32px", borderRadius: "50%" }}
                                              alt="User Avatar"
                                          />
                                          <p className="lato-bold">{imageTweetData.UserName}</p>
                                      </div>
                                      <p className="flex flex-col my-5">{imageTweetData.Post}</p>
                                      <img
  id={tweetImgId}
  className="my-16"
  src={imageUploadPlaceholder} // Provide a placeholder image or initial value
  alt="Could not display image"
  style={{ maxHeight: "420px", borderRadius:"2%",  }}
/>
                                      <p className="opacity-50">{formattedDate(imageTweetData.Timestamp.seconds)}</p>
                                      <div className="flex flex-row w-full justify-evenly">
                                          <p>
                                              <FontAwesomeIcon
                                                  icon={faRepeat}
                                                  rotation={90}
                                                  style={{ color: "#28d74b", cursor: "pointer" }}
                                                  onClick={() => addToReposts(userID, postID)} // Call addToReposts
                                              />{" "}
                                              {imageTweetData.Reposts}
                                          </p>
                                          <p>
                                              <FontAwesomeIcon
                                                  icon={faHeart}
                                                  style={{ color: "#e60f4f", cursor: "pointer" }}
                                                  onClick={() => addToLikes(userID, postID)} // Call addToLikes with tweet id
                                              />{" "}
                                              {imageTweetData.Likes}
                                          </p>
                                          <p>
                                              <FontAwesomeIcon
                                                  icon={faBookmark}
                                                  style={{ color: "#3f44d9", cursor: "pointer" }}
                                                  onClick={() => addToBookmarks(userID, postID)} // Call addToBookMarks
                                              />{" "}
                                              {imageTweetData.Bookmarks}
                                          </p>
                                      </div>
                                  </div>
                              </section>
                          );
                      } else {
                          console.log("Post not found for ID:", postID);
                          return null;
                      }
                  } catch (error) {
                      console.error("Error fetching user bookmarks:", error);
                      return null;
                  }
              }));
              postsHTML.forEach(async (post) => {
                if (!post) return;
                const postID = post.key;
                const tweetRef = doc(database, "tweets", postID);
                const tweetDoc = await getDoc(tweetRef);
                const imageTweetRef = doc(database, "imagetweets", postID);
                const imageTweetDoc = await getDoc(imageTweetRef);
                
                console.log("Post ID:", postID);
                
                if (tweetDoc.exists()) {
                    console.log("Tweet exists:", tweetDoc.data());
                    const tweetData = tweetDoc.data();
                    const tweetProfileIMG = tweetData && tweetData.UserId;
                    if (tweetProfileIMG) {
                        const imageUrl = await getDownloadURL(ref(storage, `profileimages/${tweetProfileIMG}`));
                        const img = document.querySelector(`.ProfileIMG-${postID}`);
                        img.setAttribute("src", imageUrl);
                    }
                }
                
                if (imageTweetDoc.exists()) {
                    console.log("ImageTweet exists:", imageTweetDoc.data());
                    const imageTweetData = imageTweetDoc.data();
                    const imageTweetProfileIMG = imageTweetData && imageTweetData.UserId;
                    if (imageTweetProfileIMG) {
                        const imageUrl = await getDownloadURL(ref(storage, `profileimages/${imageTweetProfileIMG}`));
                        const img = document.querySelector(`.ProfileIMG-${postID}`);
                        img.setAttribute("src", imageUrl);
                    }
                }
            });
  
              setUserBookmarksHTML(postsHTML.filter(post => post !== null));
          } catch (error) {
              console.error("Error fetching user bookmarks:", error);
          }
      };
  
      fetchUserBookmarks();
  }, [userID]); // Add userID to the dependency array
  
    return (
        <div id='bookmarkpage' className="flex-none flex-col w-5/12 lato-regular overflow-y-auto">
            <div className='flex flex-col w-full h-14 mb-8 justify-between'>
                <div className='flex flex-row w-full justify-between mt-4'><FontAwesomeIcon icon={faLeftLong} style={{ fontSize: "22px", cursor: "pointer" }} onClick={handleGoBack} />
                    <p className=''>Bookmarks</p> <p className='w-fit p-2 rounded-lg lato-regular lato-regular cursor-pointer'><FontAwesomeIcon icon={faEllipsis} style={{ fontSize: "24px" }} /></p>
                </div>
                <p className='opacity-50'>@{username}</p>
            </div>
            <div>
            {userBookmarksHTML}
            </div>
        </div>
    );
};


