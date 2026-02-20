export function formatContactLabel(
    name?: string | null,
    email?: string | null,
) {
    if (name && email) {
        return `${name} — ${email}`;
    }

    return name || email || "";
}
