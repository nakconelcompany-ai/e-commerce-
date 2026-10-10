/** Normalises Nigerian mobile numbers to E.164 (+234XXXXXXXXXX). Returns null when invalid. */
export function normalizeNigerianPhone(input: string): string | null {
  if (typeof input !== 'string') return null;
  let s = input.replace(/[\s\-().]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  let national: string;
  if (s.startsWith('234')) national = s.slice(3);
  else if (s.startsWith('0')) national = s.slice(1);
  else return null;
  // Nigerian mobile numbers: 10 digits after the country code, starting 7/8/9 then 0 or 1.
  if (!/^[789][01]\d{8}$/.test(national)) return null;
  return `+234${national}`;
}
