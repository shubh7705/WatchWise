# 🎬 WatchWise

WatchWise is a Django-based movie recommendation and community platform where users can discover movies, write reviews, participate in discussions, and receive personalized recommendations.

## 🛠 Technologies Used

* **Frontend:** React.js, Vite, Lucide Icons, Canvas Confetti, Modern CSS Design System (Glassmorphism & Cinema Dark/Light themes)
* **Backend:** Python, Django, SQLite / PostgreSQL
* **External APIs:** The Movie Database (TMDb) API Integration

## ✨ Features

* Browse and explore movies
* Add reviews and ratings
* Personalized movie recommendations
* Community discussion forums
* User authentication and profiles
* Admin moderation system

## ⚙️ Development Process

1. Designed the database schema and application structure.
2. Built modular Django apps for movies, reviews, users, and discussions.
3. Implemented authentication and authorization.
4. Developed recommendation logic based on user activity.
5. Added discussion forums and review functionality.
6. Optimized database queries and application performance.

## 📚 What I Learned

* Building scalable web applications with Django
* Designing relational databases using Django ORM
* User authentication and access control
* Recommendation system fundamentals
* Structuring large projects with modular architecture
* Performance optimization techniques

## 🚀 Future Improvements

* PostgreSQL migration for production
* Redis caching for faster response times
* Elasticsearch-powered search
* Real-time discussions using WebSockets
* Hybrid recommendation system
* Integration with external movie APIs

## ▶️ Run Locally

```bash
git clone https://github.com/shubh7705/watchwise.git

cd watchwise
```

### 1. Backend (Django)
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

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
