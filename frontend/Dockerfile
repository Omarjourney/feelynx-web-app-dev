# Build stage: build Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Expect a Vite project in this directory
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner stage: publish built assets to shared volume
FROM alpine:3.20
RUN apk add --no-cache bash coreutils
WORKDIR /runner
COPY --from=build /app/dist /app-dist
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose a mount point where nginx will read static files from
VOLUME ["/dist"]

CMD ["/entrypoint.sh"]
