# Diarium

**Write – Track – Grow**

Diarium is a cross-platform diary app that helps users reflect on their daily lives while automatically analyzing their mood using AI. Users can write entries, store them securely, and view mood trends over time through visual charts.

---

## 📌 Features
- Write, edit, and delete diary entries
- Automatic mood detection via AI
- View insights for each entry
- Track emotional trends with charts
- Cross-platform: Android & iOS (React Native)
- Secure storage via backend & database

---

## 🏗 Tech Stack

### Frontend
- [React Native](https://reactnative.dev/) – cross-platform mobile development  
- [React Query](https://tanstack.com/query) – data fetching and caching  
- [Victory Native / Recharts](https://formidable.com/open-source/victory/) – mood trend charts  

### Backend
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) – API server  
- AI integration (Hugging Face API / OpenAI for mood analysis)  
- Hosted on [Render](https://render.com/) / [Heroku](https://www.heroku.com/)  

### Database
- [MongoDB Atlas](https://www.mongodb.com/atlas) – cloud-based NoSQL database  

---

## 📂 Project Structure

```
diarium-app/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Main server file
│   ├── tests/              # Backend tests
│   └── package.json        # Backend dependencies
├── frontend/               # React Native mobile app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── screens/        # App screens
│   │   ├── navigation/     # Navigation setup
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── assets/         # Images, fonts, etc.
│   ├── App.js              # Main app component
│   ├── app.json            # Expo configuration
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account
- Expo CLI (for mobile development)

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
