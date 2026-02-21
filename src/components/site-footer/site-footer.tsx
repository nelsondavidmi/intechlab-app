import Link from "next/link";
import { Instagram } from "lucide-react";

const footerLinks = [
  { label: "Servicios", href: "#servicios" },
  { label: "Precios", href: "#precios" },
  { label: "Contacto", href: "#contacto" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-black/5 bg-gradient-to-b from-white via-white to-[#f5f6fb]">
      <div className="border-t border-black/5 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <Instagram
              className="size-4 text-[var(--accent-dark)]"
              aria-hidden="true"
            />
            <a
              href="https://www.instagram.com/intechlabmed/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold hover:text-[var(--accent-dark)]"
            >
              @intechlabmed
            </a>
          </div>
          <p>© Intechlab es una marca registrada. {currentYear}.</p>
          <p>Todos los derechos reservados.</p>
          <a
            href="/login"
            className="font-semibold hover:text-[var(--accent-dark)]"
          >
            Entrar al portal
          </a>
        </div>
      </div>
    </footer>
  );
}
