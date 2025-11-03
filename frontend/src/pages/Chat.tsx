import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, Users } from 'lucide-react';
import { chatAPI } from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';
import { Chat as ChatType, ChatMessage, ChatListItem } from '@/types';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Coffee, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import io, { Socket } from 'socket.io-client';

export default function Chat() {
  const { id: chatId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadChats();

    // Initialize Socket.IO connection
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const socket = io(apiBaseUrl, {
      auth: {
        token: localStorage.getItem('brewbook_token')
      },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('newMessage', (data: any) => {
      const message = data;
      // Only add message if it's for the current chat
      if (currentChat && currentChat._id === message.chatId) {
        setCurrentChat(prev => {
          if (!prev) return null;
          // Check if message already exists
          const exists = prev.messages.some(m => m._id === message._id);
          if (exists) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message]
          };
        });
      }
      // Always refresh chat list to show updated last message
      loadChats();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    if (chatId && user) {
      loadChat(chatId);
    }
  }, [chatId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages]);

  const loadChats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await chatAPI.getUserChats(user._id);
      setChats(data.chats);
    } catch (error) {
      toast.error('Failed to load chats');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (id: string) => {
    setLoadingChat(true);
    try {
      const data = await chatAPI.getChat(id);
      setCurrentChat(data.chat);
      
      // Join chat room for real-time updates
      if (socketRef.current) {
        socketRef.current.emit('joinChat', id);
      }
    } catch (error) {
      toast.error('Failed to load chat');
      console.error(error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat || !user) return;

    setSending(true);
    try {
      const response = await chatAPI.sendMessage(currentChat._id, messageText);
      
      // Update chat with new message
      setCurrentChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, response.message]
      } : null);

      // Message will be broadcast via socket by backend
      // No need to emit here as backend handles it

      setMessageText('');
      loadChats(); // Refresh chat list
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  const otherMember = currentChat?.members.find(m => m._id !== user?._id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* Left Panel - Chat List */}
          <Card className="w-80 flex-shrink-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No chats yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Visit a friend's profile to start chatting
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {chats.map((chat) => {
                    const SideIcon = chat.otherMember?.side === 'coffee' ? Coffee : Leaf;
                    return (
                      <button
                        key={chat._id}
                        onClick={() => navigate(`/chat/${chat._id}`)}
                        className={`w-full p-4 text-left hover:bg-muted transition-colors ${
                          chatId === chat._id ? 'bg-muted' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            {chat.otherMember ? (
                              <SideIcon
                                className={`w-5 h-5 ${
                                  chat.otherMember.side === 'coffee'
                                    ? 'text-coffee'
                                    : 'text-tea'
                                }`}
                              />
                            ) : (
                              <Users className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {chat.otherMember?.username || 'Unknown User'}
                            </div>
                            {chat.lastMessage && (
                              <div className="text-sm text-muted-foreground truncate">
                                {chat.lastMessage.text}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Chat Window */}
          <Card className="flex-1 flex flex-col">
            {!chatId ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Select a chat to start messaging</p>
                </div>
              </CardContent>
            ) : loadingChat ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <LoadingSpinner />
              </CardContent>
            ) : !currentChat ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Chat not found</p>
                  <Button onClick={() => navigate('/chat')} variant="outline" className="mt-4">
                    Back to Chats
                  </Button>
                </div>
              </CardContent>
            ) : (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/chat')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <div className="flex items-center gap-3">
                      {otherMember && (
                        <>
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {otherMember.side === 'coffee' ? (
                              <Coffee className="w-5 h-5 text-coffee" />
                            ) : (
                              <Leaf className="w-5 h-5 text-tea" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{otherMember.username}</CardTitle>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {currentChat.messages.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    currentChat.messages.map((message) => {
                      const isOwnMessage = message.sender === user?._id;
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isOwnMessage
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sending}
                    />
                    <Button type="submit" disabled={sending || !messageText.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

