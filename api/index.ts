import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { fetchProductMetadata } from '../src/fetchProductMetadata';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Product Fetcher API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'GET /api/health': 'Health check',
      'POST /api/fetch': 'Fetch product metadata',
      'GET /api/fetch': 'Fetch product metadata (query param)'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Product Fetcher API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'API information',
      'GET /api/health': 'Health check',
      'POST /api/fetch': 'Fetch product metadata',
      'GET /api/fetch': 'Fetch product metadata (query param)'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fetch product metadata - POST method
app.post('/api/fetch', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: 'Please provide a product URL in the request body'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid product URL'
      });
    }

    const metadata = await fetchProductMetadata(url);
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching product metadata:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

// Fetch product metadata - GET method (for easy browser testing)
app.get('/api/fetch', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: 'Please provide a product URL as a query parameter (?url=...)'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid product URL'
      });
    }

    const metadata = await fetchProductMetadata(url);
    res.json(metadata);
  } catch (error) {
    console.error('Error fetching product metadata:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

export default app;
