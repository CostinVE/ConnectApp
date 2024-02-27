import { useState } from "react";
import { doc, getDoc} from "firebase/firestore"
import { auth, storage, database} from '../../config/firebase'; // Import auth from firebase config


export const fetchUserPosts = async () => {
  const userID = auth?.currentUser?.uid;
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
      const userPosts = userData?.Posts || []; // Ensure userPosts is not null

      console.log("User Posts:", userPosts);

      const postsHTML = await Promise.all(userPosts.map(async (postID) => {
          const PostRef = doc(database, "tweets", postID);
          const postDoc = await getDoc(PostRef);

          if (postDoc.exists()) {
              const postData = postDoc.data();

              return (
                  <div key={postID} className="post">
                      <p>Post: {postData.Post}</p>
                      <p>Likes: {postData.Likes}</p>
                      <p>Bookmarks: {postData.Bookmarks}</p>
                      <p>Reposts: {postData.Reposts}</p>
                      <p>Timestamp: {formattedDate(postData.Timestamp.seconds)}</p>
                      <p>UserName: {postData.UserName}</p>
                  </div>
              );
          } else {
              console.log("Post not found for ID:", postID);
              return null;
          }
      }));

      console.log(postsHTML);
      return postsHTML;
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