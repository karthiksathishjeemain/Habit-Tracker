from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import random

app = Flask(__name__)
CORS(app)


habit_database = {
    "health": [
        {
            "title": "Drink Water",
            "description": "Stay hydrated by drinking 8 glasses of water daily.",
            "category": "health",
            "difficulty": "easy",
            "duration_minutes": 5,
            "tags": ["wellness", "physical", "nutrition"],
            "time_of_day": ["morning", "afternoon", "evening"]
        },
        {
            "title": "Morning Stretch",
            "description": "Start your day with a 5-minute stretching session.",
            "category": "health",
            "difficulty": "easy",
            "duration_minutes": 5,
            "tags": ["wellness", "physical", "exercise"],
            "time_of_day": ["morning"]
        },
        {
            "title": "Meditation",
            "description": "Practice mindfulness for 10 minutes daily.",
            "category": "health",
            "difficulty": "medium",
            "duration_minutes": 10,
            "tags": ["wellness", "mental", "mindfulness"],
            "time_of_day": ["morning", "evening"]
        }
    ],
    "productivity": [
        {
            "title": "Time Blocking",
            "description": "Plan your day using time blocks for better productivity.",
            "category": "productivity",
            "difficulty": "medium",
            "duration_minutes": 15,
            "tags": ["organization", "planning", "work"],
            "time_of_day": ["morning"]
        },
        {
            "title": "Digital Detox Hour",
            "description": "Spend one hour daily without any digital devices.",
            "category": "productivity",
            "difficulty": "hard",
            "duration_minutes": 60,
            "tags": ["focus", "mental", "wellness"],
            "time_of_day": ["afternoon", "evening"]
        }
    ],
    "learning": [
        {
            "title": "Read a Book",
            "description": "Develop your mind by reading at least 20 pages daily.",
            "category": "learning",
            "difficulty": "medium",
            "duration_minutes": 30,
            "tags": ["education", "mental", "focus"],
            "time_of_day": ["morning", "evening"]
        },
        {
            "title": "Learn New Skill",
            "description": "Spend 30 minutes learning something new.",
            "category": "learning",
            "difficulty": "hard",
            "duration_minutes": 30,
            "tags": ["education", "growth", "focus"],
            "time_of_day": ["afternoon"]
        }
    ]
}

class HabitRecommender:
    def __init__(self):
       
        self.habits_df = self._create_habits_df()
    
        self.feature_matrix = self._create_feature_matrix()
   
        self.kmeans = KMeans(n_clusters=3, random_state=42)
        self.kmeans.fit(self.feature_matrix)
        
    def _create_habits_df(self):
        """Convert habit database to DataFrame format"""
        habits = []
        for category, category_habits in habit_database.items():
            for habit in category_habits:
                habits.append(habit)
        return pd.DataFrame(habits)
    
    def _create_feature_matrix(self):
        """Create a numerical feature matrix for habits"""
     
        enc = OneHotEncoder(sparse_output=False)
        
       
        category_encoded = enc.fit_transform(self.habits_df[['category']])
        
        difficulty_map = {'easy': 0, 'medium': 1, 'hard': 2}
        difficulty_encoded = self.habits_df['difficulty'].map(difficulty_map).values.reshape(-1, 1)
        
        all_tags = set()
        for tags in self.habits_df['tags']:
            all_tags.update(tags)
        tag_matrix = np.zeros((len(self.habits_df), len(all_tags)))
        for i, tags in enumerate(self.habits_df['tags']):
            for j, tag in enumerate(all_tags):
                tag_matrix[i, j] = 1 if tag in tags else 0
                
  
        return np.hstack([category_encoded, difficulty_encoded, tag_matrix])
    
    def get_recommendations(self, user_habits=None, n_recommendations=3):
        """Generate recommendations based on user's existing habits"""
        if not user_habits or len(user_habits) == 0:
        
            cluster_labels = self.kmeans.labels_
            recommendations = []
            for cluster in range(self.kmeans.n_clusters):
                cluster_habits = self.habits_df[cluster_labels == cluster]
                if len(cluster_habits) > 0:
                    recommendations.append(cluster_habits.iloc[random.randint(0, len(cluster_habits)-1)])
            
            while len(recommendations) < n_recommendations:
                random_habit = self.habits_df.iloc[random.randint(0, len(self.habits_df)-1)]
                if random_habit not in recommendations:
                    recommendations.append(random_habit)
                    
            return recommendations
        
        user_habits_df = pd.DataFrame(user_habits)
        user_feature_matrix = self._create_feature_matrix()
        
        user_centroid = user_feature_matrix.mean(axis=0).reshape(1, -1)
        similarities = cosine_similarity(user_centroid, self.feature_matrix)
        
        similar_indices = similarities[0].argsort()[::-1]
        recommendations = []
        for idx in similar_indices:
            habit = self.habits_df.iloc[idx]
            if not any(uh['title'] == habit['title'] for uh in user_habits):
                recommendations.append(habit)
                if len(recommendations) == n_recommendations:
                    break
                    
        return recommendations

recommender = HabitRecommender()

@app.route('/generate-habit-suggestions', methods=['GET'])
def generate_suggestions():
    user_habits_json = request.args.get('user_habits', '[]')
    try:
        user_habits = eval(user_habits_json)
    except:
        user_habits = []
    

    recommendations = recommender.get_recommendations(user_habits)
    
  
    recommendations_json = []
    for habit in recommendations:
        if isinstance(habit, pd.Series):
            habit = habit.to_dict()
        recommendations_json.append({
            'title': habit['title'],
            'description': habit['description'],
            'category': habit['category'],
            'difficulty': habit['difficulty']
        })
    
    return jsonify(recommendations_json)

if __name__ == '__main__':
    app.run()