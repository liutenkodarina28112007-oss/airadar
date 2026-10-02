export default function Filters({ filters, onChange, categories }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <label>
        Пошук
        <input type="search" value={filters.q} onChange={set("q")} placeholder="наприклад: voice agent, image, crm" autoComplete="off" />
      </label>
      <label>
        Ніша
        <select value={filters.category} onChange={set("category")}>
          <option value="">Усі ніші</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Сортування
        <select value={filters.sort} onChange={set("sort")}>
          <option value="went_live">Найновіші</option>
          <option value="dr">Найавторитетніші (DR)</option>
          <option value="relevance">За релевантністю</option>
        </select>
      </label>
      <label>
        Запустились за
        <select value={filters.days} onChange={set("days")}>
          <option value="7">7 днів</option>
          <option value="30">30 днів</option>
          <option value="90">90 днів</option>
          <option value="">весь час</option>
        </select>
      </label>
      <label>
        Мін. DR
        <input type="number" min="0" max="100" value={filters.drMin} onChange={set("drMin")} placeholder="0" />
      </label>
    </form>
  );
}
