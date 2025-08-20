import React, { createContext, useState, useEffect, useMemo, useContext, useRef } from 'react';
import { MusicPlayerContext } from './MusicPlayerContext';

export const MusicTimeContext = createContext();

const MusicTimeProvider = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { audioRef } = useContext(MusicPlayerContext);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current > 250) {
        setCurrentTime(audio.currentTime);
        lastUpdateRef.current = now;
      }
    };

    const updateDuration = () => setDuration(audio.duration || 0);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef]);

  // Only re-create when time values change
  const contextValue = useMemo(() => ({
    currentTime: Math.floor(currentTime), // Round to reduce updates
    duration: Math.floor(duration),
    setCurrentTime,
    setDuration,
  }), [Math.floor(currentTime), Math.floor(duration)]);

  return (
    <MusicTimeContext.Provider value={contextValue}>
      {children}
    </MusicTimeContext.Provider>
  );
};

MusicTimeProvider.displayName = 'MusicTimeProvider';
export { MusicTimeProvider };
