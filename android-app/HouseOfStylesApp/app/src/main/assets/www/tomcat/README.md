# Apache Tomcat Deployment

This folder contains deployment guidance for serving the House of Styles website using Apache Tomcat.

## What this is for

- The Node backend remains the API server and should run separately on `http://localhost:5001`.
- Apache Tomcat can serve the static website content from the `website/` folder as a Java webapp.
- MongoDB is optional and the backend supports demo mode without an external database.

## Deployment steps

1. Install Apache Tomcat (version 9 or 10 recommended).
2. Copy the static website files from the root `website/` folder into Tomcat's `webapps/ROOT` directory.
   - Example:
     ```bash
     cp -R /path/to/website/* /path/to/tomcat/webapps/ROOT/
     ```
3. Start Tomcat.
4. Confirm the website is served at `http://localhost:8080`.
5. Start the backend API separately:
   ```bash
   cd /path/to/website/backend
   npm install
   npm run dev
   ```
6. Update any frontend API references if the backend is on a different host or port.

## Notes

- The backend API base URL is `http://localhost:5001/api` by default.
- The site can still call the backend from Tomcat as long as CORS is enabled for the frontend origin.
- If you want to use Tomcat as a reverse proxy to the Node backend, configure Tomcat's `RewriteValve` or use an HTTP proxy in front of Tomcat.

## Demo mode

- If no `MONGODB_URI` or `MONGODB_ATLAS_URI` is configured, the backend will run in demo mode with sample data.
- This allows the project to run without installing MongoDB.
