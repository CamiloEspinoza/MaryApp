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

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string | null;
  objectives: string | null;
  status: string;
  participants: { id: string; name: string; role: string | null }[];
  itineraryDays?: {
    id: string;
    date: string;
    notes: string | null;
    items: {
      id: string;
      type: string;
      title: string;
      description: string | null;
      location: string | null;
      startTime: string | null;
      endTime: string | null;
      cost: number | null;
      currency: string | null;
    }[];
  }[];
  transportations?: {
    id: string;
    type: string;
    origin: string;
    destination: string;
    carrier: string | null;
    flightNumber: string | null;
    departureTime: string;
    arrivalTime: string;
    cost: number | null;
    currency: string | null;
    bookingRef: string | null;
  }[];
  accommodations?: {
    id: string;
    name: string;
    address: string | null;
    checkIn: string;
    checkOut: string;
    cost: number | null;
    currency: string | null;
  }[];
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

  getTrips: (token: string) =>
    request<Trip[]>('/trips', { headers: authHeaders(token) }),

  getTrip: (token: string, id: string) =>
    request<Trip>(`/trips/${id}`, { headers: authHeaders(token) }),

  deleteTrip: (token: string, id: string) =>
    request<{ message: string }>(`/trips/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    }),

  getUserContext: (token: string) =>
    request<UserContext>('/users/me/context', {
      headers: authHeaders(token),
    }),
};

export interface UserContext {
  trips: {
    id: string;
    title: string;
    destination: string;
    status: string;
    startDate: string;
    endDate: string | null;
  }[];
  memories: {
    id: string;
    category: string;
    content: string;
    createdAt: string;
  }[];
}
