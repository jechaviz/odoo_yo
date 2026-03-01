(() => {
  const runtime = window.__unocss_runtime;
  if (!runtime || !runtime.presets) return;

  const wind = runtime.presets.presetWind3;
  const attributify = runtime.presets.presetAttributify;

  const baseConfig = window.__unocss || {};
  const priorPresets = Array.isArray(baseConfig.presets) ? baseConfig.presets : [];
  const nextPresets = [...priorPresets];

  if (typeof wind === "function") {
    nextPresets.push(wind());
  }
  if (typeof attributify === "function") {
    nextPresets.push(attributify({ prefixedOnly: false }));
  }

  window.__unocss = {
    ...baseConfig,
    presets: nextPresets,
    shortcuts: {
      ...(baseConfig.shortcuts || {}),
      "ui-card": "rounded-2xl border border-white/8 bg-slate-800/85 shadow-[0_10px_30px_rgba(2,6,23,0.35)]",
      "ui-focus-ring": "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
      "ui-soft-hover": "transition-all duration-180 ease-out hover:bg-white/6 hover:text-white",
    },
    theme: {
      ...(baseConfig.theme || {}),
      colors: {
        ...(baseConfig.theme?.colors || {}),
        ui: {
          bg: "#0f172a",
          surface: "#1e293b",
          primary: "#2563eb",
          text: "#f8fafc",
          muted: "#94a3b8",
          border: "rgba(255,255,255,0.08)",
        },
      },
    },
  };
})();
