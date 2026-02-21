"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

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

  function openResetModal() {
    setResetEmail(email);
    setResetError(null);
    setResetSuccess(false);
    setIsResetOpen(true);
  }

  function closeResetModal() {
    setIsResetOpen(false);
    setResetError(null);
    setResetSuccess(false);
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) {
      setResetError("Configura Firebase para habilitar el restablecimiento.");
      return;
    }

    if (!resetEmail.trim()) {
      setResetError("Ingresa tu correo corporativo.");
      return;
    }

    setIsResetSubmitting(true);
    setResetError(null);

    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSuccess(true);
    } catch (err) {
      const message =
        (err as Error)?.message ??
        "No pudimos enviar el enlace. Verifica tu correo e inténtalo nuevamente.";
      setResetError(message);
    } finally {
      setIsResetSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-lg flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 text-sm text-muted underline decoration-dotted"
      >
        ← Regresar a la pagina principal
      </Link>

      <div className="relative rounded-3xl border border-black/10 bg-white px-8 pb-8 shadow-[0_25px_60px_rgba(26,18,11,0.08)]">
        <div className="my-4 flex justify-center">
          <div className="p-3">
            <Image
              src="/intechlab-icon.png"
              alt="intechlab logo"
              width={100}
              height={100}
              className="h-12 w-12"
              priority
            />
          </div>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
          Portal interno
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
          Inicia sesión
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
          ¿Sin acceso?{" "}
          <button
            type="button"
            onClick={openResetModal}
            className="font-semibold text-[var(--accent)] underline decoration-dotted"
          >
            Restablece tu contraseña aquí
          </button>
          .
        </p>
      </div>

      {isResetOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="relative w-full max-w-md rounded-3xl border border-black/10 bg-white/95 p-6 shadow-[0_35px_90px_rgba(10,20,40,0.45)]">
            <button
              type="button"
              onClick={closeResetModal}
              className="absolute right-4 top-4 rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted"
              aria-label="Cerrar"
            >
              Cerrar
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-white p-3 shadow-[0_15px_40px_rgba(10,20,40,0.12)]">
                <Image
                  src="/intechlab-icon.png"
                  alt="intechlab logo"
                  width={64}
                  height={64}
                  className="h-10 w-10"
                  priority
                />
              </div>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-muted">
                Acceso seguro
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                Restablecer contraseña
              </h2>
              <p className="mt-3 text-sm text-muted">
                Te enviaremos un enlace temporal al correo registrado. Revisa tu
                bandeja en menos de un minuto.
              </p>
            </div>
            {resetSuccess ? (
              <div className="mt-6 rounded-3xl bg-[#effff5] px-4 py-4 text-sm text-[#146c43]">
                Listo. Valida el correo que acabamos de enviar y sigue las
                instrucciones para definir una nueva contraseña.
              </div>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleResetSubmit}>
                <label className="block text-left">
                  <span className="text-sm font-medium text-muted">
                    Correo corporativo
                  </span>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none focus:border-[var(--accent)]"
                  />
                </label>
                {resetError && (
                  <p className="text-sm text-[#c0392b]">{resetError}</p>
                )}
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="w-full rounded-2xl bg-[var(--accent)] py-3 text-base font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:opacity-60"
                >
                  {isResetSubmitting ? "Enviando enlace..." : "Enviar enlace"}
                </button>
              </form>
            )}
            {resetSuccess ? (
              <button
                type="button"
                className="mt-4 w-full rounded-2xl border border-black/10 py-3 text-sm font-semibold text-[var(--foreground)]"
                onClick={closeResetModal}
              >
                Cerrar
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
