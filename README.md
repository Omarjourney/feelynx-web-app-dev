# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/74f85079-0010-42ba-8b2a-06332941ffd9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/74f85079-0010-42ba-8b2a-06332941ffd9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

To check the codebase for linting issues, run:

```sh
npm run lint
```

To create a production build, execute:

```sh
npm run build
```

Tests are not yet configured, but once available you can run them with:

```sh
npm test
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Backend Architecture

The repository already contained a small Express server written in TypeScript.
Instead of introducing a separate FastAPI project we decided to expand this
existing server. Keeping everything in Node.js simplifies the tooling and keeps
the backend code in one place.

The API is located in the `server/` directory. Run it during development with:

```sh
npm run dev:server
```

For a production build, compile the server and the frontend:

```sh
npm run build
```

Start the compiled server with:

```sh
npm start
```

## LiveKit

This project includes a [LiveKit](https://livekit.io) server for real-time video and audio. The service is defined in `docker-compose.yml` and runs on ports `7880` and `7881`.

To enable LiveKit locally:

1. Copy `.env.example` to `.env` and set `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`.
2. Run `docker-compose up` to start the `livekit` container alongside the app.
3. The frontend will connect to `VITE_LIVEKIT_WS_URL` (default `ws://localhost:7880`).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/74f85079-0010-42ba-8b2a-06332941ffd9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
