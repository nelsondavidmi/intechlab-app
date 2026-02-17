"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) {
      setError("Debes configurar Firebase para habilitar el ingreso.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError("Credenciales inválidas o usuario inexistente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 text-sm text-muted underline decoration-dotted"
      >
        ← Regresar a la landing
      </Link>
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-[0_25px_60px_rgba(26,18,11,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
          Portal interno
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--foreground)]">
          Inicia sesión para ver tu carga de trabajo.
        </h1>
        {!auth && (
          <p className="mt-4 rounded-2xl bg-[#fff0e8] p-4 text-sm text-[var(--accent-dark)]">
            Aún no hay credenciales de Firebase configuradas. Define las
            variables en
            <span className="font-semibold"> .env.local</span> para activar el
            login.
          </p>
        )}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-muted">
              Correo corporativo
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-muted">Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
            />
          </label>
          {error && <p className="text-sm text-[#c0392b]">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[var(--accent)] py-3 text-center text-base font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60"
          >
            {isSubmitting ? "Verificando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          ¿Sin acceso? Solicita tu usuario a operaciones.
        </p>
      </div>
    </main>
  );
}
