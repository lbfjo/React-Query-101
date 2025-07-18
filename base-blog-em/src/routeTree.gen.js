// Manual route tree configuration for TanStack Router
// This replaces the auto-generated file to avoid TypeScript syntax issues

import { rootRoute } from './routes/__root.jsx'
import { indexRoute } from './routes/index.jsx'
import { postDetailRoute } from './routes/post/$postId.jsx'

// Create the route tree manually
export const routeTree = rootRoute.addChildren([
  indexRoute,
  postDetailRoute,
])

export default routeTree
