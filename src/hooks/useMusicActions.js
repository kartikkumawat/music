import { useContext } from 'react';
import { MusicActionsContext } from '../contexts/MusicActionsContext';

export const useMusicActions = () => {
  const context = useContext(MusicActionsContext);
  if (!context) {
    throw new Error('useMusicActions must be used within MusicActionsProvider');
  }
  return context;
};
