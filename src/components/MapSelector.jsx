import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

// Map container styles
const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.5rem',
};

// Default center (Tashkent, Uzbekistan)
const defaultCenter = {
  lat: 41.3111,
  lng: 69.2797,
};

// Libraries to load
const libraries = ['places'];

export default function MapSelector({ latitude, longitude, onCoordinatesChange, height = '400px' }) {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(defaultCenter);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps API
  const { isLoaded: mapLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '', // You can set this in your .env file
    libraries,
  });

  // Initialize position from props
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition({ lat, lng });
      }
    } else {
      setPosition(defaultCenter);
    }
  }, [latitude, longitude]);

  // Handle map click
  const handleMapClick = useCallback((event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setPosition(newPosition);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: newPosition.lat.toFixed(6),
        longitude: newPosition.lng.toFixed(6),
      });
    }
  }, [onCoordinatesChange]);

  // Handle map load
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
    setIsLoaded(true);
    // Center map on position if coordinates are provided
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapInstance.setCenter({ lat, lng });
        mapInstance.setZoom(15);
      }
    }
  }, [latitude, longitude]);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Update map center when position changes from props
  useEffect(() => {
    if (map && isLoaded && latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.setCenter({ lat, lng });
        if (lat === position.lat && lng === position.lng) {
          map.setZoom(15);
        }
      }
    }
  }, [latitude, longitude, map, isLoaded, position]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300" style={{ height }}>
        <div className="text-center p-4">
          <p className="text-red-600 font-semibold mb-2">Error loading map</p>
          <p className="text-sm text-gray-600 mb-2">Please check your Google Maps API key.</p>
          <p className="text-xs text-gray-500">
            Set <code className="bg-gray-200 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in your <code className="bg-gray-200 px-1 rounded">.env</code> file
          </p>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === '') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300" style={{ height }}>
          <div className="text-center p-4">
            <p className="text-gray-700 font-semibold mb-2">Google Maps API Key Required</p>
            <p className="text-sm text-gray-600 mb-2">
              Please add your Google Maps API key to your <code className="bg-gray-200 px-1 rounded">.env</code> file:
            </p>
            <p className="text-xs text-gray-500 font-mono bg-gray-200 p-2 rounded mt-2">
              VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Get your key from: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a>
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg border border-gray-300" style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position}
        zoom={latitude && longitude ? 15 : 13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
      <p className="mt-2 text-sm text-gray-600">
        Click on the map to select location coordinates
      </p>
    </div>
  );
}
