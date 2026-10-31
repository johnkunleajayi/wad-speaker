import { LIMITS, type Participant } from '../config';
export function validateParticipant(value: Participant): Partial<Record<keyof Participant, string>> {
  const errors: Partial<Record<keyof Participant, string>> = {};
  if (!value.name.trim()) errors.name = 'Please enter your full name.';
  for (const key of Object.keys(LIMITS) as (keyof Participant)[]) {
    if (Array.from(value[key]).length > LIMITS[key]) errors[key] = `Use ${LIMITS[key]} characters or fewer.`;
    if (/[\u0000-\u001f\u007f]/.test(value[key])) errors[key] = 'Please remove unsupported control characters.';
  }
  if (value.linkedin.trim()) {
    try {
      const url = new URL(value.linkedin);
      if (url.protocol !== 'https:' || !['linkedin.com','www.linkedin.com'].includes(url.hostname) || !url.pathname.startsWith('/in/') || !url.pathname.slice(4) || url.username || url.password || url.port) throw new Error();
    } catch { errors.linkedin = 'Use a LinkedIn profile URL: https://www.linkedin.com/in/your-name'; }
  }
  return errors;
}
export function filename(name: string): string {
  const safe = name.normalize('NFKC').trim().replace(/[^\p{L}\p{N}\p{M}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 90) || 'Attendee';
  return `WAD2026-${safe}-Attending.png`;
}
