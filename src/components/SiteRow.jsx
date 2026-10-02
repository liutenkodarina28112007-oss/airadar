import { memo } from "react";
import { fmtDate, safeUrl } from "../utils.js";

function SiteRow({ site, checked, onToggle }) {
  const url = safeUrl(site.url);
  const title = site.title || site.domain;
  const dr = site.dr ?? 0;
  const tags = [...(site.ai_categories || []).slice(0, 2)];
  if (site.ai_source && site.ai_source !== "not_ai") tags.push(site.ai_source);

  return (
    <li>
      <div className="meter" title={`Domain Rating ${dr}`}>
        <i style={{ height: `${Math.max(4, dr)}%` }} />
      </div>
      <div className="row">
        <h2>
          {url ? <a href={url} target="_blank" rel="noopener noreferrer">{title}</a> : title}
        </h2>
        <div className="dom">{site.domain}</div>
        <p className="sum">{site.ai_summary || "Опису поки немає."}</p>
        <div className="tags">
          {tags.map((t) => <span className="tag" key={t}>{t}</span>)}
        </div>
      </div>
      <div className="side">
        <div className="dr">
          {site.dr ?? "—"}
          <small>DR</small>
        </div>
        <span>запустився {fmtDate(site.went_live)}</span>
        <label className="cmp">
          <input type="checkbox" checked={checked} onChange={() => onToggle(site)} aria-label={`Порівняти ${site.domain}`} />
          Порівняти
        </label>
      </div>
    </li>
  );
}

export default memo(SiteRow);
