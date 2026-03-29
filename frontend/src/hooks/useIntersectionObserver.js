import { useEffect, useRef } from 'react';

/**
 * Calls `onIntersect` when the returned ref element enters the viewport.
 * Used to trigger infinite scroll.
 */
export function useIntersectionObserver(onIntersect, { enabled = true, threshold = 0.1 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onIntersect();
      },
      { threshold }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, onIntersect, threshold]);

  return ref;
}
