import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_ME } from '@/apollo/operations';
import { clearApolloCache } from '@/apollo/client';
import type { AuthContextType, User, RegisterInput } from '@/features/auth/types';
import toast from 'react-hot-toast';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Login Mutation
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token: newToken, user: newUser } = data.login;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('authToken', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      toast.success('Login successful!');
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed');
      throw error;
    },
  });

  // Register Mutation
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      toast.success('Registration successful! Please log in.');
    },
    onError: (error) => {
      toast.error(error.message || 'Registration failed');
      throw error;
    },
  });

  // Get Current User Query
  const { refetch: refetchMe } = useQuery(GET_ME, {
    skip: !token,
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        localStorage.setItem('user', JSON.stringify(data.me));
      }
    },
    onError: (error) => {
      console.error('Failed to fetch user:', error);
      // If fetching user fails, clear auth
      if (error.graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED')) {
        logout();
      }
    },
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Validate token by fetching user
          refetchMe().catch(() => {
            // If validation fails, clear auth
            logout();
          });
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          logout();
        }
      }

      setIsInitialized(true);
    };

    initAuth();
  }, [refetchMe]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      await loginMutation({
        variables: { email, password },
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register function
  const register = async (input: RegisterInput) => {
    try {
      await registerMutation({
        variables: { input },
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    clearApolloCache();
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading: loginLoading || registerLoading || !isInitialized,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};