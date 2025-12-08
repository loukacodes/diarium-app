# Diarium

**Write – Track – Grow**

Diarium is a web-based diary app that helps users reflect on their daily lives while automatically analyzing their mood, temporal focus, and category themes using AI. Users can write entries, store them securely, and view comprehensive analytics through visual charts.

---

## 📌 Features

### Core Features
- **Write, edit, and delete diary entries** with rich text support
- **Automatic mood detection** via AI with confidence scores
- **Temporal analysis** - Detects if entries focus on past, present, or future
- **Category analysis** - Identifies themes (work, school, relationship, family, self, society, goals, life)
- **Streak tracking** - Shows consecutive days with entries
- **Date-based filtering** - View entries by specific dates
- **Mood analytics dashboard** with interactive charts and date range filtering
- **Dark mode support** - Toggle between light and dark themes
- **Responsive design** - Works on mobile and desktop

### Analytics & Visualizations
- **Mood Distribution** - Pie chart showing mood frequency
- **Mood Over Time** - Line chart tracking mood scores
- **Weekly Mood Distribution** - Stacked bar chart by week
- **Entry Analysis Charts** - Bar charts for mood, temporal, and category analysis per entry
- **Statistics Dashboard** - Total entries, unique moods, most common mood, average words

---

## 🏗 Tech Stack

