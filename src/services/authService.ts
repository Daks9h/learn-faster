import { User, AuthSession } from '../types';

const TOKEN_KEY = 'lectureai_jwt_token';
const USER_KEY = 'lectureai_jwt_user';

/**
 * Base64URL decode helper for inspecting JWT payload on client.
 */
export function decodeJwt(token: string): { header?: any; payload?: any; valid: boolean; expired: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, expired: true };
    }

    const decodePart = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    };

    const header = decodePart(parts[0]);
    const payload = decodePart(parts[1]);
    const now = Math.floor(Date.now() / 1000);
    const expired = typeof payload.exp === 'number' && payload.exp < now;

    return { header, payload, valid: true, expired };
  } catch {
    return { valid: false, expired: true };
  }
}

/**
 * Creates a standard mock client JWT if the server is offline.
 */
function createClientDemoJwt(user: User): string {
  const base64Url = (obj: any) => {
    const json = JSON.stringify(obj);
    return btoa(json).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    institution: user.institution || 'UC Berkeley',
    level: user.level || 7,
    iat: now,
    exp: now + 86400 * 7, // 7 days
    iss: 'lectureai-auth',
  };

  const encodedHeader = base64Url(header);
  const encodedPayload = base64Url(payload);
  const mockSignature = 'simulated_hs256_sig_' + btoa(user.id + now).slice(0, 16).replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

export const authService = {
  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const { valid, expired } = decodeJwt(token);
    if (!valid || expired) {
      this.logout();
      return null;
    }
    return token;
  },

  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) return null;
    const rawUser = localStorage.getItem(USER_KEY);
    if (rawUser) {
      try {
        return JSON.parse(rawUser) as User;
      } catch {
        // Fall back to decoded payload
      }
    }

    const { payload } = decodeJwt(token);
    if (payload && payload.email) {
      return {
        id: payload.sub || 'user_1',
        name: payload.name || 'Scholar',
        email: payload.email,
        institution: payload.institution || 'UC Berkeley',
        level: payload.level || 7,
      };
    }
    return null;
  },

  getAuthHeader(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const trimmedEmail = email.trim().toLowerCase();
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8787').replace(/\/+$/, '');

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { token: data.token, user: data.user };
      }

      // If server returned a business error (e.g. invalid credentials)
      if (response.status === 401 || response.status === 400) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Invalid email or password.');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'Failed to fetch' && !err.message.includes('NetworkError')) {
        throw err;
      }
      // If server is not running or unreachable, seamlessly fall back to local demo JWT
      console.warn('[Auth] Backend unavailable, generating local client JWT session.');
    }

    // Client fallback demo credentials
    const demoUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Daksh',
      email: trimmedEmail,
      institution: trimmedEmail.includes('berkeley') ? 'UC Berkeley' : 'Stanford University',
      level: 7,
      profileSettings: {
        targetCourse: 'CS 152: Computer Architecture',
        gradeGoal: 'A (Top 10%)',
        studyMode: 'High-Yield (Audio + Exam Radar)',
        examDate: 'Midterm 2 · 12 Days Remaining',
      },
    };

    const token = createClientDemoJwt(demoUser);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    return { token, user: demoUser };
  },

  async register(name: string, email: string, password: string, institution?: string): Promise<AuthSession> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8787').replace(/\/+$/, '');

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          institution: institution?.trim() || 'UC Berkeley',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return { token: data.token, user: data.user };
      }

      if (response.status === 400 || response.status === 409) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Registration failed. Email might already be taken.');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== 'Failed to fetch' && !err.message.includes('NetworkError')) {
        throw err;
      }
      console.warn('[Auth] Backend unavailable, generating local client JWT session.');
    }

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: trimmedName || 'New Scholar',
      email: trimmedEmail,
      institution: institution?.trim() || 'UC Berkeley',
      level: 1,
      profileSettings: {
        targetCourse: 'CS 152: Computer Architecture',
        gradeGoal: 'A (Top 10%)',
        studyMode: 'High-Yield (Audio + Exam Radar)',
        examDate: 'Midterm 2 · 12 Days Remaining',
      },
    };

    const token = createClientDemoJwt(newUser);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return { token, user: newUser };
  },

  saveProfileSettings(settings: Partial<import('../types').UserProfileSettings>): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updatedUser: User = {
      ...user,
      profileSettings: {
        ...(user.profileSettings || {
          targetCourse: 'CS 152: Computer Architecture',
          gradeGoal: 'A (Top 10%)',
          studyMode: 'High-Yield (Audio + Exam Radar)',
          examDate: 'Midterm 2 · 12 Days Remaining',
        }),
        ...settings,
      },
    };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
