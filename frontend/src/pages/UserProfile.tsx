import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Coffee, Leaf, Edit2, Save, X, Users, Grid3x3, UserPlus, AlertCircle, MessageCircle, UserMinus, CheckCircle2, XCircle } from 'lucide-react';
import { usersAPI } from '@/api/users';
import { chatAPI } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile as UserProfileType, Post, Side } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/Navbar';
import { PostCard } from '@/components/PostCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [switchingSide, setSwitchingSide] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'friends'>('posts');
  const [friends, setFriends] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [removingFriend, setRemovingFriend] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [acceptingRequest, setAcceptingRequest] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile();
    }
  }, [username]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getUserProfile(username!);
      setProfile(data.profile);
      setPosts(data.posts);
      console.log('Profile loaded - isFriend status:', data.profile.isFriend);
      setBioText(data.profile.bio || '');
    } catch (error) {
      toast.error('Failed to load profile');
      console.error(error);
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!profile || !profile.isOwnProfile) return;
    
    setLoadingFriends(true);
    try {
      const data = await usersAPI.getFriends(profile._id);
      setFriends(data.friends);
    } catch (error) {
      toast.error('Failed to load friends');
      console.error(error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSaveBio = async () => {
    if (!profile) return;
    
    setSavingBio(true);
    try {
      await usersAPI.updateBio(profile._id, bioText);
      toast.success('Bio updated successfully');
      setEditingBio(false);
      loadProfile();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update bio';
      toast.error(errorMessage);
    } finally {
      setSavingBio(false);
    }
  };

  const handleSwitchSide = async () => {
    if (!profile) return;
    
    setSwitchingSide(true);
    try {
      const response = await usersAPI.switchSide(profile._id);
      toast.success(response.message);
      setShowSwitchDialog(false);
      loadProfile();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to switch side';
      toast.error(errorMessage);
    } finally {
      setSwitchingSide(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profile) return;
    
    setSendingRequest(true);
    try {
      await usersAPI.sendFriendRequest(profile._id);
      toast.success('Friend request sent successfully');
      loadProfile(); // Refresh to update relation status
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send friend request';
      toast.error(errorMessage);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!profile) return;
    
    setAcceptingRequest(true);
    try {
      await usersAPI.acceptFriendRequest(profile._id);
      toast.success('Friend request accepted');
      loadProfile(); // Refresh to update relation status
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to accept friend request';
      toast.error(errorMessage);
    } finally {
      setAcceptingRequest(false);
    }
  };

  const handleRejectFriendRequest = async () => {
    if (!profile) return;
    
    setRejectingRequest(true);
    try {
      await usersAPI.rejectFriendRequest(profile._id);
      toast.success('Friend request rejected');
      loadProfile(); // Refresh to update relation status
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to reject friend request';
      toast.error(errorMessage);
    } finally {
      setRejectingRequest(false);
    }
  };

  const handleAddFriend = async () => {
    if (!profile) return;
    
    setAddingFriend(true);
    try {
      await usersAPI.addFriend(profile._id);
      toast.success('Friend added successfully');
      loadProfile(); // Refresh to update friends count and status
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add friend';
      toast.error(errorMessage);
    } finally {
      setAddingFriend(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!profile) return;
    
    setRemovingFriend(true);
    try {
      await usersAPI.removeFriend(profile._id);
      toast.success('Friend removed successfully');
      loadProfile(); // Refresh to update friends count and status
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to remove friend';
      toast.error(errorMessage);
    } finally {
      setRemovingFriend(false);
    }
  };

  const handleStartChat = async () => {
    if (!profile || !currentUser) return;
    
    setStartingChat(true);
    try {
      const response = await chatAPI.startChat(profile._id);
      toast.success('Chat started');
      navigate(`/chat/${response.chat._id}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to start chat';
      toast.error(errorMessage);
    } finally {
      setStartingChat(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'friends' && profile?.isOwnProfile) {
      loadFriends();
    }
  }, [activeTab, profile]);

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">User not found</p>
          <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  const SideIcon = profile.side === 'coffee' ? Coffee : Leaf;
  const sideColor = profile.side === 'coffee' ? 'text-coffee' : 'text-tea';
  const currentBadge = profile.badges && profile.badges.length > 0 ? profile.badges[0] : 'Novice';
  
  const badgeIcons: Record<string, string> = {
    'Novice': '🌱',
    'Brewer': '☕',
    'Master Brewer': '⭐',
    'Caffeine Legend': '👑'
  };

  const badgeColors: Record<string, string> = {
    'Novice': 'bg-gray-100 text-gray-800',
    'Brewer': 'bg-amber-100 text-amber-800',
    'Master Brewer': 'bg-purple-100 text-purple-800',
    'Caffeine Legend': 'bg-yellow-100 text-yellow-800'
  };

  const getNextBadgeThreshold = (points: number) => {
    if (points < 50) return { threshold: 50, badge: 'Brewer', remaining: 50 - points };
    if (points < 200) return { threshold: 200, badge: 'Master Brewer', remaining: 200 - points };
    if (points < 500) return { threshold: 500, badge: 'Caffeine Legend', remaining: 500 - points };
    return null;
  };

  const nextBadge = getNextBadgeThreshold(profile.points);
  const progressPercentage = nextBadge 
    ? ((profile.points / nextBadge.threshold) * 100)
    : 100;


  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4">
                    <SideIcon className={`w-16 h-16 ${sideColor}`} />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-serif font-bold mb-2">{profile.username}</h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {profile.isOwnProfile && profile.email && (
                          <span>{profile.email}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <SideIcon className={`w-4 h-4 ${sideColor}`} />
                          <span className="capitalize">{profile.side}</span>
                        </span>
                      </div>
                    </div>

                    {/* Friend Request / Unfriend / Start Chat Buttons (if not own profile) */}
                    {!profile.isOwnProfile && currentUser && (
                      <div className="flex gap-2">
                        {profile.relation === 'none' && (
                          <Button
                            onClick={handleSendFriendRequest}
                            disabled={sendingRequest}
                            variant="outline"
                            size="sm"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {sendingRequest ? 'Sending...' : 'Send Friend Request'}
                          </Button>
                        )}
                        {profile.relation === 'pending_sent' && (
                          <Button
                            disabled
                            variant="outline"
                            size="sm"
                          >
                            Request Sent
                          </Button>
                        )}
                        {profile.relation === 'pending_received' && (
                          <>
                            <Button
                              onClick={handleAcceptFriendRequest}
                              disabled={acceptingRequest}
                              variant="default"
                              size="sm"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {acceptingRequest ? 'Accepting...' : 'Accept'}
                            </Button>
                            <Button
                              onClick={handleRejectFriendRequest}
                              disabled={rejectingRequest}
                              variant="outline"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {rejectingRequest ? 'Rejecting...' : 'Reject'}
                            </Button>
                          </>
                        )}
                        {profile.relation === 'friends' && (
                          <Button
                            onClick={handleRemoveFriend}
                            disabled={removingFriend}
                            variant="destructive"
                            size="sm"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            {removingFriend ? 'Removing...' : 'Unfriend'}
                          </Button>
                        )}
                        <Button
                          onClick={handleStartChat}
                          disabled={startingChat}
                          variant="default"
                          size="sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {startingChat ? 'Starting...' : 'Start Chat'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badgeColors[currentBadge]}`}>
                      <span>{badgeIcons[currentBadge]}</span>
                      <span>{currentBadge}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{profile.points} points</span>
                      {nextBadge && (
                        <>
                          <span>•</span>
                          <span>{nextBadge.remaining} to {nextBadge.badge}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {nextBadge && (
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mb-4">
                    <div>
                      <div className="text-2xl font-bold">{profile.postsCount}</div>
                      <div className="text-sm text-muted-foreground">Posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{profile.friendsCount}</div>
                      <div className="text-sm text-muted-foreground">Friends</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{profile.points}</div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Who are we?</h3>
                      {profile.isOwnProfile && !editingBio && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBio(true)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                    {editingBio ? (
                      <div className="space-y-2">
                        <Textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value)}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveBio}
                            disabled={savingBio}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingBio(false);
                              setBioText(profile.bio || '');
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {profile.bio || profile.isOwnProfile 
                          ? profile.bio || 'No bio yet. Click Edit to add one!'
                          : 'No bio available'}
                      </p>
                    )}
                  </div>

                  {/* Switch Side Button (own profile only) */}
                  {profile.isOwnProfile && (
                    <Button
                      variant="outline"
                      onClick={() => setShowSwitchDialog(true)}
                    >
                      Switch to {profile.side === 'coffee' ? 'Tea' : 'Coffee'} Side
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-2" />
            Posts ({profile.postsCount})
          </button>
          {profile.isOwnProfile && (
            <button
              onClick={() => setActiveTab('friends')}
              className={`pb-2 px-4 font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Friends ({profile.friendsCount})
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'posts' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <Link key={post._id} to={`/post/${post._id}`}>
                  <PostCard post={post} />
                </Link>
              ))
            )}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFriends ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No friends yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friends.map((friend) => (
                    <Link
                      key={friend._id}
                      to={`/user/${friend.username}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              {friend.side === 'coffee' ? (
                                <Coffee className="w-6 h-6 text-coffee" />
                              ) : (
                                <Leaf className="w-6 h-6 text-tea" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{friend.username}</div>
                              <div className="text-sm text-muted-foreground">
                                {friend.points || 0} points
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Switch Side Confirmation Dialog */}
        <AlertDialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Switch Side?</AlertDialogTitle>
              <AlertDialogDescription>
                Switching sides will reset your points to 0. Your current points ({profile.points}) will be lost.
                <br />
                <br />
                Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSwitchSide}
                disabled={switchingSide}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {switchingSide ? 'Switching...' : 'Switch Side'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

