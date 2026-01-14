import { useState, useEffect } from 'react';
import { getFeed } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await getFeed(pageNum);
      if (pageNum === 1) {
        setPosts(data.data);
      } else {
        setPosts(prev => [...prev, ...data.data]);
      }
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="home">
      <Navbar />
      <main className="main-content">
        <div className="feed-container">
          <CreatePost onPostCreated={handleNewPost} />
          
          {loading && posts.length === 0 ? (
            <div className="loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">No posts yet. Be the first to share!</div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={handlePostUpdate}
                  onDelete={handlePostDelete}
                />
              ))}
              
              {hasMore && (
                <button 
                  className="load-more-btn" 
                  onClick={() => loadPosts(page + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
