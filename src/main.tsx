import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Amplify } from "aws-amplify";
// Removed: import { AuthConfig } from "aws-amplify/auth";

// Configure AWS Amplify with your Cognito details
// Removed: AuthConfig type annotation
const authConfig = {
  Cognito: {
    userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
    region: import.meta.env.VITE_AWS_REGION, // This placement is correct for v6
  },
};

Amplify.configure({
  Auth: authConfig,
});

createRoot(document.getElementById("root")!).render(<App />);