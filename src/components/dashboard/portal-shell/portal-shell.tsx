type PortalShellProps = {
  children: React.ReactNode;
};

export function PortalShell({ children }: PortalShellProps) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="rounded-4xl border border-black/10 bg-white/80 p-8 shadow-[0_30px_80px_rgba(26,18,11,0.1)]">
        {children}
      </div>
    </main>
  );
}
