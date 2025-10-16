import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Settings, 
  Download, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Shield,
  Hash
} from 'lucide-react';
import { cn } from '../utils/cn';

const PDFMetadataCard = ({ data }) => {
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
          <h2 className="text-2xl font-bold text-gray-900">PDF Analysis Results</h2>
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

      {/* PDF Information */}
      {metadata.pdfInfo && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">PDF Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metadata.pdfInfo.title && (
              <div>
                <span className="text-gray-500 text-sm">Title</span>
                <p className="font-medium">{metadata.pdfInfo.title}</p>
              </div>
            )}
            {metadata.pdfInfo.author && (
              <div>
                <span className="text-gray-500 text-sm">Author</span>
                <p className="font-medium">{metadata.pdfInfo.author}</p>
              </div>
            )}
            {metadata.pdfInfo.creator && (
              <div>
                <span className="text-gray-500 text-sm">Creator</span>
                <p className="font-medium">{metadata.pdfInfo.creator}</p>
              </div>
            )}
            {metadata.pdfInfo.producer && (
              <div>
                <span className="text-gray-500 text-sm">Producer</span>
                <p className="font-medium">{metadata.pdfInfo.producer}</p>
              </div>
            )}
            {metadata.pdfInfo.createDate && (
              <div>
                <span className="text-gray-500 text-sm">Created</span>
                <p className="font-medium">{formatDate(metadata.pdfInfo.createDate)}</p>
              </div>
            )}
            {metadata.pdfInfo.modifyDate && (
              <div>
                <span className="text-gray-500 text-sm">Modified</span>
                <p className="font-medium">{formatDate(metadata.pdfInfo.modifyDate)}</p>
              </div>
            )}
            {metadata.pdfInfo.pageCount && (
              <div>
                <span className="text-gray-500 text-sm">Pages</span>
                <p className="font-medium">{metadata.pdfInfo.pageCount}</p>
              </div>
            )}
            {metadata.pdfInfo.pdfVersion && (
              <div>
                <span className="text-gray-500 text-sm">PDF Version</span>
                <p className="font-medium">{metadata.pdfInfo.pdfVersion}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
            {metadata.hasMetadata ? 'PDF Metadata Found' : 'No PDF Metadata Found'}
          </span>
        </div>
        <p className={cn(
          "text-sm mt-1",
          metadata.hasMetadata ? "text-green-700" : "text-red-700"
        )}>
          {metadata.hasMetadata 
            ? 'This PDF contains metadata that can be analyzed.'
            : 'This PDF has no metadata or it has been stripped.'
          }
        </p>
      </div>

      {metadata.hasMetadata && (
        <>
          {/* Document Information */}
          {metadata.document && Object.values(metadata.document).some(v => v) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Document Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadata.document.title && (
                  <div>
                    <span className="text-gray-500 text-sm">Title:</span>
                    <p className="font-medium">{metadata.document.title}</p>
                  </div>
                )}
                {metadata.document.author && (
                  <div>
                    <span className="text-gray-500 text-sm">Author:</span>
                    <p className="font-medium">{metadata.document.author}</p>
                  </div>
                )}
                {metadata.document.subject && (
                  <div>
                    <span className="text-gray-500 text-sm">Subject:</span>
                    <p className="font-medium">{metadata.document.subject}</p>
                  </div>
                )}
                {metadata.document.keywords && (
                  <div>
                    <span className="text-gray-500 text-sm">Keywords:</span>
                    <p className="font-medium">{metadata.document.keywords}</p>
                  </div>
                )}
                {metadata.document.creator && (
                  <div>
                    <span className="text-gray-500 text-sm">Creator:</span>
                    <p className="font-medium">{metadata.document.creator}</p>
                  </div>
                )}
                {metadata.document.producer && (
                  <div>
                    <span className="text-gray-500 text-sm">Producer:</span>
                    <p className="font-medium">{metadata.document.producer}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Information */}
          {metadata.content && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Hash className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Content Analysis</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Pages:</span>
                  <p className="font-medium">{metadata.content.pageCount}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Word Count:</span>
                  <p className="font-medium">{metadata.content.wordCount?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Text Length:</span>
                  <p className="font-medium">{metadata.content.textLength?.toLocaleString() || 'N/A'} chars</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Has Text:</span>
                  <p className="font-medium">{metadata.content.hasText ? 'Yes' : 'No'}</p>
                </div>
                {metadata.content.version && (
                  <div>
                    <span className="text-gray-500 text-sm">PDF Version:</span>
                    <p className="font-medium">{metadata.content.version}</p>
                  </div>
                )}
              </div>
              
              {metadata.content.textPreview && (
                <div className="mt-4">
                  <span className="text-gray-500 text-sm">Text Preview:</span>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <p className="text-gray-700 italic">"{metadata.content.textPreview}"</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Information */}
          {metadata.security && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Security & Features</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Encrypted:</span>
                  <p className={cn(
                    "font-medium",
                    metadata.security.encrypted ? "text-red-600" : "text-green-600"
                  )}>
                    {metadata.security.encrypted ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Linearized:</span>
                  <p className="font-medium">{metadata.security.linearized ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Tagged PDF:</span>
                  <p className="font-medium">{metadata.security.tagged ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Has Forms:</span>
                  <p className="font-medium">{metadata.security.acroForm ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">XFA Forms:</span>
                  <p className="font-medium">{metadata.security.xfa ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Information */}
          {metadata.technical && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Technical Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metadata.technical.version && (
                  <div>
                    <span className="text-gray-500 text-sm">PDF Version:</span>
                    <p className="font-medium">{metadata.technical.version}</p>
                  </div>
                )}
                {metadata.technical.fileSize && (
                  <div>
                    <span className="text-gray-500 text-sm">File Size:</span>
                    <p className="font-medium">{formatFileSize(metadata.technical.fileSize)}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 text-sm">Optimized:</span>
                  <p className="font-medium">{metadata.technical.optimized ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Fast Web View:</span>
                  <p className="font-medium">{metadata.technical.fastWebView ? 'Yes' : 'No'}</p>
                </div>
                {metadata.technical.pageLayout && (
                  <div>
                    <span className="text-gray-500 text-sm">Page Layout:</span>
                    <p className="font-medium">{metadata.technical.pageLayout}</p>
                  </div>
                )}
                {metadata.technical.pageMode && (
                  <div>
                    <span className="text-gray-500 text-sm">Page Mode:</span>
                    <p className="font-medium">{metadata.technical.pageMode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamp Information */}
          {metadata.document && (metadata.document.creationDate || metadata.document.modificationDate) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Timestamp Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadata.document.creationDate && (
                  <div>
                    <span className="text-gray-500 text-sm">Created:</span>
                    <p className="font-medium">{formatDate(metadata.document.creationDate)}</p>
                  </div>
                )}
                {metadata.document.modificationDate && (
                  <div>
                    <span className="text-gray-500 text-sm">Modified:</span>
                    <p className="font-medium">{formatDate(metadata.document.modificationDate)}</p>
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

export default PDFMetadataCard;
