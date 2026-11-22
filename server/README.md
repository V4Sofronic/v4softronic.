# V4 Softronic Backend

Run the API separately from the Next.js frontend:

```bash
npm install
npm run dev
```

The API listens on `http://localhost:4000`. Update `CLIENT_ORIGIN` in `.env` when the frontend uses another host or port.

The API uses SQLite (`data/v4softronic.sqlite`) with WAL journaling. On first startup it imports the existing `data/admin-store.json` if present; subsequent reads and writes use SQLite. Keep `.env` private and set a unique, random `ADMIN_SESSION_SECRET` of at least 32 bytes. Admin passwords are stored as scrypt hashes in `ADMIN_PASSWORD_HASH`.

Project opens use a random anonymous browser ID stored in local storage and a coarse device class (mobile, tablet, desktop). Unique counts deduplicate repeat opens per browser and project. Older events created before this tracking was added remain labeled as untracked.

Admin project images are uploaded through the authenticated `POST /api/uploads` endpoint. The server validates and converts supported image formats to WebP, limits uploads to 5 MB, and writes uniquely named files based on the project name into `client/public/images`. The project stores the resulting `/images/...webp` path. Keep that folder writable and persistent where the app is deployed.

The backend is organized into:

- `src/controllers`: request/response orchestration
- `src/middleware`: authentication, validation, security and error handling
- `src/models`: SQLite persistence and credential verification
- `src/routes`: API endpoint declarations
- `src/app.js`: middleware and endpoint wiring
- `src/server.js`: process startup
