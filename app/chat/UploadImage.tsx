// app/chat/UploadImage.tsx
'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { sendPrompt } from '../../lib/groqClient';

export default function UploadImage({ user, addMessage }: { user: any; addMessage: (msg: any) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);

    // Send to Groq AI with URL
    const response = await sendPrompt(`Analyze or respond to this image: ${urlData.publicUrl}`);
    const aiMessage = response.output_text || 'Error generating response';

    // Add AI response to chat
    addMessage({ id: Date.now().toString(), content: aiMessage, ghost_mode: false, created_at: new Date().toISOString() });

    setUploading(false);
    setFile(null);
  };

  return (
    <div className="flex gap-2 mt-2">
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="p-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        {uploading ? 'Uploading...' : 'Send Image'}
      </button>
    </div>
  );
}
