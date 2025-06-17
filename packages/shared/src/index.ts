export interface User {
  id: string;
  name: string;
  email: string;
}

export function formatName(user: User): string {
  return `${user.name} <${user.email}>`;
}

export function createUser(name: string, email: string): User {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    email,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const constants = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRY_ATTEMPTS: 3,
} as const;
