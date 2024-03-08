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
  updateDoc, getDoc , increment, FieldValue
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
import imageUploadPlaceholder from "../../assets/imageuploadplaceholder.png"

const TweetComponent = () => {
  const tweetCollectionRef = collection(database, "tweets");
  const poolCollectionRef = collection(database, "pooltweets")
  const imageTweetCollectionRef = collection(database, "imagetweets")

  const [percentages, setPercentages] = useState({
    totalPercentage: 0,
    option1Percentage: 0,
    option2Percentage: 0,
    option3Percentage: 0,
    option4Percentage: 0
  });



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
    let attempts = 0;
    const maxAttempts = 3;

    const getTweetList = async () => {
        try {
            // Fetch data from 'tweets' collection
            const tweetData = await getDocs(tweetCollectionRef);
            const tweetListData = tweetData.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                type: 'tweet' // Add a type field to distinguish between tweets and image tweets
            }));

            // Fetch data from 'imagetweets' collection
            const imageTweetData = await getDocs(imageTweetCollectionRef);
            const imageTweetListData = imageTweetData.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                type: 'imageTweet' // Add a type field to distinguish between tweets and image tweets
            }));

            const poolTweetData = await getDocs(poolCollectionRef);
            const poolTweetListData = poolTweetData.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                type: 'poolTweet' // Add a type field to distinguish between regular tweets and pool tweets
            }));

            // Combine data from all collections into one array
            const combinedData = [...tweetListData, ...imageTweetListData, ...poolTweetListData];

            // Set the combined data as the tweet list
            setTweetList(combinedData);

            // Fetch comments for each tweet
            const commentsData = await fetchComments();
            setComments(commentsData);
        } catch (err) {
            console.error(err);
            attempts++;
            if (attempts < maxAttempts) {
                // Retry after a delay of 1 second
                setTimeout(getTweetList, 1000);
            } else {
                console.error("Maximum number of attempts reached. Could not fetch tweet list.");
            }
        }
    };

    // Initial fetch
    getTweetList();
}, []);

    // // Set interval to fetch every 5 seconds
    // const intervalId = setInterval(() => {
    //   getTweetList();
    // }, 10000);

    // // Cleanup interval on component unmount
    // return () => {
    //   clearInterval(intervalId);
    // };
  // }, []); // Empty dependency array to run only once on component mount

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


  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     refreshTweetComponent();
  //   }, 250000);

  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const result = await yourAsyncOperation(); // Perform your async operation here
        if (isMounted) {
          setData(result); // Update state if component is still mounted
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const timeout = setTimeout(() => {
      console.log('Timeout reached, stopping operation');
      if (isMounted) {
        console.error('Operation timed out');
        // Handle timeout, set state, show message, etc.
        setData(null); // Set data to null or handle appropriately
      }
    }, 3000); // Timeout after 3 seconds

    Promise.race([fetchData(), timeout]);

    return () => {
      isMounted = false; // Cleanup function to handle component unmount
      clearTimeout(timeout); // Clear the timeout to prevent memory leaks
    };
  }, []);

  return (
    <>
      {tweetList
        .sort((a, b) => b.Timestamp.seconds - a.Timestamp.seconds)
        .map((tweet, index) => {
          const tweetComments = comments.filter(
            (commentBlock) => commentBlock[0]?.tweetId === tweet.id
          );

          const tweetId = tweet.id;
           // Generate a unique ID for the image element
           const imageId = `ProfileIMG-${index}`;
  
    
           const fetchTweetAndGetUserImage = async (tweetId, index) => {
            try {
              // Fetch tweet data
              const tweetRef = doc(database, "tweets", tweetId);
              const tweetDoc = await getDoc(tweetRef);
          
              if (tweetDoc.exists()) {
                const tweetData = tweetDoc.data();
                const tweetProfileIMG = tweetData.UserId;
          
                // Check if UserId exists
                if (tweetProfileIMG) {
                  // Use the extracted UserId to construct the path
                  const imageUrl = await getDownloadURL(ref(storage, `profileimages/${tweetProfileIMG}`));
          
                  // Update image element
                  const img = document.getElementById(imageId);
                  img.setAttribute("src", imageUrl);
                  return; // No need to return anything explicitly as the function is asynchronous
                }
              }
          
              // If tweet document not found in "tweets" collection, try in "imagetweets" collection
              const imageTweetRef = doc(database, "imagetweets", tweetId);
              const tweetImageDoc = await getDoc(imageTweetRef);
          
              if (tweetImageDoc.exists()) {
                const tweetData = tweetImageDoc.data();
                const tweetProfileIMG = tweetData.UserId;
          
                // Check if UserId exists
                if (tweetProfileIMG) {
                  // Use the extracted UserId to construct the path
                  const imageUrl = await getDownloadURL(ref(storage, `profileimages/${tweetProfileIMG}`));
          
                  // Update image element
                  const img = document.getElementById(imageId);
                  img.setAttribute("src", imageUrl);
                  return; // No need to return anything explicitly as the function is asynchronous
                }
              }
          
              // Throw an error if user ID not found or tweet does not exist
              throw new Error("User ID not found in tweet data or tweet does not exist.");
            } catch (error) {
              console.error("Error fetching tweet or user image:", error);
              // Optionally, re-throw the error to propagate it to the caller
              throw error;
            }
          };
          
          // Call the function and pass the index
          fetchTweetAndGetUserImage(tweetId, index);
          
 
 
           const usersCollectionRef = collection(database, "Users");
           const userID = auth.currentUser.uid;
           const tweetType = tweet.type
         
 
           const addToReposts = async (userId, tweetId) => {
            try {
              let tweetCollectionRef;
              if (tweetType === 'imageTweet') {
                tweetCollectionRef = doc(collection(database, "imagetweets"), tweetId);
              } else if (tweetType === 'poolTweet') {
                tweetCollectionRef = doc(collection(database, "pooltweets"), tweetId);
              } else {
                tweetCollectionRef = doc(collection(database, "tweets"), tweetId);
              }
          
          
              const userDocRef = doc(usersCollectionRef, userId);
          
              // Check if user has already reposted the tweet
              const userDocSnapshot = await getDoc(userDocRef);
              const userData = userDocSnapshot.data();
              if (userData && userData.repostedTweets && userData.repostedTweets.includes(tweetId)) {
                console.log("User has already reposted this tweet.");
          
                // Remove the tweetId from user's reposted tweets
                await updateDoc(userDocRef, {
                  repostedTweets: arrayRemove(tweetId),
                });
          
                // Decrease the repost count
                await updateDoc(tweetCollectionRef, {
                  Reposts: increment(-1)
                });
          
                console.log("Tweet removed from user's reposted tweets");
          
                return; // Exit the function
              }
          
              // Add the tweet to user's reposted tweets
              await updateDoc(userDocRef, {
                repostedTweets: arrayUnion(tweetId),
              });
          
              // Increase the repost count
              await updateDoc(tweetCollectionRef, {
                Reposts: increment(1)
              });
          
              console.log("Tweet added to user's reposted tweets");
            } catch (e) {
              console.error("Error reposting tweet: ", e);
            }
          };
 
          const addToBookmarks = async (userId, tweetId) => {
            try {
              let tweetCollectionRef;
              if (tweetType === 'imageTweet') {
                tweetCollectionRef = doc(collection(database, "imagetweets"), tweetId);
              } else if (tweetType === 'poolTweet') {
                tweetCollectionRef = doc(collection(database, "pooltweets"), tweetId);
              } else {
                tweetCollectionRef = doc(collection(database, "tweets"), tweetId);
              }

              const userDocRef = doc(usersCollectionRef, userId);
           
               // Check if user has already liked the tweet
               const userDocSnapshot = await getDoc(userDocRef);
               const userData = userDocSnapshot.data();
               if (userData && userData.bookmarkedTweets && userData.bookmarkedTweets.includes(tweetId)) {
                 console.log("User has already liked this tweet.");
           
                 // Remove the tweetId from user's reposted tweets
                 await updateDoc(userDocRef, {
                  bookmarkedTweets: arrayRemove(tweetId),
                });
          
                // Decrease the repost count
                await updateDoc(tweetCollectionRef, {
                  Bookmarks: increment(-1)
                });
          
                console.log("Tweet removed from user's bookmarked tweets");
          
                return; // Exit the function
              }
          
              // Add the tweet to user's reposted tweets
              await updateDoc(userDocRef, {
                bookmarkedTweets: arrayUnion(tweetId),
              });
          
              // Increase the repost count
              await updateDoc(tweetCollectionRef, {
                Bookmarks: increment(1)
              });
          
              console.log("Tweet added to user's reposted tweets");
            } catch (e) {
              console.error("Error reposting tweet: ", e);
            }
          };
 
 
 
           const addToLikes = async (userId, tweetId) => {
            try {
              let tweetCollectionRef;
              if (tweetType === 'imageTweet') {
                tweetCollectionRef = doc(collection(database, "imagetweets"), tweetId);
              } else if (tweetType === 'poolTweet') {
                tweetCollectionRef = doc(collection(database, "pooltweets"), tweetId);
              } else {
                tweetCollectionRef = doc(collection(database, "tweets"), tweetId);
              }

              const userDocRef = doc(usersCollectionRef, userId);
           
               // Check if user has already liked the tweet
               const userDocSnapshot = await getDoc(userDocRef);
               const userData = userDocSnapshot.data();
               if (userData && userData.LikedTweets && userData.LikedTweets.includes(tweetId)) {
                 console.log("User has already liked this tweet.");
           
                  // Remove the tweetId from user's reposted tweets
                  await updateDoc(userDocRef, {
                    LikedTweets: arrayRemove(tweetId),
                  });
            
                  // Decrease the repost count
                  await updateDoc(tweetCollectionRef, {
                    Likes: increment(-1)
                  });
            
                  console.log("Tweet removed from user's reposted tweets");
            
                  return; // Exit the function
                }
            
                // Add the tweet to user's reposted tweets
                await updateDoc(userDocRef, {
                  LikedTweets: arrayUnion(tweetId),
                });
            
                // Increase the repost count
                await updateDoc(tweetCollectionRef, {
                  Likes: increment(1)
                });
            
                console.log("Tweet added to user's reposted tweets");
              } catch (e) {
                console.error("Error reposting tweet: ", e);
              }
            };
   

           

          if (tweet.type === 'imageTweet') {
            const tweetIMGRef = ref(storage, `imageuploads/${tweetId}`);
            const tweetImgId = `tweetIMG-${tweetId}`;

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
            return (
              <section key={tweet.id}>
                <div className="flex-col p-3 Shadow">
                  <div className="flex flex-row my-5">
                    <img
                      id={imageId}
                      src={avatarIMG}
                      className="col-start-1 col-end-1 row-start-1 row-end-2"
                      style={{ height: "32px", borderRadius: "50%" }}
                      alt="User Avatar"
                    />
                    <p className="lato-bold">&nbsp;&nbsp;{tweet.UserName}</p>
                  </div> 
                  <p className="flex flex-col my-5">{tweet.Post}</p>
                  <div className="flex justify-center">
                  <img
  id={tweetImgId}
  className="my-16"
  src={imageUploadPlaceholder} // Provide a placeholder image or initial value
  alt="Could not display image"
  style={{ maxHeight: "420px", borderRadius:"2%",  }}
/>
</div>
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
                        style={{ color: "#28d74b", cursor:"pointer" }}
                        onClick={() => addToReposts(userID, tweetId)} // Call addToReposts
                        />{" "}
                        {tweet.Reposts}
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
                        style={{ color: "#3f44d9", cursor: "pointer" }}
                        onClick={() => addToBookmarks(userID, tweetId)} // Call addToBookMarks
                        />{" "}
                        {tweet.Bookmarks}
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
              </section>
            );
          }

          if (tweet.type === 'poolTweet') {
            const poolDocRef = doc(collection(database, "pooltweets"), tweetId);
            const userId = auth?.currentUser?.uid;
          
            try {
              getDoc(poolDocRef)
                .then((poolDocSnapshot) => {
                  if (poolDocSnapshot.exists()) {
                    const { TotalVotesCounter, Option1Votes, Option2Votes, Option3Votes, Option4Votes } = poolDocSnapshot.data();
          
                    // Calculate percentages
                    const totalPercentage = TotalVotesCounter > 0 ? 100 : 0;
                    const option1Percentage = (Option1Votes / TotalVotesCounter) * 100;
                    const option2Percentage = (Option2Votes / TotalVotesCounter) * 100;
                    const option3Percentage = (Option3Votes / TotalVotesCounter) * 100;
                    const option4Percentage = (Option4Votes / TotalVotesCounter) * 100;
          
                    setPercentages({
                      totalPercentage,
                      option1Percentage,
                      option2Percentage,
                      option3Percentage,
                      option4Percentage
                    });
                  } else {
                    console.error("Document does not exist.");
                  }
                })
                .catch((error) => {
                  console.error("Error fetching or calculating percentages:", error);
                });
          
              const handleOption1 = async () => {
                try {
                  // Fetch the document data
                  const poolDocSnapshot = await getDoc(poolDocRef);
                  const tweet = poolDocSnapshot.data();
          
                  // Check if the user has already voted
                  const alreadyVoted = tweet.UsersVoted && tweet.UsersVoted.includes(userId);
                  if (alreadyVoted) {
                    alert("User has already voted");
                    return; // Prevent further execution
                  }
          
                  // Update the document with Option1Votes and increment TotalVotesCounter
                  updateDoc(poolDocRef, {
                    Option1Votes: increment(100),
                    TotalVotesCounter: increment(100),
                    UsersVoted: arrayUnion(userId)
                  });
          
                  // Handle success
                  console.log("Vote registered successfully!");
                } catch (error) {
                  console.error("Error updating document:", error);
                }
              };
          
              // Similarly handleOption2, handleOption3, handleOption4
          
            } catch (error) {
              console.error("Error fetching pool document:", error);
            }

            return (
              <section key={tweet.id}>
                <div className="flex-col p-3 Shadow">
                  <div className="flex flex-row my-5">
                    <img
                      id={imageId}
                      src={avatarIMG}
                      className="col-start-1 col-end-1 row-start-1 row-end-2"
                      style={{ height: "32px", borderRadius: "50%" }}
                      alt="User Avatar"
                    />
                    <p className="lato-bold">&nbsp;&nbsp;{tweet.UserName}</p>
                  </div> 
                  <p className="flex flex-col my-5">{tweet.Post}</p>
                  <div className="flex flex-col mx-2 my-8 justify-center">
                    <label className="w-full p-2 my-2 rounded-lg bg-slate-200 hover:bg-indigo-200"  onClick={() => handleOption1(tweetId)}>{tweet.FirstOption} {percentages.option1Percentage}%</label>
<label className="w-full p-2 my-2 rounded-lg bg-slate-200 hover:bg-indigo-200"  onClick={() => handleOption2(tweetId)}>{tweet.SecondOption} {percentages.option2Percentage}%</label>
<label className="w-full p-2 my-2 rounded-lg bg-slate-200 hover:bg-indigo-200"  onClick={() => handleOption3(tweetId)}>{tweet.ThirdOption} {percentages.option3Percentage}%</label>
<label className="w-full p-2 my-2 rounded-lg bg-slate-200 hover:bg-indigo-200"  onClick={() => handleOption4(tweetId)}>{tweet.FourthOption} {percentages.option4Percentage}%</label>


</div>
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
                        style={{ color: "#28d74b", cursor:"pointer" }}
                        onClick={() => addToReposts(userID, tweetId)} // Call addToReposts
                        />{" "}
                        {tweet.Reposts}
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
                        style={{ color: "#3f44d9", cursor: "pointer" }}
                        onClick={() => addToBookmarks(userID, tweetId)} // Call addToBookMarks
                        />{" "}
                        {tweet.Bookmarks}
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
              </section>
            );
          }

          if (tweet.type === 'tweet') {
            return (
              <section key={tweet.id}>
                <div className="flex-col p-3 Shadow">
                  <div className="flex flex-row my-5">
                    <img
                      id={imageId}
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
                        style={{ color: "#28d74b", cursor:"pointer" }}
                        onClick={() => addToReposts(userID, tweetId)} // Call addToReposts
                        />{" "}
                        {tweet.Reposts}
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
                        style={{ color: "#3f44d9", cursor: "pointer" }}
                        onClick={() => addToBookmarks(userID, tweetId)} // Call addToBookMarks
                        />{" "}
                        {tweet.Bookmarks}
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
              </section>
            );
          }
        })}
    </>
  );
};

export default TweetComponent;