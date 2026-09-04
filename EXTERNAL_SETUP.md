# External setup required

These steps cannot be completed by code:

1. Create or sign in to a Cloudinary account at https://cloudinary.com.
2. In the Cloudinary dashboard, copy the Cloud Name, API Key, and API Secret.
3. Put those values in `server/.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. Keep `server/.env` out of Git and rotate any credential that has been exposed.
5. Start MongoDB and the server (`npm run dev` inside `server`), then start the client (`npm run dev` inside `client`).
6. Register a new account with a unique username. Test a trip photo upload and open `/profile/<username>` in an incognito window.

Cloudinary uploads require valid account credentials and an available Cloudinary plan. The application limits image uploads to 5 MB and accepts JPG, JPEG, PNG, and WebP files.
