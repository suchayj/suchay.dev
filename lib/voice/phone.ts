export function normalisePhoneInput(value: string, countryCode = "+91") {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (!countryCode) return compact;
  // Handle pasted Indian numbers with the country code or domestic trunk prefix.
  if (countryCode === "+91" && /^91[6-9]\d{9}$/.test(compact)) return `+${compact}`;
  if (countryCode === "+91" && /^0[6-9]\d{9}$/.test(compact)) return `${countryCode}${compact.slice(1)}`;
  return `${countryCode}${compact}`;
}
