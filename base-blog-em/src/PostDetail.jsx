import { fetchComments } from "./api";
import "./PostDetail.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function PostDetail({ post,deletePostMutation,updatePostMutation }) {
  // replace with useQuery
  const [updatedPostTitle, setUpdatedPostTitle] = useState(post.title);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments",post.id ],
    queryFn: () => fetchComments(post.id),
  });

  if (isLoading) {
    return <h3>Loading...</h3>;
  }
  if (isError) {
    return <h3>Error loading comments</h3>;
  }
  if (!data) {
    return <h3>No comments found</h3>;
  }
  return (
    <>
      <h3 style={{ color: "blue" }}>{post.title}</h3>
      <button onClick={() => deletePostMutation.mutate(post.id)}>Delete</button> 
      <input
        type="text"
        value={updatedPostTitle}
        onChange={(e) => setUpdatedPostTitle(e.target.value)}
        style={{ margin: "0 8px" }}
      />
      <button onClick={() => updatePostMutation.mutate({ ...post, title: updatedPostTitle })}>Update title</button>
      {deletePostMutation.isPending && <div>Deleting...</div>}
      {deletePostMutation.isError && <div>Error deleting post</div>}
      {deletePostMutation.isSuccess && <div>Post deleted successfully</div>}
      {updatePostMutation.isPending && <div>Updating...</div>}
      {updatePostMutation.isError && <div>Error updating post</div>}
      {updatePostMutation.isSuccess && <div>Post updated successfully</div>}
      <p>{post.body}</p>
      <h4>Comments</h4>
      {data.map((comment) => (
        <li key={comment.id}>
          {comment.email}: {comment.body}
        </li>
      ))}
    </>
  );
}
