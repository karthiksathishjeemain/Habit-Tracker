# Habit Tracker

A comprehensive habit tracking application featuring user authentication, habit management, and progress visualization.

## Features

- User authentication with JWT
- Flexible habit tracking (daily/weekly/monthly/yearly)
- Interactive progress dashboard
- Data visualization with charts
- Customizable user profiles

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create database:
```sql
CREATE DATABASE habit_tracker;
```

3. Configure environment variables:
```env
PORT=3000
JWT_SECRET=your_secret_key
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=habit_tracker
```

4. Run migrations:
```bash
mysql -u your_username -p habit_tracker < schema.sql
```

5. Start server:
```bash
node server.js
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Install required packages:
```bash
npm install recharts lucide-react @radix-ui/react-alert react-router-dom
npm install -D tailwindcss postcss autoprefixer
```

3. Initialize Tailwind:
```bash
npx tailwindcss init -p
```

4. Start development server:
```bash
npm run dev
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Habits
- `GET /api/habits` - List habits
- `POST /api/habits` - Create habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `POST /api/habits/:id/progress` - Update progress
- `GET /api/habits/:id/progress` - Get progress

### User
- `GET /api/user` - Get profile
- `PUT /api/user` - Update profile

## Project Structure

```bash 
project/
├── ai_recommendation/
│   ├── app.py              
│   └── requirements.txt    
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── habits.js
│   │   └── user.js
│   ├── server.js
│   └── schema.sql
└── frontend/
   ├── src/
   │   ├── components/
   │   │   ├── auth/
   │   │   │   ├── Login.jsx
   │   │   │   └── Register.jsx
   │   │   ├── ui/
   │   │   │   └── Alert.jsx
   │   │   ├── Dashboard.jsx
   │   │   └── UserProfile.jsx
   │   ├── App.jsx
   │   └── main.jsx
   ├── index.html
   └── tailwind.config.js
```

## Usage Guide

1. Register account
2. Login to access dashboard
3. Create habits with title, description, and frequency
4. Track daily progress
5. View analytics in dashboard
6. Manage profile settings

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Submit pull request
## AI Recommendation System

The system provides personalized habit recommendations using machine learning.

### Setup

1. Create virtual environment:
```bash
cd ai_recommendation
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```
2. Install dependencies
```bash
pip install -r requirements.txt
```
3. Start Flask server:
```bash
python app.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For support or queries, create an issue in the repository.