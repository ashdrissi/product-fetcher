# Product Fetcher API

A powerful API to fetch product metadata from e-commerce websites. Returns product images, title, price, store name, and store logo.

## Features

- 🛍️ Fetch product details from any e-commerce URL
- 🖼️ Extract product images
- 💰 Parse product prices
- 🏪 Identify store name and logo
- 🚀 Easy to deploy and use
- 🌐 CORS enabled for cross-origin requests

## API Endpoints

### POST /fetch
Fetch product metadata by sending a POST request with the product URL.

**Request:**
```bash
curl -X POST http://localhost:3000/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.com/..."}'
```

**Response:**
```json
{
  "url": "https://www.amazon.com/...",
  "title": "Product Title",
  "price": "$99.99",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "store": "Amazon",
  "storeLogo": "https://www.amazon.com/favicon.ico"
}
```

### GET /fetch
Fetch product metadata using a query parameter (useful for browser testing).

**Request:**
```bash
curl "http://localhost:3000/fetch?url=https://www.amazon.com/..."
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/product-fetcher.git
cd product-fetcher
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

4. Build for production:
```bash
npm run build
npm start
```

## Deployment Options

### Option 1: GitHub Pages (Static Demo Only)

GitHub Pages hosts the demo/test page but cannot run the backend API.

1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to main branch
4. The demo page will be available at: `https://yourusername.github.io/product-fetcher/`

**Note:** You'll need to deploy the API separately (see options below) and configure the API URL in the demo page.

### Option 2: Vercel (Recommended for API)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Option 3: Render

1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`

### Option 4: Railway

1. Create account at [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Railway will auto-detect and deploy

### Option 5: Heroku

1. Install Heroku CLI
2. Create new app:
```bash
heroku create your-app-name
git push heroku main
```

## Using with Flutter App

### Example Flutter Code

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ProductFetcher {
  final String apiUrl;

  ProductFetcher({this.apiUrl = 'https://your-api.com'});

  Future<ProductData> fetchProduct(String productUrl) async {
    final response = await http.post(
      Uri.parse('$apiUrl/fetch'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'url': productUrl}),
    );

    if (response.statusCode == 200) {
      return ProductData.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load product');
    }
  }
}

class ProductData {
  final String? title;
  final String? price;
  final List<String> images;
  final String? store;
  final String? storeLogo;

  ProductData({
    this.title,
    this.price,
    required this.images,
    this.store,
    this.storeLogo,
  });

  factory ProductData.fromJson(Map<String, dynamic> json) {
    return ProductData(
      title: json['title'],
      price: json['price'],
      images: List<String>.from(json['images'] ?? []),
      store: json['store'],
      storeLogo: json['storeLogo'],
    );
  }
}

// Usage
void main() async {
  final fetcher = ProductFetcher(apiUrl: 'https://your-deployed-api.com');
  final product = await fetcher.fetchProduct('https://www.amazon.com/...');

  print('Title: ${product.title}');
  print('Price: ${product.price}');
  print('Store: ${product.store}');
}
```

## Environment Variables

- `PORT`: Server port (default: 3000)

## Development

### Project Structure
```
product-fetcher/
├── src/
│   ├── fetchProductMetadata.ts  # Core scraping logic
│   └── server.ts                # Express API server
├── public/
│   └── index.html              # Demo page
├── .github/
│   └── workflows/
│       ├── deploy-pages.yml    # GitHub Pages deployment
│       └── run-fetcher.yml     # Fetcher workflow
├── package.json
└── tsconfig.json
```

### Scripts

- `npm run dev` - Run development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production server
- `npm run fetch <url>` - Fetch product metadata from command line

## Testing

Test the API locally:

```bash
# Start the server
npm run dev

# In another terminal, test the endpoint
curl -X POST http://localhost:3000/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.com/dp/B08N5WRWNW"}'
```

Or open the demo page:
- Open `public/index.html` in your browser
- Or visit the deployed GitHub Pages URL

## Troubleshooting

### CORS Issues
If you encounter CORS errors from your Flutter app:
1. Make sure the API has CORS enabled (already configured)
2. Check that you're using the correct API URL
3. Verify the API is accessible from your network

### Product Not Found
Some websites may block scraping:
- The API uses a browser-like User-Agent
- Some sites require authentication or have anti-scraping measures
- Try different product URLs if issues persist

### Deployment Issues
- Ensure all environment variables are set
- Check build logs for errors
- Verify Node.js version compatibility (18+)

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.