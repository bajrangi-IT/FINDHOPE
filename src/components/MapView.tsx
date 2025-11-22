import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Eye } from 'lucide-react';

interface MissingCase {
  id: string;
  full_name: string | null;
  last_seen_location: string | null;
  priority: string | null;
  status: string | null;
  photo_url: string | null;
}

interface Sighting {
  id: string;
  camera_location: string;
  latitude: number;
  longitude: number;
  confidence_score: number | null;
  detected_at: string;
  case_id: string;
}

interface MapViewProps {
  cases: MissingCase[];
  sightings: Sighting[];
}

const containerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 28.6139, // Delhi coordinates as default
  lng: 77.2090,
};

export const MapView = ({ cases, sightings }: MapViewProps) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedCase, setSelectedCase] = useState<MissingCase | null>(null);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Parse coordinates from location strings (simplified - would need geocoding in production)
  const getCaseMarkers = useMemo(() => {
    return cases
      .filter(c => c.last_seen_location)
      .map((c, index) => {
        const lat = 28.6139 + (Math.random() - 0.5) * 0.5;
        const lng = 77.2090 + (Math.random() - 0.5) * 0.5;
        return {
          case: c,
          lat,
          lng,
        };
      });
  }, [cases]);

  const getSightingMarkers = useMemo(() => {
    return sightings;
  }, [sightings]);

  if (!apiKey) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Google Maps Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To view the map, please enter your Google Maps API key. You can get one from the{' '}
              <a
                href="https://console.cloud.google.com/google/maps-apis"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
              .
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google Maps API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-[600px]">
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-destructive" />
          <span className="text-sm">Missing Cases ({getCaseMarkers.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm">Recent Sightings ({getSightingMarkers.length})</span>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {/* Case Markers */}
        {getCaseMarkers.map((marker) => (
          <Marker
            key={`case-${marker.case.id}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#ef4444',
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            onClick={() => {
              setSelectedCase(marker.case);
              setSelectedSighting(null);
            }}
          />
        ))}

        {/* Sighting Markers */}
        {getSightingMarkers.map((sighting) => (
          <Marker
            key={`sighting-${sighting.id}`}
            position={{ lat: sighting.latitude, lng: sighting.longitude }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3b82f6',
              fillOpacity: 0.7,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            onClick={() => {
              setSelectedSighting(sighting);
              setSelectedCase(null);
            }}
          />
        ))}

        {/* Case Info Window */}
        {selectedCase && getCaseMarkers.find(m => m.case.id === selectedCase.id) && (
          <InfoWindow
            position={{ 
              lat: getCaseMarkers.find(m => m.case.id === selectedCase.id)!.lat, 
              lng: getCaseMarkers.find(m => m.case.id === selectedCase.id)!.lng 
            }}
            onCloseClick={() => setSelectedCase(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold mb-1">{selectedCase.full_name}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {selectedCase.last_seen_location}
              </p>
              <div className="flex gap-2">
                <Badge
                  variant={
                    selectedCase.priority === 'high'
                      ? 'destructive'
                      : selectedCase.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {selectedCase.priority}
                </Badge>
                <Badge variant="outline">{selectedCase.status}</Badge>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Sighting Info Window */}
        {selectedSighting && (
          <InfoWindow
            position={{ lat: selectedSighting.latitude, lng: selectedSighting.longitude }}
            onCloseClick={() => setSelectedSighting(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold mb-1">CCTV Sighting</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {selectedSighting.camera_location}
              </p>
              <p className="text-sm mb-2">
                Confidence: {selectedSighting.confidence_score}%
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedSighting.detected_at).toLocaleString()}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </Card>
  );
};
