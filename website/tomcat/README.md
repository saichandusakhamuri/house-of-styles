# Apache Tomcat Deployment

This folder contains deployment guidance for serving the House of Styles website with Apache Tomcat.

## What This Is For

- Apache Tomcat serves the static website files from `website/`.
- The optional Node API can run separately on `http://localhost:5001`.
- MongoDB is no longer required for browsing products. The product catalog and membership tiers are served from static backend data.
- Database-backed features such as real accounts, order history, admin product editing, and payment confirmation are disabled in this static catalog build.

## Deployment Steps

1. Install Apache Tomcat 9 or 10.
2. Copy the static website files from `website/` into Tomcat's `webapps/ROOT` directory.
   ```bash
   cp -R /path/to/website/* /path/to/tomcat/webapps/ROOT/
   ```
3. Start Tomcat.
4. Confirm the website is served at `http://localhost:8080`.
5. Start the optional product API separately if you want the frontend to fetch `/api/products` from Node:
   ```bash
   cd /path/to/website/backend
   npm install
   npm start
   ```

## Notes

- The backend API base URL is `http://localhost:5001/api` by default.
- CORS already allows Tomcat local origins: `http://localhost:8080` and `http://127.0.0.1:8080`.
- If you only need the static storefront UI, Tomcat can serve `index.html` directly without starting the Node API.
