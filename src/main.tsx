import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary';
import './lib/firebase'; // Initialize Firebase
import App from "./App.tsx";
import "./index.css";

// Security: Disable logs in production
if (import.meta.env.PROD) {
    console.log = () => { };
    console.debug = () => { };
    console.warn = () => { };
    console.info = () => { };
}

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <ErrorBoundary>
            {clientId ? (
                <GoogleOAuthProvider clientId={clientId}>
                    <App />
                </GoogleOAuthProvider>
            ) : (
                <App />
            )}
        </ErrorBoundary>
    </HelmetProvider>
);
