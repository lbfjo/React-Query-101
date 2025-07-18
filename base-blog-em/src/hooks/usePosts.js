import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../lib/api.js';

// Query keys for consistent cache management
export const POSTS_QUERY_KEYS = {
  all: ['posts'],
  lists: () => [...POSTS_QUERY_KEYS.all, 'list'],
  list: (page) => [...POSTS_QUERY_KEYS.lists(), page],
  details: () => [...POSTS_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...POSTS_QUERY_KEYS.details(), id],
};

// Custom hook for fetching paginated posts
export function usePosts(page = 1, options = {}) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: POSTS_QUERY_KEYS.list(page),
    queryFn: () => postsApi.getPosts(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });

  // Prefetch next page for better UX
  const prefetchNextPage = () => {
    const nextPage = page + 1;
    if (nextPage <= 10) { // maxPostPage
      queryClient.prefetchQuery({
        queryKey: POSTS_QUERY_KEYS.list(nextPage),
        queryFn: () => postsApi.getPosts(nextPage),
        staleTime: 5 * 60 * 1000,
      });
    }
  };

  return {
    ...query,
    prefetchNextPage,
  };
}

// Custom hook for fetching a single post
export function usePost(postId, options = {}) {
  return useQuery({
    queryKey: POSTS_QUERY_KEYS.detail(postId),
    queryFn: () => postsApi.getPost(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Custom hook for post mutations
export function usePostMutations(options = {}) {
  const queryClient = useQueryClient();

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, postData }) => postsApi.updatePost(postId, postData),
    onSuccess: (data, variables) => {
      // Update the specific post in cache
      queryClient.setQueryData(
        POSTS_QUERY_KEYS.detail(variables.postId),
        data
      );
      
      // Invalidate posts list to reflect changes
      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEYS.lists(),
      });
    },
    ...options.update,
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => postsApi.deletePost(postId),
    onSuccess: (data, postId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: POSTS_QUERY_KEYS.detail(postId),
      });
      
      // Invalidate posts list
      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEYS.lists(),
      });
    },
    ...options.delete,
  });

  const createPostMutation = useMutation({
    mutationFn: (postData) => postsApi.createPost(postData),
    onSuccess: () => {
      // Invalidate posts list to show new post
      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEYS.lists(),
      });
    },
    ...options.create,
  });

  return {
    updatePost: updatePostMutation,
    deletePost: deletePostMutation,
    createPost: createPostMutation,
  };
}

// Custom hook for optimistic updates
export function useOptimisticPostUpdate() {
  const queryClient = useQueryClient();

  return {
    updatePostOptimistically: (postId, updateData) => {
      queryClient.setQueryData(
        POSTS_QUERY_KEYS.detail(postId),
        (oldData) => ({
          ...oldData,
          ...updateData,
        })
      );
    },
    
    rollbackOptimisticUpdate: (postId, originalData) => {
      queryClient.setQueryData(
        POSTS_QUERY_KEYS.detail(postId),
        originalData
      );
    },
  };
} 