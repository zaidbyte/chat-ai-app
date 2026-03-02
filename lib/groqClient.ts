import { getToken, switchToken } from './tokenManager';

export const sendPrompt = async (prompt: string) => {
  let token = getToken();
  let response: any;

  try {
    const res = await fetch('https://api.groq.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error('Token limit or API error');
    response = await res.json();
  } catch (err) {
    // switch token and retry once
    token = switchToken();
    const retry = await fetch('https://api.groq.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt }),
    });
    response = await retry.json();
  }

  return response;
};
