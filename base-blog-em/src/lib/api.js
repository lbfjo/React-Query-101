import { apiClient } from './api-client.js';

// Posts API
export const postsApi = {
  // Get paginated posts
  async getPosts(page = 1, limit = 10) {
    return apiClient.get('/posts', { 
      _page: page, 
      _limit: limit 
    });
  },

  // Get single post by ID
  async getPost(postId) {
    return apiClient.get(`/posts/${postId}`);
  },

  // Create a new post
  async createPost(postData) {
    return apiClient.post('/posts', postData);
  },

  // Update an existing post
  async updatePost(postId, postData) {
    return apiClient.patch(`/posts/${postId}`, postData);
  },

  // Delete a post
  async deletePost(postId) {
    return apiClient.delete(`/posts/${postId}`);
  },

  // Get comments for a post
  async getPostComments(postId) {
    return apiClient.get(`/posts/${postId}/comments`);
  },
};

// Comments API
export const commentsApi = {
  // Get comments by post ID
  async getCommentsByPost(postId) {
    return apiClient.get('/comments', { postId });
  },

  // Get single comment
  async getComment(commentId) {
    return apiClient.get(`/comments/${commentId}`);
  },

  // Create a new comment
  async createComment(commentData) {
    return apiClient.post('/comments', commentData);
  },

  // Update comment
  async updateComment(commentId, commentData) {
    return apiClient.patch(`/comments/${commentId}`, commentData);
  },

  // Delete comment
  async deleteComment(commentId) {
    return apiClient.delete(`/comments/${commentId}`);
  },
};

// Users API (for future use)
export const usersApi = {
  // Get all users
  async getUsers() {
    return apiClient.get('/users');
  },

  // Get single user
  async getUser(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  // Get user posts
  async getUserPosts(userId) {
    return apiClient.get(`/users/${userId}/posts`);
  },
};

// Backward compatibility exports (for existing code)
export const fetchPosts = (pageNum = 1) => postsApi.getPosts(pageNum);
export const fetchPost = (postId) => postsApi.getPost(postId);
export const fetchComments = (postId) => commentsApi.getCommentsByPost(postId);
export const updatePost = (post) => postsApi.updatePost(post.id, post);
export const deletePost = (postId) => postsApi.deletePost(postId);

// Export all APIs as a single object
export const api = {
  posts: postsApi,
  comments: commentsApi,
  users: usersApi,
}; 