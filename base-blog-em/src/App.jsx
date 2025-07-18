import React from 'react';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.js';

// Create the router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent', // Preload routes on hover/focus
  defaultPreloadStaleTime: 0, // Always preload fresh data
});

// Router instance created with route tree configuration

// Main App component
function App() {
  return <RouterProvider router={router} />;
}

export default App;
