import { useEffect, useState } from 'react';

/** Seconds until another code may be sent (counts down to 0); restart(seconds) starts it again */
export const useResendTimer = (initial = 0) => {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return [seconds, setSeconds];
};
