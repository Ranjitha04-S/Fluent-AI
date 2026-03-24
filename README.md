# 🎓 FluentAI — AI-Powered English Learning Platform

A full-stack MERN application for English learning with AI, authentication, and Google Ads support.

## ✨ Features

| Module | Description |
|--------|-------------|
| 📖 Reading | AI articles with custom prompt / random. 3 levels. Tongue Twister tab. |
| 💬 Vocabulary | 5 words/batch, custom topic, must review all 5 to unlock next batch |
| 🎯 Speaking & Writing | Custom or random topics, 6 types, timer, write or speak, AI scoring |
| 📝 Grammar | 20+ topics, MCQ + fill-in-blank quizzes, structured AI lessons |
| 🤖 AI Conversation | Infinite conversation with AI in 7+ scenarios, grammar correction |
| 🎙️ Recording Studio | Record, playback, AI analysis, download |

## 🚀 Tech Stack

- **Frontend**: React.js, React Router v6, Axios, CSS3
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Auth**: JWT + Google OAuth 2.0 (Passport.js)
- **AI**: Groq API (Llama 3.3 70B — FREE)
- **Ads**: Google AdSense placeholders (ready to activate)

---

## 📦 Setup Instructions

### Step 1: Clone & Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### Step 2: MongoDB Setup
- Install MongoDB locally OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud)
- Copy the connection string

### Step 3: Google OAuth Setup
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → Enable "Google+ API" and "Google OAuth2"
3. Go to Credentials → Create OAuth 2.0 Client ID
4. Add Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
5. Copy Client ID and Client Secret

### Step 4: Server Environment Variables

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fluentai
JWT_SECRET=your_very_secret_jwt_key_change_this
CLIENT_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### Step 5: Start the App

```bash
# Terminal 1 — Start server
cd server
npm run dev

# Terminal 2 — Start client
cd client
npm start
```

Open: **http://localhost:3000**

---

## 🔑 Groq API Key (Free)

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Sign in with Google (free, no credit card)
3. Click "Create API Key"
4. Add it in the app → Settings page

---

## 📢 Google AdSense Setup

1. Apply at [adsense.google.com](https://adsense.google.com) with your live domain
2. Wait for approval (1-2 weeks)
3. Get your Publisher ID (ca-pub-XXXXXXXX)
4. In `client/public/index.html`, uncomment and update the AdSense script
5. Replace `<div className="ad-banner">` placeholders in each page with `<ins>` tags

---

## 🌐 Deployment (Free Options)

### Option A: Render.com (Recommended)
1. Push code to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set root directory to `server`, build command: `npm install`
4. Add all environment variables
5. Deploy client to [netlify.com](https://netlify.com) or [vercel.com](https://vercel.com)

### Option B: Railway.app
1. Connect GitHub repo
2. Add environment variables
3. Deploy both server and client

### Option C: VPS (DigitalOcean/Hostinger)
```bash
# Install PM2
npm install -g pm2

# Build client
cd client && npm run build

# Serve client with Express (add to server/index.js)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));

# Start with PM2
pm2 start server/index.js --name fluentai
```

---

## 📁 Project Structure

```
fluent-mern/
├── server/
│   ├── index.js              # Express app entry
│   ├── models/User.js        # MongoDB User model
│   ├── routes/
│   │   ├── auth.js           # Login, Register, Google OAuth
│   │   ├── user.js           # Stats, Goals, API key
│   │   └── ai.js             # All AI routes (Groq)
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   └── passport.js       # Google OAuth strategy
│   └── .env.example
│
└── client/
    ├── public/index.html     # HTML with AdSense placeholder
    └── src/
        ├── App.js            # Routes
        ├── context/AuthContext.js
        ├── utils/api.js      # Axios instance
        ├── styles/global.css # Full design system
        ├── components/layout/Layout.js
        └── pages/
            ├── LandingPage.js
            ├── LoginPage.js (+ RegisterPage)
            ├── Dashboard.js
            ├── ReadingPage.js
            ├── VocabularyPage.js
            ├── PracticePage.js
            ├── GrammarPage.js
            ├── StudioPage.js
            └── SettingsPage.js
```

---

## 📄 Resume Description

**FluentAI — AI-Powered English Learning Platform**

> Full-stack MERN application with JWT + Google OAuth authentication, AI-generated learning content via Groq API (Llama 3.3 70B), real-time speech recognition, audio recording, and Google AdSense integration.

**Tech:** React.js, Node.js, Express.js, MongoDB, Passport.js, JWT, Groq API, Web Speech API, MediaRecorder API, CSS3

---

Built with ❤️ using MERN Stack + Groq AI
