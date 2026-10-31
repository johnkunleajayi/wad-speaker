export const EVENT = {
  name: "West Africa Dreamin’ 2026",
  year: '2026',
  theme: 'Beyond the Vision: Supercharging West African Businesses through Technology',
  themeHeadline: 'Beyond the Vision',
  themeDetail: 'Supercharging West African Businesses through Technology',
  date: 'Saturday, November 21, 2026',
  shortDate: '21 November 2026',
  city: 'Lagos, Nigeria',
  venueLocation: 'Victoria Island, Lagos',
  posterDate: '21 NOVEMBER 2026',
  time: '8:00 AM – 5:00 PM',
  venue: 'Lagos Continental Hotel',
  location: 'Victoria Island, Lagos, Nigeria',
  website: 'https://www.westafricadreamin.com/',
  websiteLabel: 'westafricadreamin.com',
  logo: '/brand/wad-logo.png',
  whiteLogo: '/brand/wad-logo-white.png',
} as const;
export const FORMATS = {
  square: { label: 'Square', width: 1080, height: 1080, ratio: '1:1', use: 'LinkedIn & social posts' },
  portrait: { label: 'Portrait', width: 1080, height: 1350, ratio: '4:5', use: 'Instagram & LinkedIn' },
  story: { label: 'Story', width: 1080, height: 1920, ratio: '9:16', use: 'Instagram & WhatsApp stories' },
} as const;
export type Format = keyof typeof FORMATS;
export interface Participant { name: string; title: string; organization: string; linkedin: string }
export interface Crop { zoom: number; x: number; y: number }
export const INITIAL_CROP: Crop = {zoom: 1, x: 50, y: 50};
export const LIMITS = {name: 64, title: 64, organization: 64, linkedin: 200} as const;
