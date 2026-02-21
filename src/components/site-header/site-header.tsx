import Image from "next/image";
import Link from "next/link";

import type { NavLink } from "./site-header.types";

const navLinks: NavLink[] = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Precios", href: "#precios" },
  { label: "Contáctanos", href: "#contacto" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="#inicio" className="flex items-center gap-4">
          <Image
            src="/intechlab-logo-app.png"
            alt="intechlab logo"
            width={180}
            height={48}
            className="h-10 w-auto"
            priority
          />
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.45em] text-[var(--accent-dark)]">
              Estética y función
            </p>
            <p className="text-sm text-muted">Laboratorio dental</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-[var(--foreground)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
