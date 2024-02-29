import React from 'react'
import { ProfileNavigation } from './ProfileNavigation'

export const IndividualPost = () => {
  return (
    <section key={postID} className="post">
                        <div className="flex-col p-3 Shadow">
                        <div className="flex flex-row my-5">
                        <p className="lato-bold">{postData.UserName}</p></div>
                        <p className="flex flex-col my-5">{postData.Post}</p>
                        <p className="opacity-50">{formattedDate(postData.Timestamp.seconds)}</p>
                        <div className="flex flex-row w-full justify-evenly">
                        <button type="button" onClick={openCommentForm}>
                    <FontAwesomeIcon
                      icon={faComment}
                      style={{ color: "#3f44d9" }}
                    />
                  </button>
                  <p>
                    <FontAwesomeIcon
                      icon={faRepeat}
                      rotation={90}
                      style={{ color: "#28d74b", cursor:"pointer" }}
                      onClick={() => addToReposts(userID, postID)} // Call addToReposts
                      />{" "}
                      {postData.Reposts}
                  </p>
                  <p>
                    <FontAwesomeIcon
                      icon={faHeart}
                      style={{ color: "#e60f4f", cursor: "pointer" }}
                      onClick={() => addToLikes(userID, postID)} // Call addToLikes with tweet id
                    />{" "}
                    {postData.Likes}
                  </p>
                  <p>
                    <FontAwesomeIcon
                      icon={faBookmark}
                      style={{ color: "#3f44d9", cursor: "pointer" }}
                      onClick={() => addToBookmarks(userID, postID)} // Call addToBookMarks
                      />{" "}
                      {postData.Bookmarks}
                  </p>    
                          </div>
                        </div>
                      </section>
  )
}
