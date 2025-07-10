import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Amplify } from "aws-amplify";

// Configure AWS Amplify with your Cognito details
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_WEB_CLIENT_ID,
      region: import.meta.env.VITE_AWS_REGION, // Corrected: region is inside Cognito
    },
  },
});

createRoot(document.getElementById("root")!).render(<App />);