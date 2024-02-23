import React, { useEffect, useState } from 'react';
import avatarIMG from "../assets/avatarIMG.png"; // Adjust the import path
import backgroundIMG from "../assets/backgroundplaceholder.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { auth } from '../config/firebase'; // Import auth from firebase config
import { getUserByUserID } from './getUserByUsername';



export const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('Unknown User');

    useEffect(() => {
        // Show loading screen for 2 seconds
        const loadingTimeout = setTimeout(() => {
            setLoading(false); // Hide loading screen after 2 seconds
        }, 2000);

        // Fetch user data after 2 seconds
        const fetchUserName = async () => {
            try {
                const user = await getUserByUserID(auth?.currentUser?.uid);
                if (user) {
                    setUsername(user.username);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                clearTimeout(loadingTimeout); // Cancel the loading timeout if data fetching is complete
                setLoading(false); // Hide loading screen
            }
        };

        // Call fetchUserName after 2 seconds
        const fetchDataTimeout = setTimeout(fetchUserName, 1000);

        // Cleanup function
        return () => {
            clearTimeout(loadingTimeout); // Cancel the loading timeout if component unmounts
            clearTimeout(fetchDataTimeout); // Cancel the data fetching timeout if component unmounts
        };
    }, []); // Empty dependency array to run the effect only once on component mount

    // Render loading screen if loading is true
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex-none flex-col w-5/12 lato-regular">
            <div className='flex flex-row justify-between my-3'><FontAwesomeIcon icon={faLeftLong} style={{fontSize:"22px"}} /> <p className=''>{username} </p> <span></span> </div>
            <div className="relative w-full">
    <img
        src={backgroundIMG}
        className="w-full h-full object-cover"
        alt="Background image"
    />
    <section className="Shadow z-50 p-1 absolute bottom-0 left-0 ml-4">
        <img
            src={avatarIMG}
            className="col-start-1 col-end-1 row-start-1 row-end-2"
            style={{ height: "42px", borderRadius: "50%" }}
            alt="User Avatar"
        />
    </section>
</div>
        </div>
    );
};
