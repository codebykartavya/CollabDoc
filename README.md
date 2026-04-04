# CollabDoc - Real-time Collaborative Text Editor
A real-time collaborative document editor built for GUVI Hackathon.
## Live Demo
- Frontend: https://collab-doc-psi.vercel.app
- Backend: https://collabdoc-backend-fd3g.onrender.com
## Features

- Real-time sync via Yjs CRDT
- Colored cursors with name labels per user
- User presence indicators
- Document persistence and revision history
- Dark and Light mode toggle
- Speech to text, live emoji reactions
- Pomodoro timer synced for all collaborators
- Export as PDF, Markdown and Plain Text
- Offline support and QR code sharing
- Document locking, tags and pinning

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Editor | TipTap v2, Yjs CRDT |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Deployment | Vercel + Render |

---

## Setup Instructions
Clone the repository and navigate to the project folder.
```bash
git clone https://github.com/codebykartavya/CollabDoc.git
cd CollabDoc/collabdoc
```
To start the backend, go to the server folder, install dependencies and run the dev server.
```bash
cd server
npm install
npm run dev
```
To start the frontend, open a new terminal, go to the client folder and do the same.
```bash
cd client
npm install
npm run dev
```

Create a .env file inside the server folder with the following values.
PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173

Create a .env file inside the client folder with the following values.
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
---

## AI Tools Used
| Tool | Usage |
|------|-------|
| Claude (Anthropic) | Planning and debugging assistance |
| Antigravity | Editor and bug fixer |

---
## Known Limitations
- Application is optimized for desktop only
- Speech to text works only on Chrome
- Free tier backend may have a cold start delay on first request
---
## Developer
Kartavya Jaiswal
GitHub: https://github.com/codebykartavya
