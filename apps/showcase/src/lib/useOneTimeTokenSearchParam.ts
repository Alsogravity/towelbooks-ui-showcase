import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useOneTimeTokenSearchParam(paramName = 'token'): string | null {
  const location = useLocation();
  const navigate = useNavigate();
  const [token] = useState(() => {
    const params = new URLSearchParams(location.search);

    return params.get(paramName);
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (!params.has(paramName)) {
      return;
    }

    params.delete(paramName);
    const nextSearch = params.toString();

    navigate(
      {
        hash: location.hash,
        pathname: location.pathname,
        search: nextSearch.length > 0 ? `?${nextSearch}` : '',
      },
      { replace: true },
    );
  }, [location.hash, location.pathname, location.search, navigate, paramName]);

  return token;
}
