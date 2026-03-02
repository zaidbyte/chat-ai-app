// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

type User = {
  id: string;
  email: string;
  role: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [announcement, setAnnouncement] = useState('');

  // Fetch users from Supabase
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (data) setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create new user
  const createUser = async () => {
    const { data, error } = await supabase.from('users').insert([{ email, role }]);
    if (error) alert(error.message);
    else {
      setEmail('');
      setRole('user');
      fetchUsers();
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    fetchUsers();
  };

  // Update user role
  const updateRole = async (id: string, newRole: string) => {
    await supabase.from('users').update({ role: newRole }).eq('id', id);
    fetchUsers();
  };

  // Set announcement (you can save it in a table later)
  const saveAnnouncement = () => {
    localStorage.setItem('announcement', announcement);
    alert('Announcement saved!');
  };

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <h1 className="text-3xl mb-4">Admin Panel</h1>

      {/* Create User */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Create User</h2>
        <input
          type="email"
          placeholder="User email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded mr-2"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border rounded mr-2">
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={createUser} className="p-2 bg-green-500 rounded text-white hover:bg-green-600">
          Create
        </button>
      </div>

      {/* Users List */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Users</h2>
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between mb-2">
            <div>
              {user.email} - {user.role}
            </div>
            <div>
              <select
                value={user.role}
                onChange={(e) => updateRole(user.id, e.target.value)}
                className="p-1 border rounded mr-2"
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={() => deleteUser(user.id)}
                className="p-1 bg-red-500 rounded text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div>
        <h2 className="text-xl mb-2">Set Announcement</h2>
        <input
          type="text"
          placeholder="Announcement"
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          className="p-2 border rounded mr-2 w-1/2"
        />
        <button onClick={saveAnnouncement} className="p-2 bg-blue-500 rounded text-white hover:bg-blue-600">
          Save
        </button>
      </div>
    </div>
  );
}
