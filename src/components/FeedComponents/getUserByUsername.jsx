import { collection, query, where, getDocs } from 'firebase/firestore';
import { database } from '../../config/firebase';

export const getUserByUserID = async (userID) => {
  try {
    // Create a query to find the user document with the given userID
    const q = query(collection(database, 'Users'), where('UserID', '==', userID));
    
    // Execute the query
    const querySnapshot = await getDocs(q);
    
    // Check if there are any matching documents
    if (!querySnapshot.empty) {
      // Assuming there's only one user with this userID, get the first document
      const userDoc = querySnapshot.docs[0];
      
      // Extract the username from the document
      const username = userDoc.data().Username;
      
      return { userID, username };
    } else {
      // No user found with the given userID
      console.error('No user found with the userID:', userID);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};
