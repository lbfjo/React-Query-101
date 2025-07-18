import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, deletePost, updatePost } from "./api";
import "./PostDetail.css";
import { useState, useEffect } from "react";

// Function to fetch a single post by ID
const fetchPost = async (postId) => {
  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`);
  return response.json();
};

export function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updatedPostTitle, setUpdatedPostTitle] = useState("");

  // Fetch post data
  const { data: post, isLoading: postLoading, isError: postError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId,
  });

  // Fetch comments
  const { data: comments, isLoading: commentsLoading, isError: commentsError } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    enabled: !!postId,
  });

  // Mutations
  const deletePostMutation = useMutation({
    mutationFn: (postId) => deletePost(postId),
    onSuccess: () => {
      // Navigate back to posts after successful deletion
      navigate("/");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: (postData) => updatePost(postData),
    onSuccess: () => {
      // Invalidate and refetch post data
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });

  // Set initial title when post loads
  useEffect(() => {
    if (post && !updatedPostTitle) {
      setUpdatedPostTitle(post.title);
    }
  }, [post, updatedPostTitle]);

  const handleDelete = () => {
    if (post) {
      deletePostMutation.mutate(post.id);
    }
  };

  const handleUpdate = () => {
    if (post) {
      updatePostMutation.mutate({ ...post, title: updatedPostTitle });
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  if (postLoading) {
    return (
      <div className="post-detail__loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading post...</p>
      </div>
    );
  }

  if (postError || !post) {
    return (
      <div className="post-detail__error">
        <div className="error-icon">⚠️</div>
        <p className="error-text">Error loading post</p>
        <button className="btn btn--secondary" onClick={handleBackClick}>
          ← Back to Posts
        </button>
      </div>
    );
  }

  // Initialize title if not set
  if (!updatedPostTitle) {
    setUpdatedPostTitle(post.title);
  }

  return (
    <div className="post-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="post-detail-page__breadcrumb">
        <button className="breadcrumb-button" onClick={handleBackClick}>
          ← Back to Posts
        </button>
        <span className="breadcrumb-separator">•</span>
        <span className="breadcrumb-current">Post #{post.id}</span>
      </div>

      <div className="post-detail">
        <div className="post-detail__header">
          <h1 className="post-detail__title">{post.title}</h1>
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

        {/* Comments Section */}
        <div className="post-detail__comments">
          <h4 className="post-detail__comments-title">
            Comments
            {comments && <span className="post-detail__comments-count">{comments.length}</span>}
          </h4>
          
          {commentsLoading && (
            <div className="post-detail__loading">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading comments...</p>
            </div>
          )}
          
          {commentsError && (
            <div className="post-detail__error">
              <div className="error-icon">⚠️</div>
              <p className="error-text">Error loading comments</p>
            </div>
          )}
          
          {comments && (
            <div className="post-detail__comments-list">
              {comments.map((comment) => (
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
          )}
        </div>
      </div>
    </div>
  );
} 