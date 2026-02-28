(() => {
    // Centralized API/RPC adapter for Odoo APP_UI.
    const CONFIG = window.app_ui_CONFIG;

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

        const response = await fetch(CONFIG.rpc.recordSearchReadUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "same-origin",
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "RPC error");
        return Array.isArray(data.result) ? data.result : [];
    }

    window.APP_UI_API = Object.freeze({
        fetchrecords,
    });
})();
