import { collection, getDocs } from 'firebase/firestore';
import { database } from '../../config/firebase';

export const fetchComments = async () => {
  console.log('Fetching comments...');
  try {
    const tweetRef = collection(database, 'tweets');
    const querySnapshot = await getDocs(tweetRef);
  
    const commentsPromises = querySnapshot.docs.map(async (tweetDoc) => {
      const tweetId = tweetDoc.id;
      const commentRef = collection(database, 'tweets', tweetId, 'comments');
      console.log('Mapping comments');
      const commentSnapshot = await getDocs(commentRef);
      
      const commentsData = commentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Add comment ID
          tweetId: tweetId, // Add parent tweet ID
          commentText: data.commentText,
          Username: data.Username,
          Likes: data.Likes
        };
      });
      
      return commentsData;
    });

    console.log(`Mapping comments data`);

    // Wait for all promises to resolve
    const commentsData = await Promise.all(commentsPromises);

    console.log(commentsData);
    
    return commentsData;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error; // Throw the error for the caller to handle
  }
};
