const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', uploadRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GeoMetaLens Backend is running' });
});

app.use((error, req, res, next) => {
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`GeoMetaLens Backend running on port ${PORT}`);
});

module.exports = app;
