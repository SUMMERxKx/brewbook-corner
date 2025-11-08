/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Coffee, Leaf, MapPin, Navigation, ExternalLink, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  lat: number;
  lng: number;
  type: 'coffee' | 'tea';
}

export default function MapView() {
  const { user } = useAuth();
  const { currentSide } = useTheme();
  const sideLabel = currentSide === 'coffee' ? 'coffee' : 'tea';

  // Map functionality temporarily disabled – keeping previous implementation for quick restore.
  /*
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [filter, setFilter] = useState<'coffee' | 'tea' | 'all'>('all');
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getCurrentLocation();
    }
  }, [user]);

  useEffect(() => {
    if (userLocation) {
      loadNearbyPlaces();
    }
  }, [userLocation, filter]);

  const getCurrentLocation = () => { ... };
  const loadNearbyPlaces = async () => { ... };
  const openInMaps = (place: Place) => { ... };
  const getDirections = (place: Place) => { ... };

  useEffect(() => {
    if (mapRef.current && userLocation && places.length > 0) {
      // render markers
    }
  }, [places, userLocation]);
  */

  const isCoffee = currentSide === 'coffee';

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Please log in to access MapView.</p>
              <p className="text-sm text-muted-foreground mt-2">🗺️ MapView temporarily disabled — feature coming back soon!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <MapPin className="w-12 h-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-serif">
                {isCoffee ? 'Coffee Map' : 'Tea Map'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-xl">🗺️ MapView temporarily disabled — feature coming back soon!</p>
              <p className="text-muted-foreground">
                We are brewing an improved discovery experience for all {sideLabel} lovers. Stay tuned for updates!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

