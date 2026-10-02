// Дозволяємо лише http(s)-посилання з API
export const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : null);

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtNum = (n) => new Intl.NumberFormat("uk-UA").format(n);
