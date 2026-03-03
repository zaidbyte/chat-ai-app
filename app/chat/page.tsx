'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Message = { role: 'user' | 'ai'; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // Load remembered user
  useEffect(() => {
    const saved = localStorage.getItem('chat_user');
    if (saved) setUserId(saved);
  }, []);

  useEffect(() => {
    if (rememberUser) localStorage.setItem('chat_user', userId);
    else localStorage.removeItem('chat_user');
  }, [rememberUser, userId]);

  // Load messages from Supabase (user-specific)
  useEffect(() => {
    if (!userId || ghostMode) return;
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('id', { ascending: true });
      if (error) console.error(error);
      else
        setMessages(
          data.map((m: any) => ({
            role: m.role as 'user' | 'ai',
            text: m.text,
          }))
        );
    };
    fetchMessages();
  }, [userId, ghostMode]);

  // Send message
  const sendMessage = async () => {
    if (!input || !userId) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Save to DB if not ghost mode
    if (!ghostMode) {
      const { error } = await supabase.from('chat_messages').insert([
        { user_id: userId, text: input, role: 'user' },
      ]);
      if (error) console.error(error);
    }

    // Call Groq AI
    try {
      const aiResponse = await fetch('https://api.groq.ai/v1/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_TOKEN_1}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          prompt: input,
          max_tokens: 500,
        }),
      });

      const data = await aiResponse.json();
      const text = data.choices?.[0]?.text || 'Error: no response';

      const aiMessage: Message = { role: 'ai', text };
      setMessages((prev) => [...prev, aiMessage]);

      if (!ghostMode) {
        const { error } = await supabase.from('chat_messages').insert([
          { user_id: userId, text, role: 'ai' },
        ]);
        if (error) console.error(error);
      }
    } catch (err) {
      console.error('Groq AI Error:', err);
      setMessages((prev) => [...prev, { role: 'ai', text: 'AI error' }]);
    }
  };

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
            <span className="font-bold text-black">{m.role === 'user' ? userId : 'AI'}: </span>
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
