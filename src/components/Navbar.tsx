import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/feed" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Coffee className="w-8 h-8 text-primary" />
            </motion.div>
            <span className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
              BrewBook
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/feed">
                  <Button variant="ghost" size="sm">
                    Feed
                  </Button>
                </Link>
                <Link to="/create">
                  <Button variant="default" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create
                  </Button>
                </Link>
                
                <div className="flex items-center gap-3 pl-4 border-l">
                  <div className="flex items-center gap-2">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="hidden md:block">
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.side === 'coffee' ? '☕' : '🍵'} {user.side} lover
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
