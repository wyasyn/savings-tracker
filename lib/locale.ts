/* -------------------------------------------------------------------------- */
/*  Reference data for onboarding: countries, their default currency, the     */
/*  set of savings channels, and small lookup helpers. Kept dependency-free.  */
/* -------------------------------------------------------------------------- */

export type Country = {
  /** ISO 3166-1 alpha-2 code, e.g. "UG". */
  code: string
  name: string
  /** ISO 4217 currency code, e.g. "UGX". */
  currency: string
}

// Curated list: all of Africa (the app's primary context) plus major global
// economies. Add more as needed — the combobox handles any length.
export const COUNTRIES: Country[] = [
  { code: "UG", name: "Uganda", currency: "UGX" },
  { code: "KE", name: "Kenya", currency: "KES" },
  { code: "TZ", name: "Tanzania", currency: "TZS" },
  { code: "RW", name: "Rwanda", currency: "RWF" },
  { code: "BI", name: "Burundi", currency: "BIF" },
  { code: "SS", name: "South Sudan", currency: "SSP" },
  { code: "ET", name: "Ethiopia", currency: "ETB" },
  { code: "SO", name: "Somalia", currency: "SOS" },
  { code: "DJ", name: "Djibouti", currency: "DJF" },
  { code: "ER", name: "Eritrea", currency: "ERN" },
  { code: "SD", name: "Sudan", currency: "SDG" },
  { code: "CD", name: "DR Congo", currency: "CDF" },
  { code: "CG", name: "Congo", currency: "XAF" },
  { code: "NG", name: "Nigeria", currency: "NGN" },
  { code: "GH", name: "Ghana", currency: "GHS" },
  { code: "ZA", name: "South Africa", currency: "ZAR" },
  { code: "EG", name: "Egypt", currency: "EGP" },
  { code: "MA", name: "Morocco", currency: "MAD" },
  { code: "DZ", name: "Algeria", currency: "DZD" },
  { code: "TN", name: "Tunisia", currency: "TND" },
  { code: "LY", name: "Libya", currency: "LYD" },
  { code: "CM", name: "Cameroon", currency: "XAF" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
  { code: "SN", name: "Senegal", currency: "XOF" },
  { code: "ML", name: "Mali", currency: "XOF" },
  { code: "BF", name: "Burkina Faso", currency: "XOF" },
  { code: "NE", name: "Niger", currency: "XOF" },
  { code: "BJ", name: "Benin", currency: "XOF" },
  { code: "TG", name: "Togo", currency: "XOF" },
  { code: "GN", name: "Guinea", currency: "GNF" },
  { code: "SL", name: "Sierra Leone", currency: "SLE" },
  { code: "LR", name: "Liberia", currency: "LRD" },
  { code: "GM", name: "Gambia", currency: "GMD" },
  { code: "GW", name: "Guinea-Bissau", currency: "XOF" },
  { code: "MR", name: "Mauritania", currency: "MRU" },
  { code: "TD", name: "Chad", currency: "XAF" },
  { code: "CF", name: "Central African Republic", currency: "XAF" },
  { code: "GA", name: "Gabon", currency: "XAF" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF" },
  { code: "AO", name: "Angola", currency: "AOA" },
  { code: "ZM", name: "Zambia", currency: "ZMW" },
  { code: "ZW", name: "Zimbabwe", currency: "ZWG" },
  { code: "MW", name: "Malawi", currency: "MWK" },
  { code: "MZ", name: "Mozambique", currency: "MZN" },
  { code: "BW", name: "Botswana", currency: "BWP" },
  { code: "NA", name: "Namibia", currency: "NAD" },
  { code: "LS", name: "Lesotho", currency: "LSL" },
  { code: "SZ", name: "Eswatini", currency: "SZL" },
  { code: "MG", name: "Madagascar", currency: "MGA" },
  { code: "MU", name: "Mauritius", currency: "MUR" },
  { code: "SC", name: "Seychelles", currency: "SCR" },
  { code: "CV", name: "Cabo Verde", currency: "CVE" },
  { code: "ST", name: "São Tomé and Príncipe", currency: "STN" },
  { code: "KM", name: "Comoros", currency: "KMF" },
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "NZ", name: "New Zealand", currency: "NZD" },
  { code: "IE", name: "Ireland", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "PT", name: "Portugal", currency: "EUR" },
  { code: "BE", name: "Belgium", currency: "EUR" },
  { code: "SE", name: "Sweden", currency: "SEK" },
  { code: "NO", name: "Norway", currency: "NOK" },
  { code: "DK", name: "Denmark", currency: "DKK" },
  { code: "CH", name: "Switzerland", currency: "CHF" },
  { code: "AE", name: "United Arab Emirates", currency: "AED" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR" },
  { code: "QA", name: "Qatar", currency: "QAR" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "PK", name: "Pakistan", currency: "PKR" },
  { code: "BD", name: "Bangladesh", currency: "BDT" },
  { code: "CN", name: "China", currency: "CNY" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "MY", name: "Malaysia", currency: "MYR" },
  { code: "ID", name: "Indonesia", currency: "IDR" },
  { code: "PH", name: "Philippines", currency: "PHP" },
  { code: "TR", name: "Türkiye", currency: "TRY" },
  { code: "BR", name: "Brazil", currency: "BRL" },
  { code: "MX", name: "Mexico", currency: "MXN" },
]

export type CurrencyOption = { code: string; name: string }

const CURRENCY_NAMES: Record<string, string> = {
  UGX: "Ugandan Shilling",
  KES: "Kenyan Shilling",
  TZS: "Tanzanian Shilling",
  RWF: "Rwandan Franc",
  BIF: "Burundian Franc",
  SSP: "South Sudanese Pound",
  ETB: "Ethiopian Birr",
  SOS: "Somali Shilling",
  DJF: "Djiboutian Franc",
  ERN: "Eritrean Nakfa",
  SDG: "Sudanese Pound",
  CDF: "Congolese Franc",
  XAF: "Central African CFA Franc",
  XOF: "West African CFA Franc",
  NGN: "Nigerian Naira",
  GHS: "Ghanaian Cedi",
  ZAR: "South African Rand",
  EGP: "Egyptian Pound",
  MAD: "Moroccan Dirham",
  DZD: "Algerian Dinar",
  TND: "Tunisian Dinar",
  LYD: "Libyan Dinar",
  GNF: "Guinean Franc",
  SLE: "Sierra Leonean Leone",
  LRD: "Liberian Dollar",
  GMD: "Gambian Dalasi",
  MRU: "Mauritanian Ouguiya",
  AOA: "Angolan Kwanza",
  ZMW: "Zambian Kwacha",
  ZWG: "Zimbabwe Gold",
  MWK: "Malawian Kwacha",
  MZN: "Mozambican Metical",
  BWP: "Botswana Pula",
  NAD: "Namibian Dollar",
  LSL: "Lesotho Loti",
  SZL: "Swazi Lilangeni",
  MGA: "Malagasy Ariary",
  MUR: "Mauritian Rupee",
  SCR: "Seychellois Rupee",
  CVE: "Cabo Verdean Escudo",
  STN: "São Tomé and Príncipe Dobra",
  KMF: "Comorian Franc",
  USD: "US Dollar",
  GBP: "British Pound",
  EUR: "Euro",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  NZD: "New Zealand Dollar",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  CHF: "Swiss Franc",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  INR: "Indian Rupee",
  PKR: "Pakistani Rupee",
  BDT: "Bangladeshi Taka",
  CNY: "Chinese Yuan",
  JPY: "Japanese Yen",
  SGD: "Singapore Dollar",
  MYR: "Malaysian Ringgit",
  IDR: "Indonesian Rupiah",
  PHP: "Philippine Peso",
  TRY: "Turkish Lira",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
}

/** Unique, alphabetically sorted currencies derived from the country list. */
export const CURRENCIES: CurrencyOption[] = Array.from(
  new Set(COUNTRIES.map((c) => c.currency))
)
  .map((code) => ({ code, name: CURRENCY_NAMES[code] ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const VALID_COUNTRY_CODES = new Set(COUNTRIES.map((c) => c.code))
export const VALID_CURRENCY_CODES = new Set(CURRENCIES.map((c) => c.code))

export function currencyForCountry(code: string): string | undefined {
  return COUNTRIES.find((c) => c.code === code)?.currency
}

export function currencyName(code: string): string {
  return CURRENCY_NAMES[code] ?? code
}

/* --- Savings channels ---------------------------------------------------- */

export const SAVINGS_CHANNELS = [
  { value: "bank", label: "Bank", hint: "Savings or current account" },
  { value: "mobile_money", label: "Mobile Money", hint: "MoMo, Airtel Money, M-Pesa…" },
  { value: "sacco", label: "SACCO", hint: "Savings & credit cooperative" },
  { value: "cash", label: "Cash", hint: "Money kept on hand" },
] as const

export type SavingsChannel = (typeof SAVINGS_CHANNELS)[number]["value"]

export const VALID_CHANNELS = new Set<string>(SAVINGS_CHANNELS.map((c) => c.value))

export function channelLabel(value: string): string {
  return SAVINGS_CHANNELS.find((c) => c.value === value)?.label ?? value
}
