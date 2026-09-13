# 🎬 WatchWise

WatchWise is a full-stack movie discovery, review, and community platform featuring personalized recommendations, TMDb integration, and interactive clubs.

## 🛠 Technologies Used

* **Frontend:** React.js, Vite, Lucide Icons, Canvas Confetti, Modern CSS Design System (Glassmorphism & Cinema Dark/Light themes)
* **Backend:** Python, Django, SQLite / PostgreSQL, Django REST framework
* **External APIs:** The Movie Database (TMDb) API Integration

## ✨ Features

* Browse and explore movies with live TMDb search & auto-fill
* Add reviews and ratings with spoiler warnings
* Personalized movie recommendations & Mood Matcher / Vibe Roulette
* Community discussion forums & movie clubs
* User authentication, user profiles & Role-Based Access Control (Admin-only movie management)
* Light and Dark cinema themes

## 📁 Project Structure

```text
WatchWise/
├── backend/                  # Django REST API Backend
│   ├── WatchWise/            # Project configuration & settings
│   ├── accounts/             # Authentication, profile & RBAC
│   ├── movies/               # Movies, TMDb sync & recommendations
│   ├── reviews/              # Reviews & ratings
│   ├── groups/               # Community clubs & discussions
│   ├── media/                # Uploaded movie posters & avatars
│   ├── manage.py             # Django management script
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React.js + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # Reusable UI components & modals
│   │   ├── context/          # MovieContext, AuthContext, ThemeContext
│   │   ├── pages/            # App pages (Home, MovieDetail, Clubs, etc.)
│   │   ├── services/         # Axios API client & endpoints
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## ⚙️ Development Process

1. Designed relational database models and application architecture.
2. Built modular Django apps for movies, reviews, accounts, and discussion clubs.
3. Implemented JWT/session authentication, permissions, and RBAC.
4. Integrated TMDb API for comprehensive movie metadata, trailers, and ratings.
5. Developed high-performance React + Vite frontend with glassmorphism UI.
6. Added personalized recommendations, watchlist, and interactive community features.

## 🚀 Future Improvements

* PostgreSQL migration for production
* Redis caching for faster response times
* Elasticsearch-powered search
* Real-time discussions using WebSockets
* Hybrid recommendation system

## ▶️ Run Locally

```bash
git clone https://github.com/shubh7705/watchwise.git
cd watchwise
```

### 1. Backend (Django)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend API will be running at **`http://127.0.0.1:8000/`**.

### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

## 🌐 Live Demo

https://watchwise-k07t.onrender.com/movies/

> Hosted on Render's free tier, so the initial load may take a few seconds.
