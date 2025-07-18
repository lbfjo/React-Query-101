import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Posts } from "./Posts";
import { PostDetailPage } from "./PostDetailPage";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="app">
          <header className="app-header">
            <div className="app-header__container">
              <h1 className="app-title">Blog 'em Ipsum</h1>
            </div>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={
                <div className="app-container">
                  <Posts />
                </div>
              } />
              <Route path="/post/:postId" element={<PostDetailPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
