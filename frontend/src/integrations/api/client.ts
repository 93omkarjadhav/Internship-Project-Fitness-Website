// API Client to replace Supabase client

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SignUpData {
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

// Auth client class
class AuthClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async signInWithPassword(data: SignInData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async signInWithOAuth(): Promise<void> {
    throw new Error('OAuth sign in not implemented');
  }

  async signOut(): Promise<void> {
    this.clearToken();
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    await this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updateUser(data: { password: string; token?: string }): Promise<void> {
    await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSession() {
    const token = this.getToken();
    if (!token) {
      return { data: { session: null } };
    }

    try {
      const response = await this.request('/api/auth/me');
      return {
        data: {
          session: {
            user: response.user,
            access_token: token,
          },
        },
      };
    } catch (error) {
      this.clearToken();
      return { data: { session: null } };
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    // Simple implementation - in production, use websockets or polling
    let isAuthenticated = false;

    const checkAuth = async () => {
      const { data } = await this.getSession();
      const currentlyAuthenticated = data.session !== null;

      if (currentlyAuthenticated !== isAuthenticated) {
        isAuthenticated = currentlyAuthenticated;
        callback(isAuthenticated ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
      }
    };

    // Check auth state immediately
    checkAuth();

    // Poll for changes every 30 seconds
    const intervalId = setInterval(checkAuth, 30000);

    return {
      data: { subscription: intervalId },
      unsubscribe: () => clearInterval(intervalId),
    };
  }
}

export const apiClient = new AuthClient();

// Export for compatibility with Supabase-style usage
export const auth = {
  signUp: (data: SignUpData) => apiClient.signUp(data),
  signInWithPassword: (data: SignInData) => apiClient.signInWithPassword(data),
  signInWithOAuth: () => apiClient.signInWithOAuth(),
  signOut: () => apiClient.signOut(),
  resetPasswordForEmail: (email: string) => apiClient.resetPasswordForEmail(email),
  updateUser: (data: { password: string; token?: string }) => apiClient.updateUser(data),
  getSession: () => apiClient.getSession(),
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    apiClient.onAuthStateChange(callback),
};

// Create a mock supabase-like object for compatibility
export const supabase = {
  auth,
  functions: {
    invoke: async () => {
      console.warn('Supabase functions invoke is deprecated. Email sending is now handled by the backend.');
      return { data: null, error: null };
    },
  },
};

