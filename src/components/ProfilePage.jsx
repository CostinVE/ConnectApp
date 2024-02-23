import React, { useEffect, useState } from 'react';
import avatarIMG from "../assets/avatarIMG.png"; // Adjust the import path
import backgroundIMG from "../assets/backgroundplaceholder.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftLong } from '@fortawesome/free-solid-svg-icons';
import { auth } from '../config/firebase'; // Import auth from firebase config
import { getUserByUserID } from './getUserByUsername';



export const ProfilePage = () => {
    const [username, setUsername] = useState('Unknown User');
    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const user = await getUserByUserID(auth?.currentUser?.uid);
                console.log(user)
                if (user) {
                    setUsername(user.username);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUserName();
    }, []);

    return (
        <div className="flex-none flex-col w-5/12 lato-regular">
            <p><FontAwesomeIcon icon={faLeftLong} /> {username} </p>
            <div className='w-full'>
                <img
                    src={backgroundIMG}
                    className='w-full h-full object-cover'
                    alt="Background image" />
            </div>
            <section className="Shadow">
                <img
                    src={avatarIMG}
                    className="col-start-1 col-end-1 row-start-1 row-end-2"
                    style={{ height: "42px", borderRadius: "50%", marginLeft: "2em" }}
                    alt="User Avatar" />
            </section>
        </div>
    );
};
