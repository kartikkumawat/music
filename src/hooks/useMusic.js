import { useContext } from 'react';
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

export const useMusic = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusic must be used within MusicPlayerProvider');
  }
  return context;
};
