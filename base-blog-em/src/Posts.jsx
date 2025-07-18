import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { fetchPosts } from "./api";

const maxPostPage = 10;

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts", currentPage],
    queryFn: () => fetchPosts(currentPage),
    staleTime: 2000,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentPage < maxPostPage) {
      const nextPage = currentPage + 1;
      queryClient.prefetchQuery({
        queryKey: ["posts", nextPage],
        queryFn: () => fetchPosts(nextPage),
      });
    }
  }, [currentPage, queryClient]);

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading posts...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-text">Error fetching posts</p>
      </div>
    );
  }

  return (
    <div className="posts-section">
      <div className="posts-list">
        {data.map((post) => (
          <div
            key={post.id}
            className="post-card"
            onClick={() => handlePostClick(post.id)}
          >
            <h3 className="post-card__title">{post.title}</h3>
            <div className="post-card__meta">
              <span className="post-card__badge">Post #{post.id}</span>
              <span>Click to view details</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          className="pagination__button"
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(previousValue => previousValue - 1)}
        >
          ← Previous
        </button>
        <div className="pagination__info">
          Page {currentPage} of {maxPostPage}
        </div>
        <button
          className="pagination__button"
          disabled={currentPage >= maxPostPage}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
