import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '../lib/api.js';

// Query keys for consistent cache management
export const COMMENTS_QUERY_KEYS = {
  all: ['comments'],
  lists: () => [...COMMENTS_QUERY_KEYS.all, 'list'],
  byPost: (postId) => [...COMMENTS_QUERY_KEYS.lists(), 'post', postId],
  details: () => [...COMMENTS_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...COMMENTS_QUERY_KEYS.details(), id],
};

// Custom hook for fetching comments by post ID
export function useComments(postId, options = {}) {
  return useQuery({
    queryKey: COMMENTS_QUERY_KEYS.byPost(postId),
    queryFn: () => commentsApi.getCommentsByPost(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Custom hook for fetching a single comment
export function useComment(commentId, options = {}) {
  return useQuery({
    queryKey: COMMENTS_QUERY_KEYS.detail(commentId),
    queryFn: () => commentsApi.getComment(commentId),
    enabled: !!commentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Custom hook for comment mutations
export function useCommentMutations(options = {}) {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => commentsApi.createComment(commentData),
    onSuccess: (data, variables) => {
      // Add comment to the post's comments list
      queryClient.setQueryData(
        COMMENTS_QUERY_KEYS.byPost(variables.postId),
        (oldComments) => [...(oldComments || []), data]
      );
    },
    ...options.create,
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, commentData }) => 
      commentsApi.updateComment(commentId, commentData),
    onSuccess: (data, variables) => {
      // Update comment in cache
      queryClient.setQueryData(
        COMMENTS_QUERY_KEYS.detail(variables.commentId),
        data
      );
      
      // Update comment in post's comments list
      queryClient.setQueryData(
        COMMENTS_QUERY_KEYS.byPost(data.postId),
        (oldComments) => 
          oldComments?.map(comment => 
            comment.id === variables.commentId ? data : comment
          ) || []
      );
    },
    ...options.update,
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => commentsApi.deleteComment(commentId),
    onSuccess: (data, commentId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: COMMENTS_QUERY_KEYS.detail(commentId),
      });
      
      // Remove from all post comments lists
      queryClient.invalidateQueries({
        queryKey: COMMENTS_QUERY_KEYS.lists(),
      });
    },
    ...options.delete,
  });

  return {
    createComment: createCommentMutation,
    updateComment: updateCommentMutation,
    deleteComment: deleteCommentMutation,
  };
} 