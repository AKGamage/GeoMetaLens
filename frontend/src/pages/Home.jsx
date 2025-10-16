import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import MetadataCard from '../components/MetadataCard';
import PDFMetadataCard from '../components/PDFMetadataCard';
import MapView from '../components/MapView';

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAnalysisData(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to analyze image. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={require('../assets/logo.png')} alt="GeoMetaLens" className="h-8 w-8" />
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
              GeoMetaLens
            </h1>
          </div>
          <a 
            href="https://github.com/AKGamage/GeoMetaLens" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!analysisData && !error && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Analyze Your File Metadata
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload an image or PDF to extract detailed metadata including EXIF data, camera settings, 
              GPS coordinates, document properties, and timestamps. Discover hidden information in your files.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {!analysisData && (
          <div className="mb-8">
            <UploadBox onUpload={handleUpload} isLoading={isLoading} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="text-red-800 font-semibold">Error</h3>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={resetAnalysis}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisData && (
          <div className="space-y-8">
            {/* Back to Upload Button */}
            <div className="text-center">
              <button
                onClick={resetAnalysis}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Analyze Another File
              </button>
            </div>

            {/* Metadata Card - Choose component based on file type */}
            {analysisData.mimetype === 'application/pdf' ? (
              <PDFMetadataCard data={analysisData} />
            ) : (
              <MetadataCard data={analysisData} />
            )}

            {/* Map View - Only for images with GPS data */}
            {analysisData.mimetype !== 'application/pdf' && analysisData.metadata?.gps && (
              <MapView gpsData={analysisData.metadata.gps} />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>Developed with ❤️ by Achintha Gamage</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
