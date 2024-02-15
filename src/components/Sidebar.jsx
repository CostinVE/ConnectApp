import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faMessage, faBookmark, faUser, faEllipsis } from '@fortawesome/free-solid-svg-icons'

export const Sidebar = () => {
  return (
    <div className='flex-none flex-column h-screen w-2/12 justify-evenly pl-10 my-10 gap-10'>
        <h1 className='pb-8 my-12 lato-regular'>ConnectApp</h1>
        <p className='my-12 w-fit p-2 rounded-lg lato-regular lato-regular hover:bg-indigo-300 cursor-pointer'><FontAwesomeIcon icon={faHouse} style={{fontSize:"24px"}}/> &nbsp;&nbsp;Home </p>
        <p className='my-12 w-fit p-2 rounded-lg lato-regular lato-regular hover:bg-indigo-300 cursor-pointer'><FontAwesomeIcon icon={faMessage} style={{fontSize:"23px"}}/> &nbsp;&nbsp;Messages</p>
        <p className='my-12 w-fit p-2 rounded-lg lato-regular lato-regular hover:bg-indigo-300 cursor-pointer'><FontAwesomeIcon icon={faBookmark} style={{fontSize:"24px"}}/>&nbsp;&nbsp;&nbsp; Bookmarks</p>
        <p className='my-12 w-fit p-2 rounded-lg lato-regular lato-regular hover:bg-indigo-300 cursor-pointer'><FontAwesomeIcon icon={faUser} style={{fontSize:"24px"}}/> &nbsp;&nbsp; Profile </p>
        <p className='my-12 w-fit p-2 rounded-lg lato-regular lato-regular hover:bg-indigo-300 cursor-pointer'><FontAwesomeIcon icon={faEllipsis} style={{fontSize:"24px"}}/> &nbsp;&nbsp; More </p>
    </div>
  )
}
