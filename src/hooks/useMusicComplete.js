import { useMusic } from './useMusic';
import { useMusicTime } from './useMusicTime';
import { useMusicActions } from './useMusicActions';

export const useMusicComplete = () => {
  const playerState = useMusic();
  const timeState = useMusicTime();
  const actions = useMusicActions();

  return {
    ...playerState,
    ...timeState,
    ...actions,
  };
};
