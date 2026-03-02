'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [users, setUsers] = useState<any[]>([]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error(error);
    else setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const deleteUser = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchUsers();
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl mb-4">Admin Panel</h1>

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
                  <button onClick={() => deleteUser(u.id)} className="bg-red-500 text-white p-1">
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
