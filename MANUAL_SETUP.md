# Manual Setup Required

The application uses the existing MongoDB connection and JWT settings from `server/.env`. Before running the app:

1. Create or start a MongoDB Atlas database and allow the development machine's IP address in the Atlas Network Access list.
2. Set `MONGO_URI` to the connection string for that database.
3. Set `JWT_SECRET` to a private random value.
4. Set `PORT=5050` unless the frontend proxy is updated to match another port.

Keep `server/.env` local. It is ignored by Git and must not be committed.

No separate database migration is required. Mongoose creates the `trips` collection when the first trip is created.
