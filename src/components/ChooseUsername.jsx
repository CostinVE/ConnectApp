import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import { collection, addDoc, setDoc , doc} from 'firebase/firestore';
import { database } from '../config/firebase';

export const ChooseUsername = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const addUserToFirestore = async (userID, username, likedTweets) => {
    try {
      // Add a new document with a generated ID
      const docRef = await setDoc(doc(database, 'Users', userID), {
        UserID: userID,
        Username: username,
        likedTweets: [] ,
        bookmarkedTweets: [],
        repostedTweets: []
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleContinue = async () => {
    try {
        event.preventDefault()
      // Ensure username is not empty
      if (!username) {
        console.error('Username is required.');
        return;
      }
      
      // Get the userID of the current user
      const userID = auth.currentUser.uid;

      // Update the user's display name using updateProfile
      await updateProfile(auth.currentUser, { displayName: username });

      // Add user data to Firestore
      await addUserToFirestore(userID, username);

      // Now you can navigate to the next page or perform any other actions
      navigate('/ConnectApp');
    } catch (err) {
      console.error(err);
    }
  };  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Please choose your username
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Already a member?{' '}
            <a href="/SignIn" className="font-bold leading-4 text-indigo-600 hover:text-indigo-500 underline hover:underline-offset-[2px]">
              Click here to Sign In
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