### Frontend
- **[React 19](https://react.dev/)** – UI library
- **[TypeScript](https://www.typescriptlang.org/)** – Type safety
- **[Vite](https://vitejs.dev/)** – Build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS framework
- **[Recharts](https://recharts.org/)** – Charting library for analytics
- **[React Day Picker](https://react-day-picker.dev/)** – Date picker component
- **[Radix UI](https://www.radix-ui.com/)** – Accessible UI primitives
- **[Husky](https://typicode.github.io/husky/)** + **[lint-staged](https://github.com/okonet/lint-staged)** – Git hooks for code quality

### Backend
- **[Node.js](https://nodejs.org/)** + **[Express 5](https://expressjs.com/)** – API server
- **[Prisma](https://www.prisma.io/)** – Database ORM
- **[PostgreSQL](https://www.postgresql.org/)** – Database (used for both local and production)
- **[JWT](https://jwt.io/)** – Authentication tokens
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** – Password hashing

### AI/ML Analysis
- **[@xenova/transformers](https://github.com/xenova/transformers.js)** – On-device AI models for mood classification
- **[Natural](https://github.com/NaturalNode/natural)** – Natural language processing (fallback classifier)
- **Custom Text Analyzer** – Keyword-based analysis for temporal and category detection
- **Hybrid Classifier** – Combines Transformers.js and Natural for robust mood detection

---

## 📂 Project Structure

```
diarium-app/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── server.js          # Main server file
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Authentication, CORS, etc.
│   │   ├── lib/
│   │   │   └── prisma.js      # Prisma client instance
│   │   ├── routes/            # API route definitions
│   │   ├── services/           # Business logic
│   │   └── utils/             # Utility functions
│   ├── ml/                     # Machine learning models
│   │   ├── moodClassifier.js              # Natural.js classifier
│   │   ├── moodClassifierHybrid.js         # Hybrid classifier
│   │   ├── transformersClassifier.js       # Transformers.js classifier
│   │   ├── huggingFaceClassifier.js        # Hugging Face API classifier
│   │   ├── textAnalyzer.js                 # Temporal & category analysis
│   │   ├── train-model.js                  # Model training script
│   │   └── test-classifier.js              # Testing utilities
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/       # Database migrations
│   ├── tests/                 # Backend tests
│   └── package.json
│
├── frontend/                   # React web application
│   ├── src/
│   │   ├── main.tsx          # Application entry point
│   │   ├── App.tsx           # Main app component
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components
│   │   │   │   ├── bottom-nav.tsx      # Mobile navigation
│   │   │   │   ├── desktop-nav.tsx     # Desktop navigation
│   │   │   │   ├── nav-icons.tsx       # SVG icons
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   └── ...
│   │   │   └── views/        # Page components
│   │   │       ├── HomeView.tsx        # Write entries, calendar
│   │   │       ├── EntriesView.tsx     # List of entries
│   │   │       ├── EntryDetailView.tsx # Entry details with charts
│   │   │       ├── MoodView.tsx        # Analytics dashboard
│   │   │       ├── ProfileView.tsx      # User profile
│   │   │       └── AuthView.tsx         # Login/Register
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useDarkMode.ts
│   │   │   └── useEntries.ts
│   │   ├── services/         # API services
│   │   │   └── moodService.ts
│   │   ├── types/            # TypeScript types
│   │   │   └── index.ts
│   │   ├── utils/            # Utility functions
│   │   │   └── helpers.ts
│   │   └── config/
│   │       └── api.ts        # API configuration
│   ├── public/               # Static assets
│   ├── dist/                 # Build output
│   └── package.json
│
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v20 or higher)
- **npm** or **yarn**
- **Git**

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up PostgreSQL database:**
   
   Install PostgreSQL locally if you haven't already:
   - **macOS**: `brew install postgresql@16` then `brew services start postgresql@16`
   - **Linux**: `sudo apt-get install postgresql` (Ubuntu/Debian)
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

   Create a database:
   ```bash
   createdb diarium
   # Or using psql:
   psql postgres
   CREATE DATABASE diarium;
   \q
   ```

4. **Set up environment variables:**
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://localhost:5432/diarium?schema=public"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
```

   **Note:** Replace the database connection string with your PostgreSQL credentials if needed:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/diarium?schema=public"
   ```

5. **Set up database:**
```bash
npx prisma generate
npx prisma db push
```

6. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API URL:**
Update `src/config/api.ts` with your backend URL:
```typescript
const API_URL = 'http://localhost:3000';
export default API_URL;
```

4. **Start the development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port Vite assigns)

### Database Management

#### Prisma Studio (Visual Database Browser)
```bash
cd backend
npx prisma studio
```
- **URL:** http://localhost:5555
- **Features:** View, edit, and manage database records
- **Collections:** User, Entry tables

#### Database Schema
- **User**: id, email, name, password, createdAt
- **Entry**: id, content, mood, moods (JSON), moodScore, temporal (JSON), category (JSON), createdAt, updatedAt, userId

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Entries
- `GET /api/entries` - Get all entries (authenticated)
- `GET /api/entries/:id` - Get entry by ID (authenticated)
- `POST /api/entries` - Create new entry (authenticated)
- `DELETE /api/entries/:id` - Delete entry (authenticated)

### Analysis
- `POST /api/analyze-mood` - Analyze text for mood, temporal, and category

### Database
- `GET /api/database` - Database overview (development)

---

## 🧠 AI/ML Analysis

The app uses a hybrid approach for mood analysis:

1. **Primary**: Transformers.js (on-device, works offline after initial download)
2. **Fallback**: Natural.js classifier (always works offline)
3. **Optional**: Hugging Face API (requires API key)

### Analysis Types

- **Mood Analysis**: Detects emotions (happy, sad, anxious, calm, etc.) with confidence scores
- **Temporal Analysis**: Identifies if entry focuses on past, present, or future
- **Category Analysis**: Categorizes entries (work, school, relationship, family, self, society, goals, life)

---

## 🎨 Features in Detail

### Entry Analysis
Each entry displays:
- **Mood Analysis Chart** - Bar chart showing top moods with confidence
- **Temporal Focus Chart** - Bar chart showing past/present/future distribution
- **Category Focus Chart** - Bar chart showing category distribution

### Mood Analytics Dashboard
- **Date Range Filtering** - Preset options (All Time, Last 7/30/90 Days) or custom range
- **Mood Distribution** - Pie chart with legend
- **Mood Over Time** - Line chart tracking mood scores
- **Weekly Distribution** - Stacked bar chart by week
- **Statistics** - Total entries, unique moods, most common mood, average words

### Calendar Integration
- **Visual Indicators** - Dates with entries are highlighted
- **Date Selection** - Click any date to view entries for that day
- **Streak Display** - Shows consecutive days with entries

---

## 🛠 Development

### Code Quality
- **ESLint** - Code linting with TypeScript support
- **Pre-commit Hooks** - Automatically lint staged files
- **TypeScript** - Full type safety

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

---

## 📱 Deployment

### Backend
- Configured for **Render** (see `render.yaml`)
- Uses **PostgreSQL** for both local development and production
- Environment variables required: `DATABASE_URL`, `JWT_SECRET`, `PORT`, `NODE_ENV`

### Frontend
- Configured for **Vercel** (see `vercel.json`)
- Static build output in `dist/` directory
- Update API URL in production environment

---

## 📝 License

MIT

---

## 👤 Author

Louka Tran
