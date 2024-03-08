import React, { useEffect, useState } from "react";
import "../../index.css";
import { useNavigate } from "react-router-dom";

import avatarIMG from "../../assets/avatarIMG.png";
import backgroundIMG from "../../assets/backgroundplaceholder.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faComment, faBookmark } from "@fortawesome/free-regular-svg-icons";
import imageUploadPlaceholder from "../../assets/imageuploadplaceholder.png";

import { auth, storage, database } from "../../config/firebase"; // Import auth from firebase config
import {
  collection,
  addDoc,
  Timestamp,
  getDocs,
  doc,
  arrayUnion,
  arrayRemove,
  updateDoc,
  getDoc,
  increment,
  FieldValue,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getUserByUserID } from "../getUserByUsername";

export const ProfilePage = () => {
  const userID = auth?.currentUser?.uid;

  const [selectedOption, setSelectedOption] = useState("Reposts");
  const [username, setUsername] = useState();
  const [creationTime, setCreationTime] = useState(null);

  const [userPostsHTML, setUserPostsHTML] = useState([]); // State variable to hold the HTML elements of user posts
  const [userRepostsHTML, setUserRepostsHTML] = useState([]); // State variable to hold the HTML elements of user posts
  const [userImagePostsHTML, setUserImagePostsHTML] = useState([]); // State variable to hold the HTML elements of user posts
  const [isImageClick, setIsImageClick] = useState(false);


  const handleChangeOption = (option) => {
    switch (option) {
      case "Posts":
        console.log(`navigation switched to ${option}`);
        break;
      case "Media":
        console.log(`navigation switched to ${option}`);
        break;
      case "Reposts":
        console.log(`navigation switched to ${option}`);
        break;
      default:
        console.error(`Unhandled option: ${option}`);
    }
    setSelectedOption(option);
  };

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  console.log(userID);

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

  const fetchUserName = async () => {
    let loadingTimeout;

    try {
      const user = await getUserByUserID(auth?.currentUser?.uid);
      if (user) {
        setUsername(user.username);
        // No need to log here, as we want to log after the state has been updated

        // Get the creation time after fetching the username
        if (auth.currentUser) {
          const userCreationTime = auth.currentUser.metadata.creationTime;
          setCreationTime(userCreationTime);
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      // Set a timeout for 1.2 seconds before clearing the loading timeout and hiding loading screen
      loadingTimeout = setTimeout(() => {
        clearTimeout(loadingTimeout); // Cancel the loading timeout if data fetching is complete
        setLoading(false); // Hide loading screen
      }, 1200);
    }
  };

  fetchUserName();

  const uploadImage = async (file) => {
    if (!file) return; // Ensure file is not null or undefined

    // Get the userID of the currently logged-in user
    const userID = auth?.currentUser?.uid;

    // If no user is logged in, return
    if (!userID) {
      console.error("No user logged in.");
      return;
    }

    // Get a reference to the storage location with the userID as the image name
    const storageRef = ref(storage, `profileimages/${userID}`);

    try {
      // Check if an image with the same name already exists
      const existingImageRef = storageRef.child(file.name);
      await existingImageRef.getDownloadURL();

      // If an existing image is found, delete it
      await deleteObject(existingImageRef);
      console.log("Existing image deleted successfully.");
    } catch (error) {
      // If no existing image is found, continue with the upload
      console.log("No existing image found.");
    }

    // Set metadata for the image (including userID)
    const metadata = {
      customMetadata: {
        userID: userID,
      },
    };

    // Upload the image file and metadata
    uploadBytes(storageRef, file, metadata)
      .then(() => {
        alert("Image Uploaded");
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
      });
  };

  const handleImageUploadClick = () => {
    // Assuming you're using an input element of type file to select the image
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*"; // Specify that only image files are accepted
    input.onchange = (event) => {
      const file = event.target.files[0];
      setImageUpload(file); // Set the selected file object in the state
      uploadImage(file); // Trigger the uploadImage function with the selected file object
    };
    input.click();
  };

  getDownloadURL(ref(storage, `profileimages/${userID}`)).then((url) => {
    const img = document.getElementById("ProfileIMG");
    img.setAttribute("src", url).catch((error) => {});
  });

  const fetchUserPosts = async () => {
    const usersCollectionRef = collection(database, "Users");
    const userID = auth.currentUser.uid;

    try {
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

      const UserRef = doc(database, "Users", userID);
      const userDoc = await getDoc(UserRef);
      const userData = userDoc.data();
      const userPosts = userData?.Posts
      
      console.log("User Posts:", userPosts);

      const postsHTML = await Promise.all(
        userPosts.map(async (postID) => {
          try {
            const username = userDoc.data().Username;

            const PostRef = doc(database, "tweets", postID);
            const postDoc = await getDoc(PostRef);
            const postData = postDoc.data();

            if (postDoc.exists()) {
             

              const addToReposts = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.repostedTweets &&
                    userData.repostedTweets.includes(postID)
                  ) {
                    console.log("User has already reposted this tweet.");
                    await updateDoc(userDocRef, {
                      repostedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Reposts: increment(-1),
                    });
                    console.log("Tweet removed from user's reposted tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      repostedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Reposts: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's reposted tweets: ",
                    e
                  );
                }
              };

              const addToBookmarks = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.bookmarkedTweets &&
                    userData.bookmarkedTweets.includes(postID)
                  ) {
                    console.log("User has already bookmarked this tweet.");
                    await updateDoc(userDocRef, {
                      bookmarkedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Bookmarks: increment(-1),
                    });
                    console.log("Tweet removed from user's bookmarked tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      bookmarkedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Bookmarks: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's bookmarked tweets: ",
                    e
                  );
                }
              };

              const addToLikes = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.likedTweets &&
                    userData.likedTweets.includes(postID)
                  ) {
                    console.log("User has already liked this tweet.");
                    await updateDoc(userDocRef, {
                      likedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Likes: increment(-1),
                    });
                    console.log("Tweet removed from user's liked tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      likedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Likes: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's liked tweets: ",
                    e
                  );
                }
              };

              return (
                <section key={postID} className="post">
                  <div className="flex-col p-3 Shadow">
                    <div className="flex flex-row my-5">
                      <p className="lato-bold">{postData.UserName}</p>
                    </div>
                    <p className="flex flex-col my-5">{postData.Post}</p>
                    <p className="opacity-50">
                      {formattedDate(postData.Timestamp.seconds)}
                    </p>
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
          } catch (error) {
            console.error("Error processing post:", error);
            return null;
          }
        })
      );

      // Render the HTML for posts
      return postsHTML;
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await fetchUserPosts(); // Call the async function to fetch user posts
        if (posts) {
          console.log("Fetching data...");
          console.log("Posts fetched:", posts);
          console.log("Setting user posts HTML...");
          setUserPostsHTML(posts); // Update the state with the HTML elements of user posts if posts is not null
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchData(); // Invoke the async function to fetch user posts when the component mounts
  }, []);

  const fetchUserReposts = async () => {
    const usersCollectionRef = collection(database, "Users");
    const userID = auth.currentUser.uid;

    try {
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

      const UserRef = doc(database, "Users", userID);
      const userDoc = await getDoc(UserRef);
      const userData = userDoc.data();
      const userPosts = userData?.repostedTweets
      
      console.log("User Posts:", userPosts);

      const repostHTML = await Promise.all(
        userPosts.map(async (postID) => {
          try {
            const username = userDoc.data().Username;

            const PostRef = doc(database, "tweets", postID);
            const postDoc = await getDoc(PostRef);
            const postData = postDoc.data();

            if (postDoc.exists()) {
              
              const addToReposts = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.repostedTweets &&
                    userData.repostedTweets.includes(postID)
                  ) {
                    console.log("User has already reposted this tweet.");
                    await updateDoc(userDocRef, {
                      repostedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Reposts: increment(-1),
                    });
                    console.log("Tweet removed from user's reposted tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      repostedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Reposts: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's reposted tweets: ",
                    e
                  );
                }
              };

              const addToBookmarks = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.bookmarkedTweets &&
                    userData.bookmarkedTweets.includes(postID)
                  ) {
                    console.log("User has already bookmarked this tweet.");
                    await updateDoc(userDocRef, {
                      bookmarkedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Bookmarks: increment(-1),
                    });
                    console.log("Tweet removed from user's bookmarked tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      bookmarkedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Bookmarks: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's bookmarked tweets: ",
                    e
                  );
                }
              };

              const addToLikes = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.likedTweets &&
                    userData.likedTweets.includes(postID)
                  ) {
                    console.log("User has already liked this tweet.");
                    await updateDoc(userDocRef, {
                      likedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Likes: increment(-1),
                    });
                    console.log("Tweet removed from user's liked tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      likedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Likes: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's liked tweets: ",
                    e
                  );
                }
              };

              return (
                <section key={postID} className="post">
                  <div className="flex-col p-3 Shadow">
                    <div className="flex flex-row my-5">
                      <p className="lato-bold">{postData.UserName}</p>
                    </div>
                    <p className="flex flex-col my-5">{postData.Post}</p>
                    <p className="opacity-50">
                      {formattedDate(postData.Timestamp.seconds)}
                    </p>
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
          } catch (error) {
            console.error("Error processing post:", error);
            return null;
          }
        })
      );

      // Render the HTML for posts
      return repostHTML;
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const posts = await fetchUserReposts(); // Call the async function to fetch user posts
        if (posts) {
          console.log("Fetching data...");
          console.log("Posts fetched:", posts);
          console.log("Setting user posts HTML...");
          setUserRepostsHTML(posts); // Update the state with the HTML elements of user posts if posts is not null
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchData(); // Invoke the async function to fetch user posts when the component mounts
  }, []);


  const fetchUserImagePosts = async () => {
    const usersCollectionRef = collection(database, "Users");
    const userID = auth.currentUser.uid;

    try {
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

      const UserRef = doc(database, "Users", userID);
      const userDoc = await getDoc(UserRef);
      const userData = userDoc.data();
      const userPosts = userData?.ImagePosts;
      console.log("User Posts:", userPosts);

      const ImagePostsHTML = await Promise.all(
        userPosts.map(async (postID) => {
          try {
       

            const PostRef = doc(database, "imagetweets", postID);
            const postDoc = await getDoc(PostRef);
           

            if (postDoc.exists()) {
            

              const addToBookmarks = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.bookmarkedTweets &&
                    userData.bookmarkedTweets.includes(postID)
                  ) {
                    console.log("User has already bookmarked this tweet.");
                    await updateDoc(userDocRef, {
                      bookmarkedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Bookmarks: increment(-1),
                    });
                    console.log("Tweet removed from user's bookmarked tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      bookmarkedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Bookmarks: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's bookmarked tweets: ",
                    e
                  );
                }
              };

              const addToLikes = async (userId, postID) => {
                try {
                  const userDocRef = doc(usersCollectionRef, userId);
                  const userDocSnapshot = await getDoc(userDocRef);
                  const userData = userDocSnapshot.data();
                  if (
                    userData &&
                    userData.likedTweets &&
                    userData.likedTweets.includes(postID)
                  ) {
                    console.log("User has already liked this tweet.");
                    await updateDoc(userDocRef, {
                      likedTweets: arrayRemove(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Likes: increment(-1),
                    });
                    console.log("Tweet removed from user's liked tweets");
                  } else {
                    await updateDoc(userDocRef, {
                      likedTweets: arrayUnion(postID),
                    });
                    const tweetDocRef = doc(
                      collection(database, "tweets"),
                      postID
                    );
                    await updateDoc(tweetDocRef, {
                      Likes: increment(1),
                    });
                  }
                } catch (e) {
                  console.error(
                    "Error adding tweet to user's liked tweets: ",
                    e
                  );
                }
              };

              return (
                <img
  className={`tweet-img-${postID}`}
  src={imageUploadPlaceholder} // Provide a placeholder image or initial value
  alt="Could not display image"
  style={{
    width: "100%",
    height: "100%",
    objectFit: "cover", // Ensure the image covers the container while maintaining aspect ratio
    borderRadius: "4%",
    cursor:"pointer"
  }}
/>
              );
            } else {
              console.log("Post not found for ID:", postID);
              return null;
            }
          } catch (error) {
            console.error("Error processing post:", error);
            return null;
          }
        })
      );

      const postIDs = await Promise.all(
        userPosts.map(async (postID) => postID)
      );
      return { ImagePostsHTML, postIDs };
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return { ImagePostsHTML: null, postIDs: [] }; // Return an empty array if there's an error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { ImagePostsHTML, postIDs } = await fetchUserImagePosts(); // Call the async function to fetch user posts
        if (ImagePostsHTML && postIDs) {
          console.log("Fetching data...");
          console.log("Posts fetched:", ImagePostsHTML);
          console.log("Setting user posts HTML...");

          await Promise.all(
            postIDs.map(async (postID) => {
              const tweetIMGRef = ref(storage, `imageuploads/${postID}`);
              const url = await getDownloadURL(tweetIMGRef);
              const imgElement = document.querySelector(`.tweet-img-${postID}`);
              if (imgElement) {
                imgElement.src = url;
              }
            })
          );
          setUserImagePostsHTML(ImagePostsHTML);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      }
    };

    fetchData(); // Invoke the async function to fetch user posts when the component mounts
  }, []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reloadFlag = localStorage.getItem("reloadProfilePage");
    if (reloadFlag === "true") {
      localStorage.removeItem("reloadProfilePage");
      window.location.reload(); // Reload the page
    } else {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 1750);

      return () => clearTimeout(timeout);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const ImageForm = () => {
    const handleExitClick = () => {
        setIsImageClick(false);
      };
    return (
      <div className="z-50 bg-black absolute opacity-75 top-0 left-0 w-full h-full overflow-hidden">
      <div className="flex flex-row justify-evenly my-4 w-full">
        <button onClick={handleExitClick}>
          <FontAwesomeIcon icon={faXmark} className="rounded-full px-2 m-4 hover:bg-slate-900" style={{ color: "#ffffff", fontSize: "32px" }} />
        </button>
        <img
          className={`tweet-img`}
          src={imageUploadPlaceholder} // Provide a placeholder image or initial value
          alt="Could not display image"
          style={{
            width: "50vw",
            height: "85vh",
            objectFit: "cover", // Ensure the image covers the container while maintaining aspect ratio
            borderRadius: "12%",
          }}
        />
        <span style={{ opacity: 0 }}>Spacer</span>
      </div>
    </div>
    )
}


  const handleImageClick = () => {
    setIsImageClick(true);
  };

  return (
    <div className="flex flex-col w-5/12 lato-regular overflow-y-auto">
      <div className="flex flex-row justify-between my-3">
        <FontAwesomeIcon
          icon={faLeftLong}
          style={{ fontSize: "22px", cursor: "pointer" }}
          onClick={handleGoBack}
        />{" "}
        <p className="">{username} </p> <span></span>{" "} 
      </div>
      <div className="relative">
        <img
          src={backgroundIMG}
          className="w-full rounded-lg max-h-64 object-cover relative"
          alt="Background image"
        />
        <img
          id="ProfileIMG"
          src={avatarIMG} // Use the uploaded image URL if available, otherwise use the default avatar
          className="rounded-lg bottom-0 mb-[-30px] border-4 border-white mx-8 z-50 absolute"
          style={{ height: "82px", borderRadius: "50%", cursor: "pointer" }}
          alt="User avatar"
          onClick={handleImageUploadClick} // Attach the onClick event handler
        />
      </div>
      <section className="flex-col w-full mt-4 justify-between bg-white p-3 bottom-0 left-0 bg-white rounded-lg ">
        <br></br>
        <div className="flex justify-between">
          <h3 className="lato-bold"> &nbsp;&nbsp; {username}1</h3>
          <button className="p-1 rounded-r-full rounded-l-full bg-white hover:bg-indigo-300 text-base">
            Set up profile
          </button>
        </div>
        <p className="mx-2 opacity-50">
          &nbsp;&nbsp;
          <FontAwesomeIcon icon={faCalendar} />
          &nbsp; Joined{" "}
          {creationTime ? new Date(creationTime).toLocaleDateString() : ""}
        </p>
      </section>
      <nav className="flex items-center justify-between bg-white z-20 my-6">
        <div className="flex flex-row justify-evenly w-full">
          <p
            onClick={() => handleChangeOption("Posts")}
            className={
              selectedOption === "Posts"
                ? "selected border-b-4 border-indigo-500 rounded-sm"
                : ""
            }
            style={{ cursor: "pointer" }}
          >
            Posts
          </p>
          <p
            onClick={() => handleChangeOption("Media")}
            className={
              selectedOption === "Media"
                ? "selected border-b-4 border-indigo-500 rounded-sm"
                : ""
            }
            style={{ cursor: "pointer" }}
          >
            Media
          </p>
          <p
            onClick={() => handleChangeOption("Reposts")}
            className={
              selectedOption === "Reposts"
                ? "selected border-b-4 border-indigo-500 rounded-sm"
                : ""
            }
            style={{ cursor: "pointer" }}
          >
            Reposts
          </p>
        </div>
      </nav>
      {selectedOption === "Posts" && (
        <section className="flex-col w-full">
          {userPostsHTML &&
            userPostsHTML.map((postHTML, index) => (
              <div key={index} className="post">
                {postHTML}
              </div>
            ))}
        </section>
      )}
      {selectedOption === "Media" && (
        <section className="flex-col w-full">
          <div className="grid grid-cols-3 gap-1 w-full">
            {isImageClick && <ImageForm />}
      {userImagePostsHTML &&
        userImagePostsHTML.map((postHTML, index) => (
          <div key={index} className="post" onClick={handleImageClick}>
            {postHTML}
          </div>
        ))}
         {selectedOption === "Reposts" && (
        <section className="flex-col w-full">
          {userRepostsHTML &&
            userRepostsHTML.map((postHTML, index) => (
              <div key={index} className="post">
                {postHTML}
              </div>
            ))}
        </section>
      )}
   </div>
        </section>
      )}
    </div>
  );
};
