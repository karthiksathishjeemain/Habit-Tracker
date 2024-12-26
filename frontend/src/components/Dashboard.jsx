import  { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,  ResponsiveContainer, } from 'recharts';
import {  User, LogOut,PlusCircle, Edit2, Trash2, CheckCircle, Calendar, BarChart2 } from 'lucide-react';
// import { Alert, AlertDescription } from '../components/ui/Alert';


const Dashboard = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editHabit, setEditHabit] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newHabit, setNewHabit] = useState({
        title: '',
        description: '',
        duration: 'daily',
        startDate: new Date().toLocaleDateString('en-CA')
    });
    // const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const [selectedView, setSelectedView] = useState('list');
 
    const [suggestedHabits, setSuggestedHabits] = useState([]);
   
    
    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const response = await fetch('https://habit-tracker-9sjw.vercel.app/api/habits', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch habits');
                const data = await response.json();

           
                const habitsWithProgress = await Promise.all(data.map(async (habit) => {
                  
                    const progressResponse = await fetch(`https://habit-tracker-9sjw.vercel.app/api/habits/${habit.id}/progress`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    const progressData = await progressResponse.json();
                  
                    return {
                        ...habit,
                        progress: progressData
                    };
                }));
             
                setHabits(habitsWithProgress);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };
        fetchHabits();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`https://habit-tracker-ai-back.onrender.com/generate-habit-suggestions?user_habits=${JSON.stringify(habits)}`);
                if (!response.ok) throw new Error('Failed to fetch habit suggestions');
                const data = await response.json();
                setSuggestedHabits(data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchSuggestions();
    }, [habits]);
    const handleProfileClick = () => {
        // setSelectedView('userProfile');
        window.location.href = '/profile';
    };
    const handleLogout = ()=>{
        // setSelectedView('logOut');
        localStorage.removeItem('token');
        window.location.href = '/login';
    }

    const handleAddHabit = async () => {
        try {
            const response = await fetch('https://habit-tracker-9sjw.vercel.app/api/habits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newHabit)
            });
            if (!response.ok) throw new Error('Failed to add habit');
            const data = await response.json();
            setHabits([...habits, { ...data, progress: [] }]);
            setShowAddModal(false);
            setNewHabit({ title: '', description: '', duration: 'daily', startDate: new Date().toLocaleDateString('en-CA') });
        } catch (err) {
            setError(err.message);
        }
    };


    const handleMarkComplete = async (habitId) => {
        try {
            const response = await fetch(`https://habit-tracker-9sjw.vercel.app/api/habits/${habitId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    date: new Date().toLocaleDateString('en-CA'),
                    status: 'completed',
                    notes: 'No notes for the time being'
                })
            });
            if (!response.ok) throw new Error('Failed to update progress');

   
            setHabits(habits.map(habit => {
                if (habit.id === habitId) {
                    return {
                        ...habit,
                        progress: [...habit.progress, { date: new Date().toLocaleDateString('en-CA'), status: 'completed' }]
                    };
                }
                return habit;
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const calculateProgress = (habit) => {
        if (!habit.progress || !habit.progress.length) return { completed: 0, missed: 0, streak: 0 };

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);
        today.setHours(0, 0, 0, 0);
        console.log("Today is ", today)
        let startDate;
        if (habit.formatted_start_date){
        startDate = new Date(habit.formatted_start_date);}
        else {
            startDate = new Date(habit.startDate)
        }
        startDate.setHours(0, 0, 0, 0)
        console.log("StartDate is ", startDate);

      
        const daysSinceStart = Math.floor((yesterday - startDate) / (1000 * 60 * 60 * 24)) + 1;
     
        const formatted_today = new Date().toLocaleDateString('en-CA');
        const completed = habit.progress.filter(p => p.status === 'completed' && p.date !== formatted_today).length;
        const missed = daysSinceStart - completed;

        const sortedProgress = [...habit.progress].sort((a, b) => new Date(b.date) - new Date(a.date));
        
      
        let streak = 0;
        
        for (let date = today; date >= startDate; date.setDate(date.getDate() - 1)) {
            const dateStr = date.toLocaleDateString('en-CA');
            const progressEntry = sortedProgress.find(p => p.date === dateStr);
            console.log("Date is ",dateStr)
            if (progressEntry && progressEntry.status === 'completed') {
              
                streak ++;
            } else {
               
                // streak=0;
                break;
            }
        }
        let total_complete = completed

        if (habit.progress.some(p => p.status === 'completed' && p.date === formatted_today)) {
            total_complete += 1;
        }
        return { total_complete, missed, streak };
    };
  
    const handleDeleteHabit = async (habitId) => {
        try {
            const response = await fetch(`https://habit-tracker-9sjw.vercel.app/api/habits/${habitId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete habit');
            setHabits(habits.filter(habit => habit.id !== habitId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditHabit = async () => {
        try {
            const response = await fetch(`https://habit-tracker-9sjw.vercel.app/api/habits/${editHabit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: editHabit.title,
                    description: editHabit.description,
                    duration: editHabit.duration,
                    status: editHabit.status
                })
            });

            if (!response.ok) throw new Error('Failed to update habit');

       
            setHabits(habits.map(habit =>
                habit.id === editHabit.id ? editHabit : habit
            ));

            setShowEditModal(false);
            setEditHabit(null);
        } catch (err) {
            setError(err.message);
        }
    };



    return (
        <div className="container mx-auto p-4">
         
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Habit Tracker</h1>
               
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedView('list')}
                        className={`p-2 rounded ${selectedView === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <CheckCircle className="w-5 h-5" />
                    </button>
                   
                    <button
                        onClick={() => setSelectedView('charts')}
                        className={`p-2 rounded ${selectedView === 'charts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <BarChart2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setSelectedView('calendar')}
                        className={`p-2 rounded ${selectedView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleProfileClick}
                        className={`p-2 rounded ${selectedView === 'userProfile' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <User className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`p-2 rounded ${selectedView === 'logOut' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">My Habits</h2>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="bg-blue-500 text-white p-2 rounded-full"
                            >
                                <PlusCircle className="w-5 h-5" />
                            </button>
                        </div>

                        {selectedView === 'list' && (
                            <div className="space-y-4">
                                {habits.map(habit => {
                                    const progress = calculateProgress(habit);
                                    return (
                                        <div key={habit.id} className="flex items-center justify-between bg-gray-50 p-4 rounded">
                                            <div>
                                                <h3 className="font-medium">{habit.title}</h3>
                                                <p className="text-sm text-gray-600">{habit.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {habit.duration} • Streak: {progress.streak} days
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleMarkComplete(habit.id)}
                                                    className={`p-2 rounded ${habit.progress?.some(p =>
                                                        p.date === new Date().toLocaleDateString('en-CA')
                                                    ) ? 'bg-green-500 text-white' : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-2 rounded bg-gray-200"
                                                    onClick={() => {
                                                        setEditHabit(habit);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteHabit(habit.id)}
                                                    className="p-2 rounded bg-red-100 text-red-600"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedView === 'charts' && (
                            <div className="space-y-8">
                                {habits.map(habit => {
                                    const progress = calculateProgress(habit);
                                    const chartData = [
                                        { name: 'Completed', value: progress.total_complete },
                                        { name: 'Missed', value: progress.missed }
                                    ];

                                    return (
                                        <div key={habit.id} className="bg-gray-50 p-4 rounded">
                                            <h3 className="font-medium mb-2">{habit.title}</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Bar dataKey="value" fill="#4CAF50" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                                <div>
                                                    <p className="text-sm text-gray-600">Completed</p>
                                                    <p className="font-medium">{progress.total_complete} days</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Missed</p>
                                                    <p className="font-medium">{progress.missed} days</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Current Streak</p>
                                                    <p className="font-medium">{progress.streak} days</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {selectedView === 'calendar' && (
                            <div className="space-y-8">
                                {habits.map(habit => (
                                    <div key={habit.id} className="bg-gray-50 p-4 rounded">
                                        <h3 className="font-medium mb-4">{habit.title}</h3>
                                        <div className="grid grid-cols-7 gap-2">
                                            {Array.from({ length: 31 }, (_, i) => {
                                                const date = new Date();
                                               
                                                date.setDate(date.getDate() - (30 - i));
                                                const dateStr = date.toLocaleDateString('en-CA');
                                                
                                                const startDate = new Date(habit.startDate).toLocaleDateString('en-CA');
                                                const isCompleted = habit.progress?.some(p => {
                                                    
                                                    const pdateStr = new Date(p.date).toLocaleDateString('en-CA');
                                                   
                                                    return pdateStr === dateStr && p.status === 'completed'
                                                }
                                               

                                                );
                                              
                                                const isMissed = dateStr >startDate && !isCompleted;

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`aspect-square rounded flex items-center justify-center text-sm ${isCompleted ? 'bg-green-500 text-white' : isMissed ? 'bg-red-500 text-white' : 'bg-gray-100'
                                                            }`}
                                                    >
                                                        {date.getDate()}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


      
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-semibold mb-4">Suggested Habits</h2>
                    <div className="space-y-4">
                        {suggestedHabits.map((habit, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded">
                                <h3 className="font-medium">{habit.title}</h3>
                                <p className="text-sm text-gray-600">{habit.description}</p>
                                <p className="text-xs text-gray-500 mt-1">{habit.category}</p>
                                <button
                                    onClick={() => {
                                        const formattedHabit = {
                                            title: habit.title,
                                            description: habit.description,
                                            duration: 'daily', // Default value or adjust as needed
                                            startDate: new Date().toLocaleDateString('en-CA') // Default value or adjust as needed
                                        };
                                        setNewHabit(formattedHabit);
                                        setShowAddModal(true);
                                    }}
                                    className="mt-2 text-blue-500 text-sm font-medium"
                                >
                                    Add to my habits
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Add New Habit</h2>
                        <input
                            type="text"
                            placeholder="Habit title"
                            value={newHabit.title}
                            onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <textarea
                            placeholder="Description"
                            value={newHabit.description}
                            onChange={e => setNewHabit({ ...newHabit, description: e.target.value })}
                            className="w-full mb-4 p-2 border rounded h-24"
                        />
                        <select
                            value={newHabit.duration}
                            onChange={e => setNewHabit({ ...newHabit, duration: e.target.value })}
                            className="w-full mb-4 p-2 border rounded"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        <input
                            type="date"
                            value={newHabit.startDate}
                            onChange={e => setNewHabit({ ...newHabit, startDate: e.target.value })}
                            className="w-full mb-4 p-2 border rounded"
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewHabit({
                                        title: '',
                                        description: '',
                                        duration: 'daily',
                                        startDate: new Date().toLocaleDateString('en-CA')
                                    });
                                }}
                                className="px-4 py-2 text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddHabit}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Add Habit
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && editHabit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Habit</h2>
                        <input
                            type="text"
                            placeholder="Habit title"
                            value={editHabit.title}
                            onChange={e => setEditHabit({ ...editHabit, title: e.target.value })}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <textarea
                            placeholder="Description"
                            value={editHabit.description}
                            onChange={e => setEditHabit({ ...editHabit, description: e.target.value })}
                            className="w-full mb-4 p-2 border rounded h-24"
                        />
                        <select
                            value={editHabit.duration}
                            onChange={e => setEditHabit({ ...editHabit, duration: e.target.value })}
                            className="w-full mb-4 p-2 border rounded"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditHabit(null);
                                }}
                                className="px-4 py-2 text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditHabit}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;