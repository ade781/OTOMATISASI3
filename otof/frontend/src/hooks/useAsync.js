import { useCallback, useEffect, useState } from 'react';

// Hook pembantu untuk menangani siklus async: loading, error, data
export const useAsync = (asyncFn, { immediate = false, initialValue = null } = {}) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  useEffect(() => {
    if (immediate) {
      run();
    }
  }, [immediate, run]);

  return { data, loading, error, run, setData, setError };
};
