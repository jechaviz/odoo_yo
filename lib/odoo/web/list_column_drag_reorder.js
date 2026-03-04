/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { ListRenderer } from "@web/views/list/list_renderer";

const STORAGE_PREFIX = "odoo:list_column_order:v1";
const ALWAYS_WRAP_FIELD_NAMES = new Set(["x_asset_lot_id", "name"]);

function getListTables(root) {
    return [...root.querySelectorAll("table.o_list_table")];
}

function applyWordWrapInlineStyles(cell) {
    if (!(cell instanceof HTMLElement)) {
        return;
    }
    cell.style.setProperty("white-space", "normal", "important");
    cell.style.setProperty("overflow", "visible", "important");
    cell.style.setProperty("text-overflow", "clip", "important");
    cell.style.setProperty("height", "auto", "important");

    const innerNodes = cell.querySelectorAll(".o_field_many2one, .o_field_widget, .text-truncate, a, span");
    for (const node of innerNodes) {
        if (!(node instanceof HTMLElement)) {
            continue;
        }
        node.style.setProperty("white-space", "normal", "important");
        node.style.setProperty("overflow-wrap", "anywhere", "important");
        node.style.setProperty("word-break", "break-word", "important");
        node.style.setProperty("overflow", "visible", "important");
        node.style.setProperty("text-overflow", "clip", "important");
        if (node.tagName === "A" || node.tagName === "SPAN" || node.classList.contains("text-truncate")) {
            node.style.setProperty("display", "block", "important");
            node.style.setProperty("max-width", "none", "important");
        }
    }
}

function syncHeaderCellMetadata(root) {
    for (const table of getListTables(root)) {
        const headerRow = table.querySelector("thead tr");
        if (!headerRow) {
            continue;
        }
        const headers = [...headerRow.children];
        const headerMeta = headers.map((th) => ({
            name: th instanceof HTMLElement ? th.dataset.name || "" : "",
            shouldWrap: th instanceof HTMLElement ? th.classList.contains("o_lib_word_wrap_cell") : false,
        }));
        for (const row of table.querySelectorAll("tbody tr")) {
            const cells = [...row.children];
            let rowHasWrappedCell = false;
            for (let index = 0; index < cells.length; index++) {
                const cell = cells[index];
                const meta = headerMeta[index];
                if (!(cell instanceof HTMLElement) || !meta) {
                    continue;
                }
                if (meta.name) {
                    cell.dataset.name = meta.name;
                    cell.setAttribute("name", meta.name);
                }
                const shouldWrap = meta.shouldWrap || ALWAYS_WRAP_FIELD_NAMES.has(meta.name);
                if (shouldWrap) {
                    cell.classList.add("o_lib_word_wrap_cell");
                    applyWordWrapInlineStyles(cell);
                    rowHasWrappedCell = true;
                } else {
                    cell.classList.remove("o_lib_word_wrap_cell");
                }
            }
            if (row instanceof HTMLElement) {
                row.classList.toggle("o_lib_has_wrapped_cell", rowHasWrappedCell);
                if (rowHasWrappedCell) {
                    row.style.setProperty("height", "auto", "important");
                }
            }
        }
    }
}

function getDraggableHeaders(root) {
    return [...root.querySelectorAll("table.o_list_table thead th[data-name]")].filter(
        (th) => th.dataset.name && !th.classList.contains("o_list_record_selector")
    );
}

function nearestHeader(target) {
    if (!(target instanceof Element)) {
        return null;
    }
    const th = target.closest("th[data-name]");
    if (!th || !th.dataset.name || th.classList.contains("o_list_record_selector")) {
        return null;
    }
    return th;
}

function moveColumn(table, fromIndex, beforeIndex) {
    if (fromIndex < 0 || fromIndex === beforeIndex) {
        return;
    }
    for (const row of table.querySelectorAll("tr")) {
        const cells = [...row.children];
        if (fromIndex >= cells.length) {
            continue;
        }
        const sourceCell = cells[fromIndex];
        const anchor = beforeIndex === null || beforeIndex >= cells.length ? null : cells[beforeIndex];
        row.insertBefore(sourceCell, anchor);
    }
}

function computeStorageKey(renderer) {
    const model =
        renderer.props?.list?.resModel ||
        renderer.props?.list?.model?.root?.resModel ||
        "unknown_model";
    const viewId =
        renderer.props?.archInfo?.viewId ||
        renderer.props?.list?.viewId ||
        "unknown_view";
    return `${STORAGE_PREFIX}:${model}:${viewId}`;
}

function readOrder(key) {
    try {
        const raw = window.localStorage.getItem(key);
        const parsed = JSON.parse(raw || "[]");
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
        return [];
    }
}

function writeOrder(key, root) {
    const order = getDraggableHeaders(root).map((th) => th.dataset.name).filter(Boolean);
    try {
        window.localStorage.setItem(key, JSON.stringify(order));
    } catch {
        // Ignore storage errors in private/incognito sessions.
    }
}

function applySavedOrder(root, order) {
    if (!order.length) {
        return;
    }
    for (let desiredPos = 0; desiredPos < order.length; desiredPos++) {
        const desiredName = order[desiredPos];
        const headers = getDraggableHeaders(root);
        const currentPos = headers.findIndex((th) => th.dataset.name === desiredName);
        if (currentPos < 0 || currentPos === desiredPos) {
            continue;
        }
        const fromHeader = headers[currentPos];
        const beforeHeader = headers[desiredPos];
        const fromIndex = fromHeader.cellIndex;
        const beforeIndex = beforeHeader ? beforeHeader.cellIndex : null;
        for (const table of getListTables(root)) {
            moveColumn(table, fromIndex, beforeIndex);
        }
    }
}

