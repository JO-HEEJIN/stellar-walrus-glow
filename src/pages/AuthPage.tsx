import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MadeWithDyad } from '@/components/made-with-dyad';

const AuthPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">K-Fashion Platform</h1>
        <Authenticator
          formFields={{
            signUp: {
              email: {
                order: 1,
                isRequired: true,
                label: '이메일 주소',
                placeholder: '이메일을 입력해주세요',
              },
              password: {
                order: 2,
                isRequired: true,
                label: '비밀번호',
                placeholder: '비밀번호를 입력해주세요',
              },
              confirm_password: {
                order: 3,
                isRequired: true,
                label: '비밀번호 확인',
                placeholder: '비밀번호를 다시 입력해주세요',
              },
            },
          }}
          components={{
            Header: () => (
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">로그인 또는 회원가입</h2>
              </div>
            ),
            Footer: () => (
              <div className="text-center mt-6 text-sm text-gray-500">
                계정이 없으신가요? 지금 바로 가입하세요!
              </div>
            ),
          }}
        >
          {({ signOut, user }) => (
            <main>
              <h1 className="text-xl font-bold mb-4">Hello {user?.username}</h1>
              <button onClick={signOut} className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors">Sign Out</button>
            </main>
          )}
        </Authenticator>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AuthPage;