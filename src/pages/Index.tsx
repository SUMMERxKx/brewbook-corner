import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Heart, Users, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Coffee className="w-8 h-8" />,
      title: 'Share Recipes',
      description: 'Post your favorite coffee and tea recipes with beautiful photos',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Discover & Like',
      description: 'Explore recipes from the community and save your favorites',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Join Community',
      description: 'Connect with fellow coffee and tea enthusiasts worldwide',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Get Inspired',
      description: 'Find new brewing techniques and flavor combinations',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero border-b">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <Coffee className="w-20 h-20 text-primary" />
                </motion.div>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
                Welcome to <span className="text-primary">BrewBook</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Share your passion for coffee and tea. Discover amazing recipes, 
                connect with fellow enthusiasts, and brew something extraordinary.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="text-lg px-8"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="text-lg px-8"
                >
                  Sign In
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-4">
              Why Join BrewBook?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to share and discover the perfect brew
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-serif font-bold mb-6">
              Ready to Share Your Brew?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of coffee and tea lovers sharing their favorite recipes
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="text-lg px-8"
            >
              Create Account
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
