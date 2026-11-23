import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Resource<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; data: T };

export function useApiData<T>(path: string): Resource<T> {
  const [resource, setResource] = useState<Resource<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getJson<T>(path)
      .then((data) => {
        if (active) setResource({ status: 'success', data });
      })
      .catch(() => {
        if (active) setResource({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, [path]);

  return resource;
}
