"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useJobs } from "@/hooks/useJobs";
import type { Job, JobStatus } from "@/types/job";
import { ArrowRight, LogOut } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOutUser } = useAuth();
  const {
    jobs,
    groupedByStatus,
    loading: jobsLoading,
  } = useJobs(user ? { assignedTo: user.displayName ?? undefined } : undefined);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <PortalShell>
        <p className="text-muted">Verificando sesión...</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <header className="flex flex-col gap-4 border-b border-black/10 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-muted">
            Carga personal
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            Hola {user.displayName ?? user.email}, estos son tus trabajos.
          </h1>
          <p className="text-sm text-muted">
            Última actualización:{" "}
            {new Intl.DateTimeFormat("es-ES", {
              dateStyle: "full",
              timeStyle: "short",
            }).format(new Date())}
          </p>
        </div>
        <button
          onClick={signOutUser}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:border-black/30"
        >
          <LogOut className="size-4" />
          Salir
        </button>
      </header>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {statusOrder.map((status) => {
          const statusJobs = groupedByStatus[status];
          return (
            <article
              key={status}
              className="rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_20px_50px_rgba(26,18,11,0.07)]"
            >
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-muted">
                    {status}
                  </p>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">
                    {statusJobs.length} casos
                  </h2>
                </div>
                <span className="text-sm text-muted">Ordenado por entrega</span>
              </header>
              <div className="mt-4 space-y-4">
                {(jobsLoading ? skeletonJobs : statusJobs).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="mt-10 flex items-center justify-between rounded-3xl border border-black/10 bg-[var(--card)] px-6 py-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Necesitas algo
          </p>
          <p className="text-base text-[var(--foreground)]">
            Reporta bloqueos directamente al administrador para reasignar.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin")}
          className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          Ir a administración
          <ArrowRight className="size-4" />
        </button>
      </section>
    </PortalShell>
  );
}

function JobCard({ job }: { job: Job }) {
  const badge = statusConfig[job.status];

  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-[var(--foreground)]">
          {job.patientName}
        </p>
        <span
          className={`${badge.bg} ${badge.text} rounded-full px-3 py-1 text-xs font-semibold`}
        >
          {badge.label}
        </span>
      </div>
      <p className="text-sm text-muted">{job.treatment}</p>
      <div className="mt-3 flex items-center justify-between text-sm text-muted">
        <span>{job.dentist}</span>
        <span>{formatDate(job.dueDate)}</span>
      </div>
      {job.notes && (
        <p className="mt-2 text-sm text-muted">Nota: {job.notes}</p>
      )}
    </div>
  );
}

const statusConfig = {
  pendiente: { label: "Pendiente", bg: "bg-[#fff4de]", text: "text-[#b77516]" },
  "en-proceso": {
    label: "En proceso",
    bg: "bg-[#e4f0ff]",
    text: "text-[#1f4db8]",
  },
  listo: { label: "Listo", bg: "bg-[#dff3e3]", text: "text-[#1f8f58]" },
  entregado: { label: "Entregado", bg: "bg-[#e9e9e9]", text: "text-[#5d5d5d]" },
} as const;

const statusOrder: JobStatus[] = [
  "pendiente",
  "en-proceso",
  "listo",
  "entregado",
];

const skeletonJobs: Job[] = Array.from({ length: 3 }).map((_, index) => ({
  id: `placeholder-${index}`,
  patientName: "Sincronizando...",
  treatment: "",
  dentist: "",
  dueDate: new Date().toISOString(),
  assignedTo: "",
  status: "pendiente",
  priority: "media",
}));

function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-4xl border border-black/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(26,18,11,0.1)]">
        {children}
      </div>
    </main>
  );
}

function formatDate(date: string) {
  if (!date) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
