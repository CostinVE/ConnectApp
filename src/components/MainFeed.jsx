import React from "react";
import avatarIMG from "../assets/avatarIMG.png";
import gifPNG from "../assets/gif.png"

export const MainFeed = () => {
  
  return (
    <div className="flex-none flex-col w-5/12 lato-regular">
      <div className="grid grid-cols-2 gap-x-2 my-5">
        <p className="lato-bold ">For you</p>
        <p className="lato-regular opacity-50">Following</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <img
          src={avatarIMG}
          className="col-start-1 col-end-2 row-start-1 row-end-2"
          style={{ height: "42px", borderRadius: "50%", marginLeft:"2em" }}
          alt="User Avatar"
        />
        <input
          className="col-start-2 col-end-4 row-start-1 row-end-3 border-none"
          placeholder="What is happening?!"
          style={{height:"42px"}}
        />
        <div className="col-start-1 col-end-4 row-start-2 row-end-2 flex items-center justify-center">
        <img src={gifPNG} style={{height:'28px' , marginRight:"5px"}} />
        <img src={gifPNG} style={{height:'28px' , marginRight:"5px"}} />
        <img src={gifPNG} style={{height:'28px' , marginRight:"5px"}} />
        <img src={gifPNG} style={{height:'28px' , marginRight:"5px"}} />
        </div>
        <div className="col-start-4 col-end-5 row-start-2 row-end-3">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-full">Post</button>
        </div>
      </div>
    </div>
  );
};
