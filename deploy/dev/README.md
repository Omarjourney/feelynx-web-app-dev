# dev.feelynx.live containerized deployment

This setup serves a Vite-built React frontend via Nginx, proxies API and WebSocket traffic to the backend service, and provides a simple health-check endpoint.

## Directory layout

```
deploy/
  dev/
    docker-compose.yml     # 3 services: frontend (build/publisher), backend (app server), nginx (static+proxy)
    nginx.conf             # HTTP, static serving, /api proxy, /ws WebSocket upgrade, SPA fallback
backend/
  app.py                   # Simple HTTP backend on port 8000
Dockerfile.backend         # Builds backend image
frontend/
  Dockerfile               # Build Vite app, publish dist to shared volume
  entrypoint.sh            # Copies built /app-dist to /dist volume and sleeps
  vite.config.js           # Local dev proxy for /api and WebSocket endpoints
  public/
    ashall.txt             # Fixes 404 for /ashall.txt
```

## Runtime volumes and mounts

- `frontend_dist` (named volume) → holds built frontend artifacts.
  - The `frontend` service writes to `/dist` (mounted volume)
  - Nginx serves from `/usr/share/nginx/html` (same volume)

## How to run

Prereqs:
- Frontend and backend source code present under `frontend/` and `backend/`

Commands:

```bash
cd deploy/dev
docker compose up -d --build
```

Check:

```bash
docker compose ps
docker compose logs -f nginx backend frontend
curl -I http://localhost
curl -I http://localhost/api/health
```

WebSocket should connect at:
`ws://localhost/ws/`

## Notes

- Nginx proxies to `backend:8000` over the internal network.
- The `frontend` container only publishes build artifacts to the shared volume; Nginx serves the static site.
- To update assets, rebuild `frontend` service: `docker compose up -d --build frontend`.
- WebSocket clients should connect to `ws://<your-host>/ws/`.
