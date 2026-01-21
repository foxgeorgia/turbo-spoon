# Turbo Spoon Frontend

A simple React web application for displaying email summaries.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

The development server includes:
- Hot Module Replacement (HMR) for instant updates
- Fast refresh for React components

## Build for Production

To create a production build:

```bash
npm run build
```

The optimized files will be generated in the `dist/` directory.

## Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Linting

To run ESLint on the codebase:

```bash
npm run lint
```

## Project Structure

- `src/` - Source code
  - `main.jsx` - Application entry point
  - `App.jsx` - Main App component
  - `App.css` - App styles
  - `index.css` - Global styles
- `public/` - Static assets
- `index.html` - HTML template
- `vite.config.js` - Vite configuration
