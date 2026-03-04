const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/git/customers/yo/odoo_yo/.codex_tools/node_modules/playwright');

function parseArgs(argv) {
  const args = {
    menuMap: '',
    outDir: '',
    limit: 0,
    samplePerRoot: 1,
  };
  for (const arg of argv) {
    if (arg.startsWith('--menu-map=')) args.menuMap = arg.substring('--menu-map='.length);
    else if (arg.startsWith('--out-dir=')) args.outDir = arg.substring('--out-dir='.length);
    else if (arg.startsWith('--limit=')) args.limit = Number(arg.substring('--limit='.length) || 0);
    else if (arg.startsWith('--sample-per-root=')) args.samplePerRoot = Number(arg.substring('--sample-per-root='.length) || 1);
  }
  return args;
}

async function launchBrowserWithFallback() {
  const attempts = [
    { label: 'msedge', options: { headless: true, channel: 'msedge', timeout: 25000 } },
    { label: 'chrome', options: { headless: true, channel: 'chrome', timeout: 25000 } },
    { label: 'bundled', options: { headless: true, timeout: 25000 } },
  ];
  let lastError = null;
  for (const attempt of attempts) {
    try {
      const browser = await chromium.launch(attempt.options);
      return { browser, browserLabel: attempt.label };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Unable to launch browser');
}

async function login(page, baseUrl, user, pass) {
  const loginUrl = `${baseUrl.replace(/\/$/, '')}/web/login`;
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector("input[name='login']", { timeout: 20000 });
  await page.fill("input[name='login']", user);
  await page.fill("input[name='password']", pass);
  await page.click("button[type='submit']");
  await page.waitForURL((url) => /\/odoo(\/|$)/.test(String(url)), { timeout: 40000 });
  await page.waitForLoadState('domcontentloaded');
}

function sanitize(value) {
  return String(value || '').replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'menu';
}

function buildMarkdown(summary, perRoot, failures) {
  const lines = [
    '# Deep Visual Audit',
    '',
    `- Generated: ${summary.generatedAt}`,
    `- Base URL: ${summary.baseUrl}`,
    `- Total actionable menus audited: ${summary.total}`,
    `- Passed: ${summary.passed}`,
    `- Failed: ${summary.failed}`,
    '',
    '## Per Root App',
    '',
    '| Root App | Total | Passed | Failed |',
    '|---|---:|---:|---:|',
  ];
  Object.entries(perRoot)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([root, s]) => {
      lines.push(`| ${root} | ${s.total} | ${s.passed} | ${s.failed} |`);
    });

  if (failures.length) {
    lines.push('', '## Failures', '');
    failures.slice(0, 200).forEach((f) => {
      lines.push(`- [${f.root_app}] menu_id=${f.menu_id} ${f.complete_name}`);
      lines.push(`  - url: ${f.url}`);
      lines.push(`  - reason: ${f.reason}`);
      if (f.screenshot) lines.push(`  - screenshot: ${f.screenshot}`);
    });
  }

  lines.push('');
  return lines.join('\n');
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  if (!args.menuMap) throw new Error('Missing --menu-map');

  const baseUrl = process.env.ODOO_URL || 'https://test1253.odoo.com';
  const user = process.env.ODOO_USER || '';
  const pass = process.env.ODOO_PASS || '';
  if (!user || !pass) throw new Error('Missing ODOO_USER/ODOO_PASS');

  const raw = JSON.parse(fs.readFileSync(args.menuMap, 'utf8'));
  const menus = (raw.menus || [])
    .filter((m) => m.is_actionable)
    .sort((a, b) => String(a.complete_name || '').localeCompare(String(b.complete_name || '')));

  const selected = args.limit > 0 ? menus.slice(0, args.limit) : menus;
  const outDir = args.outDir || path.join(path.dirname(args.menuMap), 'visual_audit');
  const screensDir = path.join(outDir, 'screens');
  fs.mkdirSync(screensDir, { recursive: true });

  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    browserChannel: '',
    total: selected.length,
    passed: 0,
    failed: 0,
    perRoot: {},
    rows: [],
  };

  let browser;
  const launch = await launchBrowserWithFallback();
  browser = launch.browser;
  result.browserChannel = launch.browserLabel;

  try {
    const page = await browser.newPage({ viewport: { width: 1680, height: 1200 } });
    page.setDefaultTimeout(25000);

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text() || '';
        if (!/favicon|ResizeObserver loop|Source map error/i.test(text)) {
          consoleErrors.push(text);
        }
      }
    });

    await login(page, baseUrl, user, pass);

    const rootShotCounter = new Map();

    for (let index = 0; index < selected.length; index += 1) {
      const menu = selected[index];
      const url = `${baseUrl.replace(/\/$/, '')}${menu.deeplink}`;
      const row = {
        idx: index + 1,
        menu_id: menu.id,
        root_app: menu.root_app || '(root)',
        complete_name: menu.complete_name,
        url,
        ok: false,
        reason: '',
        screenshot: '',
      };

      const rootStats = result.perRoot[row.root_app] || { total: 0, passed: 0, failed: 0 };
      rootStats.total += 1;

      const beforeErrors = consoleErrors.length;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('.o_main_navbar, nav.o_navbar', { timeout: 15000 });
        await page.waitForTimeout(700);

        const uiCheck = await page.evaluate(() => {
          const bodyText = (document.body && document.body.textContent ? document.body.textContent : '').toLowerCase();
          const hasClientError = bodyText.includes('uncaughtpromiseerror') || bodyText.includes('traceback') || bodyText.includes('server error');
          const hasContent = Boolean(document.querySelector('.o_content, .o_action_manager, .o_view_controller'));
          const hasTheme = document.body.classList.contains('theme-fw-enabled');
          const hasTopbarPort = document.body.classList.contains('app-port-topbar-active');
          const nav = document.querySelector('.o_main_navbar, nav.o_navbar');
          const navStyle = nav ? window.getComputedStyle(nav) : null;
          const navBg = navStyle ? String(navStyle.backgroundImage || '') : '';
          const navMinHeight = navStyle ? String(navStyle.minHeight || '') : '';
          const hasThemeVisual = navBg.includes('rgb(8, 22, 47)') && navMinHeight.includes('64px');
          return { hasClientError, hasContent, hasTheme, hasTopbarPort, hasThemeVisual };
        });

        const newErrors = consoleErrors.slice(beforeErrors);
        const criticalError = newErrors.find((text) =>
          /UncaughtPromiseError|OwlError|Traceback|ReferenceError|TypeError|SyntaxError|RPC_ERROR/i.test(String(text || '')),
        );
        if (uiCheck.hasClientError) {
          row.reason = 'client-error-banner';
        } else if (!uiCheck.hasContent) {
          row.reason = 'missing-main-content';
        } else if (!(uiCheck.hasTheme || uiCheck.hasTopbarPort || uiCheck.hasThemeVisual)) {
          row.reason = 'theme-not-applied';
        } else if (criticalError) {
          row.reason = `console-error:${criticalError.slice(0, 220)}`;
        } else {
          row.ok = true;
          row.reason = 'ok';
        }

        const rootCount = rootShotCounter.get(row.root_app) || 0;
        const shouldSample = rootCount < args.samplePerRoot;
        if (shouldSample || !row.ok) {
          const shotName = `${String(index + 1).padStart(4, '0')}_${sanitize(row.root_app)}_${sanitize(menu.name || menu.id)}.png`;
          const shotPath = path.join(screensDir, shotName);
          await page.screenshot({ path: shotPath, fullPage: true });
          row.screenshot = path.relative(outDir, shotPath).replace(/\\/g, '/');
          if (shouldSample) rootShotCounter.set(row.root_app, rootCount + 1);
        }
      } catch (error) {
        row.reason = `exception:${String(error && error.message ? error.message : error)}`;
        const shotName = `${String(index + 1).padStart(4, '0')}_${sanitize(row.root_app)}_${sanitize(menu.name || menu.id)}_error.png`;
        const shotPath = path.join(screensDir, shotName);
        try {
          await page.screenshot({ path: shotPath, fullPage: true });
          row.screenshot = path.relative(outDir, shotPath).replace(/\\/g, '/');
        } catch {
          // ignore screenshot failure
        }
      }

      if (row.ok) {
        result.passed += 1;
        rootStats.passed += 1;
      } else {
        result.failed += 1;
        rootStats.failed += 1;
      }

      result.perRoot[row.root_app] = rootStats;
      result.rows.push(row);
    }
  } finally {
    if (browser) await browser.close();
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'deep_visual_audit.json'), JSON.stringify(result, null, 2), 'utf8');

  const failures = result.rows.filter((r) => !r.ok);
  fs.writeFileSync(
    path.join(outDir, 'deep_visual_audit.md'),
    buildMarkdown(result, result.perRoot, failures),
    'utf8',
  );

  console.log(JSON.stringify({
    outDir,
    total: result.total,
    passed: result.passed,
    failed: result.failed,
    browserChannel: result.browserChannel,
  }, null, 2));
})();
