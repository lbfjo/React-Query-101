import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root.jsx';
import { Posts } from '../Posts';
import ErrorBoundary from '../components/ErrorBoundary';

// Posts page component with error boundary
function PostsPage() {
  return (
    <ErrorBoundary fallbackMessage="Error loading posts. Please try again.">
      <div className="app-container">
        <Posts />
      </div>
    </ErrorBoundary>
  );
}

// Create and export the index route
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PostsPage,
}); 