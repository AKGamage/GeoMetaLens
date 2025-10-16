import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

const MapView = ({ gpsData }) => {
  if (!gpsData || !gpsData.latitude || !gpsData.longitude) {
    return null;
  }

  const { latitude, longitude, embedUrl, mapUrl } = gpsData;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Location Map</h3>
        </div>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          <span>Open in Maps</span>
        </a>
      </div>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Coordinates: {latitude.toFixed(6)}°, {longitude.toFixed(6)}°</p>
        </div>
        
        <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Location Map"
            className="absolute inset-0"
          />
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          This map shows the exact location where the photo was taken based on GPS coordinates in the image metadata.
        </div>
      </div>
    </div>
  );
};

export default MapView;
