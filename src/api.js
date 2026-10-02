// Шар роботи з публічним API freeserp.ai. Для локального запуску через Vite
// використовуємо проксі, бо сервер API повертає некоректний CORS заголовок.
export const API_URL = "/api.php";
export const PAGE_SIZE = 20;
export const MAX_OFFSET = 10000; // ліміт from+size для індексу sites

// Необов'язкові поля, які рекомендує документація, щоб власники API могли зв'язатися
const IDENTITY = { agent: "ai-radar/1.0", project: "AI Radar test task" };

export const FALLBACK_CATEGORIES = [
  "AI Agents & Autonomous",
  "Code & Dev Tools",
  "AI Infrastructure & API",
  "AI Automation & Workflows",
  "LLM & Prompt Tools",
  "AI Search & Answers",
  "AI Website Builder",
  "No-code / App Builder",
  "Image Generation",
  "Video Generation",
  "Voice & Text-to-Speech",
  "Data & Analytics",
  "Research & Science",
  "Design & UI",
  "Chatbot & Assistant",
];

export const DEFAULT_FILTERS = {
  q: "",
  category: "",
  sort: "went_live",
  days: "7",
  drMin: "",
};

export function buildParams(filters, from = 0) {
  const p = new URLSearchParams({
    ai_startups: "1", // лише справжні AI-продукти, без шуму
    size: String(PAGE_SIZE),
    from: String(from),
    sort: filters.sort,
    order: "desc",
    ...IDENTITY,
  });
  const q = filters.q.trim();
  if (q) p.set("q", q);
  if (filters.category) p.set("ai_categories", filters.category);
  if (filters.drMin !== "") {
    p.set(
      "dr_min",
      String(Math.max(0, Math.min(100, Number(filters.drMin) || 0))),
    );
  }
  if (filters.days) {
    const d = new Date(Date.now() - Number(filters.days) * 864e5);
    p.set("from_date", d.toISOString().slice(0, 10)); // фільтр за went_live
  }
  return p;
}

async function getJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (data.ok === false) throw new Error(data.error || "api_error");
  return data;
}

export const fetchSites = (filters, from, signal) =>
  getJson(`${API_URL}?${buildParams(filters, from)}`, signal);

export const fetchStats = (signal) =>
  getJson(`${API_URL}?stats=1&${new URLSearchParams(IDENTITY)}`, signal);
