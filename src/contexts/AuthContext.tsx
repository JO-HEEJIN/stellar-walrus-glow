import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hub } from 'aws-amplify';
import { signIn, signUp, signOut, currentAuthenticatedUser, User } from 'aws-amplify/auth'; // Corrected imports
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
        const currentUser = await currentAuthenticatedUser(); // Changed from Auth.currentAuthenticatedUser()
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

  const signInUser = async (username: string, password: string) => { // Renamed to avoid conflict with imported signIn
    setLoading(true);
    try {
      await signIn({ username, password }); // Changed from Auth.signIn()
    } catch (error: any) {
      showError(error.message || '로그인에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpUser = async (username: string, password: string, attributes?: Record<string, string>) => { // Renamed to avoid conflict with imported signUp
    setLoading(true);
    try {
      await signUp({ username, password, attributes }); // Changed from Auth.signUp()
      showSuccess('회원가입이 완료되었습니다. 이메일 인증을 완료해주세요.');
    } catch (error: any) {
      showError(error.message || '회원가입에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => { // Renamed to avoid conflict with imported signOut
    setLoading(true);
    try {
      await signOut(); // Changed from Auth.signOut()
    } catch (error: any) {
      showError(error.message || '로그아웃에 실패했습니다.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, signIn: signInUser, signUp: signUpUser, signOut: signOutUser }}>
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