const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Error ${res.status}`);
  }

  return res.json();
}

export const api = {
  sendOtp: (email: string) =>
    request<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, code: string) =>
    request<{
      token: string;
      user: { id: string; email: string; name: string | null };
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
};
