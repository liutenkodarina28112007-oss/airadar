import { useEffect, useState } from "react";
import { fetchStats, FALLBACK_CATEGORIES } from "../api.js";

// Лічильники для шапки та список ніш із ?stats=1 (із запасним списком)
export function useStats() {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);

  useEffect(() => {
    const c = new AbortController();
    fetchStats(c.signal)
      .then((s) => {
        setStats(s.ai_startups || null);
        const keys = (s.top_ai_categories || []).map((x) => x.key).filter(Boolean);
        if (keys.length) setCategories(keys);
      })
      .catch(() => {});
    return () => c.abort();
  }, []);

  return { stats, categories };
}
