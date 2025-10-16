import React, { useState } from 'react';
import { 
  Camera, 
  Calendar, 
  MapPin, 
  Settings, 
  Download, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '../utils/cn';

const MetadataCard = ({ data }) => {
  const [showRawData, setShowRawData] = useState(false);

  if (!data) return null;

  const { metadata, filename, filesize, mimetype } = data;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      // If it's in ExifTool format, try parsing it directly
      if (typeof dateString === 'string' && dateString.includes(':')) {
        const [datePart, timePart] = dateString.split(' ');
        const [year, month, day] = datePart.split(':');
        const [time, timezone] = (timePart || '').split(/([+-].*)/);
        try {
          const date = new Date(`${year}-${month}-${day}T${time || '00:00:00'}${timezone || ''}`);
          if (!isNaN(date.getTime())) {
            return date.toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short'
            });
          }
        } catch {}
      }
      return dateString;
    }
  };

  const downloadMetadata = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${filename}_metadata.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <button
            onClick={downloadMetadata}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download JSON</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Filename:</span>
            <p className="font-medium truncate">{filename}</p>
          </div>
          <div>
            <span className="text-gray-500">File Size:</span>
            <p className="font-medium">{formatFileSize(filesize)}</p>
          </div>
          <div>
            <span className="text-gray-500">Type:</span>
            <p className="font-medium">{mimetype}</p>
          </div>
        </div>
      </div>

      {/* Metadata Status */}
      <div className={cn(
        "rounded-lg p-4 border-l-4",
        metadata.hasMetadata 
          ? "bg-green-50 border-green-400" 
          : "bg-red-50 border-red-400"
      )}>
        <div className="flex items-center space-x-2">
          {metadata.hasMetadata ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <span className={cn(
            "font-semibold",
            metadata.hasMetadata ? "text-green-800" : "text-red-800"
          )}>
            {metadata.hasMetadata ? 'Metadata Found' : 'No Metadata Found'}
          </span>
        </div>
        <p className={cn(
          "text-sm mt-1",
          metadata.hasMetadata ? "text-green-700" : "text-red-700"
        )}>
          {metadata.hasMetadata 
            ? 'This image contains EXIF metadata that can be analyzed.'
            : 'This image has no metadata or it has been stripped (common with social media uploads).'
          }
        </p>
      </div>

      {metadata.hasMetadata && (
        <>
          {/* GPS Information */}
          {metadata.gps && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Location Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-500 text-sm">Latitude:</span>
                  <p className="font-medium">{metadata.gps.latitude}°</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Longitude:</span>
                  <p className="font-medium">{metadata.gps.longitude}°</p>
                </div>
                {metadata.gps.altitude && (
                  <div>
                    <span className="text-gray-500 text-sm">Altitude:</span>
                    <p className="font-medium">{metadata.gps.altitude} m</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={metadata.gps.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          )}

          {/* Camera Information */}
          {metadata.camera && Object.values(metadata.camera).some(v => v) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Camera className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Camera Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metadata.camera.make && (
                  <div>
                    <span className="text-gray-500 text-sm">Make:</span>
                    <p className="font-medium">{metadata.camera.make}</p>
                  </div>
                )}
                {metadata.camera.model && (
                  <div>
                    <span className="text-gray-500 text-sm">Model:</span>
                    <p className="font-medium">{metadata.camera.model}</p>
                  </div>
                )}
                {metadata.camera.lens && (
                  <div>
                    <span className="text-gray-500 text-sm">Lens:</span>
                    <p className="font-medium">{metadata.camera.lens}</p>
                  </div>
                )}
                {metadata.camera.software && (
                  <div>
                    <span className="text-gray-500 text-sm">Software:</span>
                    <p className="font-medium">{metadata.camera.software}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Technical Information */}
          {metadata.technical && Object.values(metadata.technical).some(v => v) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Technical Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metadata.technical.iso && (
                  <div>
                    <span className="text-gray-500 text-sm">ISO:</span>
                    <p className="font-medium">{metadata.technical.iso}</p>
                  </div>
                )}
                {metadata.technical.aperture && (
                  <div>
                    <span className="text-gray-500 text-sm">Aperture:</span>
                    <p className="font-medium">f/{metadata.technical.aperture}</p>
                  </div>
                )}
                {metadata.technical.shutterSpeed && (
                  <div>
                    <span className="text-gray-500 text-sm">Shutter Speed:</span>
                    <p className="font-medium">{metadata.technical.shutterSpeed}</p>
                  </div>
                )}
                {metadata.technical.focalLength && (
                  <div>
                    <span className="text-gray-500 text-sm">Focal Length:</span>
                    <p className="font-medium">{metadata.technical.focalLength}</p>
                  </div>
                )}
                {metadata.technical.imageWidth && metadata.technical.imageHeight && (
                  <div>
                    <span className="text-gray-500 text-sm">Dimensions:</span>
                    <p className="font-medium">{metadata.technical.imageWidth} × {metadata.technical.imageHeight}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp Information */}
          {metadata.timestamp && Object.values(metadata.timestamp).some(v => v) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Timestamp Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadata.timestamp.dateTimeOriginal && (
                  <div>
                    <span className="text-gray-500 text-sm">Date Taken:</span>
                    <p className="font-medium">{formatDate(metadata.timestamp.dateTimeOriginal)}</p>
                  </div>
                )}
                {metadata.timestamp.createDate && (
                  <div>
                    <span className="text-gray-500 text-sm">Created:</span>
                    <p className="font-medium">{formatDate(metadata.timestamp.createDate)}</p>
                  </div>
                )}
                {metadata.timestamp.gpsDateTime && (
                  <div>
                    <span className="text-gray-500 text-sm">GPS Time:</span>
                    <p className="font-medium">{formatDate(metadata.timestamp.gpsDateTime)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Raw Data Toggle */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showRawData ? 'Hide' : 'Show'} Raw Metadata</span>
            </button>
            
            {showRawData && metadata.raw && (
              <div className="mt-4">
                <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-auto max-h-96">
                  {JSON.stringify(metadata.raw, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MetadataCard;
