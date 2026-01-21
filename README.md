# turbo-spoon

## Project Overview

Turbo Spoon is an experimental full-stack application that explores using an LLM as an email monitoring assistant. The app integrates with Gmail to fetch recent emails and uses OpenAI to generate summaries, action items, and reply recommendations.

**Tech Stack:**
- **Backend:** Node.js + Express (port 3000)
- **Frontend:** Vite + React (port 5173 in development)
- **APIs:** Google Gmail API, OpenAI API

## Local Development

### Prerequisites
- Node.js (v18+)
- npm
- Google OAuth credentials (for Gmail integration)
- OpenAI API key

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd turbo-spoon
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `GOOGLE_REDIRECT_URI` - OAuth redirect URI (e.g., `http://localhost:3000/auth/google/callback`)
   - `GOOGLE_REFRESH_TOKEN` - Google OAuth refresh token (obtain via `/auth/google` flow)
   - `OPENAI_API_KEY` - OpenAI API key

3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   This starts both:
   - Backend server at `http://localhost:3000`
   - Frontend dev server at `http://localhost:5173`
   
   The Vite dev server proxies `/api/*` requests to the backend automatically.

### Development Notes

- Frontend calls the backend using relative `/api/*` URLs
- Vite's proxy configuration (in `frontend/vite.config.js`) forwards `/api` requests to `http://localhost:3000` during development
- Backend API endpoints:
  - `GET /api/emails/recent` - Fetch recent emails from Gmail
  - `POST /api/summarize` - Summarize email content using OpenAI

## Production Build & Deploy

### Building for Production

```bash
npm run build
```

This command:
1. Installs frontend dependencies
2. Builds the React app to `frontend/dist`

### Deployment (Render)

The backend serves the built frontend from `frontend/dist` in production.

1. Set environment variables in Render dashboard (same as `.env.example`)
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. The Express server serves static files from `frontend/dist` and handles API routes at `/api/*`

The production server runs on the port specified by `PORT` environment variable (defaults to 3000).
