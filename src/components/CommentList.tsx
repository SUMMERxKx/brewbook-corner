import { Comment } from '@/types';
import { Coffee, Leaf } from 'lucide-react';

interface CommentListProps {
  comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const SideIcon = comment.user.side === 'coffee' ? Coffee : Leaf;
        const sideColor = comment.user.side === 'coffee' ? 'text-coffee' : 'text-tea';
        
        return (
          <div key={comment._id} className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <SideIcon className={`w-4 h-4 ${sideColor}`} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium mb-1">{comment.user.username}</p>
                <p className="text-sm text-foreground">{comment.text}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
