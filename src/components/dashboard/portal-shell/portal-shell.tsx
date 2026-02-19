type PortalShellProps = {
  children: React.ReactNode;
  maxWidthClass?: string;
  contentClassName?: string;
};

export function PortalShell({
  children,
  maxWidthClass = "max-w-5xl",
  contentClassName = "bg-white/80",
}: PortalShellProps) {
  return (
    <main className={`mx-auto ${maxWidthClass} px-6 py-12`}>
      <div
        className={`rounded-4xl border border-black/10 p-8 shadow-[0_30px_80px_rgba(26,18,11,0.1)] ${contentClassName}`}
      >
        {children}
      </div>
    </main>
  );
}
