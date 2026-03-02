// lib/tokenManager.ts
export const tokens = [
  'YOUR_GROQ_TOKEN_1',
  'YOUR_GROQ_TOKEN_2',
  'YOUR_GROQ_TOKEN_3', // add as many as you have
];

let currentIndex = 0;

// Get current token
export const getToken = () => tokens[currentIndex];

// Switch to next token
export const switchToken = () => {
  currentIndex = (currentIndex + 1) % tokens.length;
  return tokens[currentIndex];
};
