// Import necessary React hooks and Google OAuth utilities
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import api from '@/services/api';

/**
 * User Interface - Represents an authenticated user in the system
 * 
 * This interface defines the structure of user data returned from the backend
 * after successful authentication.
 */
export interface User {
  _id: string;                                    // Unique MongoDB user identifier
  name: string;                                   // User's display name from Google
  email: string;                                  // User's email address
  role: 'user' | 'admin';                        // User's role for access control
  token?: string;                                 // JWT token for authenticated requests
}

/**
 * AuthContext Type Definition
 * 
 * Defines all authentication-related state and methods available through the context.
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  signInWithGoogle: () => void;
  loginWithPassword: (email: string, password: string) => Promise<{ requireOTP?: boolean; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  authenticate: (credential: string) => Promise<boolean>;
}

// Create the authentication context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component - Main Authentication Provider
 * 
 * This component wraps the application and provides authentication state and methods
 * to all child components via React Context. It handles:
 * - Automatic authentication on mount (checking for stored JWT)
 * - Google OAuth integration
 * - Persistent login via localStorage
 * - Token refresh and validation
 * 
 * @param children - React components that need access to authentication context
 */
const ADMIN_EMAILS = ['abhishekpyakurel01@gmail.com'];

export function AuthProvider({ children }: { children: ReactNode }) {
  // State: Current authenticated user (null if not logged in)
  const [user, setUser] = useState<User | null>(null);

  // State: Loading indicator for initial auth check
  const [isLoading, setIsLoading] = useState(true);

  // Helper to force admin role for specific emails
  const enhanceUser = (userData: User | null) => {
    if (userData && ADMIN_EMAILS.includes(userData.email)) {
      return { ...userData, role: 'admin' as const };
    }
    return userData;
  };

  /**
   * Effect: Check Authentication on Mount
   * 
   * When the app loads, check if there's a JWT token in localStorage.
   * If found, validate it with the backend by fetching user data.
   * This enables persistent login across browser sessions.
   * 
   * Flow:
   * 1. Check localStorage for 'token'
   * 2. If found, call /auth/me to validate and get user data
   * 3. On success, set user state with fetched data
   * 4. On failure, remove invalid token from storage
   * 5. Set isLoading to false once check is complete
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Validate token and fetch user data from backend
          const { data } = await api.get('/auth/me');
          setUser(enhanceUser({ ...data, token }));
        } catch (error: any) {
          console.error("Auth check failed", error);
          // If 401 but not expired, it's just invalid
          if (error.response?.status === 401 && error.response?.data?.code !== 'TOKEN_EXPIRED') {
            localStorage.removeItem('accessToken');
          }
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  /**
   * Google OAuth Login Handler
   * 
   * Uses the @react-oauth/google library to handle Google sign-in.
   * This implements the OAuth 2.0 implicit flow with access tokens.
   * 
   * Flow:
   * 1. User clicks "Sign in with Google"
   * 2. Google OAuth popup/redirect opens
   * 3. User authenticates with Google
   * 4. Google returns access_token
   * 5. Send access_token to backend /auth/google
   * 6. Backend validates token with Google and creates/updates user
   * 7. Backend returns JWT token and user data
   * 8. Store JWT in localStorage and update user state
   */
  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      try {
        console.log('Google login success, sending auth code to backend');

        // Send Google authorization code to backend for verification
        const { data } = await api.post('/auth/google', {
          code: codeResponse.code
        });

        // Store JWT token for subsequent API requests
        localStorage.setItem('accessToken', data.accessToken);

        // Update user state with authenticated user data
        setUser(enhanceUser({ ...data.user, token: data.accessToken }));
      } catch (error) {
        console.error("Login failed", error);
        alert('Failed to sign in. Please check console for details.');
      }
    },
    onError: error => {
      console.error("Login Failed:", error);
      alert('Google sign-in failed. Please try again.');
    },
    flow: 'auth-code'
  });

  const loginWithPassword = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      if (data.requireOTP) {
        return { requireOTP: true };
      }

      localStorage.setItem('accessToken', data.accessToken);
      setUser(enhanceUser({ ...data.user, token: data.accessToken }));
      return { requireOTP: false };
    } catch (error: any) {
      return { error: error.response?.data?.message || 'Login failed' };
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('accessToken', data.accessToken);
      setUser(enhanceUser({ ...data.user, token: data.accessToken }));
      return true;
    } catch (error) {
      console.error("OTP verification failed", error);
      return false;
    }
  };

  /**
   * Alternative Authentication Method
   * 
   * Generic authenticate function that accepts a Google authorization code.
   * This is an alternative to the access token flow and can be used
   * for server-side OAuth implementations.
   * 
   * @param code - Google authorization code
   * @returns Promise<boolean> - true if authentication successful, false otherwise
   */
  const authenticate = async (code: string) => {
    try {
      const { data } = await api.post('/auth/google', { code });
      localStorage.setItem('accessToken', data.token); // Google returns it as 'token' sometimes in older calls
      setUser(enhanceUser({ ...data.user, token: data.token }));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  /**
   * Logout Function
   * 
   * Completely logs out the user by:
   * 1. Calling Google's logout to revoke OAuth session
   * 2. Removing JWT token from localStorage
   * 3. Clearing user state
   * 4. Redirecting to home page
   * 
   * This ensures complete session cleanup on both client and Google's side.
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout from server failed", e);
    }
    googleLogout();
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  /**
   * Context Provider
   * 
   * Provides authentication state and methods to all child components.
   * The value object includes:
   * - user: Current user object or null
   * - isLoading: Authentication check status
   * - login/signInWithGoogle: Initiate Google OAuth flow
   * - logout: Log out current user
   * - isAdmin/isVendor: Role-based access helpers
   * - authenticate: Alternative auth method
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: login,
        signInWithGoogle: login,
        loginWithPassword,
        verifyOTP,
        logout,
        isAdmin: user?.role === 'admin',
        authenticate
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook - Access Authentication Context
 * 
 * Custom hook to access authentication state and methods from any component.
 * Must be used within a component wrapped by AuthProvider.
 * 
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType - Authentication context with user state and methods
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signInWithGoogle, logout, isAdmin } = useAuth();
 *   
 *   if (!user) {
 *     return <button onClick={signInWithGoogle}>Sign In</button>;
 *   }
 *   
 *   return <div>Welcome {user.name}!</div>;
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
