// lib/tokenManager.ts
export const tokens = [
  process.env.NEXT_PUBLIC_GROQ_TOKEN_1!,
  process.env.NEXT_PUBLIC_GROQ_TOKEN_2!,
];

let currentIndex = 0;

// Get current token
export const getToken = () => tokens[currentIndex];

// Switch to next token
export const switchToken = () => {
  currentIndex = (currentIndex + 1) % tokens.length;
  return tokens[currentIndex];
};
