
const API_BASE_URL = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'An unknown error occurred' }));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    
    // For POST requests that might not return a body (e.g., 201 Created)
    if (res.status === 201 || res.status === 204) {
      // Try to parse json, but if it fails, return an empty object
      try {
        return await res.json();
      } catch (e) {
        return {} as T;
      }
    }
    
    return res.json();
  }

  // Auth
  login(email: string, password: string): Promise<{token: string, user: any}> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  signup(username: string, email: string, password: string): Promise<{token: string, user: any}> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }
  
  // Users
  getUsers(): Promise<any[]> {
    return this.request('/users');
  }

  // Rooms
  getRooms(): Promise<any[]> {
    return this.request('/rooms');
  }

  createRoom(name: string, members: string[] = []): Promise<any> {
    const isPublic = !name.startsWith('@'); // A simple convention
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, isPublic, members }),
    });
  }

  // Messages
  getMessages(roomId: string): Promise<any[]> {
    return this.request(`/messages/${roomId}`);
  }

  sendMessage(roomId: string, text: string): Promise<any> {
    return this.request(`/messages/${roomId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }
}

export const api = new ApiClient();
