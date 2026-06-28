import { useState, useEffect } from 'react';

export function useStates() {
  const [states, setStates] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/locations/states')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { states, loading };
}

export function useCities(stateCode: string) {
  const [cities, setCities] = useState<{value: string, label: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stateCode) {
      setCities([]);
      return;
    }
    
    setLoading(true);
    fetch(`/api/locations/cities?stateCode=${stateCode}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [stateCode]);

  return { cities, loading };
}
