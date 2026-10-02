import { useEffect, useMemo, useState } from "react";
import Filters from "./components/Filters.jsx";
import SiteRow from "./components/SiteRow.jsx";
import CompareBar from "./components/CompareBar.jsx";
import CompareDialog from "./components/CompareDialog.jsx";
import { useDebounce } from "./hooks/useDebounce.js";
import { useSites } from "./hooks/useSites.js";
import { useStats } from "./hooks/useStats.js";
import { DEFAULT_FILTERS, MAX_OFFSET } from "./api.js";
import { fmtNum } from "./utils.js";

const MAX_COMPARE = 3;

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [picked, setPicked] = useState({}); // domain -> запис сайту
  const [dialog, setDialog] = useState(false);
  const [theme, setTheme] = useState("dark"); // темний стиль за замовчуванням

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Запити йдуть із затримкою, щоб не бити API на кожен символ
  const debounced = useDebounce(filters, 350);
  const { items, total, loading, error, loadMore, retry } = useSites(debounced);
  const { stats, categories } = useStats();

  const pickedList = useMemo(() => Object.values(picked), [picked]);
  const [limitHit, setLimitHit] = useState(false);
  const themeLabel = theme === "dark" ? "Світла тема" : "Темна тема";

  const toggle = (site) => {
    if (picked[site.domain]) {
      const { [site.domain]: _removed, ...rest } = picked;
      setPicked(rest);
      setLimitHit(false);
    } else if (pickedList.length >= MAX_COMPARE) {
      setLimitHit(true);
    } else {
      setPicked({ ...picked, [site.domain]: site });
      setLimitHit(false);
    }
  };

  const toggleTheme = () => {
    const dark = theme
      ? theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  const canMore = !loading && items.length < total && items.length < MAX_OFFSET;

  return (
    <>
      <div className="wrap">
        <header className="hero">
          <div className="hero-copy">
            <span className="eyebrow">AI startup monitor</span>
            <h1>AI Radar</h1>
            <p className="lead">
              Нові AI-сайти, які щойно запрацювали. Шукайте за ніччю,
              відсортуйте за авторитетом або свіжістю й порівняйте до трьох
              сайтів.
            </p>
          </div>
          <div className="hero-actions">
            <span className="status-pill">Live data</span>
            <button className="btn ghost" type="button" onClick={toggleTheme}>
              {themeLabel}
            </button>
          </div>
        </header>

        <div className="kpis" aria-live="polite">
          {stats && (
            <>
              <div className="kpi">
                <span className="kpi-label">AI-стартапів</span>
                <strong>{fmtNum(stats.total)}</strong>
                <small>в індексі</small>
              </div>
              <div className="kpi">
                <span className="kpi-label">Нових сьогодні</span>
                <strong>{fmtNum(stats.today)}</strong>
                <small>запусків</small>
              </div>
              <div className="kpi">
                <span className="kpi-label">Поточний фільтр</span>
                <strong>{items.length}</strong>
                <small>показано сайтів</small>
              </div>
            </>
          )}
        </div>

        <Filters
          filters={filters}
          onChange={setFilters}
          categories={categories}
        />

        <div className="meta">
          <div className="meta-left">
            <span className="meta-chip">Результати</span>
            {total > 0 && (
              <span>{`Знайдено ${fmtNum(total)} · показано ${items.length}`}</span>
            )}
          </div>
        </div>
        {limitHit && (
          <p className="hint" role="status">
            Можна порівняти до {MAX_COMPARE} сайтів. Зніміть позначку з одного з
            них.
          </p>
        )}

        <ul aria-live="polite">
          {items.map((s, i) => (
            <SiteRow
              key={s.domain + i}
              site={s}
              checked={!!picked[s.domain]}
              onToggle={toggle}
            />
          ))}
          {loading && items.length === 0 && (
            <li className="empty-row">
              <div />
              <div className="state">Завантаження…</div>
            </li>
          )}
          {!loading && !error && items.length === 0 && (
            <li className="empty-row">
              <div />
              <div className="state">
                Нічого не знайдено. Спробуйте ширший період, іншу нішу або
                менший DR.
              </div>
            </li>
          )}
          {error && (
            <li className="empty-row">
              <div />
              <div className="state err">
                Не вдалося завантажити дані ({error}).{" "}
                <button className="btn ghost" type="button" onClick={retry}>
                  Повторити
                </button>
              </div>
            </li>
          )}
        </ul>

        <div className="more">
          {items.length > 0 && (canMore || loading) && (
            <button
              className="btn"
              type="button"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? "Завантаження…" : "Показати ще"}
            </button>
          )}
        </div>

        <footer>
          Дані:{" "}
          <a href="https://freeserp.ai/docs.php" rel="noopener noreferrer">
            FreeSerp API
          </a>{" "}
          (індекс <code>sites</code>, лише головні сторінки). «Запустився» —
          дата, коли сайт вперше підтвердили як робочий, а не офіційний запуск.
        </footer>
      </div>

      <CompareBar
        count={pickedList.length}
        max={MAX_COMPARE}
        onClear={() => {
          setPicked({});
          setLimitHit(false);
        }}
        onOpen={() => setDialog(true)}
      />
      <CompareDialog
        open={dialog}
        sites={pickedList}
        onClose={() => setDialog(false)}
      />
    </>
  );
}
