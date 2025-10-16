const { execFile } = require('child_process');
const util = require('util');
const execFileAsync = util.promisify(execFile);
const path = require('path');
const fs = require('fs').promises;

class CustomExifParser {
  constructor() {
    // Set up paths
    this.backendDir = path.resolve(__dirname, '..');
    this.exiftoolPath = path.join(this.backendDir, 'exiftool.exe');
    this.exiftoolFilesDir = path.join(this.backendDir, 'exiftool_files');
    
    // Verify ExifTool exists
    if (!require('fs').existsSync(this.exiftoolPath)) {
      throw new Error(`ExifTool not found at ${this.exiftoolPath}. Please ensure exiftool.exe is in the backend folder.`);
    }

    // Create exiftool_files directory if it doesn't exist
    if (!require('fs').existsSync(this.exiftoolFilesDir)) {
      require('fs').mkdirSync(this.exiftoolFilesDir, { recursive: true });
    }
    
    // Verify if we're using a standalone version of exiftool
    const isStandalone = require('fs').existsSync(path.join(this.exiftoolFilesDir, 'perl5.dll')) ||
                        require('fs').readdirSync(this.exiftoolFilesDir).some(file => file.startsWith('perl5'));
                        
    if (!isStandalone) {
      console.log('[ExifParser] Note: Using exiftool.exe requires perl5*.dll files in the exiftool_files directory.');
      console.log('[ExifParser] Please download the Windows standalone version of ExifTool and copy all .dll files to:', this.exiftoolFilesDir);
    }
  }

  async extractMetadata(filePath) {
    try {
      await fs.access(this.exiftoolPath);
    } catch (err) {
      throw new Error(`ExifTool not found at ${this.exiftoolPath}. Please ensure exiftool.exe is in the backend folder.`);
    }

    try {
      await fs.access(filePath);
    } catch (err) {
      return {
        success: false,
        error: `Input file not found: ${filePath}`,
        hasMetadata: false,
        gps: null,
        camera: null,
        timestamp: null,
        technical: null,
        raw: null
      };
    }

    try {
      const args = ['-json', '-n', '-charset', 'filename=utf8', filePath];
      let result;
      try {
        result = await execFileAsync(this.exiftoolPath, args);
      } catch (execError) {
        throw execError;
      }
      
      const { stdout, stderr } = result;
      
      if (!stdout) {
        throw new Error('ExifTool produced no output');
      }
      
      let parsed;
      try {
        parsed = stdout ? JSON.parse(stdout) : null;
      } catch (parseErr) {
        console.error('[ExifParser] JSON parse error:', parseErr);
        return {
          success: false,
          error: 'Failed to parse exiftool JSON output',
          details: parseErr.message,
          exiftoolStdout: stdout,
          exiftoolStderr: stderr || null,
          hasMetadata: false,
          gps: null,
          camera: null,
          timestamp: null,
          technical: null,
          raw: stdout
        };
      }

      const data = Array.isArray(parsed) && parsed.length ? parsed[0] : (parsed || {});

      const hasMetadata = parsed && Array.isArray(parsed) && parsed.length > 0;

      // If no metadata found, return diagnostics
      if (!hasMetadata) {
        return {
          success: true,
          hasMetadata: false,
          exiftoolStdout: stdout,
          exiftoolStderr: stderr || null,
          gps: null,
          camera: null,
          timestamp: null,
          technical: null,
          raw: parsed || null
        };
      }

      // PDF specific metadata
      let pdfInfo = null;
      if (data.MIMEType === 'application/pdf' || data.FileType === 'PDF') {
        pdfInfo = {
          title: data.Title || null,
          author: data.Author || null,
          creator: data.Creator || null,
          producer: data.Producer || null,
          createDate: parseExifDate(data.CreateDate) || parseExifDate(data.FileCreateDate) || null,
          modifyDate: parseExifDate(data.ModifyDate) || parseExifDate(data.FileModifyDate) || null,
          pageCount: data.PageCount || null,
          fileSize: data.FileSize || null,
          pdfVersion: data.PDFVersion || null
        };
      }

      // GPS
      let gps = null;
      const lat = data.GPSLatitude;
      const lon = data.GPSLongitude;
      if (typeof lat === 'number' && typeof lon === 'number') {
        gps = {
          latitude: lat,
          longitude: lon,
          altitude: data.GPSAltitude || null,
          mapUrl: `https://www.google.com/maps?q=${lat},${lon}`,
          embedUrl: `https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`,
          raw: {
            GPSLatitude: data.GPSLatitude,
            GPSLongitude: data.GPSLongitude,
            GPSAltitude: data.GPSAltitude
          }
        };
      }

      // Camera
      const camera = {
        make: data.Make || data['CameraMake'] || null,
        model: data.Model || data['CameraModel'] || null,
        software: data.Software || null,
        lens: data.Lens || data.LensModel || null,
        serialNumber: data.SerialNumber || data.BodySerialNumber || null
      };

      // Helper function to convert ExifTool date format to ISO
      const parseExifDate = (dateStr) => {
        if (!dateStr) return null;
        // ExifTool format: "2025:10:16 22:44:35+05:30"
        try {
          const [datePart, timePart] = dateStr.split(' ');
          const [year, month, day] = datePart.split(':');
          const [time, timezone] = timePart.split(/([+-].*)/);
          return new Date(`${year}-${month}-${day}T${time}${timezone}`).toISOString();
        } catch (e) {
          return dateStr; // Return original if parsing fails
        }
      };

      // Timestamps
      const timestamp = {
        dateTimeOriginal: parseExifDate(data.DateTimeOriginal) || parseExifDate(data.CreateDate) || null,
        createDate: parseExifDate(data.CreateDate) || parseExifDate(data.FileCreateDate) || null,
        modifyDate: parseExifDate(data.ModifyDate) || parseExifDate(data.FileModifyDate) || null,
        gpsDateTime: parseExifDate(data.GPSDateTime) || null
      };

      // Technical
      const technical = {
        iso: data.ISO || data.ISOValue || null,
        aperture: data.FNumber || data.Aperture || null,
        shutterSpeed: data.ExposureTime || null,
        focalLength: data.FocalLength || null,
        imageWidth: data.ImageWidth || data.ExifImageWidth || null,
        imageHeight: data.ImageHeight || data.ExifImageHeight || null,
        orientation: data.Orientation || null,
        fileSize: null
      };

      try {
        const st = await fs.stat(filePath);
        technical.fileSize = st.size;
      } catch (e) {
        // ignore
      }

      return {
        success: true,
        hasMetadata,
        gps,
        camera,
        timestamp,
        technical,
        pdfInfo,
        raw: data,
        exiftoolStderr: stderr || null
      };
    } catch (err) {
      return {
        success: false,
        error: (err && err.message) || String(err),
        hasMetadata: false,
        gps: null,
        camera: null,
        timestamp: null,
        technical: null,
        raw: null
      };
    }
  }
}

module.exports = CustomExifParser;
