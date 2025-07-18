import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePosts } from "./hooks/usePosts.js";

const maxPostPage = 10;

// Memoized PostCard component for better performance
const PostCard = React.memo(({ post, onPostClick }) => {
  const handleClick = useCallback(() => {
    onPostClick(post.id);
  }, [post.id, onPostClick]);

  return (
    <div className="post-card" onClick={handleClick}>
      <h3 className="post-card__title">{post.title}</h3>
      <div className="post-card__meta">
        <span className="post-card__badge">Post #{post.id}</span>
        <span>Click to view details</span>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';

// Memoized Pagination component
const Pagination = React.memo(({ 
  currentPage, 
  maxPage, 
  onPreviousPage, 
  onNextPage 
}) => {
  return (
    <div className="pagination">
      <button
        className="pagination__button"
        disabled={currentPage <= 1}
        onClick={onPreviousPage}
      >
        ← Previous
      </button>
      <div className="pagination__info">
        Page {currentPage} of {maxPage}
      </div>
      <button
        className="pagination__button"
        disabled={currentPage >= maxPage}
        onClick={onNextPage}
      >
        Next →
      </button>
    </div>
  );
});

Pagination.displayName = 'Pagination';

// Memoized LoadingState component
const LoadingState = React.memo(() => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p className="loading-text">Loading posts...</p>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Memoized ErrorState component
const ErrorState = React.memo(({ error, onRetry }) => (
  <div className="error-container">
    <div className="error-icon">⚠️</div>
    <p className="error-text">
      {error?.message || 'Error fetching posts'}
    </p>
    {onRetry && (
      <button className="btn btn--primary" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
));

ErrorState.displayName = 'ErrorState';

// Main Posts component
export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  const { 
    data: posts, 
    isLoading, 
    isError, 
    error,
    refetch,
    prefetchNextPage 
  } = usePosts(currentPage);

  // Prefetch next page when current page changes
  useEffect(() => {
    if (currentPage < maxPostPage) {
      prefetchNextPage();
    }
  }, [currentPage, prefetchNextPage]);

  // Memoized handlers
  const handlePostClick = useCallback((postId) => {
    navigate({ to: '/post/$postId', params: { postId: postId.toString() } });
  }, [navigate]);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prevPage => Math.max(1, prevPage - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prevPage => Math.min(maxPostPage, prevPage + 1));
  }, []);

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Main content
  return (
    <div className="posts-section">
      <div className="posts-list">
        {posts?.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onPostClick={handlePostClick}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        maxPage={maxPostPage}
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
      />
    </div>
  );
}

// Export memoized version for better performance
export default React.memo(Posts);
