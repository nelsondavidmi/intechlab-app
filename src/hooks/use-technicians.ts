"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, type DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Technician } from "@/types/technician";

const mockTechnicians: Technician[] = [
    {
        id: "lab-tech-001",
        name: "Laboratorista demo",
        email: "demo@intechlab.com",
    },
];

export function useTechnicians() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setTechnicians(mockTechnicians);
            setLoading(false);
            return;
        }

        const techniciansQuery = query(
            collection(db, "technicians"),
            orderBy("name", "asc"),
        );

        const unsubscribe = onSnapshot(techniciansQuery, (snapshot) => {
            const next = snapshot.docs.map((doc) => normalizeTechnician(doc.id, doc.data()));
            setTechnicians(next);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { technicians, loading };
}

function normalizeTechnician(id: string, data: DocumentData): Technician {
    return {
        id,
        name: data.name ?? "Sin nombre",
        email: data.email ?? "",
        phone: data.phone,
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt,
    };
}
