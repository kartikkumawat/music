export const GENRES = [
  'Pop',
  'Rock',
  'Hip Hop',
  'Electronic',
  'Classical',
  'Jazz',
  'Country',
  'R&B',
  'Reggae',
  'Blues',
  'Folk',
  'Alternative',
  'Metal',
  'Punk',
  'Disco',
  'Funk'
];

export const AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac'
];

export const IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const MAX_FILE_SIZE = {
  AUDIO: 50 * 1024 * 1024, // 50MB
  IMAGE: 5 * 1024 * 1024   // 5MB
};

export const REPEAT_MODES = {
  OFF: 'off',
  ALL: 'all',
  ONE: 'one'
};

export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  PLAYLISTS: '/playlists',
  ADMIN: '/music-admin'
};

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#06b6d4'
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};
