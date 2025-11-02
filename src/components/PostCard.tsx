import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Coffee, Leaf } from 'lucide-react';
import { Post } from '@/types';
import { Card } from './ui/card';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike }) => {
  const SideIcon = post.side === 'coffee' ? Coffee : Leaf;
  const sideColor = post.side === 'coffee' ? 'text-coffee' : 'text-tea';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-hover transition-smooth">
        <Link to={`/post/${post._id}`}>
          <div className="aspect-square overflow-hidden bg-muted">
            <motion.img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </Link>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            {post.user.avatar ? (
              <img
                src={post.user.avatar}
                alt={post.user.username}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <SideIcon className={`w-4 h-4 ${sideColor}`} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{post.user.username}</p>
              <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
            </div>
            <SideIcon className={`w-5 h-5 ${sideColor}`} />
          </div>

          <Link to={`/post/${post._id}`}>
            <h3 className="font-serif font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-1">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {post.description}
            </p>
          </Link>

          <div className="flex items-center gap-4 pt-3 border-t">
            <motion.button
              onClick={() => onLike?.(post._id)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-4 h-4" />
              <span>{post.likes}</span>
            </motion.button>
            <Link
              to={`/post/${post._id}`}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments.length}</span>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
