'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // SHA-256 hashing function
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleLogin = async () => {
    if (!userId || !password) return alert('Enter User ID and password');

    const hash = await hashPassword(password);

    // Query custom_users table
    const { data, error } = await supabase
      .from('custom_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return alert('User not found');

    if (data.password === hash) {
      setLoggedIn(true);
      alert(`Welcome, ${userId}`);
    } else {
      alert('Incorrect password');
    }
  };

  if (loggedIn) {
    return <div className="p-8">Welcome, {userId}!</div>;
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl mb-4">Login</h1>
      <input
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-4"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-2 w-full"
      >
        Login
      </button>
    </div>
  );
}
