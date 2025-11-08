# Vercel Troubleshooting Guide

If you're getting "Access denied" or 403 errors from your Vercel deployment, follow these steps:

## Step 1: Check Vercel Project Settings

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `product-fetcher` project
3. Go to **Settings** → **General**

### Check Protection Settings:

**Option A: Vercel Authentication (Pro/Team plans)**
- If you see "Vercel Authentication" or "Password Protection" enabled, **DISABLE IT**
- This blocks public access to your API

**Option B: Deployment Protection**
- Settings → Deployment Protection
- Make sure it's set to **"None"** or **"Preview Deployments Only"**
- NOT "All Deployments"

## Step 2: Check Environment Variables

1. Go to Settings → Environment Variables
2. Make sure there are NO authentication-related variables like:
   - `VERCEL_PASSWORD`
   - `AUTH_SECRET`
   - `PROTECT_DEPLOYMENT`

## Step 3: Verify Build Settings

1. Go to Settings → General → Build & Development Settings
2. Should be:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (or leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

## Step 4: Check Vercel Firewall

1. Go to Settings → Firewall
2. Make sure:
   - IP blocking is OFF
   - Geo-blocking is OFF (or allows all countries)
   - DDoS Protection: Standard (not Strict)

## Step 5: Re-deploy

After making changes:

```bash
# Via CLI
vercel --prod

# Or via dashboard
# Go to Deployments → ... → Redeploy
```

## Step 6: Test Endpoints

```bash
# Test health endpoint
curl https://product-fetcher-six.vercel.app/api/health

# Test API info
curl https://product-fetcher-six.vercel.app/api

# Test fetch endpoint
curl "https://product-fetcher-six.vercel.app/api/fetch?url=https://www.amazon.com/dp/B08N5WRWNW"
```

## Alternative: Check Vercel Logs

1. Go to Deployments → Latest Deployment
2. Click on Functions
3. Check if `/api/health` is listed
4. Click on it to see logs and errors

## Common Issues

### Issue: "Access denied" on all routes
**Solution**: Disable Vercel Authentication or Deployment Protection

### Issue: Functions not showing in dashboard
**Solution**:
- Verify `api/` folder exists with `.ts` files
- Check that build completed successfully
- Look at build logs for TypeScript errors

### Issue: 500 errors instead of 403
**Solution**: Check function logs for import errors or missing dependencies

## Need More Help?

If still not working, share:
1. Screenshot of Vercel project settings
2. Build logs from latest deployment
3. Function logs from dashboard

## Alternative Deployment

If Vercel issues persist, try deploying to Render instead:

```bash
# See DEPLOYMENT.md for Render instructions
# Render's free tier is more straightforward
```

Render doesn't have these protection layers by default and may be easier to get started with.
