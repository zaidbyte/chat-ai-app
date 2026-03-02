'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async () => {
    if (!userId || !password) return alert('User ID and password required');

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('password', password)
      .single();

    if (error || !data) {
      alert('Invalid User ID or Password');
    } else {
      // save login session (simple example)
      localStorage.setItem('userId', data.id);
      localStorage.setItem('role', data.role);
      router.push('/dashboard');
    }
  };

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
      <button onClick={login} className="bg-blue-500 text-white p-2 w-full">
        Login
      </button>
    </div>
  );
}
