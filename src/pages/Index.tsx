import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "react-oidc-context";
import React from "react";

const Index = () => {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = "16bdq2fib11bcss6po40koivdi"; // This should ideally come from config/env
    const logoutUri = "https://d84l1y8p4kdic.cloudfront.net"; // This should match redirect_uri
    const cognitoDomain = "https://ap-northeast-1xv5gzrnik.auth.ap-northeast-1.amazoncognito.com"; // This should ideally come from config/env
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Encountering error...</h1>
          <p className="text-xl text-gray-600">{auth.error.message}</p>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  if (auth.isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Welcome!</h1>
          <pre className="text-left text-gray-700 mb-2">Email: {auth.user?.profile.email}</pre>
          <pre className="text-left text-gray-700 mb-2 break-all">ID Token: {auth.user?.id_token?.substring(0, 50)}...</pre>
          <pre className="text-left text-gray-700 mb-4 break-all">Access Token: {auth.user?.access_token?.substring(0, 50)}...</pre>
          <button
            onClick={() => auth.removeUser()}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Sign out (OIDC)
          </button>
          <button
            onClick={signOutRedirect}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors mt-2"
          >
            Sign out (Cognito Redirect)
          </button>
        </div>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">K-Fashion Platform</h1>
        <button
          onClick={() => auth.signinRedirect()}
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors mb-2"
        >
          Sign in
        </button>
        <button
          onClick={signOutRedirect}
          className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
        >
          Sign out (Cognito Redirect)
        </button>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;