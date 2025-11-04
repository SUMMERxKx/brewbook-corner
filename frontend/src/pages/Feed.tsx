import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Post } from '@/types';
import { postsAPI } from '@/api/posts';
import { useFeed } from '@/context/FeedContext';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { FeedTabs } from '@/components/FeedTabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { feedType } = useFeed();
  const location = useLocation();

  useEffect(() => {
    loadPosts();
  }, [feedType, location.key, location.state]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      let data: Post[];
      
      switch (feedType) {
        case 'discover':
          data = await postsAPI.getDiscoverFeed();
          break;
        case 'friends':
          data = await postsAPI.getFriendsFeed();
          break;
        case 'side':
          data = await postsAPI.getSideFeed();
          break;
        default:
          data = await postsAPI.getDiscoverFeed();
      }
      
      console.log(`Loaded ${feedType} feed:`, data.length);
      if (data.length > 0) {
        console.log('First post imageUrl:', data[0].imageUrl);
      }
      setPosts(data);
    } catch (error) {
      toast.error(`Failed to load ${feedType} feed`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await postsAPI.likePost(postId);
      toast.success('Post liked!');
      // Refresh posts to get updated like count
      await loadPosts();
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">
              {feedType === 'discover' ? 'Discover' : feedType === 'friends' ? 'Friends' : 'My Side'} Feed
            </h1>
            <p className="text-muted-foreground">
              {feedType === 'discover' && 'Explore amazing recipes from the community'}
              {feedType === 'friends' && 'See what your friends are sharing'}
              {feedType === 'side' && 'Discover recipes from your side'}
            </p>
          </div>
          <FeedTabs />
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <LoadingSpinner />
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg">
                {feedType === 'friends' 
                  ? "No posts from friends yet. Make some friends first!" 
                  : "No posts found. Be the first to share!"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard post={post} onLike={handleLike} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
