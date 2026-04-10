'use client';

import { useEffect, useState } from 'react';

export function useCurrentTime(granularityMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const tick = () => {
      setNow(new Date());
    };

    const startInterval = () => {
      tick();
      intervalId = window.setInterval(tick, granularityMs);
    };

    timeoutId = window.setTimeout(startInterval, granularityMs - (Date.now() % granularityMs));

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [granularityMs]);

  return now;
}
