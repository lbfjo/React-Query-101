import { fetchComments } from "./api";
import "./PostDetail.css";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function PostDetail({ post, deletePostMutation, updatePostMutation }) {
  const [updatedPostTitle, setUpdatedPostTitle] = useState(post.title);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchComments(post.id),
  });

  if (isLoading) {
    return (
      <div className="post-detail__loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading comments...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="post-detail__error">
        <div className="error-icon">⚠️</div>
        <p className="error-text">Error loading comments</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="post-detail__error">
        <div className="error-icon">📭</div>
        <p className="error-text">No comments found</p>
      </div>
    );
  }

  const handleDelete = () => {
    deletePostMutation.mutate(post.id);
  };

  const handleUpdate = () => {
    updatePostMutation.mutate({ ...post, title: updatedPostTitle });
  };

  return (
    <div className="post-detail">
      <div className="post-detail__header">
        <h3 className="post-detail__title">{post.title}</h3>
        <div className="post-detail__actions">
          <button 
            className="btn btn--danger btn--small"
            onClick={handleDelete}
            disabled={deletePostMutation.isPending}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="post-detail__content">
        <p className="post-detail__body">{post.body}</p>
      </div>

      <div className="post-detail__edit">
        <input
          type="text"
          value={updatedPostTitle}
          onChange={(e) => setUpdatedPostTitle(e.target.value)}
          className="post-detail__edit-input"
          placeholder="Enter new title..."
        />
        <button 
          className="btn btn--primary btn--small"
          onClick={handleUpdate}
          disabled={updatePostMutation.isPending}
        >
          ✏️ Update
        </button>
      </div>

      <div className="post-detail__status">
        {deletePostMutation.isPending && (
          <div className="status-message status-message--loading">
            <span className="status-message__icon">⏳</span>
            <span>Deleting post...</span>
          </div>
        )}
        {deletePostMutation.isError && (
          <div className="status-message status-message--error">
            <span className="status-message__icon">❌</span>
            <span>Error deleting post</span>
          </div>
        )}
        {deletePostMutation.isSuccess && (
          <div className="status-message status-message--success">
            <span className="status-message__icon">✅</span>
            <span>Post deleted successfully</span>
          </div>
        )}
        {updatePostMutation.isPending && (
          <div className="status-message status-message--loading">
            <span className="status-message__icon">⏳</span>
            <span>Updating post...</span>
          </div>
        )}
        {updatePostMutation.isError && (
          <div className="status-message status-message--error">
            <span className="status-message__icon">❌</span>
            <span>Error updating post</span>
          </div>
        )}
        {updatePostMutation.isSuccess && (
          <div className="status-message status-message--success">
            <span className="status-message__icon">✅</span>
            <span>Post updated successfully</span>
          </div>
        )}
      </div>

      <div className="post-detail__comments">
        <h4 className="post-detail__comments-title">
          Comments
          <span className="post-detail__comments-count">{data.length}</span>
        </h4>
        <div className="post-detail__comments-list">
          {data.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-card__header">
                <span className="comment-card__author">{comment.email}</span>
                <span className="comment-card__separator">•</span>
                <span>Comment #{comment.id}</span>
              </div>
              <p className="comment-card__body">{comment.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
