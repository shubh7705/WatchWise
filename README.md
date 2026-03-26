# 🎬 WatchWise – Movie Recommendation & Community Platform

WatchWise is a scalable Django-based web application that enables users to discover, review, and discuss movies in an interactive, community-driven environment. The platform combines personalized recommendations with social features to enhance user engagement and movie discovery.

---

## 🌐 Live Demo

🔗 https://watchwise-k07t.onrender.com/movies/

> ⚠️ Note: The app is hosted on Render (free tier), so it may take a few seconds to load initially.

---

## 🚀 Features

### 🎥 Movie Discovery

* Browse and explore a wide range of movies
* View detailed movie information (description, genres, ratings)
* Submit new movies (admin approval required)

### ⭐ Reviews & Ratings

* Add structured reviews for movies
* Sentiment-based rating system (positive, neutral, negative)
* Community-driven feedback system to boost engagement

### 🤖 Personalized Recommendations

* Recommend movies based on user watch history
* Content-based filtering for relevant suggestions

### 👥 Community Discussions

* Create and participate in group discussions
* Topic-based forums for deeper interaction
* Increased user engagement and session duration

### 🔐 Authentication System

* Secure user registration and login
* User profile management
* Access control for reviews and discussions

---

## 🏗️ Tech Stack

* **Backend:** Django, Python
* **Frontend:** HTML, CSS
* **Database:** SQLite *(PostgreSQL-ready for production scaling)*

---

## ⚙️ System Architecture

* Modular Django architecture with separate apps for:

  * User Management
  * Movie Management
  * Reviews & Ratings
  * Discussion Forums
* Django ORM for efficient database operations
* Admin panel for content moderation (movie approval workflow)

---

## 📊 Performance Optimizations

* Optimized database queries using Django ORM
* Reduced page load latency by ~20%
* Modular architecture for better scalability and maintainability

---

## 🔮 Future Enhancements

* 🔄 Migrate to PostgreSQL for production-level scalability
* ⚡ Integrate Redis for caching and performance optimization
* 🔍 Implement full-text search using Elasticsearch
* 💬 Enable real-time discussions with Django Channels (WebSockets)
* 🎯 Build a hybrid recommendation system (content + collaborative filtering)
* 🌐 Integrate external APIs (e.g., TMDb) for richer movie data

---

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/shubh7705/watchwise.git

# Navigate to project directory
cd watchwise

# Create virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Run the server
python manage.py runserver
```

---

## 📌 Usage

* Register/Login to the platform
* Browse or search for movies
* Add reviews and ratings
* Participate in discussions
* Receive personalized recommendations

---

## 📸 Screenshots (Recommended)

> Add screenshots here to showcase:

* Home page
* Movie details page
* Review system
* Discussion forums

---

## 🤝 Contributing

Contributions are welcome!
Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Shubham Jadhav**
B.Tech @ IIIT Nagpur

---
