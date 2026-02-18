import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const technicianSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const payload = technicianSchema.parse(await request.json());

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
            return NextResponse.json({ message: "Solo administradores pueden registrar laboratoristas." }, { status: 403 });
        }

        const db = getAdminDb();

        const userRecord = await auth.createUser({
            email: payload.email,
            password: payload.password,
            displayName: payload.name,
        });

        await db.collection("technicians").doc(userRecord.uid).set({
            name: payload.name,
            email: payload.email,
            phone: payload.phone ?? null,
            createdAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json(
            {
                uid: userRecord.uid,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
        }

        if (typeof error === "object" && error && "code" in error) {
            const code = (error as { code: string }).code;
            if (code === "auth/email-already-exists") {
                return NextResponse.json({ message: "Ya existe un usuario con ese correo." }, { status: 400 });
            }
            if (code === "auth/id-token-expired") {
                return NextResponse.json({ message: "Tu sesión expiró. Ingresa nuevamente." }, { status: 401 });
            }
        }

        console.error("Error creando laboratorista:", error);
        return NextResponse.json({ message: "No se pudo registrar al laboratorista." }, { status: 500 });
    }
}
