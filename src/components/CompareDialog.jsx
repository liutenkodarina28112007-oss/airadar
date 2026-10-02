import { useEffect, useRef } from "react";
import { fmtDate } from "../utils.js";

const ROWS = [
  ["Назва", (h) => h.title || "—"],
  ["Домен", (h) => h.domain],
  ["Domain Rating", (h) => h.dr ?? "—"],
  ["Ніша", (h) => (h.ai_categories || []).join(", ") || "—"],
  ["Стек / білдер", (h) => h.ai_source || "—"],
  ["Запустився", (h) => fmtDate(h.went_live)],
  ["Зона", (h) => (h.tld ? "." + h.tld : "—")],
  ["Опис", (h) => h.ai_summary || "—"],
];

export default function CompareDialog({ open, sites, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="cmp-title">
      <div className="dh">
        <h3 id="cmp-title">Порівняння сайтів</h3>
        <button className="btn ghost" type="button" onClick={onClose}>Закрити</button>
      </div>
      <div className="tw">
        <table>
          <thead>
            <tr>
              <th />
              {sites.map((h) => <th scope="col" key={h.domain}>{h.domain}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, fn]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {sites.map((h) => <td key={h.domain}>{String(fn(h))}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </dialog>
  );
}
