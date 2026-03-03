'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const router = useRouter();

  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  useEffect(() => {
    const saved = localStorage.getItem('chat_user');
    if (saved) setUserId(saved);
  }, []);

  useEffect(() => {
    if (rememberUser) localStorage.setItem('chat_user', userId);
    else localStorage.removeItem('chat_user');
  }, [rememberUser, userId]);

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

    // Redirect to chat page
    router.push('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mb-3 rounded w-full text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 rounded w-full text-black"
        />
        <label className="flex items-center gap-2 mb-4 text-black">
          <input
            type="checkbox"
            checked={rememberUser}
            onChange={(e) => setRememberUser(e.target.checked)}
          />
          Remember Me
        </label>
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
