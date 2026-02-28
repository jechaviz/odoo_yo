(() => {
  // Pure metric/domain helpers for record UI.

  function formatMoney(value, locale = "es-MX", currency = "MXN") {
    const n = Number(value || 0);
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
  }

  function daysBetween(a, b) {
    const ms = b.getTime() - a.getTime();
    return Math.round(ms / (24 * 3600 * 1000));
  }

  function classifyRows(rows) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = (row) => {
      const due = row.record_date_due ? new Date(row.record_date_due) : null;
      if (!due || Number.isNaN(due.getTime())) return false;
      due.setHours(0, 0, 0, 0);
      return String(row.state || "") === "posted" && Number(row.amount_residual || 0) > 0 && due < today;
    };

    return {
      all: rows,
      paid: rows.filter((r) => String(r.payment_state || "") === "paid" && String(r.state || "") === "posted"),
      overdue: rows.filter((r) => isOverdue(r)),
      pending: rows.filter((r) => String(r.state || "") === "posted" && String(r.payment_state || "") !== "paid"),
      draft: rows.filter((r) => String(r.state || "") === "draft"),
    };
  }

  function normalizeText(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();
  }

  function inferFilterFromStatusText(text) {
    const t = normalizeText(text);
    if (!t) return "all";
    if (t.includes("paid") || t.includes("pagad")) return "paid";
    if (t.includes("overdue") || t.includes("venc")) return "overdue";
    if (t.includes("draft") || t.includes("borrador")) return "draft";
    if (t.includes("pending") || t.includes("not paid") || t.includes("abierto")) return "pending";
    return "all";
  }

  window.APP_UI_METRICS = Object.freeze({
    formatMoney,
    daysBetween,
    classifyRows,
    inferFilterFromStatusText,
  });
})();
