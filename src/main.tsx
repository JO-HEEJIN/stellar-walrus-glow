import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Amplify } from "aws-amplify";
import { AuthConfig } from "aws-amplify/auth"; // Import AuthConfig type

// Configure AWS Amplify with your Cognito details
const authConfig: AuthConfig = {
  Cognito: {
    userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
    region: import.meta.env.VITE_AWS_REGION, // Region is here
  },
};

Amplify.configure({
  Auth: authConfig,
});

createRoot(document.getElementById("root")!).render(<App />);