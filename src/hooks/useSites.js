import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSites } from "../api.js";

// Завантаження списку сайтів: скидання при зміні фільтрів, догрузка, скасування застарілих запитів
export function useSites(filters) {
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const ctrl = useRef(null);

  const run = useCallback(
    async (append, from) => {
      ctrl.current?.abort();
      const c = new AbortController();
      ctrl.current = c;
      setState((s) => ({ ...s, loading: true, error: null, items: append ? s.items : [] }));
      try {
        const data = await fetchSites(filters, from, c.signal);
        setState((s) => ({
          items: append ? [...s.items, ...data.results] : data.results,
          total: data.total || 0,
          loading: false,
          error: null,
        }));
      } catch (e) {
        if (e.name === "AbortError") return;
        setState((s) => ({ ...s, loading: false, error: e.message }));
      }
    },
    [filters]
  );

  useEffect(() => {
    run(false, 0);
    return () => ctrl.current?.abort();
  }, [run]);

  const loadMore = useCallback(() => run(true, state.items.length), [run, state.items.length]);
  const retry = useCallback(() => run(false, 0), [run]);
  return { ...state, loadMore, retry };
}
