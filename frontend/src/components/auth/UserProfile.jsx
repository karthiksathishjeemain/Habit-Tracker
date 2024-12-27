import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '../ui/alert';

export const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Clear error after 5 seconds

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [error, setError]);
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('https://habit-tracker-9sjw.vercel.app/api/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfile(data);
      setUpdateData(prev => ({ ...prev, name: data.name , email : data.email}));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (updateData.newPassword && updateData.newPassword !== updateData.confirmNewPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      const response = await fetch('https://habit-tracker-9sjw.vercel.app/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: updateData.name,
          email: updateData.email,
          oldPassword: updateData.currentPassword,
          newPassword: updateData.newPassword
        })
      });


      if (!response.ok) throw new Error('Failed to update profile');

      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">User Profile</h2>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

          {!editMode ? (
            // <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-lg text-gray-900 font-semibold">{profile.name}</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-lg text-gray-900 font-semibold">{profile.email}</p>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} >
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={updateData.name}
                  onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={updateData.email}
                  onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                  placeholder="Email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  value={updateData.currentPassword}
                  onChange={(e) => setUpdateData({ ...updateData, currentPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  value={updateData.newPassword}
                  onChange={(e) => setUpdateData({ ...updateData, newPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  value={updateData.confirmNewPassword}
                  onChange={(e) => setUpdateData({ ...updateData, confirmNewPassword: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-between">
              <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default UserProfile