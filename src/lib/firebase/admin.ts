import { readFileSync } from "fs";
import path from "path";
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

    const filePath = process.env.SERVICE_ACCOUNT_PATH ?? process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!filePath) {
        throw new Error("Configura FIREBASE_SERVICE_ACCOUNT_JSON o FIREBASE_SERVICE_ACCOUNT_PATH.");
    }

    try {
        const resolvedPath = path.resolve(process.cwd(), filePath);
        const contents = readFileSync(resolvedPath, "utf-8");
        return JSON.parse(contents);
    } catch (error) {
        throw new Error(`No se pudo leer el archivo del service account: ${error}`);
    }
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
