import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

const dentistSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
});

const deleteDentistSchema = z.object({
    uid: z.string().min(1),
});

export async function POST(request: Request) {
    try {
        const payload = dentistSchema.parse(await request.json());

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "No autorizado." }, { status: 401 });
        }

        const adminToken = authHeader.split(" ")[1];
        if (!adminToken) {
            return NextResponse.json({ message: "No autorizado." }, { status: 401 });
        }

        const auth = getAdminAuth();
        const decoded = await auth.verifyIdToken(adminToken).catch(() => null);

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json(
                { message: "Solo administradores pueden registrar doctores." },
                { status: 403 },
            );
        }

        const db = getAdminDb();

        const userRecord = await auth.createUser({
            email: payload.email,
            password: payload.password,
            displayName: payload.name,
        });

        await auth.setCustomUserClaims(userRecord.uid, {
            role: "doctor",
        });

        await db.collection("dentist").doc(userRecord.uid).set({
            name: payload.name,
            email: payload.email,
            phone: payload.phone ?? null,
            role: "doctor",
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ uid: userRecord.uid }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0]?.message ?? "Datos inválidos" },
                { status: 400 },
            );
        }

        if (typeof error === "object" && error && "code" in error) {
            const code = (error as { code: string }).code;
            if (code === "auth/email-already-exists") {
                return NextResponse.json(
                    { message: "Ya existe un usuario con ese correo." },
                    { status: 400 },
                );
            }
            if (code === "auth/id-token-expired") {
                return NextResponse.json(
                    { message: "Tu sesión expiró. Ingresa nuevamente." },
                    { status: 401 },
                );
            }
        }

        console.error("Error creando doctor:", error);
        return NextResponse.json(
            { message: "No se pudo registrar al doctor." },
            { status: 500 },
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const payload = deleteDentistSchema.parse(await request.json());

        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ message: "No autorizado." }, { status: 401 });
        }

        const adminToken = authHeader.split(" ")[1];
        if (!adminToken) {
            return NextResponse.json({ message: "No autorizado." }, { status: 401 });
        }

        const auth = getAdminAuth();
        const decoded = await auth.verifyIdToken(adminToken).catch(() => null);

        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json(
                { message: "Solo administradores pueden eliminar doctores." },
                { status: 403 },
            );
        }

        const db = getAdminDb();

        await auth.deleteUser(payload.uid).catch((error) => {
            if (error?.code === "auth/user-not-found") {
                return;
            }
            throw error;
        });

        await db.collection("dentist").doc(payload.uid).delete().catch(() => undefined);

        return NextResponse.json({ message: "Doctor eliminado." }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.issues[0]?.message ?? "Datos inválidos" },
                { status: 400 },
            );
        }

        if (typeof error === "object" && error && "code" in error) {
            const code = (error as { code: string }).code;
            if (code === "auth/id-token-expired") {
                return NextResponse.json(
                    { message: "Tu sesión expiró. Ingresa nuevamente." },
                    { status: 401 },
                );
            }
        }

        console.error("Error eliminando doctor:", error);
        return NextResponse.json(
            { message: "No se pudo eliminar al doctor." },
            { status: 500 },
        );
    }
}
