import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../__root.jsx';
import { PostDetailPage } from '../../PostDetailPage';
import ErrorBoundary from '../../components/ErrorBoundary';
import { postsApi, commentsApi } from '../../lib/api.js';

// Post detail page component with error boundary
function PostDetailPageWithErrorBoundary() {
  return (
    <ErrorBoundary fallbackMessage="Error loading post details. Please try again.">
      <PostDetailPage />
    </ErrorBoundary>
  );
}

// Create and export the post detail route
export const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post/$postId',
  component: PostDetailPageWithErrorBoundary,
  // Parse and validate the postId parameter
  parseParams: (params) => ({
    postId: params.postId,
  }),
  // Validate that postId is a valid number
  validateSearch: (search) => search,
  // Preload data for better UX
  loader: async ({ params, context }) => {
    const postId = params.postId;
    
    // Validate that postId is a number
    if (!/^\d+$/.test(postId)) {
      throw new Error('Invalid post ID');
    }

    // Preload both post and comments data
    try {
      const [post, comments] = await Promise.all([
        postsApi.getPost(postId),
        commentsApi.getCommentsByPost(postId),
      ]);

      return { post, comments };
    } catch (error) {
      console.error('Error preloading post data:', error);
      // Don't throw here - let the components handle the error
      return { post: null, comments: null };
    }
  },
  // Handle errors during route loading
  errorComponent: ({ error }) => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h2 className="error-text">Error Loading Post</h2>
      <p>{error.message || 'An unexpected error occurred while loading the post.'}</p>
    </div>
  ),
  // Pending component while loading
  pendingComponent: () => (
    <div className="post-detail__loading">
      <div className="loading-spinner"></div>
      <p className="loading-text">Loading post...</p>
    </div>
  ),
}); 