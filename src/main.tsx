import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AuthProvider } from "react-oidc-context";
import React from "react";

const oidcConfig = {
  authority: import.meta.env.VITE_COGNITO_DOMAIN || "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_xV5GZRniK",
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID || "16bdq2fib11bcss6po40koivdi",
  redirect_uri: import.meta.env.VITE_REDIRECT_URI || "https://d84l1y8p4kdic.cloudfront.net",
  response_type: "code",
  scope: "email openid phone",
  client_secret: import.meta.env.VITE_CLIENT_SECRET,
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);