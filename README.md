# OpenFuel API Frontend

A minimal Vue dashboard for demonstrating the OpenFuel API. It opens directly into an interactive API query panel and a responsive fuel price chart.

## Stack

- Vite
- Vue 3
- Tailwind CSS
- Chart.js via `vue-chartjs`
- GSAP for smooth scroll transitions

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the API base URL:

```bash
VITE_API_BASE_URL=/api
```

For local development, Vite proxies `/api` to `https://open-fuel-api.onrender.com` to avoid browser CORS issues. For a deployed frontend, set `VITE_API_BASE_URL` to your deployed API URL after enabling CORS on the API.

The readonly API endpoints are public. No frontend token is required.

The frontend calls these endpoints:

- `GET /fuel/all`
- `GET /fuel/{fuel_type}/{location}`
- `GET /news`
- `GET /news/{fuel_type}`

Keep local environment overrides in `.env`, which is ignored by git.

## Run Locally

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
