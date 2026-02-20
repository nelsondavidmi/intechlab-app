"use client";

import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    orderBy,
    query,
    type DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { Dentist } from "@/types/dentist";

const mockDentists: Dentist[] = [
    {
        id: "demo-dentist-001",
        name: "Doctor de prueba",
        email: "doctor@intechlab.com",
        role: "doctor",
    },
];

export function useDentists() {
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setDentists(mockDentists);
            setLoading(false);
            return;
        }

        const dentistsQuery = query(
            collection(db, "dentist"),
            orderBy("name", "asc"),
        );

        const unsubscribe = onSnapshot(dentistsQuery, (snapshot) => {
            const next = snapshot.docs.map((doc) =>
                normalizeDentist(doc.id, doc.data()),
            );
            setDentists(next);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { dentists, loading };
}

function normalizeDentist(id: string, data: DocumentData): Dentist {
    return {
        id,
        name: data.name ?? "Sin nombre",
        email: data.email ?? "",
        phone: data.phone,
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? data.createdAt,
        role: "doctor",
    };
}
