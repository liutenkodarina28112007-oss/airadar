import { useMemo, useState } from "react";
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
  const [theme, setTheme] = useState(null); // null = за системою

  // Запити йдуть із затримкою, щоб не бити API на кожен символ
  const debounced = useDebounce(filters, 350);
  const { items, total, loading, error, loadMore, retry } = useSites(debounced);
  const { stats, categories } = useStats();

  const pickedList = useMemo(() => Object.values(picked), [picked]);
  const [limitHit, setLimitHit] = useState(false);

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
    const dark = theme ? theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = dark ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  const canMore = !loading && items.length < total && items.length < MAX_OFFSET;

  return (
    <>
      <div className="wrap">
        <header>
          <h1>AI Radar</h1>
          <p className="lead">
            Нові AI-сайти, які щойно запрацювали. Шукайте за ніччю, відсортуйте за авторитетом або свіжістю й порівняйте до трьох сайтів.
          </p>
          <div className="stats" aria-live="polite">
            {stats && (
              <>
                <span><b>{fmtNum(stats.total)}</b> AI-стартапів в індексі</span>
                <span><b>{fmtNum(stats.today)}</b> нових сьогодні</span>
              </>
            )}
          </div>
        </header>

        <Filters filters={filters} onChange={setFilters} categories={categories} />

        <div className="meta">
          <span>
            {total > 0 && `Знайдено ${fmtNum(total)} · показано ${items.length}`}
          </span>
          <button className="btn ghost" type="button" onClick={toggleTheme}>Тема</button>
        </div>
        {limitHit && <p className="hint" role="status">Можна порівняти до {MAX_COMPARE} сайтів. Зніміть позначку з одного з них.</p>}

        <ul aria-live="polite">
          {items.map((s, i) => (
            <SiteRow key={s.domain + i} site={s} checked={!!picked[s.domain]} onToggle={toggle} />
          ))}
          {loading && items.length === 0 && (
            <li><div /><div className="state">Завантаження…</div></li>
          )}
          {!loading && !error && items.length === 0 && (
            <li><div /><div className="state">Нічого не знайдено. Спробуйте ширший період, іншу нішу або менший DR.</div></li>
          )}
          {error && (
            <li>
              <div />
              <div className="state err">
                Не вдалося завантажити дані ({error}).{" "}
                <button className="btn ghost" type="button" onClick={retry}>Повторити</button>
              </div>
            </li>
          )}
        </ul>

        <div className="more">
          {items.length > 0 && (canMore || loading) && (
            <button className="btn" type="button" onClick={loadMore} disabled={loading}>
              {loading ? "Завантаження…" : "Показати ще"}
            </button>
          )}
        </div>

        <footer>
          Дані: <a href="https://freeserp.ai/docs.php" rel="noopener noreferrer">FreeSerp API</a> (індекс <code>sites</code>, лише головні сторінки).
          «Запустився» — дата, коли сайт вперше підтвердили як робочий, а не офіційний запуск.
        </footer>
      </div>

      <CompareBar count={pickedList.length} max={MAX_COMPARE} onClear={() => { setPicked({}); setLimitHit(false); }} onOpen={() => setDialog(true)} />
      <CompareDialog open={dialog} sites={pickedList} onClose={() => setDialog(false)} />
    </>
  );
}
