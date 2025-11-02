# dev.feelynx.live containerized deployment

This setup serves a Vite-built React frontend over HTTPS via Nginx, proxies API and WebSocket (Socket.io) traffic to a Node.js backend, and mounts production TLS certs for `dev.feelynx.live`.

## Directory layout

```
deploy/
  dev/
    docker-compose.yml     # 3 services: frontend (build/publisher), backend (Express+Socket.io), nginx (TLS proxy)
    nginx.conf             # HTTPS, static serving, /api and /socket.io proxy, HTTP->HTTPS redirect
api/
  Dockerfile               # Backend image build
  package.json             # Express + Socket.io deps
  server.js                # Backend app listening on :3001
frontend/
  Dockerfile               # Build Vite app, publish dist to shared volume
  entrypoint.sh            # Copies built /app-dist to /dist volume and sleeps
  vite.config.js           # Local dev proxy for /api and /socket.io
  public/
    ashall.txt             # Fixes 404 for /ashall.txt
```

## Runtime volumes and mounts

- `certs` (named volume) → binds host directory `/etc/letsencrypt/live/dev.feelynx.live` into Nginx at the same path.
- `frontend_dist` (named volume) → holds built frontend artifacts.
  - The `frontend` service writes to `/dist` (mounted volume)
  - Nginx serves from `/usr/share/nginx/html` (same volume)

## How to run

Prereqs:
- Host has valid certs at `/etc/letsencrypt/live/dev.feelynx.live/{fullchain.pem,privkey.pem}`
- Frontend and backend source code present under `frontend/` and `api/`

Commands:

```bash
cd deploy/dev
docker compose up -d --build
```

Check:

```bash
docker compose ps
docker compose logs -f nginx backend frontend
curl -I https://dev.feelynx.live
curl -I https://dev.feelynx.live/api/health
```

WebSocket should connect at:
`wss://dev.feelynx.live/socket.io/?EIO=4&transport=websocket`

## CORS

Backend honors `CORS_ORIGIN=https://dev.feelynx.live` (set in compose). If your origin differs, update `CORS_ORIGIN` and rebuild.

## Notes

- Nginx terminates TLS and proxies to `backend:3001` over the internal network.
- The `frontend` container only publishes build artifacts to the shared volume; Nginx serves the static site.
- To update assets, rebuild `frontend` service: `docker compose up -d --build frontend`.
