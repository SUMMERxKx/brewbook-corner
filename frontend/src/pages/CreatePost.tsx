import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { postsAPI } from '@/api/posts';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const [validatingImage, setValidatingImage] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();

  // Validate image URL is loadable
  const validateImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!url || !url.trim()) {
        resolve(false);
        return;
      }

      // Validate URL format
      try {
        new URL(url.trim());
      } catch {
        resolve(false);
        return;
      }

      const img = new Image();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          img.onload = null;
          img.onerror = null;
        }
      };

      img.onload = () => {
        cleanup();
        resolve(true);
      };

      img.onerror = () => {
        cleanup();
        resolve(false);
      };

      // Set timeout (10 seconds)
      setTimeout(() => {
        if (!resolved) {
          cleanup();
          resolve(false);
        }
      }, 10000);

      img.src = url.trim();
    });
  };

  // Validate image when URL changes
  useEffect(() => {
    const checkImage = async () => {
      if (!imageUrl || !imageUrl.trim()) {
        setImageValid(null);
        return;
      }

      setValidatingImage(true);
      const isValid = await validateImage(imageUrl);
      setImageValid(isValid);
      setValidatingImage(false);
    };

    // Debounce validation
    const timer = setTimeout(checkImage, 500);
    return () => clearTimeout(timer);
  }, [imageUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate imageUrl before submitting
      const trimmedImageUrl = imageUrl.trim();
      if (!trimmedImageUrl) {
        toast.error('Please provide an image URL');
        setLoading(false);
        return;
      }

      // Validate URL format
      try {
        new URL(trimmedImageUrl);
      } catch (error) {
        toast.error('Please provide a valid image URL (must start with http:// or https://)');
        setLoading(false);
        return;
      }

      // Check if image is valid
      if (imageValid === false) {
        toast.error('Image URL is not accessible. Please use a valid, publicly accessible image URL.');
        setLoading(false);
        return;
      }

      // If still validating, wait for it
      if (imageValid === null && validatingImage) {
        toast.error('Please wait for image validation to complete');
        setLoading(false);
        return;
      }

      // Log what we're sending
      console.log('Creating post with data:', { title, description, imageUrl: trimmedImageUrl });

      // Create post data with current imageUrl value
      const postData = { 
        title: title.trim(), 
        description: description.trim(), 
        imageUrl: trimmedImageUrl 
      };
      
      console.log('Sending post data:', postData);
      
      const createdPost = await postsAPI.createPost(postData);
      
      // Log the response
      console.log('Post created successfully:', createdPost);
      console.log('Post imageUrl:', createdPost.imageUrl);
      
      // Clear form after successful submission
      setTitle('');
      setDescription('');
      setImageUrl('');
      
      toast.success('Post created successfully!');
      
      // Navigate with state to force Feed refresh
      navigate('/feed', { replace: true, state: { refresh: true, timestamp: Date.now() } });
    } catch (error: any) {
      console.error('Error creating post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
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
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Create New Recipe</CardTitle>
              <CardDescription>Share your favorite coffee or tea recipe with the community</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., Iced Vanilla Latte"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your recipe, ingredients, and preparation method..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a URL to an image of your recipe. Image upload coming soon!
                  </p>
                </div>

                {imageUrl && (
                  <div className="space-y-2">
                    <div className="rounded-lg overflow-hidden border relative">
                      {validatingImage ? (
                        <div className="w-full h-64 flex items-center justify-center bg-muted">
                          <p className="text-muted-foreground">Validating image...</p>
                        </div>
                      ) : imageValid === false ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center bg-destructive/10 border-destructive">
                          <AlertCircle className="w-8 h-8 text-destructive mb-2" />
                          <p className="text-destructive font-medium">Image URL is not accessible</p>
                          <p className="text-sm text-destructive/80 mt-1">Please use a valid, publicly accessible image URL</p>
                        </div>
                      ) : imageValid === true ? (
                        <div className="relative">
                          <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-muted">
                          <p className="text-muted-foreground">Enter an image URL to preview</p>
                        </div>
                      )}
                    </div>
                    {imageValid === false && (
                      <p className="text-sm text-destructive">
                        The image URL you provided is not accessible. Make sure the URL is public and points to a valid image file.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/feed')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || validatingImage || imageValid === false} 
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : validatingImage ? 'Validating image...' : 'Create Post'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
