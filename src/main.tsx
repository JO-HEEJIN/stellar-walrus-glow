import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AuthProvider } from "react-oidc-context";
import React from "react";

const oidcConfig = {
  authority: `https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_xV5GZRniK`,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID || "16bdq2fib11bcss6po40koivdi",
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "email openid phone",
  automaticSilentRenew: true,
  loadUserInfo: true,
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);