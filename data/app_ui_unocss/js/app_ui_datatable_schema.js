(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
  const STATUS_VALUES = ['paid', 'overdue', 'pending', 'draft'];
  const FILTER_OPERATORS = ['contains', 'equals', 'starts_with', 'gt', 'lt', 'before', 'after'];

  function toText(value) {
    return String(value == null ? '' : value);
  }

  function normalizeDate(value) {
    const raw = toText(value).trim();
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw.slice(0, 10);
    return date.toISOString().slice(0, 10);
  }

  function createColumnSchema(i18n = {}) {
    return [
      { key: 'recordCode', label: i18n.tableId || 'Id', sortable: true, filterable: true, visible: true, editable: false, width: 150 },
      { key: 'billFrom', label: i18n.tableBillFrom || 'Bill From', sortable: true, filterable: true, visible: true, editable: true, editorType: 'text', width: 210 },
      { key: 'billTo', label: i18n.tableBillTo || 'Bill To', sortable: true, filterable: true, visible: true, editable: true, editorType: 'text', width: 210 },
      { key: 'contactEmail', label: i18n.tableEmail || 'Email', sortable: true, filterable: true, visible: false, editable: true, editorType: 'email', width: 220 },
      { key: 'total', label: i18n.tableTotalCost || 'Total Cost', sortable: true, filterable: true, visible: true, editable: true, editorType: 'number', numeric: true, width: 150 },
      { key: 'status', label: i18n.tableStatus || 'Status', sortable: true, filterable: true, visible: true, editable: true, editorType: 'select', options: STATUS_VALUES.map((status) => ({ value: status, label: status })), width: 140 },
      { key: 'stage', label: i18n.tableStage || 'Stage', sortable: true, filterable: true, visible: false, editable: true, editorType: 'select', options: ['Backlog', 'Review', 'Ready', 'Closed'].map((value) => ({ value, label: value })), width: 150 },
      { key: 'issuedDateIso', label: i18n.tableCreated || 'Created', sortable: true, filterable: true, visible: true, editable: true, editorType: 'date', width: 140 },
      { key: 'dueDateIso', label: i18n.tableDue || 'Due', sortable: true, filterable: true, visible: true, editable: true, editorType: 'date', width: 140 },
      { key: 'owner', label: i18n.tableOwner || 'Owner', sortable: true, filterable: true, visible: false, editable: true, editorType: 'user', width: 160 },
      { key: 'collaborators', label: i18n.tableCollaborators || 'Collaborators', sortable: false, filterable: true, visible: false, editable: true, editorType: 'multi-user', width: 220 },
      { key: 'module', label: i18n.tableModule || 'Module', sortable: true, filterable: true, visible: false, editable: true, editorType: 'select', options: ['Rental', 'Sales', 'Accounting', 'Drafting'].map((value) => ({ value, label: value })), width: 160 },
      { key: 'paymentTerm', label: i18n.tablePaymentTerm || 'Payment Term', sortable: true, filterable: true, visible: false, editable: true, editorType: 'text', width: 150 },
      { key: 'tags', label: i18n.tableTags || 'Tags', sortable: false, filterable: true, visible: false, editable: true, editorType: 'tags', width: 220 },
      { key: 'rating', label: i18n.tableRating || 'Rating', sortable: true, filterable: true, visible: false, editable: true, editorType: 'rating', numeric: true, width: 120 },
      { key: 'urgency', label: i18n.tableUrgency || 'Urgency', sortable: true, filterable: true, visible: false, editable: true, editorType: 'slider', numeric: true, width: 140 },
    ];
  }

  function createRule(fallbackColumn) {
    return { id: `rule-${Date.now()}-${Math.round(Math.random() * 1000)}`, column: fallbackColumn || 'billTo', operator: 'contains', value: '' };
  }

  function createGroup(fallbackColumn) {
    return { id: `group-${Date.now()}-${Math.round(Math.random() * 1000)}`, logic: 'AND', filters: [createRule(fallbackColumn)] };
  }

  function normalizeRule(rule, fallbackColumn) {
    return {
      id: toText(rule?.id || `rule-${Date.now()}`),
      column: toText(rule?.column || fallbackColumn || 'billTo'),
      operator: FILTER_OPERATORS.includes(rule?.operator) ? rule.operator : 'contains',
      value: Array.isArray(rule?.value) ? [...rule.value] : toText(rule?.value || ''),
    };
  }

  function normalizeFilterGroup(group, fallbackColumn) {
    if (!group || typeof group !== 'object') return createGroup(fallbackColumn);
    const filters = Array.isArray(group.filters) ? group.filters : [];
    return {
      id: toText(group.id || `group-${Date.now()}`),
      logic: group.logic === 'OR' ? 'OR' : 'AND',
      filters: filters.map((entry) => (entry && typeof entry === 'object' && Array.isArray(entry.filters) ? normalizeFilterGroup(entry, fallbackColumn) : normalizeRule(entry, fallbackColumn))),
    };
  }

  function resolveCellValue(row, column) {
    const col = column || {};
    if (col.key === 'recordCode') return `${toText(row.series)}-${toText(row.folio)}`;
    if (col.key === 'status') return toText(row.type || 'draft').toLowerCase();
    if (col.key === 'total') {
      if (typeof row.total === 'number') return row.total;
      const parsed = Number(toText(row.amount).replace(/[^\d.-]/g, ''));
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return row[col.key];
  }

  ROOT.datatable = ROOT.datatable || {};
  ROOT.datatable.schema = Object.freeze({
    STATUS_VALUES,
    FILTER_OPERATORS,
    toText,
    normalizeDate,
    createColumnSchema,
    createRule,
    createGroup,
    normalizeRule,
    normalizeFilterGroup,
    resolveCellValue,
  });
})();
