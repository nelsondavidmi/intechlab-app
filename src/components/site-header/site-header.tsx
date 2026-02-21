"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import type { NavLink } from "./site-header.types";

const navLinks: NavLink[] = [
  { label: "Servicios", href: "#servicios" },
  { label: "Precios", href: "#precios" },
  { label: "Contáctanos", href: "#contacto" },
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const headerClassName = `sticky top-0 z-40 border-b border-black/5 ${isMenuOpen ? "bg-white" : "bg-white/85 backdrop-blur"}`;

  return (
    <header className={headerClassName}>
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
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[var(--foreground)] md:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <div
        id="mobile-nav"
        className={`absolute inset-x-0 top-full z-30 border-b border-black/5 bg-white/85 backdrop-blur transition-all duration-300 md:hidden ${isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className={`mx-auto max-w-6xl px-6 py-1 transition-transform duration-300 ${isMenuOpen ? "translate-y-0" : "-translate-y-2"}`}
        >
          <div
            className={`rounded-3xl border border-black/10 bg-white/95 px-5 py-2 shadow-[0_25px_60px_rgba(3,24,15,0.08)] transition-[transform,opacity] duration-300 ${isMenuOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-muted pt-4">
              Conoce más
            </p>
            <div className="mt-4 flex flex-col divide-y divide-black/5 text-base font-semibold text-[var(--foreground)]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 transition hover:text-[var(--accent-dark)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen ? (
        <button
          type="button"
          className="fixed left-0 right-0 bottom-0 top-[72px] z-10 bg-white/60 backdrop-blur-md transition md:hidden"
          aria-label="Cerrar menú"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}
    </header>
  );
}
