import {
    PHONE_COUNTRY_DIGITS,
    PHONE_COUNTRY_LABELS,
    type PhoneCountryCode,
} from "@/constants/phone-country";

export function formatDateInputValue(value: Date) {
    const offsetMinutes = value.getTimezoneOffset();
    const localTime = new Date(value.getTime() - offsetMinutes * 60000);
    return localTime.toISOString().slice(0, 16);
}

export function buildPhoneNumber(
    country: PhoneCountryCode,
    digits: string,
): string | null {
    const sanitized = digits.replace(/[^\d]/g, "");
    const expected = PHONE_COUNTRY_DIGITS[country];
    if (!sanitized || sanitized.length !== expected) {
        return null;
    }
    return `${country} ${sanitized}`;
}

export function phoneErrorMessage(country: PhoneCountryCode) {
    const label = PHONE_COUNTRY_LABELS[country];
    const digits = PHONE_COUNTRY_DIGITS[country];
    return `Ingresa un teléfono válido de ${label} con ${digits} dígitos.`;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string) {
    return EMAIL_REGEX.test(value.trim());
}
