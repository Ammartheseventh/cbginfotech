import { useEffect, useState } from 'react';

export function useAsync(asyncFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    
    setError(null);

    asyncFn()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [asyncFn]);

  return { data, loading, error };
}