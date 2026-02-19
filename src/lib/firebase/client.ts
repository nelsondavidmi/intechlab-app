import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
] as const;

const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
const isConfigured = missingKeys.length === 0;

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getOrInitApp() {
    if (!isConfigured) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
                "Firebase no configurado. Añade las variables en .env.local.",
                missingKeys
            );
        }
        return null;
    }

    if (app) return app;

    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return app;
}

export const firebaseApp = getOrInitApp();
export const auth = (() => {
    if (!firebaseApp) return null;
    if (authInstance) return authInstance;
    authInstance = getAuth(firebaseApp);
    return authInstance;
})();

export const db = (() => {
    if (!firebaseApp) return null;
    if (firestoreInstance) return firestoreInstance;
    firestoreInstance = getFirestore(firebaseApp);
    return firestoreInstance;
})();

export const firebaseReady = Boolean(firebaseApp);

export const storage = (() => {
    if (!firebaseApp) return null;
    if (storageInstance) return storageInstance;
    storageInstance = getStorage(firebaseApp);
    return storageInstance;
})();
