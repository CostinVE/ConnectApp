import React, {useState, useEffect} from 'react'

import { auth, storage, database} from '../../config/firebase'; // Import auth from firebase config
import {ref, uploadBytes, getDownloadURL, deleteObject,} from 'firebase/storage'
import { getUserByUserID } from '../getUserByUsername';
import { ProfileNavigation, fetchUserPosts } from './ProfileNavigation';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

export const BookmarksFeed = () => {

    const userID = auth?.currentUser?.uid;
    const [username, setUsername] = useState()
    const [userBookmarksHTML, setUserBookmarksHTML] = useState([]); // State variable to hold the HTML elements of user posts

    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await fetchUserPosts(); // Call the async function to fetch user posts
                if (posts) {
                    setUserBookmarksHTML(posts); // Update the state with the HTML elements of user posts if posts is not null
                }
            } catch (error) {
                console.error("Error fetching user posts:", error);
            }
        };
    
        fetchData(); // Invoke the async function to fetch user posts when the component mounts
    }, []);

    const [loading, setLoading] = useState(true)

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

    

    useEffect(() => {
        const reloadFlag = localStorage.getItem('reloadProfilePage');
        if (reloadFlag === 'true') {
            localStorage.removeItem('reloadProfilePage');
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

  return (
    <div className="flex-none flex-col w-5/12 lato-regular ">
        <div className='flex flex-row w-full h-14 my-8 justify-between'>
            <div className='flex flex-col m-0'>
            <h3 className='lato-bold m-0'>Bookmarks</h3>
            <p className='opacity-50 m-0'>@{username}</p></div>
            <p className='w-fit p-2 rounded-lg lato-regular lato-regular cursor-pointer'><FontAwesomeIcon icon={faEllipsis} style={{fontSize:"24px"}}/></p>
            </div>
        
        {userBookmarksHTML && userBookmarksHTML.map((postHTML, index) => (
        <div key={index} className="post">
            {postHTML}
        </div>
    ))}</div>
  )
}
