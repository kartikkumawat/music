import { AUDIO_FORMATS, IMAGE_FORMATS, MAX_FILE_SIZE } from './constants';

export const validateAudioFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('Audio file is required');
    return errors;
  }

  if (!AUDIO_FORMATS.includes(file.type)) {
    errors.push('Invalid audio format. Supported formats: MP3, WAV, OGG, AAC, FLAC');
  }

  if (file.size > MAX_FILE_SIZE.AUDIO) {
    errors.push(`Audio file size must be less than ${MAX_FILE_SIZE.AUDIO / (1024 * 1024)}MB`);
  }

  return errors;
};

export const validateImageFile = (file) => {
  const errors = [];

  if (!file) {
    return errors; // Image is optional
  }

  if (!IMAGE_FORMATS.includes(file.type)) {
    errors.push('Invalid image format. Supported formats: JPEG, PNG, WebP, GIF');
  }

  if (file.size > MAX_FILE_SIZE.IMAGE) {
    errors.push(`Image file size must be less than ${MAX_FILE_SIZE.IMAGE / (1024 * 1024)}MB`);
  }

  return errors;
};

export const validateSongData = (data) => {
  const errors = [];

  if (!data.title?.trim()) {
    errors.push('Song title is required');
  }

  if (!data.artist?.trim()) {
    errors.push('Artist name is required');
  }

  if (data.title && data.title.length > 100) {
    errors.push('Song title must be less than 100 characters');
  }

  if (data.artist && data.artist.length > 100) {
    errors.push('Artist name must be less than 100 characters');
  }

  if (data.album && data.album.length > 100) {
    errors.push('Album name must be less than 100 characters');
  }

  return errors;
};

export const validatePlaylistData = (data) => {
  const errors = [];

  if (!data.name?.trim()) {
    errors.push('Playlist name is required');
  }

  if (data.name && data.name.length > 100) {
    errors.push('Playlist name must be less than 100 characters');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Playlist description must be less than 500 characters');
  }

  return errors;
};

export const validateSearchQuery = (query) => {
  const errors = [];

  if (!query?.trim()) {
    errors.push('Search query is required');
  }

  if (query && query.length < 2) {
    errors.push('Search query must be at least 2 characters');
  }

  if (query && query.length > 100) {
    errors.push('Search query must be less than 100 characters');
  }

  return errors;
};

export const validateLoginData = (data) => {
  const errors = [];

  if (!data.email?.trim()) {
    errors.push('Email is required');
  }

  if (!data.password?.trim()) {
    errors.push('Password is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Please enter a valid email address');
  }

  return errors;
};
