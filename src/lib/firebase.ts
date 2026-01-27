import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if config is provided
let app = null;
let analytics = null;

if (firebaseConfig.apiKey) {
    try {
        app = initializeApp(firebaseConfig);

        // Initialize Analytics safely
        if (typeof window !== 'undefined') {
            analytics = getAnalytics(app);
        }
        console.log("🔥 Firebase initialized successfully");
    } catch (err) {
        console.warn("Firebase failed to initialize:", err);
    }
} else {
    console.warn("Firebase configuration missing in environment variables");
}

export { app, analytics };
