#!/usr/bin/env bash
set -euo pipefail

# Usage: ./push_images.sh <registry-prefix>
# Example: ./push_images.sh docker.io/youruser

REG_PREFIX=${1:-}
if [[ -z "$REG_PREFIX" ]]; then
  echo "Usage: $0 <registry-prefix>  e.g. docker.io/youruser or <aws_account>.dkr.ecr.<region>.amazonaws.com"
  exit 2
fi

FRONT_IMG=feelynx-web-app-dev-fresh-frontend:latest
BACK_IMG=feelynx-web-app-dev-fresh-backend:latest

echo "Tagging images for push to: $REG_PREFIX"
docker tag "$FRONT_IMG" "$REG_PREFIX/feelynx-frontend:latest"
docker tag "$BACK_IMG" "$REG_PREFIX/feelynx-backend:latest"

echo "Pushing images (you must be logged in: docker login)
"
docker push "$REG_PREFIX/feelynx-frontend:latest"
docker push "$REG_PREFIX/feelynx-backend:latest"

echo "Done."
