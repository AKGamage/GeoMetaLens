import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Github, AlertCircle } from 'lucide-react';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GeoMetaLens</h1>
                <p className="text-sm text-gray-500">Smart Image Metadata & Geo-Analyzer</p>
              </div>
            </div>
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">View on GitHub</span>
            </a>
          </div>
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

        {/* Features Section */}
        {!analysisData && !error && (
          <div className="mt-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Features</h3>
              <p className="text-gray-600">Everything you need to analyze file metadata</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Camera Details</h4>
                <p className="text-gray-600">Extract camera make, model, lens information, and technical settings like ISO, aperture, and shutter speed.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">GPS Location</h4>
                <p className="text-gray-600">View exact GPS coordinates and location on an interactive map. See where your photos were taken.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">PDF Analysis</h4>
                <p className="text-gray-600">Extract document metadata, author information, creation dates, security settings, and content analysis from PDF files.</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Privacy Aware</h4>
                <p className="text-gray-600">Files are processed temporarily and automatically deleted. Get warnings about sensitive metadata before sharing.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 GeoMetaLens. Built for analyzing image and document metadata.</p>
            <p className="text-sm mt-2">
              Supported formats: JPG, PNG, HEIC, WebP, TIFF, PDF • Maximum file size: 10MB
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
