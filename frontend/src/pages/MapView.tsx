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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Failed to get your location. Please enable location services.');
        setLoading(false);
        
        // Fallback to a default location (example: San Francisco)
        setUserLocation({ lat: 37.7749, lng: -122.4194 });
        toast.error('Using default location. Please enable location services for accurate results.');
      }
    );
  };

  const loadNearbyPlaces = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      // Use Google Maps Places API if API key is provided, otherwise use OpenStreetMap
      if (googleMapsApiKey) {
        // Google Maps Places API
        const placeType = filter === 'all' 
          ? 'cafe'
          : filter === 'coffee'
          ? 'cafe'
          : 'meal_takeaway'; // Tea houses might be categorized differently

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${userLocation.lat},${userLocation.lng}` +
          `&radius=5000` +
          `&type=${placeType}` +
          `&keyword=${filter === 'tea' ? 'tea' : filter === 'coffee' ? 'coffee' : 'cafe'}` +
          `&key=${googleMapsApiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch places from Google Maps');
        }

        const data = await response.json();

        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
          throw new Error(data.error_message || 'Failed to fetch places');
        }

        // Transform Google Places data to our Place format
        const transformedPlaces: Place[] = (data.results || [])
          .map((place: any) => {
            // Determine type based on name/types
            const name = place.name?.toLowerCase() || '';
            const types = place.types || [];
            const isCoffee = name.includes('coffee') || name.includes('cafe') || name.includes('espresso') || 
                           types.includes('cafe') || types.includes('coffee_shop');
            const isTea = name.includes('tea') || types.includes('meal_takeaway');
            
            let type: 'coffee' | 'tea' = 'coffee';
            if (isTea && !isCoffee) {
              type = 'tea';
            } else if (!isCoffee && !isTea) {
              type = currentSide === 'tea' ? 'tea' : 'coffee';
            }

            return {
              id: place.place_id,
              name: place.name,
              address: place.vicinity || place.formatted_address || 'Address not available',
              rating: place.rating,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
              type
            };
          });

        // Filter by type if needed
        const filteredPlaces = filter === 'all' 
          ? transformedPlaces 
          : transformedPlaces.filter(p => p.type === filter);

        setPlaces(filteredPlaces);
        toast.success(`Found ${filteredPlaces.length} places nearby!`);
        return;
      }

      // Fallback to OpenStreetMap Nominatim API (free, no API key needed)
      const searchQuery = filter === 'all' 
        ? 'cafe OR coffee OR tea OR tea house'
        : filter === 'coffee'
        ? 'cafe OR coffee shop'
        : 'tea OR tea house';

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}` +
        `&format=json` +
        `&limit=20` +
        `&lat=${userLocation.lat}` +
        `&lon=${userLocation.lng}` +
        `&radius=5000`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();
      
      // Transform Nominatim data to our Place format
      const transformedPlaces: Place[] = data
        .filter((place: any) => place.lat && place.lon)
        .map((place: any, index: number) => {
          // Determine type based on name/tags
          const name = place.display_name.toLowerCase();
          const isCoffee = name.includes('coffee') || name.includes('cafe') || name.includes('espresso');
          const isTea = name.includes('tea');
          
          let type: 'coffee' | 'tea' = 'coffee';
          if (isTea && !isCoffee) {
            type = 'tea';
          } else if (!isCoffee && !isTea) {
            // Default based on user's side
            type = currentSide === 'tea' ? 'tea' : 'coffee';
          }

          return {
            id: place.place_id || `place-${index}`,
            name: place.name || place.display_name.split(',')[0] || 'Unknown Place',
            address: place.display_name,
            rating: undefined, // Nominatim doesn't provide ratings
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            type
          };
        });

      // Filter by type if needed
      const filteredPlaces = filter === 'all' 
        ? transformedPlaces 
        : transformedPlaces.filter(p => p.type === filter);

      setPlaces(filteredPlaces);
      toast.success(`Found ${filteredPlaces.length} places nearby!`);
    } catch (error: any) {
      console.error('Error loading places:', error);
      toast.error('Failed to load nearby places');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = (place: Place) => {
    // Open in Google Maps or Apple Maps
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  const getDirections = (place: Place) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${place.lat},${place.lng}`;
    window.open(url, '_blank');
  };

  // Initialize map visualization (simple HTML/CSS based)
  useEffect(() => {
    if (mapRef.current && userLocation && places.length > 0) {
      // Simple map visualization using divs
      // In production, you'd use a proper map library like Leaflet or Google Maps
      const mapContainer = mapRef.current;
      mapContainer.innerHTML = '';
      
      // Create a simple grid-based map visualization
      const mapWidth = mapContainer.offsetWidth;
      const mapHeight = 400;
      
      places.slice(0, 10).forEach((place, index) => {
        const marker = document.createElement('div');
        marker.className = `absolute w-4 h-4 rounded-full cursor-pointer ${
          place.type === 'coffee' ? 'bg-coffee' : 'bg-tea'
        }`;
        
        // Simple positioning (this is a placeholder - use proper map library in production)
        const x = (index % 5) * (mapWidth / 5) + 20;
        const y = Math.floor(index / 5) * 100 + 50;
        
        marker.style.left = `${x}px`;
        marker.style.top = `${y}px`;
        marker.title = place.name;
        
        marker.addEventListener('click', () => {
          openInMaps(place);
        });
        
        mapContainer.appendChild(marker);
      });
    }
  }, [places, userLocation]);

  const isCoffee = currentSide === 'coffee';

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Please log in to view the map</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <MapPin className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-2">
            Nearby {isCoffee ? 'Cafés ☕' : 'Tea Houses 🍵'}
          </h1>
          <p className="text-muted-foreground">
            Discover {isCoffee ? 'coffee' : 'tea'} spots near you
          </p>
        </motion.div>

        {/* Filter and Location Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={filter === 'coffee' ? 'default' : 'outline'}
              onClick={() => setFilter('coffee')}
              size="sm"
              className="gap-2"
            >
              <Coffee className="w-4 h-4" />
              Coffee
            </Button>
            <Button
              variant={filter === 'tea' ? 'default' : 'outline'}
              onClick={() => setFilter('tea')}
              size="sm"
              className="gap-2"
            >
              <Leaf className="w-4 h-4" />
              Tea
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={getCurrentLocation}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Location
          </Button>
        </div>

        {locationError && (
          <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg text-yellow-800 dark:text-yellow-200">
            <p>{locationError}</p>
          </div>
        )}

        {/* Map Visualization */}
        {userLocation && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="relative w-full h-[400px] bg-muted rounded-lg border-2 border-border overflow-hidden"
                style={{ minHeight: '400px' }}
              >
                {!loading && places.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-muted-foreground">No places found. Try adjusting your location or filters.</p>
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Click on markers to view in Google Maps. Click "Get Directions" for navigation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Places List */}
        {loading && places.length === 0 ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : places.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No places found. Try refreshing your location.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {places.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {place.type === 'coffee' ? (
                          <Coffee className="w-5 h-5 text-coffee" />
                        ) : (
                          <Leaf className="w-5 h-5 text-tea" />
                        )}
                        <CardTitle className="text-lg">{place.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {place.address}
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openInMaps(place)}
                        className="flex-1 gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => getDirections(place)}
                        className="flex-1 gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

