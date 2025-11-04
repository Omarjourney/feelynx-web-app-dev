Feelynx — Deployment artifacts

What is here
- feelynx-frontend.tar.gz  — Docker image archive for frontend (nginx + built dist)
- feelynx-backend.tar.gz   — Docker image archive for backend (uvicorn + FastAPI)

How to load images on another host
1. Copy the .tar.gz files to the target host (scp, rsync, or transfer via your preferred method).
2. On the target host, run:

```bash
# Optional: create a directory and copy files there
mkdir -p ~/feelynx-artifacts && cd ~/feelynx-artifacts
# Uncompress
gunzip feelynx-frontend.tar.gz
gunzip feelynx-backend.tar.gz
# Load images into Docker
docker load -i feelynx-frontend.tar
docker load -i feelynx-backend.tar
# Verify images exist
docker images | grep feelynx
```

Tagging and pushing to a registry
If you want to push images to a registry (Docker Hub, ECR, GCR), tag them and push. Example Docker Hub flow:

```bash
# Tag images for Docker Hub (replace <username> with your Docker Hub user)
docker tag feelynx-web-app-dev-fresh-frontend:latest <username>/feelynx-frontend:latest
docker tag feelynx-web-app-dev-fresh-backend:latest <username>/feelynx-backend:latest
# Log in
docker login --username <username>
# Push
docker push <username>/feelynx-frontend:latest
docker push <username>/feelynx-backend:latest
```

ECR (AWS) example
1. Create an ECR repo and get login:
   aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
2. Tag and push:
   docker tag feelynx-web-app-dev-fresh-frontend:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/feelynx-frontend:latest
   docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/feelynx-frontend:latest

Notes
- LIVEKIT_KEYS: The docker-compose in this project warns if LIVEKIT_KEYS is unset. If you rely on LiveKit features, set the environment variable before starting the stack.
- Python venv: The host used to build images lacked python3-venv/pip for creating a local venv; running the backend in Docker avoids that issue.

Kubernetes
----------
There is a set of example Kubernetes manifests under `artifacts/k8s/` that were added alongside these artifacts:

- `frontend-deployment.yaml`, `frontend-service.yaml`
- `backend-deployment.yaml`, `backend-service.yaml`
- `ingress.yaml` (example routing; requires an ingress controller such as nginx)

Apply them with:

```bash
kubectl apply -f artifacts/k8s/
```

Notes on k8s deployments:
- The manifests reference local image names `feelynx-web-app-dev-fresh-frontend:latest` and `feelynx-web-app-dev-fresh-backend:latest`.
   - If you load the `.tar.gz` images on the cluster nodes (via `docker load`), those tags will work.
   - If you push to a registry, update the `image:` fields to point to the registry (or use imagePullSecrets).
- The backend manifest includes an environment placeholder for `LIVEKIT_KEYS` — use a Kubernetes Secret and mount it as an env var for production.

GitHub Actions
--------------
A workflow was added at `.github/workflows/docker-build-push.yml` which builds the frontend and backend images with Docker Buildx. It can optionally push to Docker Hub when the repository contains `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` (or equivalent) secrets.

Push script
-----------
If you prefer to push images manually from this host, use the `artifacts/push_images.sh` helper:

```bash
# Example: push to Docker Hub under your username
./artifacts/push_images.sh docker.io/<your-dockerhub-username>

# Example: push to AWS ECR (login required first)
./artifacts/push_images.sh <aws_account_id>.dkr.ecr.<region>.amazonaws.com
```

Next steps I can take for you (pick one):
- Push the images to a registry (you provide credentials or set them in env/secrets on this host).
- Create Kubernetes Secrets + a k8s Namespace and apply the manifests directly (requires kubeconfig).
- Wire up a GitHub Actions secretless dry-run and artifact upload so the workflow can produce tarballs in Actions.

If you'd like me to proceed with any of these, tell me which one and provide credentials/access as needed.
