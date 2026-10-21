import { useCallback, type MouseEvent } from 'react';
import { useLocation, useNavigate, type To } from 'react-router';

export interface UseSmartBackResult {
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function useSmartBack(fallback: To): UseSmartBackResult {
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      if (location.key !== 'default') {
        navigate(-1);
        return;
      }

      navigate(fallback, { replace: true });
    },
    [fallback, location.key, navigate],
  );

  return { onClick };
}
