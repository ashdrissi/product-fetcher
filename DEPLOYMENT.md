# 🚀 Quick Deployment Guide

This guide will help you deploy your Product Fetcher API in minutes.

## Option 1: Vercel (Recommended - Free & Fast)

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ashdrissi/product-fetcher)

### Manual Deploy

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Your API will be live!**
   - Vercel will give you a URL like: `https://product-fetcher-xxx.vercel.app`
   - Use this URL in your Flutter app and demo page

### Endpoints:
- `https://your-app.vercel.app/api/fetch` (POST)
- `https://your-app.vercel.app/api/fetch?url=PRODUCT_URL` (GET)
- `https://your-app.vercel.app/api/health` (GET)

---

## Option 2: Render (Free Tier Available)

1. **Go to [Render.com](https://render.com)** and sign up

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file

3. **Configuration (auto-filled from render.yaml):**
   - Name: `product-fetcher-api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for build to complete (~2-3 minutes)

5. **Your API will be live!**
   - URL: `https://product-fetcher-api.onrender.com`
   - Use this in your Flutter app

---

## Option 3: Railway (Easy & Fast)

1. **Go to [Railway.app](https://railway.app)** and sign up

2. **Deploy from GitHub:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select `product-fetcher` repository

3. **Railway auto-detects everything!**
   - No configuration needed
   - Automatically builds and deploys

4. **Get your URL:**
   - Go to Settings → Generate Domain
   - Your API: `https://your-app.up.railway.app`

---

## Option 4: Fly.io (Global Edge Network)

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Launch:**
   ```bash
   fly launch
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

---

## Testing Your Deployment

### Test via cURL:
```bash
curl -X POST https://your-deployed-api.com/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.com/dp/B08N5WRWNW"}'
```

### Test via Demo Page:
1. Go to: `https://ashdrissi.github.io/product-fetcher/`
2. Enter your deployed API URL in Step 1
3. Enter a product URL in Step 2
4. Click "Fetch Product Details"

---

## Using in Flutter App

Once deployed, update your Flutter code:

```dart
final fetcher = ProductFetcher(
  apiUrl: 'https://your-deployed-api.vercel.app'  // Your deployed URL
);

final product = await fetcher.fetchProduct(
  'https://www.amazon.com/dp/B08N5WRWNW'
);
```

---

## Environment Variables (Optional)

Most platforms auto-detect Node.js version from `package.json`. If needed:

- `PORT`: Automatically set by hosting platform
- `NODE_VERSION`: 20.11.0 (set in render.yaml)

---

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify dependencies install: `npm install`
- Test build locally: `npm run build`

### API Returns 404
- Check endpoint path (should include `/api/fetch` for Vercel)
- For other platforms, use `/fetch`

### CORS Errors from Flutter
- CORS is already enabled in the code
- Check that API URL is correct
- Verify API is accessible from your network

### Deployment is Slow
- First deployment takes longer (installs dependencies)
- Subsequent deploys are faster (uses cache)

---

## Cost Comparison

| Platform | Free Tier | Limits |
|----------|-----------|--------|
| **Vercel** | ✅ Yes | 100GB bandwidth/month |
| **Render** | ✅ Yes | Spins down after inactivity |
| **Railway** | ✅ $5 credit/month | ~500 hours |
| **Fly.io** | ✅ Limited | 3 shared VMs |

**Recommendation:** Start with **Vercel** for best performance and reliability.

---

## Need Help?

- Check the [main README](README.md) for full documentation
- Open an issue on GitHub
- Test locally first with `npm run dev`
