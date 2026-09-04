'use client';

import { useState, useEffect } from 'react';

interface CountdownOverlayProps {
  onComplete: () => void;
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState<number | string>(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const startCountdown = () => {
      timer = setTimeout(() => {
        setCount(2);
        timer = setTimeout(() => {
          setCount(1);
          timer = setTimeout(() => {
            setCount('GO!');
            timer = setTimeout(() => {
              onComplete();
            }, 800);
          }, 800);
        }, 800);
      }, 800);
    };

    startCountdown();

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="gts-countdown">
      <div key={count} className="gts-countdown-number">
        {count}
      </div>
    </div>
  );
}
