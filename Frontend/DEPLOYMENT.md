# Deployment Guide for Handballito Time Frontend

This guide covers multiple deployment options for your React app.

## ⚠️ Important: Frontend and Backend are Independent

**Yes, you can deploy your React frontend to Vercel (or any platform) and use your .NET backend hosted anywhere else!**

- **Vercel/Netlify/etc.** only host your **static React files** (HTML, CSS, JS)
- Your **.NET backend** can be hosted on **any platform**:
  - Azure App Service
  - AWS (EC2, Elastic Beanstalk, etc.)
  - Railway
  - Render
  - Heroku
  - Your own server/VPS
  - Anywhere accessible via HTTP/HTTPS

**How it works:**
1. User visits your Vercel-hosted React app
2. React app makes API calls to your .NET backend (wherever it's hosted)
3. They communicate over HTTP/HTTPS - no platform restrictions!

**Example setup:**
- Frontend: `https://handballito-time.vercel.app` (Vercel)
- Backend: `https://api-handballito.azurewebsites.net` (Azure)
- Set `VITE_API_BASE_URL=https://api-handballito.azurewebsites.net/api` in Vercel

## Prerequisites

1. Build your app: `npm run build`
2. Ensure your .NET backend is deployed and accessible
3. Update CORS settings in your .NET backend to allow requests from your frontend domain

## Option 1: Vercel (Recommended - Easiest)

**Best for:** Quick deployment, automatic CI/CD, free tier

### Steps:

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or connect your GitHub repo at [vercel.com](https://vercel.com)

3. **Set Environment Variables** in Vercel dashboard:
   - `VITE_API_BASE_URL` = Your production backend URL (e.g., `https://api.yourdomain.com/api`)

4. **Configure `vercel.json`** (optional, for routing):
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

**Pros:**
- Free tier with generous limits
- Automatic deployments from Git
- Built-in CDN
- Easy environment variable management
- Great performance

**Cons:**
- Platform lock-in (though minimal)

---

## Option 2: Netlify

**Best for:** Similar to Vercel, great free tier

### Steps:

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```
   Or connect your GitHub repo at [netlify.com](https://netlify.com)

3. **Set Environment Variables** in Netlify dashboard:
   - `VITE_API_BASE_URL` = Your production backend URL

4. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

**Pros:**
- Free tier
- Easy Git integration
- Good documentation
- Form handling (if needed)

**Cons:**
- Slightly slower than Vercel in some regions

---

## Option 3: Azure Static Web Apps (Best if using Azure for .NET backend)

**Best for:** If your .NET backend is on Azure

### Steps:

1. **Install Azure Static Web Apps extension** in VS Code, or use Azure Portal

2. **Create Static Web App** in Azure Portal

3. **Set Environment Variables**:
   - `VITE_API_BASE_URL` = Your Azure backend URL

4. **Configure `staticwebapp.config.json`**:
   ```json
   {
     "navigationFallback": {
       "rewrite": "/index.html"
     }
   }
   ```

**Pros:**
- Integrates well with Azure services
- Free tier available
- Good for full-stack Azure solutions

**Cons:**
- More complex setup
- Azure-specific

---

## Option 4: GitHub Pages

**Best for:** Free hosting, simple static sites

### Steps:

1. **Install `gh-pages`**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update `package.json`**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/handballito-time-frontend"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Set Environment Variables**: Use GitHub Actions or build-time replacement

**Pros:**
- Completely free
- Simple
- Good for open source projects

**Cons:**
- No server-side environment variables (need build-time replacement)
- Custom domain requires configuration
- HTTPS only

---

## Option 5: AWS S3 + CloudFront

**Best for:** Enterprise, high traffic, full AWS integration

### Steps:

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Upload to S3**:
   - Create S3 bucket
   - Enable static website hosting
   - Upload `dist` folder contents

3. **Set up CloudFront**:
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom domain (optional)

4. **Environment Variables**: Use build-time replacement or CloudFront functions

**Pros:**
- Highly scalable
- Global CDN
- Enterprise-grade

**Cons:**
- More complex setup
- Costs can add up
- Requires AWS knowledge

---

## Option 6: Railway / Render

**Best for:** Simple deployment, good free tier

### Railway:
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`

### Render:
1. Create new Static Site
2. Connect repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL`

**Pros:**
- Simple setup
- Free tier
- Good for small to medium projects

**Cons:**
- Less popular than Vercel/Netlify
- Fewer features

---

## Important Configuration Steps (All Options)

### 1. Update Backend CORS

In your .NET backend, update CORS to allow your frontend domain. **You need to add your Vercel domain** (or whatever frontend hosting you use):

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "https://your-app.vercel.app",        // Vercel domain
                "https://your-custom-domain.com",     // Custom domain (if you have one)
                "http://localhost:3000"               // Local development
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Don't forget to use it:
app.UseCors("AllowFrontend");
```

**For Vercel specifically:**
- Your app will be at: `https://your-app-name.vercel.app`
- Add this exact URL to your CORS policy
- If you add a custom domain later, add that too

### 2. Environment Variables

For production, set:
- `VITE_API_BASE_URL` = Your production backend URL

**Note:** Vite requires `VITE_` prefix for environment variables to be exposed to the client.

### 3. Test Production Build Locally

```bash
npm run build
npm run preview
```

This builds and serves the production version locally to test before deploying.

---

## Recommended Approach

**For most users:** Start with **Vercel** or **Netlify** - they're the easiest and have great free tiers.

**If using Azure:** Use **Azure Static Web Apps** for better integration.

**For enterprise:** Consider **AWS S3 + CloudFront** or **Azure Static Web Apps**.

---

## Troubleshooting

### Issue: API calls fail after deployment
- Check CORS settings in your .NET backend
- Verify `VITE_API_BASE_URL` is set correctly
- Check browser console for errors
- Ensure backend is accessible from the internet

### Issue: Routes don't work (404 on refresh)
- Configure redirect rules (see options above)
- Ensure all routes redirect to `index.html`

### Issue: Environment variables not working
- Remember: Vite requires `VITE_` prefix
- Rebuild after changing environment variables
- Check that variables are set in deployment platform

