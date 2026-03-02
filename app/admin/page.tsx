'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

type User = {
  id: string;
  email: string;
  role: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  // Fetch users
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (data) setUsers(data);
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchAnnouncements();
  }, []);

  // Create user
  const createUser = async () => {
    const { error } = await supabase.from('users').insert([{ email, role }]);
    if (error) alert(error.message);
    else { setEmail(''); setRole('user'); fetchUsers(); }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    fetchUsers();
  };

  // Update role
  const updateRole = async (id: string, newRole: string) => {
    await supabase.from('users').update({ role: newRole }).eq('id', id);
    fetchUsers();
  };

  // Create announcement
  const createAnnouncement = async () => {
    const { data, error } = await supabase.from('announcements').insert([{
      title: annTitle,
      content: annContent,
      created_by: supabase.auth.getUser().then(u => u.data.user?.id),
    }]);
    if (error) alert(error.message);
    else { setAnnTitle(''); setAnnContent(''); fetchAnnouncements(); }
  };

  // Delete announcement
  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    fetchAnnouncements();
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
            <div>{user.email} - {user.role}</div>
            <div>
              <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value)} className="p-1 border rounded mr-2">
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => deleteUser(user.id)} className="p-1 bg-red-500 rounded text-white hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Announcements */}
      <div>
        <h2 className="text-xl mb-2">Announcements</h2>
        <input
          type="text"
          placeholder="Title"
          value={annTitle}
          onChange={(e) => setAnnTitle(e.target.value)}
          className="p-2 border rounded mr-2 mb-2 w-full max-w-md block"
        />
        <textarea
          placeholder="Content"
          value={annContent}
          onChange={(e) => setAnnContent(e.target.value)}
          className="p-2 border rounded mr-2 mb-2 w-full max-w-md block"
        />
        <button onClick={createAnnouncement} className="p-2 bg-blue-500 rounded text-white hover:bg-blue-600 mb-4">
          Create Announcement
        </button>

        {/* Announcements List */}
        {announcements.map((ann) => (
          <div key={ann.id} className="border p-2 mb-2 rounded bg-gray-200 dark:bg-gray-700 flex justify-between items-start">
            <div>
              <h3 className="font-bold">{ann.title}</h3>
              <p>{ann.content}</p>
            </div>
            <button onClick={() => deleteAnnouncement(ann.id)} className="p-1 bg-red-500 rounded text-white hover:bg-red-600">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
