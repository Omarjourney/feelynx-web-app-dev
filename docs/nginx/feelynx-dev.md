# NGINX reverse proxy for dev.feelynx.live

Place the following configuration in `/etc/nginx/sites-available/feelynx-dev.conf` to terminate TLS with Let's Encrypt, redirect HTTP to HTTPS, and proxy traffic (including WebSockets) to the Next.js app running on `127.0.0.1:4000`.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name dev.feelynx.live;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dev.feelynx.live;

    ssl_certificate /etc/letsencrypt/live/dev.feelynx.live/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dev.feelynx.live/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 300;
    }

    location /health {
        proxy_pass http://127.0.0.1:4000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Provision TLS certificates

Use Certbot with the NGINX plugin to request and renew certificates:

```bash
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dev.feelynx.live --redirect --hsts --no-eff-email -m infra@feelynx.live
```

The `--redirect` flag configures the HTTP→HTTPS redirect, and Certbot will manage renewal cron jobs automatically.

## Enable, test, and reload NGINX

```bash
sudo ln -sf /etc/nginx/sites-available/feelynx-dev.conf /etc/nginx/sites-enabled/feelynx-dev.conf
sudo nginx -t
sudo systemctl reload nginx
```

Run the same sequence after any configuration changes.
