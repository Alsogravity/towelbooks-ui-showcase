import { useCallback, useEffect, useRef, useState } from 'react';

export const AUTH_EMAIL_ACTION_COOLDOWN_SECONDS = 60;

export function useAuthActionCooldown() {
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const cooldownEndsAtRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearCooldownInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateRemainingSeconds = useCallback(() => {
    if (cooldownEndsAtRef.current === null) {
      setRemainingSeconds(0);
      clearCooldownInterval();
      return;
    }

    const nextRemainingSeconds = Math.max(
      0,
      Math.ceil((cooldownEndsAtRef.current - Date.now()) / 1000),
    );

    setRemainingSeconds(nextRemainingSeconds);

    if (nextRemainingSeconds === 0) {
      cooldownEndsAtRef.current = null;
      clearCooldownInterval();
    }
  }, [clearCooldownInterval]);

  const startCooldown = useCallback(
    (seconds = AUTH_EMAIL_ACTION_COOLDOWN_SECONDS) => {
      cooldownEndsAtRef.current = Date.now() + seconds * 1000;
      setRemainingSeconds(seconds);
      clearCooldownInterval();
      intervalRef.current = window.setInterval(updateRemainingSeconds, 1000);
    },
    [clearCooldownInterval, updateRemainingSeconds],
  );

  useEffect(() => clearCooldownInterval, [clearCooldownInterval]);

  return {
    isCoolingDown: remainingSeconds > 0,
    remainingSeconds,
    startCooldown,
  };
}
