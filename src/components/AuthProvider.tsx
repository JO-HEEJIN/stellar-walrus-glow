import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { User } from 'aws-amplify/auth';
import { showSuccess, showError } from '@/utils/toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, attributes?: Record<string, string>) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resendSignUpCode: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await Auth.currentAuthenticatedUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const listener = (data: any) => {
      switch (data.payload.event) {
        case 'signIn':
          setUser(data.payload.data);
          showSuccess('로그인 성공!');
          break;
        case 'signOut':
          setUser(null);
          showSuccess('로그아웃 되었습니다.');
          break;
        case 'signUp':
          showSuccess('회원가입 성공! 이메일로 전송된 코드를 확인해주세요.');
          break;
        case 'signIn_failure':
        case 'signUp_failure':
          showError('인증 실패: ' + data.payload.data.message);
          break;
      }
      checkCurrentUser(); // Re-check user status on auth events
    };

    Hub.listen('auth', listener);
    checkCurrentUser(); // Initial check

    return () => Hub.remove('auth', listener);
  }, []);

  const signIn = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await Auth.signIn(username, password);
    } catch (error: any) {
      showError(error.message || '로그인 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await Auth.signOut();
    } catch (error: any) {
      showError(error.message || '로그아웃 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (username: string, password: string, attributes?: Record<string, string>) => {
    setIsLoading(true);
    try {
      await Auth.signUp({
        username,
        password,
        attributes,
      });
    } catch (error: any) {
      showError(error.message || '회원가입 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (username: string, code: string) => {
    setIsLoading(true);
    try {
      await Auth.confirmSignUp(username, code);
      showSuccess('이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.');
    } catch (error: any) {
      showError(error.message || '인증 코드 확인 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendSignUpCode = async (username: string) => {
    setIsLoading(true);
    try {
      await Auth.resendSignUpCode(username);
      showSuccess('인증 코드가 재전송되었습니다.');
    } catch (error: any) {
      showError(error.message || '인증 코드 재전송 실패');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signUp, confirmSignUp, resendSignUpCode }}>
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