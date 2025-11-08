import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchProductMetadata } from '../src/fetchProductMetadata';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let productUrl: string | undefined;

    // Handle both GET and POST requests
    if (req.method === 'POST') {
      productUrl = req.body?.url;
    } else if (req.method === 'GET') {
      productUrl = req.query?.url as string | undefined;
    }

    if (!productUrl) {
      return res.status(400).json({
        error: 'Missing required parameter: url',
        message: req.method === 'POST'
          ? 'Please provide a product URL in the request body as {"url": "..."}'
          : 'Please provide a product URL as a query parameter (?url=...)'
      });
    }

    // Validate URL format
    try {
      new URL(productUrl);
    } catch {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid product URL'
      });
    }

    const metadata = await fetchProductMetadata(productUrl);
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error fetching product metadata:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}
