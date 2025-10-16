# GeoMetaLens

A web application that extracts and analyzes metadata from images and PDF documents, including EXIF data, GPS coordinates, camera settings, document properties, and timestamps.

## Features

- Extract image metadata (camera details, technical settings)
- Analyze PDF document properties
- Display GPS locations on interactive maps
- View file creation and modification timestamps
- Download complete metadata as JSON
- Clean, responsive interface with drag-and-drop upload

## Setup

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

2. **Start the Application**
   ```bash
   # Backend (in backend directory)
   npm run dev

   # Frontend (in frontend directory)
   npm start
   ```

3. Open `http://localhost:3000` in your browser

## Project Structure

```
GeoMetaLens/
│
├── backend/                 # Node.js Express API
│   ├── app.js              # Main application entry point
│   ├── routes/
│   │   └── upload.js       # Image upload and processing routes
│   ├── utils/
│   │   └── exifParser.js   # EXIF metadata extraction logic
│   ├── uploads/            # Temporary file storage (auto-created)
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment configuration
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── UploadBox.jsx      # Drag-and-drop file upload
│   │   │   ├── MetadataCard.jsx   # Metadata display component
│   │   │   ├── PDFMetadataCard.jsx # PDF metadata display
│   │   │   └── MapView.jsx        # Google Maps integration
│   │   ├── pages/
│   │   │   └── Home.jsx           # Main application page
│   │   ├── utils/
│   │   │   └── cn.js              # Utility functions
│   │   ├── App.js                 # React app root
│   │   └── index.js               # React DOM entry point
│   ├── public/            # Static assets
│   └── package.json        # Frontend dependencies
│
└── README.md             # Project documentation
```

## Technologies Used

- Frontend: React, TailwindCSS
- Backend: Node.js, Express
- Metadata Extraction: ExifTool

## Credits

- ExifTool by Phil Harvey (https://exiftool.org)
  - Used for extracting metadata from images and PDFs
  - License: Perl Artistic License / GNU General Public License
