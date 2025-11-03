import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Coffee, Leaf } from 'lucide-react';
import { Post } from '@/types';
import { postsAPI } from '@/api/posts';
import { Navbar } from '@/components/Navbar';
import { CommentList } from '@/components/CommentList';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    try {
      const data = await postsAPI.getPost(postId);
      setPost(data);
    } catch (error) {
      toast.error('Failed to load post');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    try {
      await postsAPI.likePost(post._id);
      toast.success('Post liked!');
      // Reload post to get updated like count
      await loadPost(post._id);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !comment.trim()) return;
    
    setSubmitting(true);
    try {
      await postsAPI.addComment(post._id, { text: comment });
      toast.success('Comment added!');
      setComment('');
      await loadPost(post._id);
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">Post not found</p>
          <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  const SideIcon = post.side === 'coffee' ? Coffee : Leaf;
  const sideColor = post.side === 'coffee' ? 'text-coffee' : 'text-tea';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/feed')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Image Section */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full aspect-square object-cover"
                  onError={(e) => {
                    // Fallback image if URL fails to load
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80';
                  }}
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center bg-muted">
                  <SideIcon className={`w-24 h-24 ${sideColor} opacity-50`} />
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <motion.button
                  onClick={handleLike}
                  className="flex items-center gap-2 text-destructive hover:text-destructive/80 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{post.likes} likes</span>
                </motion.button>
                
                <div className="flex items-center gap-2">
                  <SideIcon className={`w-5 h-5 ${sideColor}`} />
                  <span className="text-sm text-muted-foreground capitalize">
                    {post.side}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {post.user.avatar ? (
                  <img
                    src={post.user.avatar}
                    alt={post.user.username}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <SideIcon className={`w-6 h-6 ${sideColor}`} />
                  </div>
                )}
                <div>
                  <p className="font-medium">{post.user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <h1 className="text-3xl font-serif font-bold mb-4">{post.title}</h1>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-serif font-semibold mb-4">
                Comments ({post.comments.length})
              </h2>

              <form onSubmit={handleComment} className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="mb-3"
                />
                <Button type="submit" disabled={submitting || !comment.trim()}>
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>

              <CommentList comments={post.comments} />
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
