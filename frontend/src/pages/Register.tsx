import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Leaf } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Side } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [side, setSide] = useState<Side>('coffee');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ username, email, password, side });
      navigate('/feed');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-hero">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-block"
          >
            <Coffee className="w-16 h-16 text-primary mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-serif font-bold mb-2">Join BrewBook</h1>
          <p className="text-muted-foreground">Share your favorite recipes with the community</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>Get started by creating your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label>Choose Your Side</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    onClick={() => setSide('coffee')}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${side === 'coffee' 
                        ? 'border-coffee bg-coffee-light' 
                        : 'border-border hover:border-coffee/50'
                      }
                    `}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Coffee className={side === 'coffee' ? 'text-coffee' : 'text-muted-foreground'} />
                    <span className={`font-medium ${side === 'coffee' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Coffee
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => setSide('tea')}
                    className={`
                      p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                      ${side === 'tea' 
                        ? 'border-tea bg-tea-light' 
                        : 'border-border hover:border-tea/50'
                      }
                    `}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Leaf className={side === 'tea' ? 'text-tea' : 'text-muted-foreground'} />
                    <span className={`font-medium ${side === 'tea' ? 'text-foreground' : 'text-muted-foreground'}`}>
                      Tea
                    </span>
                  </motion.button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
