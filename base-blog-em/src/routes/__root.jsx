import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import ErrorBoundary from '../components/ErrorBoundary';
import { APIError } from '../lib/api-client.js';
import '../App.css';

// Create QueryClient with better configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Root layout component
function RootLayout() {
  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the blog application. Please try refreshing the page.">
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <header className="app-header">
            <div className="app-header__container">
              <h1 className="app-title">Blog 'em Ipsum</h1>
            </div>
          </header>
          <main className="app-main">
            <Outlet />
          </main>
        </div>
        
        {/* Development tools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <ReactQueryDevtools initialIsOpen={false} />
            <TanStackRouterDevtools />
          </>
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Create and export the root route
export const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <div className="error-container">
      <div className="error-icon">🔍</div>
      <h2 className="error-text">Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  ),
}); 