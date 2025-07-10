import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hub } from 'aws-amplify';
import { Auth } from 'aws-amplify/auth'; // Corrected import path for Auth
import { User } from 'aws-amplify/auth';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string, attributes?: Record<string, string>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const listener = (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          setUser(data.payload.data);
          showSuccess('로그인되었습니다.');
          break;
        case 'signOut':
          setUser(null);
          showSuccess('로그아웃되었습니다.');
          break;
        case 'signIn_failure':
        case 'signUp_failure':
          showError('인증 오류가 발생했습니다.');
          break;
      }
    };

    Hub.listen('auth', listener);
    checkCurrentUser();

    return () => Hub.remove('auth', listener);
  }, []);

  const signIn = async (username: string, password: string) => {
    setLoading(true);
    try {
      await Auth.signIn({ username, password });
    } catch (error: any) {
      showError(error.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (username: string, password: string, attributes?: Record<string, string>) => {
    setLoading(true);
    try {
      await Auth.signUp({ username, password, attributes });
      showSuccess('회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.');
    } catch (error: any) {
      showError(error.message || '회원가입에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await Auth.signOut();
    } catch (error: any) {
      showError(error.message || '로그아웃에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};