patch(ListRenderer.prototype, {
    setup() {
        super.setup(...arguments);
        this._rpDragEnabled = false;
        this._rpDragSource = null;
        this._rpDropTarget = null;
        this._rpDropBefore = true;
        this._rpStorageKey = computeStorageKey(this);
    },

    mounted() {
        super.mounted?.(...arguments);
        this._rpEnableColumnDragReorder();
        this._rpApplySavedColumnOrder();
    },

    patched() {
        super.patched?.(...arguments);
        this._rpEnableColumnDragReorder();
        this._rpApplySavedColumnOrder();
    },

    willUnmount() {
        this._rpDisableColumnDragReorder();
        super.willUnmount?.(...arguments);
    },

    _rpEnableColumnDragReorder() {
        if (!this.el || this._rpDragEnabled) {
            this._rpRefreshDraggableHeaders();
            return;
        }
        this._rpOnDragStart = (ev) => this._rpHandleDragStart(ev);
        this._rpOnDragOver = (ev) => this._rpHandleDragOver(ev);
        this._rpOnDrop = (ev) => this._rpHandleDrop(ev);
        this._rpOnDragEnd = () => this._rpResetDragUI();
        this.el.addEventListener("dragstart", this._rpOnDragStart);
        this.el.addEventListener("dragover", this._rpOnDragOver);
        this.el.addEventListener("drop", this._rpOnDrop);
        this.el.addEventListener("dragend", this._rpOnDragEnd);
        this._rpDragEnabled = true;
        this._rpRefreshDraggableHeaders();
    },

    _rpDisableColumnDragReorder() {
        if (!this.el || !this._rpDragEnabled) {
            return;
        }
        this.el.removeEventListener("dragstart", this._rpOnDragStart);
        this.el.removeEventListener("dragover", this._rpOnDragOver);
        this.el.removeEventListener("drop", this._rpOnDrop);
        this.el.removeEventListener("dragend", this._rpOnDragEnd);
        this._rpDragEnabled = false;
    },

    _rpRefreshDraggableHeaders() {
        if (!this.el) {
            return;
        }
        for (const th of getDraggableHeaders(this.el)) {
            th.setAttribute("draggable", "true");
            th.classList.add("o_lib_draggable_column");
        }
        syncHeaderCellMetadata(this.el);
    },

    _rpApplySavedColumnOrder() {
        if (!this.el) {
            return;
        }
        const order = readOrder(this._rpStorageKey);
        if (!order.length) {
            return;
        }
        applySavedOrder(this.el, order);
        this._rpRefreshDraggableHeaders();
        syncHeaderCellMetadata(this.el);
    },

    _rpHandleDragStart(ev) {
        const header = nearestHeader(ev.target);
        if (!header) {
            return;
        }
        this._rpDragSource = header.dataset.name;
        header.classList.add("o_lib_dragging_column");
        if (ev.dataTransfer) {
            ev.dataTransfer.effectAllowed = "move";
            ev.dataTransfer.setData("text/plain", this._rpDragSource);
        }
    },

    _rpHandleDragOver(ev) {
        if (!this._rpDragSource) {
            return;
        }
        const header = nearestHeader(ev.target);
        if (!header || header.dataset.name === this._rpDragSource) {
            return;
        }
        ev.preventDefault();
        const rect = header.getBoundingClientRect();
        this._rpDropBefore = ev.clientX <= rect.left + rect.width / 2;
        this._rpDropTarget = header.dataset.name;
        this._rpPaintDropMarker(header, this._rpDropBefore);
    },

    _rpHandleDrop(ev) {
        if (!this._rpDragSource || !this._rpDropTarget || !this.el) {
            this._rpResetDragUI();
            return;
        }
        ev.preventDefault();

        const headers = getDraggableHeaders(this.el);
        const sourceHeader = headers.find((th) => th.dataset.name === this._rpDragSource);
        const targetHeader = headers.find((th) => th.dataset.name === this._rpDropTarget);
        if (!sourceHeader || !targetHeader) {
            this._rpResetDragUI();
            return;
        }

        const sourceIndex = sourceHeader.cellIndex;
        const headersAfterLookup = getDraggableHeaders(this.el);
        const targetPos = headersAfterLookup.findIndex((th) => th.dataset.name === this._rpDropTarget);
        const beforeHeader = this._rpDropBefore ? headersAfterLookup[targetPos] : headersAfterLookup[targetPos + 1];
        const beforeIndex = beforeHeader ? beforeHeader.cellIndex : null;

        for (const table of getListTables(this.el)) {
            moveColumn(table, sourceIndex, beforeIndex);
        }
        writeOrder(this._rpStorageKey, this.el);
        syncHeaderCellMetadata(this.el);
        this._rpResetDragUI();
    },

    _rpPaintDropMarker(header, before) {
        if (!this.el) {
            return;
        }
        for (const th of this.el.querySelectorAll("th.o_lib_drop_before, th.o_lib_drop_after")) {
            th.classList.remove("o_lib_drop_before", "o_lib_drop_after");
        }
        header.classList.add(before ? "o_lib_drop_before" : "o_lib_drop_after");
    },

    _rpResetDragUI() {
        if (!this.el) {
            return;
        }
        this._rpDragSource = null;
        this._rpDropTarget = null;
        for (const th of this.el.querySelectorAll(
            "th.o_lib_dragging_column, th.o_lib_drop_before, th.o_lib_drop_after"
        )) {
            th.classList.remove("o_lib_dragging_column", "o_lib_drop_before", "o_lib_drop_after");
        }
    },
});
