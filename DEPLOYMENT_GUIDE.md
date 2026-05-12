# 🚀 House of Styles - Deployment Guide (Render)

Follow these steps to put your project online for free using Render.

## Step 1: Push your code to GitHub
If you haven't already, create a new repository on GitHub and push your project there:
```bash
git init
git add .
git commit -m "Initial commit for House of Styles"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Deploy Backend to Render
1.  Go to [dashboard.render.com](https://dashboard.render.com) and log in.
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Name**: `house-of-styles-backend`
    *   **Root Directory**: `website/backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Click "Advanced"):
    *   `MONGODB_ATLAS_URI`: *Paste your MongoDB Atlas link here*
    *   `JWT_SECRET`: *Create a random password*
    *   `CORS_ORIGIN`: Your frontend URL, for example `https://house-of-styles-frontend.onrender.com`
6.  The backend checks starter products and membership tiers automatically after MongoDB connects. You can also run the seed manually:
    ```bash
    cd website/backend
    npm run seed
    ```

## Step 3: Deploy Website to Render
1.  Click **"New +"** and select **"Static Site"**.
2.  Connect the same GitHub repository.
3.  **Settings**:
    *   **Name**: `house-of-styles-frontend`
    *   **Root Directory**: `website`
    *   **Build Command**: *(Leave empty)*
    *   **Publish Directory**: `.`
4.  Click **"Create Static Site"**.

---

## 🔗 Connecting Frontend to Backend
Once your backend is deployed, Render will give you a URL (e.g., `https://house-of-styles-backend.onrender.com`).

1. Open `website/runtime-config.js` in your code.
2. Update `backendOrigin` to your deployed backend URL (Render `onrender.com` URL or your custom domain).
3. Push the change to GitHub, and Render will automatically update your site!
