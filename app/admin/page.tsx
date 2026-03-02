'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_PASSWORD_HASH = 'cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90'; 
// SHA-256 hash of your admin password

export default function AdminPage() {
  const [auth, setAuth] = useState(false); // true = password correct
  const [inputPassword, setInputPassword] = useState('');

  // === SHA-256 hashing function using Web Crypto API ===
  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // === Admin login handler ===
  const handleAdminLogin = async () => {
    const hash = await hashPassword(inputPassword);
    if (hash === ADMIN_PASSWORD_HASH) setAuth(true);
    else alert('Incorrect admin password');
  };

  // === User management states ===
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [users, setUsers] = useState<any[]>([]);

  // === Fetch all users from Supabase ===
  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error(error);
    else setUsers(data);
  };

  useEffect(() => {
    if (auth) fetchUsers();
  }, [auth]);

  // === Create new user ===
  const createUser = async () => {
    if (!userId || !password) return alert('User ID and password required');
    const { error } = await supabase.from('users').insert([{ id: userId, password, role }]);
    if (error) alert(error.message);
    else {
      alert('User created successfully');
      setUserId('');
      setPassword('');
      fetchUsers();
    }
  };

  // === Delete existing user ===
  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchUsers();
  };

  // === Render admin login form if not authenticated ===
  if (!auth) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <h1 className="text-2xl mb-4">Admin Login</h1>
        <input
          type="password"
          placeholder="Admin Password"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
          className="border p-2 w-full mb-4"
        />
        <button
          onClick={handleAdminLogin}
          className="bg-blue-500 text-white p-2 w-full"
        >
          Login
        </button>
      </div>
    );
  }

  // === Render admin panel if authenticated ===
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-4">Admin Panel</h1>

      {/* Create User Section */}
      <div className="mb-8 border p-4">
        <h2 className="text-xl mb-2">Create User</h2>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-2 w-full"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 mb-2 w-full"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={createUser} className="bg-green-500 text-white p-2 w-full">
          Create User
        </button>
      </div>

      {/* Existing Users Table */}
      <div className="border p-4">
        <h2 className="text-xl mb-2">Existing Users</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">User ID</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border p-2">{u.id}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-500 text-white p-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
