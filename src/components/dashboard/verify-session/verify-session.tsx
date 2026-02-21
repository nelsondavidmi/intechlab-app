import Image from "next/image";

type VerifySessionProps = {
  label?: string;
};

export function VerifySession({
  label = "Verificando sesión",
}: VerifySessionProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div>
        <Image
          src="/intechlab-icon.png"
          alt="intechlab logo"
          width={160}
          height={160}
          className="h-20 w-20 animate-bounce"
          priority
        />
      </div>
      <p className="text-sm uppercase tracking-[0.4em] text-muted">{label}</p>
    </div>
  );
}
