import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/api';

export const useFetch = (url, { params = null, immediate = true } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchData = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await apiClient.get(url, { params: overrideParams ?? params, signal: controller.signal });
      setData(res.data);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      setError(err);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [url, params]);

  useEffect(() => {
    if (immediate) fetchData();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchData, immediate]);

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;
