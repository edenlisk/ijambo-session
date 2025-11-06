
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, UserRole, type LoginRequest, type RegisterRequest, type LoginResponse } from '@/types';
import axios, { AxiosError } from 'axios';

// Configure your API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - try to refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { token, user } = response.data;
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('authUser', JSON.stringify(user));

                    // Retry original request with new token
                    if (error.config) {
                        error.config.headers.Authorization = `Bearer ${token}`;
                        return axios.request(error.config);
                    }
                } catch (refreshError) {
                    // Refresh failed - clear auth and redirect to login
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (roles: UserRole[]) => boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth data on mount
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await api.post<LoginResponse>('/api/auth/login', credentials);

            const { accessToken, refreshToken, user } = response.data;

            // Store auth data
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('authUser', JSON.stringify(user));

            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            setToken(accessToken);
            setUser(user);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ message?: string; error?: string }>;
                console.error('Login failed:', axiosError.response?.data);

                // Throw error with response for component to handle
                throw axiosError;
            }
            throw error;
        }
    };

    const register = async (data: RegisterRequest) => {
        try {
            const response = await api.post<LoginResponse>('/api/auth/register', data);

            const { accessToken: token, refreshToken, user } = response.data;

            // Store auth data
            localStorage.setItem('authToken', token);
            localStorage.setItem('authUser', JSON.stringify(user));

            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken);
            }

            setToken(token);
            setUser(user);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<{ message?: string; error?: string }>;
                console.error('Registration failed:', axiosError.response?.data);
                throw axiosError;
            }
            throw error;
        }
    };

    const logout = () => {
        // Optionally call logout endpoint
        // api.post('/api/auth/logout').catch(console.error);

        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('refreshToken');
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!user && !!token;

    const hasRole = (roles: UserRole[]) => {
        return user ? roles.includes(user.role) : false;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, hasRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Export api instance for use in other services
export { api };