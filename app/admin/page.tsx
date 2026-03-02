'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const ADMIN_PASSWORD_HASH =
  'cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90';
// SHA-256 hash of your admin password

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  const hashPassword = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleAdminLogin = async () => {
    const hash = await hashPassword(inputPassword);
    if (hash === ADMIN_PASSWORD_HASH) setAuth(true);
    else alert('Incorrect admin password');
  };

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('custom_users').select('*');
    if (error) console.error(error);
    else setUsers(data);
  };

  useEffect(() => {
    if (auth) fetchUsers();
  }, [auth]);

  const createUser = async () => {
    if (!userId || !password) return alert('User ID and password required');

    // Hash password automatically
    const hashed = await hashPassword(password);

    const { error } = await supabase
      .from('custom_users')
      .insert([{ id: userId, password: hashed, role }]);
    if (error) alert(error.message);
    else {
      alert('User created successfully');
      setUserId('');
      setPassword('');
      fetchUsers();
    }
  };

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('custom_users').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchUsers();
  };

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Admin Password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <button
            onClick={handleAdminLogin}
            className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Panel</h1>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create User</h2>
        <div className="flex flex-col gap-3">
          <input
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={createUser}
            className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
          >
            Create User
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Existing Users</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">User ID</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="border p-2">{u.id}</td>
                <td className="border p-2">{u.role}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition"
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
