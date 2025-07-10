import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { Amplify } from "aws-amplify";

// Configure Amplify with your Cognito details
// You will need to replace these with your actual Cognito User Pool details
// It's recommended to use environment variables for these in a real application
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_APP_COGNITO_USER_POOL_ID || "YOUR_COGNITO_USER_POOL_ID",
      userPoolClientId: import.meta.env.VITE_APP_COGNITO_CLIENT_ID || "YOUR_COGNITO_CLIENT_ID",
      signUpVerificationMethod: 'code', // 'code' or 'link'
      region: import.meta.env.VITE_APP_COGNITO_REGION || "ap-northeast-2", // e.g., 'ap-northeast-2'
    },
  },
});

createRoot(document.getElementById("root")!).render(<App />);