import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Trash2 } from 'lucide-react';
import { postsAPI } from '@/api/posts';
import { uploadAPI } from '@/api/upload';
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, GIF, or WebP).');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 5MB.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setUploadedImageUrl(null); // force re-upload if file changes
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error('Please upload an image for your recipe.');
      return;
    }

    setLoading(true);

    try {
      let imageUrlToUse = uploadedImageUrl;

      if (!imageUrlToUse) {
        setUploadingImage(true);
        const uploadResult = await uploadAPI.uploadImage(imageFile);
        imageUrlToUse = uploadResult.url;
        setUploadedImageUrl(imageUrlToUse);
      }

      const postData = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrlToUse as string
      };

      await postsAPI.createPost(postData);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview(null);
      setUploadedImageUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Post created successfully!');
      navigate('/feed', { replace: true, state: { refresh: true, timestamp: Date.now() } });
    } catch (error: any) {
      console.error('Error creating post:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
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
                  <Label htmlFor="image">Recipe Image</Label>
                  <Input
                    id="image"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a JPG, PNG, GIF, or WebP image up to 5MB.
                  </p>
                </div>

                {imagePreview && (
                  <div className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 gap-2"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </Button>
                    </div>
                  </div>
                )}

                {!imagePreview && (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted p-4 bg-muted/50 text-muted-foreground">
                    <UploadCloud className="w-6 h-6" />
                    <p className="text-sm">Upload an image to showcase your brew.</p>
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
                    disabled={loading || uploadingImage || !imageFile}
                    className="flex-1"
                  >
                    {uploadingImage ? 'Uploading image...' : loading ? 'Creating...' : 'Create Post'}
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
