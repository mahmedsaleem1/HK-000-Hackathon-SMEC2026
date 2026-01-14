# Air Quality Checker - Task 01

A single-page application to check air pollution levels using the OpenWeatherMap Air Pollution API.

## Features

- Enter any city name to check air quality
- Displays Air Quality Index (1-5 scale)
- Shows detailed pollutant concentrations (SO₂, NO₂, PM₁₀, PM₂.₅, O₃, CO)
- Color-coded status indicators
- Reference table for pollution thresholds
- Search history saved to MongoDB

## Tech Stack

- **Frontend:** React 18 with TypeScript
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **API:** OpenWeatherMap Air Pollution API

## Project Structure

```
Task01/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/     # UI components
│       ├── services/       # API calls
│       ├── types/          # TypeScript types
│       ├── utils/          # Helper functions
│       ├── App.tsx
│       └── index.tsx
└── server/                 # Express backend
    └── src/
        ├── controllers/    # Request handlers
        ├── models/         # MongoDB schemas
        ├── routes/         # API routes
        └── app.ts          # Server entry
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally
- OpenWeatherMap API key

### 1. Get API Key
1. Go to https://openweathermap.org/api
2. Sign up and get a free API key
3. Subscribe to Air Pollution API

### 2. Setup Server
```bash
cd Task01/server
npm install
```

Create `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/airpollution
WEATHER_API_KEY=your_api_key_here
```

Start server:
```bash
npm run dev
```

### 3. Setup Client
```bash
cd Task01/client
npm install
npm start
```

Open http://localhost:3000 in browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/pollution/check | Check air quality for a location |
| GET | /api/pollution/history | Get recent search history |

## Air Quality Index Scale

| Index | Quality | Description |
|-------|---------|-------------|
| 1 | Good | Air quality is satisfactory |
| 2 | Fair | Acceptable for most people |
| 3 | Moderate | Sensitive groups may be affected |
| 4 | Poor | Health effects for everyone |
| 5 | Very Poor | Emergency conditions |

## Screenshots

The app displays:
- Search input for city name
- Air Quality Index with color badge
- Grid of pollutant values with status
- Reference table with threshold ranges
