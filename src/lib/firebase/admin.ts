import 'server-only'

import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function parseServiceAccount(): ServiceAccount {
    const raw = process.env.SERVICE_ACCOUNT_JSON ?? process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (error) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido");
        }
    }

    throw new Error("Define SERVICE_ACCOUNT_JSON para inicializar Firebase Admin.");
}

function getOrInitAdminApp(): App {
    if (adminApp) return adminApp;
    const serviceAccount = parseServiceAccount();
    adminApp = getApps().length ? getApps()[0] : initializeApp({
        credential: cert(serviceAccount),
    });
    return adminApp;
}

export function getAdminAuth() {
    return getAuth(getOrInitAdminApp());
}

export function getAdminDb() {
    return getFirestore(getOrInitAdminApp());
}
