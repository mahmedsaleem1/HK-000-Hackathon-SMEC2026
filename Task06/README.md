# Collab - Video Conferencing & Collaboration Tool

A clean, minimalistic video conferencing app with real-time collaboration features.

## Features

- **Video Calling** - Multi-user video calls with WebRTC
- **Screen Sharing** - Share your screen with participants
- **File Sharing** - Upload and download files during meetings
- **Whiteboard** - Draw and write together in real-time
- **Chat** - Text messaging during calls

## Quick Start

### Server

```bash
cd SoruceCode/Server
npm install
npm run dev
```

Runs on `http://localhost:5000`

### Client

```bash
cd SoruceCode/Client
npm install
npm run dev
```

Runs on `http://localhost:5173`

## How to Use

1. Open the app and enter your name
2. Click **Start new meeting** to create a room
3. Share the room code with others
4. Others enter the code and click **Join meeting**

### Controls

- 🎤 Toggle microphone
- 📹 Toggle camera
- 🖥️ Share screen
- ✏️ Open whiteboard
- 📞 Leave meeting

### Whiteboard Tools

- Pen and eraser
- Color selection
- Adjustable stroke size
- Clear canvas

## Tech Stack

**Client:** React, Vite, Socket.io-client, Simple-peer

**Server:** Node.js, Express, Socket.io, Multer

## Project Structure

```
SoruceCode/
├── Client/
│   └── src/
│       ├── components/     # UI components
│       ├── pages/          # Home and Room pages
│       └── services/       # Socket and API services
└── Server/
    └── src/
        ├── controllers/    # Request handlers
        ├── routes/         # API routes
        ├── services/       # Socket handling
        └── middlewares/    # File upload middleware
```
