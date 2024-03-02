import React from 'react'

import '../../index.css';
import { database, auth, storage } from '../../config/firebase.jsx';
import { collection, addDoc, Timestamp, getDocs, doc, updateDoc, arrayUnion} from 'firebase/firestore';
import {ref, getDownloadURL, uploadBytes} from 'firebase/storage'
import { getUserByUserID } from "../getUserByUsername.jsx";


import avatarIMG from "../../assets/avatarIMG.png"; // Adjust the import path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faRepeat, faXmark } from "@fortawesome/free-solid-svg-icons";
import imageUploadPlaceholder from "../../assets/imageuploadplaceholder.png"

 const PoolUploadForm = () => {
    return (
        <section className="flex-none flex-col w-5/12 lato-regular">
        <div className="flex flex-row w-full justify-center my-4">
          <p className="text-lg">Create a pool</p>
        </div>
       
          <section className="flex flex-col rounded-lg Shadow">
            <div className="flex flex-row mx-2 my-4 justify-between">
           <img
              id="CommentIMG"
              src={avatarIMG}
              className="col-start-1 col-end-1 row-start-1 row-end-2"
              style={{ height: "42px", borderRadius: "50%", marginLeft: "1em",}}
              alt="User Avatar"
            />
            <input
              className="col-start-2 col-end-4 row-start-1 w-80 row-end-3 border-none"
              placeholder="What should others vote ?"
              style={{ height: "52px", minWidth: "65%" }}
            //   value={newPost}
            //   onChange={(event) => setNewPost(event.target.value)}
            />
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full">Post</button>
            </div>
            <input id="Option1" className="w-100 row-end-3 border-none mx-2 my-1" placeholder='First option'/>
            <input id="Option2" className="w-100 row-end-3 border-none mx-2 my-1" placeholder='Seccond option'/>
            <input id="Option3" className="w-100 row-end-3 border-none mx-2 my-1" placeholder='Third option'/>
            <input id="Option4" className="w-100 row-end-3 border-none mx-2 my-1" placeholder='Fourth option'/>
            <div className="flex my-8 justify-center">

            </div>
          </section>
          {/* Feed space */}
        </section>
      );
}

export default PoolUploadForm
