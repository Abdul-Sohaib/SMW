// src/utils/authFetch.ts
const BASE_URL = import.meta.env.PROD 
  ? '/api'  // This will use Netlify's proxy
  : 'https://api.dgin.in/api';
  console.log('🔍 Authfetch BASE_URL:', BASE_URL, '| Production mode:', import.meta.env.PROD);
let setIsAuthenticatedCallback: ((auth: boolean) => void) | null = null;

export const setAuthCallback = (callback: (auth: boolean) => void) => {
    setIsAuthenticatedCallback = callback;
};

// Helper to decode and check token expiry
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        return exp < now;
    } catch {
        return true; // Treat as expired if invalid
    }
};

export const refreshToken = async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
        setIsAuthenticatedCallback?.(false);
        return null;
    }

    try {
        const response = await fetch(`${BASE_URL}/auth/refreshtoken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            return data.accessToken;
        } else {
            throw new Error('Refresh failed');
        }
    } catch (error) {
        console.error('Token refresh error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setIsAuthenticatedCallback?.(false);
        return null;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customFetch = async (url: string, options: any = {}): Promise<Response> => {
    let accessToken = localStorage.getItem('accessToken');

    // Check if token exists and is expired
    if (accessToken && isTokenExpired(accessToken)) {
        accessToken = await refreshToken();
    }

    const headers = {
        ...options.headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const finalOptions = { ...options, headers };

    try {
        const response = await fetch(url, finalOptions);

        // In case backend does return 401
        if (response.status === 401) {
            const newAccessToken = await refreshToken();
            if (newAccessToken) {
                finalOptions.headers.Authorization = `Bearer ${newAccessToken}`;
                return await fetch(url, finalOptions);
            }
        }

        return response;
    } catch (err) {
        console.error("customFetch error:", err);
        throw err;
    }
};
