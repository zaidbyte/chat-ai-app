'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleLogin = async () => {
    if (!userId || !password) return alert('Enter User ID and password');

    const hashed = await hashPassword(password);

    const { data, error } = await supabase
      .from('custom_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return alert('User not found');
    if (data.password !== hashed) return alert('Incorrect password');

    setLoggedIn(true);
    setUserRole(data.role);
  };

  if (loggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {userId}!</h1>
        <p className="mb-6 text-gray-700">Role: {userRole}</p>
        <div className="bg-white p-6 rounded shadow w-full max-w-lg">
          <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
          <p className="text-gray-700 mb-2">
            Here’s where you can add your features: Chat, Forum, Settings, etc.
          </p>
          <p className="text-gray-700">
            You can now build the full UI for messages, ghost mode, image uploads, etc.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mb-3 rounded w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 rounded w-full"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
