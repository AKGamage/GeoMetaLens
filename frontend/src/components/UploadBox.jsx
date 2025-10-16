import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const UploadBox = ({ onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setDragActive(false);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      let errorMessage = 'File rejected';
      
      if (rejection.errors[0]?.code === 'file-too-large') {
        errorMessage = 'File is too large. Maximum size is 10MB.';
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        errorMessage = 'Invalid file type. Please upload JPG, PNG, HEIC, WebP, TIFF images, or PDF documents.';
      }
      
      alert(errorMessage);
      return;
    }

    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/heic': ['.heic'],
      'image/webp': ['.webp'],
      'image/tiff': ['.tiff', '.tif'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
          "hover:border-primary hover:bg-primary/5",
          isDragActive || dragActive ? "border-primary bg-primary/10" : "border-gray-300",
          isLoading && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          ) : (
            <div className="relative">
              <Upload className="h-12 w-12 text-gray-400" />
              <Image className="h-6 w-6 text-primary absolute -bottom-1 -right-1" />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {isLoading ? 'Analyzing File...' : 'Upload Your File'}
            </h3>
            
            {!isLoading && (
              <>
                <p className="text-gray-600">
                  Drag and drop your file here, or click to select
                </p>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span>Supported formats:</span>
                  <div className="flex space-x-1">
                    {['JPG', 'PNG', 'HEIC', 'WebP', 'TIFF', 'PDF'].map((format) => (
                      <span key={format} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
              </>
            )}
          </div>
        </div>
        
        {isDragActive && (
          <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <p className="text-primary font-semibold">Drop your image here!</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-start space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Privacy Notice</p>
          <p className="text-xs text-amber-700 mt-1">
            Your images are processed locally and temporarily. GPS and personal data may be extracted from EXIF metadata. 
            Files are automatically deleted after analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadBox;
