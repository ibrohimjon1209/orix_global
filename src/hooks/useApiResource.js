import { useEffect, useState } from 'react';

export const useApiResource = (loader) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await loader({ signal: controller.signal });
        if (mounted) setData(result);
      } catch (err) {
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        if (mounted) {
          setError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              err?.message ||
              'Maʼlumotlarni yuklashda xatolik yuz berdi.'
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [loader]);

  return { data, loading, error };
};
