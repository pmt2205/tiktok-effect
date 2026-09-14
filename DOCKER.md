# Run the full stack with Docker

The Compose stack contains the Next.js frontend, NestJS backend, and MongoDB.

1. Copy `.env.example` to `.env` and replace the database password and JWT secret.
2. Build and start everything:

   ```bash
   docker compose up --build -d
   ```

3. Open `http://localhost:3000`. The API health endpoint is available at
   `http://localhost:3001/api/health`.

Useful commands:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

MongoDB data and uploaded backend media are stored in named volumes, so a normal
`docker compose down` keeps them. To intentionally remove those volumes as well,
run `docker compose down -v`.

`NEXT_PUBLIC_BACKEND_URL` is embedded during the frontend image build. After
changing it, rebuild the frontend with `docker compose build frontend`.
