(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
  ROOT.datatable = ROOT.datatable || {};
  const SCHEMA = ROOT.datatable.schema;
  if (!SCHEMA) return;
  const { toText, resolveCellValue } = SCHEMA;

  function createColumnMap(columns = []) {
    return Object.fromEntries(columns.map((column) => [column.key, column]));
  }

  function comparePrimitive(left, right) {
    const leftNum = Number(left);
    const rightNum = Number(right);
    if (!Number.isNaN(leftNum) && !Number.isNaN(rightNum) && toText(left) !== '' && toText(right) !== '') return leftNum - rightNum;
    return toText(left).localeCompare(toText(right), undefined, { sensitivity: 'base' });
  }

  function statusLabel(type, i18n = {}) {
    const normalized = toText(type).toLowerCase();
    if (normalized === 'paid') return i18n.filterPaid || 'Paid';
    if (normalized === 'overdue') return i18n.filterOverdue || 'Overdue';
    if (normalized === 'pending') return i18n.filterPending || 'Pending';
    return i18n.filterDraft || 'Draft';
  }

  function formatMoney(value, locale = 'en-US', currency = 'USD') {
    const amount = Number(value || 0);
    const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    return Number.isNaN(amount) ? formatter.format(0) : formatter.format(amount);
  }

  function evaluateRule(row, rule, columnMap) {
    const column = columnMap[rule.column] || { key: rule.column };
    const leftRaw = resolveCellValue(row, column);
    const leftText = toText(leftRaw).toLowerCase();
    const rightRaw = Array.isArray(rule.value) ? rule.value : toText(rule.value).trim();
    const rightText = toText(rightRaw).toLowerCase();
    switch (rule.operator) {
      case 'equals': return leftText === rightText;
      case 'starts_with': return leftText.startsWith(rightText);
      case 'gt': return comparePrimitive(leftRaw, rightRaw) > 0;
      case 'lt': return comparePrimitive(leftRaw, rightRaw) < 0;
      case 'before': {
        const leftDate = Date.parse(leftRaw);
        const rightDate = Date.parse(rightRaw);
        return !Number.isNaN(leftDate) && !Number.isNaN(rightDate) && leftDate < rightDate;
      }
      case 'after': {
        const leftDate = Date.parse(leftRaw);
        const rightDate = Date.parse(rightRaw);
        return !Number.isNaN(leftDate) && !Number.isNaN(rightDate) && leftDate > rightDate;
      }
      default: return leftText.includes(rightText);
    }
  }

  function evaluateFilterGroup(row, group, columnMap) {
    const filters = Array.isArray(group?.filters) ? group.filters : [];
    if (!filters.length) return true;
    const results = filters.map((entry) => (entry && typeof entry === 'object' && Array.isArray(entry.filters) ? evaluateFilterGroup(row, entry, columnMap) : evaluateRule(row, entry, columnMap)));
    return group.logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
  }

  function applyColumnFilters(row, visibleColumns, columnFilters) {
    return visibleColumns.every((column) => {
      const filterValue = toText(columnFilters[column.key]).trim().toLowerCase();
      if (!filterValue) return true;
      return toText(resolveCellValue(row, column)).toLowerCase().includes(filterValue);
    });
  }

  function filterRows({ rows, query, searchKeys, visibleColumns, columnFilters, filterGroup, columnMap }) {
    const safeQuery = toText(query).trim().toLowerCase();
    return rows.filter((row) => {
      if (safeQuery) {
        const haystack = searchKeys.map((key) => {
          const value = row[key];
          return Array.isArray(value) ? value.join(' ') : toText(value);
        }).join(' ').toLowerCase();
        if (!haystack.includes(safeQuery)) return false;
      }
      if (!applyColumnFilters(row, visibleColumns, columnFilters)) return false;
      return evaluateFilterGroup(row, filterGroup, columnMap);
    });
  }

  function sortRows(rows, sorting, columns) {
    const rules = Array.isArray(sorting) ? sorting.filter((entry) => entry && entry.id) : sorting?.id ? [sorting] : [];
    if (!rules.length) return rows.slice();
    return rows.slice().sort((left, right) => {
      for (const rule of rules) {
        const column = columns.find((entry) => entry.key === rule.id) || { key: rule.id };
        const cmp = comparePrimitive(resolveCellValue(left, column), resolveCellValue(right, column));
        if (cmp !== 0) return rule.dir === 'desc' ? -cmp : cmp;
      }
      return 0;
    });
  }

  function paginateRows(rows, page, pageSize) {
    const safeSize = Math.max(1, Number(pageSize) || 10);
    const pageCount = Math.max(1, Math.ceil(rows.length / safeSize));
    const safePage = Math.min(Math.max(Number(page) || 1, 1), pageCount);
    const start = (safePage - 1) * safeSize;
    return { pageCount, safePage, pageRows: rows.slice(start, start + safeSize), startIndex: rows.length ? start + 1 : 0, endIndex: Math.min(start + safeSize, rows.length) };
  }

  function buildGroupBuckets(rows, key, columnMap, i18n = {}) {
    const column = columnMap[key] || { key };
    const buckets = new Map();
    rows.forEach((row) => {
      const raw = resolveCellValue(row, column);
      const label = key === 'status' ? statusLabel(raw, i18n) : (Array.isArray(raw) ? raw.join(', ') : toText(raw || '-'));
      const bucketKey = Array.isArray(raw) ? raw.join('|') : toText(raw || '-');
      if (!buckets.has(bucketKey)) buckets.set(bucketKey, { key: bucketKey, label, rows: [] });
      buckets.get(bucketKey).rows.push(row);
    });
    return Array.from(buckets.values());
  }

  function escapeCsvCell(value) {
    return `"${String(value ?? '').replaceAll('"', '""')}"`;
  }

  ROOT.datatable.filters = Object.freeze({
    createColumnMap,
    statusLabel,
    formatMoney,
    filterRows,
    sortRows,
    paginateRows,
    buildGroupBuckets,
    escapeCsvCell,
  });
})();
