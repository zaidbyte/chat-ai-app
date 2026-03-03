'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ChatPage() {
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // Load remembered user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat_user');
    if (saved) setUserId(saved);
  }, []);

  // Save user if rememberUser is checked
  useEffect(() => {
    if (rememberUser) localStorage.setItem('chat_user', userId);
    else localStorage.removeItem('chat_user');
  }, [rememberUser, userId]);

  // Send a message
  const sendMessage = async () => {
    if (!input || !userId) return;

    const newMessage = { user: userId, text: input };

    // If ghost mode is off, save to Supabase
    if (!ghostMode) {
      const { error } = await supabase.from('chat_messages').insert([newMessage]);
      if (error) console.error('Error saving message:', error.message);
    }

    // Update UI
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  // Load saved messages from Supabase
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('id', { ascending: true });
      if (error) console.error(error);
      else setMessages(data.map((m: any) => ({ user: m.user, text: m.text })));
    };

    if (!ghostMode) fetchMessages();
  }, [ghostMode]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col max-w-3xl mx-auto">
      {/* User Controls */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <input
          placeholder="Your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 rounded w-full sm:w-auto text-black"
        />
        <label className="flex items-center gap-2 text-black">
          <input
            type="checkbox"
            checked={rememberUser}
            onChange={(e) => setRememberUser(e.target.checked)}
          />
          Remember Me
        </label>
        <label className="flex items-center gap-2 text-black">
          <input
            type="checkbox"
            checked={ghostMode}
            onChange={(e) => setGhostMode(e.target.checked)}
          />
          Ghost Mode
        </label>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto border rounded p-4 bg-white mb-4 h-[60vh]">
        {messages.map((m, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-bold text-black">{m.user}: </span>
            <span className="text-black">{m.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border p-2 rounded flex-1 text-black"
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
