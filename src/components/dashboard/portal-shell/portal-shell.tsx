type PortalShellProps = {
  children: React.ReactNode;
  maxWidthClass?: string;
  contentClassName?: string;
  paddingClass?: string;
};

export function PortalShell({
  children,
  maxWidthClass = "max-w-5xl",
  contentClassName = "bg-white/80",
  paddingClass = "px-4 py-8 sm:px-6 sm:py-12",
}: PortalShellProps) {
  return (
    <main className={`mx-auto ${maxWidthClass} ${paddingClass}`}>
      <div
        className={`rounded-4xl border border-black/10 p-5 shadow-[0_30px_80px_rgba(26,18,11,0.1)] sm:p-8 ${contentClassName}`}
      >
        {children}
      </div>
    </main>
  );
}
