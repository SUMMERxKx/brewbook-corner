import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Mail } from 'lucide-react';
import { authAPI } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.requestPasswordReset(email);
      setSuccess(true);
      toast.success('If that email exists, a reset link has been sent');
      
      // In development, check backend console for the reset link
      if (process.env.NODE_ENV === 'development') {
        console.log('Check your backend console for the reset link');
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send reset link';
      toast.error(errorMessage);
      console.error('Password reset request failed:', error);
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
          <h1 className="text-4xl font-serif font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email to receive a reset link</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Forgot Password?</CardTitle>
            <CardDescription>
              {success
                ? 'Check your email for a reset link. If the email exists, you should receive it shortly.'
                : "We'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <Mail className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    If an account with that email exists, a password reset link has been sent.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    In development mode, check your backend console for the reset link.
                  </p>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Email
                  </Button>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

