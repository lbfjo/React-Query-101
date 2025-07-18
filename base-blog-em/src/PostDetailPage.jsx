import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { usePost, usePostMutations } from "./hooks/usePosts.js";
import { useComments } from "./hooks/useComments.js";
import "./PostDetail.css";

// Memoized Breadcrumb component
const Breadcrumb = React.memo(({ postId, onBackClick }) => (
  <div className="post-detail-page__breadcrumb">
    <button className="breadcrumb-button" onClick={onBackClick}>
      ← Back to Posts
    </button>
    <span className="breadcrumb-separator">•</span>
    <span className="breadcrumb-current">Post #{postId}</span>
  </div>
));

Breadcrumb.displayName = 'Breadcrumb';

// Memoized Comment component
const Comment = React.memo(({ comment }) => (
  <div className="comment-card">
    <div className="comment-card__header">
      <span className="comment-card__author">{comment.email}</span>
      <span className="comment-card__separator">•</span>
      <span>Comment #{comment.id}</span>
    </div>
    <p className="comment-card__body">{comment.body}</p>
  </div>
));

Comment.displayName = 'Comment';

// Memoized Comments List component
const CommentsList = React.memo(({ postId }) => {
  const { data: comments, isLoading, isError } = useComments(postId);

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

  return (
    <div className="post-detail__comments">
      <h4 className="post-detail__comments-title">
        Comments
        {comments && <span className="post-detail__comments-count">{comments.length}</span>}
      </h4>
      <div className="post-detail__comments-list">
        {comments?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
});

CommentsList.displayName = 'CommentsList';

// Memoized Status Messages component
const StatusMessages = React.memo(({ updatePost, deletePost }) => {
  if (!updatePost.isPending && !updatePost.isError && !updatePost.isSuccess &&
      !deletePost.isPending && !deletePost.isError && !deletePost.isSuccess) {
    return null;
  }

  return (
    <div className="post-detail__status">
      {deletePost.isPending && (
        <div className="status-message status-message--loading">
          <span className="status-message__icon">⏳</span>
          <span>Deleting post...</span>
        </div>
      )}
      {deletePost.isError && (
        <div className="status-message status-message--error">
          <span className="status-message__icon">❌</span>
          <span>Error deleting post</span>
        </div>
      )}
      {deletePost.isSuccess && (
        <div className="status-message status-message--success">
          <span className="status-message__icon">✅</span>
          <span>Post deleted successfully</span>
        </div>
      )}
      {updatePost.isPending && (
        <div className="status-message status-message--loading">
          <span className="status-message__icon">⏳</span>
          <span>Updating post...</span>
        </div>
      )}
      {updatePost.isError && (
        <div className="status-message status-message--error">
          <span className="status-message__icon">❌</span>
          <span>Error updating post</span>
        </div>
      )}
      {updatePost.isSuccess && (
        <div className="status-message status-message--success">
          <span className="status-message__icon">✅</span>
          <span>Post updated successfully</span>
        </div>
      )}
    </div>
  );
});

StatusMessages.displayName = 'StatusMessages';

// Main PostDetailPage component
export function PostDetailPage() {
  const { postId } = useParams({ from: '/post/$postId' });
  const navigate = useNavigate();
  const [updatedPostTitle, setUpdatedPostTitle] = useState("");

  // Fetch post data
  const { data: post, isLoading: postLoading, isError: postError } = usePost(postId);

  // Mutations
  const { updatePost, deletePost } = usePostMutations({
    delete: {
      onSuccess: () => {
        // Navigate back to posts after successful deletion
        navigate({ to: '/' });
      },
    },
  });

  // Set initial title when post loads
  useEffect(() => {
    if (post && !updatedPostTitle) {
      setUpdatedPostTitle(post.title);
    }
  }, [post, updatedPostTitle]);

  // Memoized handlers
  const handleBackClick = useCallback(() => {
    navigate({ to: '/' });
  }, [navigate]);

  const handleDelete = useCallback(() => {
    if (post) {
      deletePost.mutate(post.id);
    }
  }, [post, deletePost]);

  const handleUpdate = useCallback(() => {
    if (post && updatedPostTitle.trim()) {
      updatePost.mutate({
        postId: post.id,
        postData: { ...post, title: updatedPostTitle.trim() }
      });
    }
  }, [post, updatedPostTitle, updatePost]);

  const handleTitleChange = useCallback((e) => {
    setUpdatedPostTitle(e.target.value);
  }, []);

  // Loading state
  if (postLoading) {
    return (
      <div className="post-detail__loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading post...</p>
      </div>
    );
  }

  // Error state
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

  // Main content
  return (
    <div className="post-detail-page">
      <Breadcrumb postId={post.id} onBackClick={handleBackClick} />

      <div className="post-detail">
        <div className="post-detail__header">
          <h1 className="post-detail__title">{post.title}</h1>
          <div className="post-detail__actions">
            <button 
              className="btn btn--danger btn--small"
              onClick={handleDelete}
              disabled={deletePost.isPending}
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
            onChange={handleTitleChange}
            className="post-detail__edit-input"
            placeholder="Enter new title..."
          />
          <button 
            className="btn btn--primary btn--small"
            onClick={handleUpdate}
            disabled={updatePost.isPending || !updatedPostTitle.trim()}
          >
            ✏️ Update
          </button>
        </div>

        <StatusMessages updatePost={updatePost} deletePost={deletePost} />

        <CommentsList postId={postId} />
      </div>
    </div>
  );
}

// Export memoized version for better performance
export default React.memo(PostDetailPage); 