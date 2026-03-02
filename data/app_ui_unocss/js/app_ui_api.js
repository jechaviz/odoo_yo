(() => {
  const ROOT = window.odooApp || (window.odooApp = {});
    // Centralized API/RPC adapter for the app shell.
    const CONFIG = ROOT.config;
    const DEMO = ROOT.demo;

    async function fetchrecords() {
        if (!CONFIG) return [];

        const payload = {
            jsonrpc: "2.0",
            method: "call",
            params: {
                model: "account.move",
                method: "search_read",
                args: [[["move_type", "=", "out_record"], ["state", "in", ["draft", "posted"]]]],
                kwargs: {
                    fields: ["state", "amount_total", "amount_residual", "record_date_due", "payment_state"],
                    limit: CONFIG.rpc.recordLimit,
                    order: "record_date desc",
                },
            },
            id: Date.now(),
        };

        try {
            const response = await fetch(CONFIG.rpc.recordSearchReadUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "same-origin",
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "RPC error");
            const rows = Array.isArray(data.result) ? data.result : [];
            if (rows.length) return rows;
        } catch (_err) {
            // Fallback to local demo rows in preview/sandbox contexts.
        }
        return DEMO ? DEMO.getMetricRows("all") : [];
    }

    function fetchTableRows(filterName = "all", query = "", i18n = {}, surfaceKey = "records") {
        if (!DEMO) return [];
        if (typeof DEMO.getTableRowsBySurface === "function") {
            return DEMO.getTableRowsBySurface(surfaceKey, filterName, query, i18n);
        }
        return DEMO.getTableRows(filterName, query, i18n);
    }

    ROOT.api = Object.freeze({
        fetchrecords,
        fetchTableRows,
    });
})();
