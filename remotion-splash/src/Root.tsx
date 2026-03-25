import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {WCSplash, WCSplashProps} from './WCSplash';
import {DURATION, FPS, HEIGHT, WIDTH} from './constants';

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WCSplash"
      component={WCSplash}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={
        {
          orgName: '',
          orgColor: '#14C8D7',
          orgLogoUrl: '',
          platformDoors: 1204,
          platformCloses: 31,
        } satisfies WCSplashProps
      }
    />
  );
};

registerRoot(RemotionRoot);
