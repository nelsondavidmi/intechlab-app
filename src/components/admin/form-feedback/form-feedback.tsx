import { AlertTriangle, CheckCircle2 } from "lucide-react";

export type FormMessage = {
  type: "success" | "error";
  text: string;
} | null;

export function FormFeedback({ message }: { message: FormMessage }) {
  if (!message) return null;

  const isSuccess = message.type === "success";
  const baseClasses =
    "mt-4 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm";
  const variantClasses = isSuccess
    ? "bg-[#e9f6ee] text-[#1f8f58]"
    : "bg-[#ffe6e0] text-[#c0392b]";

  return (
    <p className={`${baseClasses} ${variantClasses}`}>
      {isSuccess ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <AlertTriangle className="size-4" />
      )}
      {message.text}
    </p>
  );
}
