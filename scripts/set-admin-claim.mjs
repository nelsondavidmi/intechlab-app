#!/usr/bin/env node

import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

dotenv.config({ path: ".env.local" });

const email = process.argv[2];

if (!email) {
  console.error("Uso: node scripts/set-admin-claim.mjs usuario@dominio");
  process.exit(1);
}

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!rawServiceAccount) {
  console.error("Falta FIREBASE_SERVICE_ACCOUNT_JSON en el entorno.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(rawServiceAccount);
} catch (error) {
  console.error("No se pudo parsear FIREBASE_SERVICE_ACCOUNT_JSON:", error);
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

async function main() {
  const auth = getAuth();
  const userRecord = await auth.getUserByEmail(email).catch((error) => {
    console.error("No se encontró el usuario:", error.message);
    process.exit(1);
  });

  const nextClaims = { ...userRecord.customClaims, role: "admin" };

  await auth.setCustomUserClaims(userRecord.uid, nextClaims);
  console.log(`Usuario ${email} ahora tiene role=admin.`);
}

main().catch((error) => {
  console.error("Error al asignar el rol:", error);
  process.exit(1);
});
