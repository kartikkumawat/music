import React from 'react';
import { useMusic } from '../../hooks/useMusic';
import { useMusicActions } from '../../hooks/useMusicActions';
import {
  Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1
} from 'lucide-react';

const AudioControls = () => {
  const { isPlaying, currentSong, isShuffled, repeatMode , playlist} = useMusic();
  const {
    playSong, pauseSong, nextSong,
    previousSong, toggleShuffle, toggleRepeat
  } = useMusicActions();

  const handlePlayPause = () => {
    if (currentSong) {
      playSong(currentSong, playlist); // Always use playSong for consistency
    }
  };


  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const repeatColor =
    repeatMode === 'one' ? 'text-green-500'
    : repeatMode === 'all' ? 'text-blue-500'
    : 'text-gray-400';

  return (
    <div className="flex items-center gap-4 select-none">
      {/* Previous */}
      <button className='text-gray-400' onClick={previousSong}><SkipBack/></button>

      {/* Play / Pause */}
      <button className='text-gray-400' onClick={handlePlayPause}>
        {isPlaying ? <Pause/>  : <Play/>}
      </button>

      {/* Next */}
      <button className='text-gray-400' onClick={nextSong}><SkipForward/></button>

      {/* Shuffle */}
      <button
        onClick={toggleShuffle}
        className={isShuffled ? 'text-blue-500' : 'text-gray-400'}>
        <Shuffle/>
      </button>

      {/* Repeat */}
      <button
        onClick={toggleRepeat}
        className={repeatColor}>
        <RepeatIcon/>
      </button>
    </div>
  );
};

export default AudioControls;
