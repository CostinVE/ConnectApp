import React, { useEffect, useState } from 'react';
import "../../index.css"
import { useNavigate } from 'react-router-dom';

import avatarIMG from "../../assets/avatarIMG.png"; 
import backgroundIMG from "../../assets/backgroundplaceholder.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';

import { auth, storage, database} from '../../config/firebase'; // Import auth from firebase config
import {ref, uploadBytes, getDownloadURL, deleteObject,} from 'firebase/storage'
import { getUserByUserID } from '../getUserByUsername';
import { ProfileNavigation, fetchUserPosts } from './ProfileNavigation';

export const ProfilePage = () => {

    const userID = auth?.currentUser?.uid;

    const [imageUpload, setImageUpload] = useState(null);
    const [username, setUsername] = useState()
    const [creationTime, setCreationTime] = useState(null);


    const navigate = useNavigate()

    const handleGoBack = () => {
        navigate(-1);
      };


   
    console.log(userID)

    // Code to fetch user data and other functionalities...

    const [userPostsHTML, setUserPostsHTML] = useState([]); // State variable to hold the HTML elements of user posts

    useEffect(() => {
        const fetchData = async () => {
            try {
                const posts = await fetchUserPosts(); // Call the async function to fetch user posts
                if (posts) {
                    setUserPostsHTML(posts); // Update the state with the HTML elements of user posts if posts is not null
                }
            } catch (error) {
                console.error("Error fetching user posts:", error);
            }
        };
    
        fetchData(); // Invoke the async function to fetch user posts when the component mounts
    }, []);
    

    const generateTimestamp = () => {
        return Timestamp.now(); // This will give you the current timestamp
      };
    
      const formattedDate = (timestamp) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(timestamp * 1000).toLocaleTimeString('en-US', options);
        
        const options2 = { day: '2-digit', month: '2-digit' };
        const dateString = new Date(timestamp * 1000).toLocaleDateString('en-US', options2);
        
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
            console.error('Error fetching user:', error);
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
                userID: userID
            }
        };
    
        // Upload the image file and metadata
        uploadBytes(storageRef, file, metadata).then(() => {
            alert("Image Uploaded");
        }).catch((error) => {
            console.error("Error uploading image:", error);
        });
    };

    const handleImageUploadClick = () => {
        // Assuming you're using an input element of type file to select the image
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*'; // Specify that only image files are accepted
        input.onchange = (event) => {
            const file = event.target.files[0];
            setImageUpload(file); // Set the selected file object in the state
            uploadImage(file); // Trigger the uploadImage function with the selected file object
        };
        input.click();
    };

    getDownloadURL(ref(storage, `profileimages/${userID}`))
  .then((url) => {
     
    const img = document.getElementById('ProfileIMG')
    img.setAttribute('src', url)
    .catch((error) => {
    })
  
  })




    const [loading, setLoading] = useState(true)
    
    

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
        <div className="flex flex-col w-5/12 lato-regular">
            <div className='flex flex-row justify-between my-3'><FontAwesomeIcon icon={faLeftLong} style={{fontSize:"22px", cursor:"pointer"}} onClick={handleGoBack} /> <p className=''>{username} </p> <span></span> </div>
            <div className='relative'>
                <img
                    src={backgroundIMG}
                    className="w-full rounded-lg max-h-64 object-cover relative"
                    alt="Background image"
                />
                <img
                    id='ProfileIMG'
                    src={avatarIMG} // Use the uploaded image URL if available, otherwise use the default avatar
                    className="rounded-lg bottom-0 mb-[-30px] border-4 border-white mx-8 z-50 absolute"
                    style={{ height: "82px", borderRadius: "50%", cursor: "pointer" }}
                    alt="User avatar"
                    onClick={handleImageUploadClick} // Attach the onClick event handler
                />
            </div>
            <section className="flex-col w-full mt-4 justify-between bg-white p-3 bottom-0 left-0 bg-white rounded-lg ">
                <br></br>
                <div className='flex justify-between'>
                    <h3 className='lato-bold'> &nbsp;&nbsp; {username}</h3>
                    <button className='p-1 rounded-r-full rounded-l-full bg-white hover:bg-indigo-300 text-base'>Set up profile</button>
                </div>
                <p className='mx-2 opacity-50'>
                    &nbsp;&nbsp;
                    <FontAwesomeIcon icon={faCalendar} />
                    &nbsp; Joined {creationTime ? new Date(creationTime).toLocaleDateString() : ''}
                </p>
            </section>
            <nav className='flex items-center justify-between bg-white z-20 my-6'>
                <ProfileNavigation/>
            </nav>
            <section className="flex-col w-full">
            {userPostsHTML && userPostsHTML.map((postHTML, index) => (
                <div key={index} className="post">
                    {postHTML}
                </div>
            ))}
            </section>
        </div>
    );
}
