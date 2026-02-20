export const PHONE_COUNTRY_OPTIONS = [
    { code: "+57", label: "Colombia", digits: 10, flag: "🇨🇴" },
    { code: "+1", label: "Estados Unidos", digits: 10, flag: "🇺🇸" },
] as const;

export type PhoneCountryCode = (typeof PHONE_COUNTRY_OPTIONS)[number]["code"];

export const DEFAULT_PHONE_COUNTRY: PhoneCountryCode = PHONE_COUNTRY_OPTIONS[0].code;

export const PHONE_COUNTRY_DIGITS: Record<PhoneCountryCode, number> = Object.fromEntries(
    PHONE_COUNTRY_OPTIONS.map(({ code, digits }) => [code, digits]),
) as Record<PhoneCountryCode, number>;

export const PHONE_COUNTRY_LABELS: Record<PhoneCountryCode, string> = Object.fromEntries(
    PHONE_COUNTRY_OPTIONS.map(({ code, label }) => [code, label]),
) as Record<PhoneCountryCode, string>;
