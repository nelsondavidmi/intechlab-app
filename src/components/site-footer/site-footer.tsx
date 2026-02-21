import Link from "next/link";

const footerLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Precios", href: "#precios" },
  { label: "Contacto", href: "#contacto" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-black/5 bg-gradient-to-b from-white via-white to-[#f5f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <p className="inline-flex items-center rounded-full bg-[var(--accent)]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent-dark)]">
            intechlab
          </p>
          <h3 className="text-3xl font-semibold text-[var(--foreground)]">
            Restauraciones boutique para clínicas exigentes.
          </h3>
          <p className="max-w-xl text-sm text-muted">
            Evidencia fotográfica, soporte directo y un portal pensado para
            doctores. Confirma tus próximos casos y mantén a tu equipo alineado.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-muted">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-black/10 px-4 py-2 text-[var(--foreground)] transition hover:border-black/30"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[32px] border border-black/5 bg-white/80 p-6 text-sm shadow-[0_25px_60px_rgba(3,24,15,0.08)]">
          <p className="text-xs uppercase tracking-[0.4em] text-muted">
            Portal interno
          </p>
          <p className="text-base text-[var(--foreground)]">
            Accede a la plataforma operativa para doctores y laboratorio.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Entrar al portal
          </Link>
        </div>
      </div>
      <div className="border-t border-black/5 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© Intechlab es una marca registrada. {currentYear}.</p>
          <p>Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
