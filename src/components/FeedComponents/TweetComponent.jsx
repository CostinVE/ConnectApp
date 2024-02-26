import React, { useState, useEffect } from "react";
import "../../index.css";
import { database, auth, storage } from "../../config/firebase.jsx";
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  arrayUnion, arrayRemove,
  updateDoc, getDoc
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

import { getUserByUserID } from "../getUserByUsername.jsx";
import { fetchComments } from "./FetchComments.jsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";
import avatarIMG from "../../assets/avatarIMG.png";
import gifPNG from "../../assets/gif.png";
import emojiPNG from "../../assets/smile.png";
import imagePNG from "../../assets/imageupload.png";

const TweetComponent = () => {
  const tweetCollectionRef = collection(database, "tweets");

  const [tweetList, setTweetList] = useState([]);

  const [comments, setComments] = useState([]);
  const [isCommentFormOpen, setCommentFormOpen] = useState(false);

  const getUserName = async (userID) => {
    try {
      const user = await getUserByUserID(userID);
      return user ? user.username : "Unknown User";
    } catch (error) {
      console.error("Error fetching user:", error);
      return "Unknown User";
    }
  };

  const openCommentForm = () => {
    setCommentFormOpen(true);
  };

  const closeCommentForm = () => {
    setCommentFormOpen(false);
  };

  const handleDivClick = (event) => {
    // Check if the clicked element is the div itself
    if (event.target === event.currentTarget) {
      // Call closeCommentForm only when clicking on the div itself
      closeCommentForm();
    }
  };

  const CommentForm = () => {
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

    const addCommentToTweet = async () => {
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
            onClick={closeCommentForm}
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
                onClick={addCommentToTweet}
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateTimestamp = () => {
    return Timestamp.now(); // This will give you the current timestamp
  };

  const formattedDate = (timestamp) => {
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const timeString = new Date(timestamp * 1000).toLocaleTimeString(
      "en-US",
      options
    );
    const options2 = { day: "2-digit", month: "2-digit" };
    const dateString = new Date(timestamp * 1000).toLocaleDateString(
      "en-US",
      options2
    );
    return `${timeString}, ${dateString}`;
  };

  useEffect(() => {
    const getTweetList = async () => {
      try {
        const data = await getDocs(tweetCollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setTweetList(filteredData);

        // Fetch comments for each tweet
        const commentsData = await fetchComments();
        setComments(commentsData);
      } catch (err) {
        console.error(err);
      }
    };

    // Initial fetch
    getTweetList();

    // Set interval to fetch every 5 seconds
    const intervalId = setInterval(() => {
      getTweetList();
    }, 10000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run only once on component mount

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

  const userID = auth?.currentUser?.uid;
  console.log(userID);

  getDownloadURL(ref(storage, `profileimages/${userID}`)).then((url) => {
    const img = document.getElementById("ProfileIMG");
    img.setAttribute("src", url).catch((error) => {});
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshTweetComponent();
    }, 25000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {tweetList
        .sort((a, b) => b.Timestamp.seconds - a.Timestamp.seconds)
        .map((tweet) => {
          const tweetComments = comments.filter(
            (commentBlock) => commentBlock[0]?.tweetId === tweet.id
          );

          const usersCollectionRef = collection(database, "Users");
          const userID = auth.currentUser.uid;
          const tweetId = tweet.id;

          const addToLikes = async (userId, tweetId) => {
            try {
              const userDocRef = doc(usersCollectionRef, userId);
          
              // Check if user has already liked the tweet
              const userDocSnapshot = await getDoc(userDocRef);
              const userData = userDocSnapshot.data();
              if (userData && userData.likedTweets && userData.likedTweets.includes(tweetId)) {
                console.log("User has already liked this tweet.");
          
                // Remove the tweetId from user's liked tweets
                await updateDoc(userDocRef, {
                  likedTweets: arrayRemove(tweetId),
                });
          
                console.log("Tweet removed from user's liked tweets");
                
                return; // Exit the function
              }
          
              // Add the tweet to user's liked tweets
              await updateDoc(userDocRef, {
                likedTweets: arrayUnion(tweetId),
              });
              console.log("Tweet added to user's liked tweets");
            } catch (e) {
              console.error("Error adding tweet to user's liked tweets: ", e);
            }
          };

          return (
            <div key={tweet.id}>
              <div className="flex-col p-3 Shadow">
                <div className="flex flex-row my-5">
                  <img
                    id="ProfileIMG"
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
                  <button type="button" onClick={openCommentForm}>
                    <FontAwesomeIcon
                      icon={faComment}
                      style={{ color: "#3f44d9" }}
                    />
                  </button>
                  <p>
                    <FontAwesomeIcon
                      icon={faRepeat}
                      rotation={90}
                      style={{ color: "#28d74b" }}
                    />
                  </p>
                  <p>
                    <FontAwesomeIcon
                      icon={faHeart}
                      style={{ color: "#e60f4f", cursor: "pointer" }}
                      onClick={() => addToLikes(userID, tweetId)} // Call addToLikes with tweet id
                    />{" "}
                    {tweet.Likes}
                  </p>
                  <p>
                    <FontAwesomeIcon
                      icon={faBookmark}
                      style={{ color: "#3f44d9" }}
                    />
                  </p>
                </div>
                {isCommentFormOpen && <CommentForm />}
              </div>
              <div
                className="commentDiv"
                id={`commentDiv-${tweet.id}`}
                style={{
                  display: "none",
                  top: "100%",
                  left: "0",
                  backgroundColor: "white",
                  padding: "10px",
                }}
              >
                {tweetComments && tweetComments.length > 0 ? (
                  tweetComments.map((commentBlock, index) => (
                    <div key={index}>
                      {Array.isArray(commentBlock) ? (
                        commentBlock.map((comment, idx) => (
                          <div key={idx}>
                            <p>{comment.commentText}</p>
                            <p>{comment.Username}</p>
                            <p>{comment.Likes}</p>
                          </div>
                        ))
                      ) : (
                        <p>{commentBlock}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No comments available</p>
                )}
              </div>
              <div className="w-full p-1 Shadow text-center">
                <button
                  className="text-indigo-600"
                  onClick={() => handleShowDivClick(tweet.id)}
                >
                  Show Comments
                </button>
              </div>
            </div>
          );
        })}
    </>
  );
};

export default TweetComponent;
