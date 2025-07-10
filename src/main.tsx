import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./amplify-config.ts"; // Import Amplify configuration
import { AuthProvider } from "./components/AuthProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);