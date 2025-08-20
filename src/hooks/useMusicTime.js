import { useContext } from 'react';
import { MusicTimeContext } from '../contexts/MusicTimeContext';

export const useMusicTime = () => {
  const context = useContext(MusicTimeContext);
  if (!context) {
    throw new Error('useMusicTime must be used within MusicTimeProvider');
  }
  return context;
};
