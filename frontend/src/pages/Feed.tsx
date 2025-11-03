import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Side, Post } from '@/types';
import { postsAPI } from '@/api/posts';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { SideToggle } from '@/components/SideToggle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Side | 'all'>('all');
  const location = useLocation();

  useEffect(() => {
    // Always reload when component mounts or location changes
    loadPosts();
  }, [filter, location.key, location.state]); // Reload when filter changes or when navigating to this page

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Add cache-busting timestamp to ensure fresh data
      const data = await postsAPI.getPosts(filter === 'all' ? undefined : filter);
      console.log('Loaded posts:', data.length);
      // Log first post's imageUrl to debug
      if (data.length > 0) {
        console.log('First post imageUrl:', data[0].imageUrl);
      }
      setPosts(data);
    } catch (error) {
      toast.error('Failed to load posts');
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
            <h1 className="text-3xl font-serif font-bold mb-2">Discover Recipes</h1>
            <p className="text-muted-foreground">
              Explore amazing {filter === 'all' ? 'coffee and tea' : filter} recipes from the community
            </p>
          </div>
          <SideToggle selected={filter} onChange={setFilter} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No posts found. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onLike={handleLike} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
