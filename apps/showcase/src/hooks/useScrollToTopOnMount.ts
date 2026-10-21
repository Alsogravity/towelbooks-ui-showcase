import { useEffect } from 'react';
import { useLocation } from 'react-router';

export function useScrollToTopOnMount() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
}
