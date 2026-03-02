// app/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Conversation = {
  id: string;
  content: string;
  ghost_mode: boolean;
  created_at: string;
};

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [ghostMode, setGhostMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check login
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) window.location.href = '/login';
      else setUser(user);
    });
  }, []);

  // Fetch conversation history
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  // Send message
  const sendMessage = async () => {
    if (!input) return;
    if (!ghostMode) {
      await supabase.from('conversations').insert([
        { user_id: user.id, content: input, ghost_mode: false },
      ]);
      fetchMessages();
    }
    // Here you would call Groq AI API for response
    setMessages([...messages, { id: Date.now().toString(), content: input, ghost_mode: ghostMode, created_at: new Date().toISOString() }]);
    setInput('');
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      <div className="flex justify-between p-4 items-center border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-2xl">Chat</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1">
            Ghost Mode
            <input type="checkbox" checked={ghostMode} onChange={() => setGhostMode(!ghostMode)} />
          </label>
          <label className="flex items-center gap-1">
            Dark Mode
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </label>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="space-y-2 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded ${msg.ghost_mode ? 'bg-gray-300 dark:bg-gray-700 italic' : 'bg-blue-100 dark:bg-blue-700'}`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded"
          />
          <button onClick={sendMessage} className="p-2 bg-green-500 rounded text-white hover:bg-green-600">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
