import { Authenticator, useTheme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { MadeWithDyad } from './made-with-dyad';

const AuthForm = () => {
  const { tokens } = useTheme();

  const formFields = {
    signIn: {
      username: {
        placeholder: 'Enter your email',
      },
    },
    signUp: {
      email: {
        order: 1,
        placeholder: 'Enter your email',
      },
      password: {
        order: 2,
        placeholder: 'Enter your password',
      },
      confirm_password: {
        order: 3,
        placeholder: 'Confirm your password',
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <Authenticator
          formFields={formFields}
          components={{
            Header() {
              return (
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">K-Fashion Platform</h1>
                  <p className="text-gray-600 dark:text-gray-400">Sign in or create an account</p>
                </div>
              );
            },
            Footer() {
              return (
                <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  <p>&copy; 2025 K-Fashion. All rights reserved.</p>
                </div>
              );
            },
          }}
        >
          {({ signOut, user }) => (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Hello {user?.username}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You are successfully logged in.
              </p>
              <button
                onClick={signOut}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </Authenticator>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AuthForm;