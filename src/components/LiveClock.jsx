import React, { useState, useEffect, useMemo } from 'react';

/**
 * A memoized live clock component that updates every second.
 * Isolating this prevents the parent App from re-rendering every second.
 */
export const LiveClock = React.memo(function LiveClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const timeString = useMemo(
    () => currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    [currentTime]
  );

  return <span>{timeString}</span>;
});
