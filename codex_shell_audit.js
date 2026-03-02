const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('C:/git/customers/yo/odoo_yo/.codex_tools/node_modules/playwright');

const ROOT = 'C:/git/customers/yo/odoo_yo';
const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.vue': 'text/plain; charset=utf-8',
  '.yml': 'text/yaml; charset=utf-8',
  '.yaml': 'text/yaml; charset=utf-8',
};

function createStaticServer(root) {
  const normalizedRoot = path.resolve(root);
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    const safePath = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    const relativePath = safePath.replace(/^[/\\]+/, '');
    let target = path.resolve(root, relativePath);
    if (relativePath === '') target = path.resolve(root, 'docs/app_ui_preview/index.html');
    if (!target.startsWith(normalizedRoot)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.stat(target, (statError, stats) => {
      if (statError) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const filePath = stats.isDirectory() ? path.join(target, 'index.html') : target;
      fs.readFile(filePath, (readError, content) => {
        if (readError) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
        res.end(content);
      });
    });
  });
}

async function launchBrowserWithFallback() {
  const attempts = [
    { label: 'msedge', options: { headless: true, channel: 'msedge', timeout: 20000 } },
    { label: 'chrome', options: { headless: true, channel: 'chrome', timeout: 20000 } },
    { label: 'bundled', options: { headless: true, timeout: 20000 } },
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
  throw lastError || new Error('Unable to launch browser with any fallback channel');
}
async function activateOpsTab(page, tabKey) {
  const selector = `.app-ops-surface__tab[data-tab-key="${tabKey}"]`;
  await page.waitForSelector(selector, { timeout: 5000 });
  await page.$eval(selector, (el) => el.click());
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function activateSurface(page, label) {
  await page.waitForSelector('.app-sidebar .app-nav-item', { timeout: 5000 });
  const clicked = await page.$eval('.app-sidebar-nav', (root, targetLabel) => {
    const norm = (value) => String(value || '').trim().toLowerCase();
    const wanted = norm(targetLabel);
    const candidates = Array.from(root.querySelectorAll('.app-nav-item'));
    for (const item of candidates) {
      const textNode = item.querySelector('.app-item-text');
      const label = norm(textNode ? textNode.textContent : item.textContent);
      if (label === wanted) {
        item.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      }
    }
    return false;
  }, label);
  if (!clicked) {
    throw new Error(`Unable to activate surface "${label}" from sidebar nav`);
  }
  await page.waitForTimeout(180);
}

(async () => {
  let hardStop = null;
  const server = createStaticServer(ROOT);
  const result = { ok: true, errors: [], notes: [] };
  hardStop = setTimeout(() => {
    try {
      console.log(JSON.stringify({
        ok: false,
        errors: ['Audit watchdog timeout: execution did not finish in 240s'],
        notes: result.notes || [],
      }, null, 2));
    } finally {
      process.exit(0);
    }
  }, 240000);

  let browser = null;
  let page = null;
  const mark = (label) => process.stderr.write(`[audit] ${label}\n`);
  try {
    const launchInfo = await launchBrowserWithFallback();
    browser = launchInfo.browser;
    result.browserChannel = launchInfo.browserLabel;
    page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
    page.setDefaultTimeout(12000);

    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const port = server.address().port;
    const previewUrl = `http://127.0.0.1:${port}/docs/app_ui_preview/index.html?locale=en`;
    result.previewUrl = previewUrl;

    await page.goto(previewUrl, { waitUntil: 'networkidle' });
    mark('loaded preview');
    await page.waitForSelector('.app-pro-shell', { timeout: 15000 });
    result.lazySections = await page.locator('.app-lazy-on-visible').count();

    await page.click('.app-topbar-apps-trigger');
    mark('topbar apps open');
    await page.waitForSelector('.app-mega-modal', { timeout: 5000 });
    result.megaOpen = await page.locator('.app-mega-modal').isVisible();
    await page.locator('.app-mega-menu-overlay').click({ position: { x: 12, y: 12 } });
    await page.waitForSelector('.app-mega-modal', { state: 'hidden', timeout: 5000 });

    await page.click('.app-topbar-primary-action');
    mark('quick create open');
    await page.waitForSelector('.app-modal-layer', { timeout: 5000 });
    result.quickCreateVisible = await page.locator('.app-modal-layer').isVisible();
    result.quickCreateGroups = await page.locator('.app-quick-create .app-button-group__option').count();
    result.quickCreateCards = await page.locator('.app-quick-create .app-data-card').count();
    if (result.quickCreateGroups > 1) {
      await page.locator('.app-quick-create .app-button-group__option').nth(1).click();
      await page.waitForTimeout(150);
      result.quickCreateCardsSecondGroup = await page.locator('.app-quick-create .app-data-card').count();
    } else {
      result.quickCreateCardsSecondGroup = result.quickCreateCards;
    }
    await page.click('.app-modal__close');
    await page.waitForSelector('.app-modal-layer', { state: 'hidden', timeout: 5000 });

    await page.click('.app-user-profile');
    mark('profile open');
    await page.waitForSelector('.app-profile-dropdown', { timeout: 5000 });
    result.profileSwitchGroups = await page.locator('.app-profile-switcher__item').count();
    await page.locator('.app-profile-switcher__item').first().click();
    await page.click('.app-user-profile');
    await page.waitForSelector('.app-profile-dropdown', { timeout: 5000 });
    result.switchedProfileName = (await page.locator('.app-user-name').textContent())?.trim();
    await page.keyboard.press('Escape');

    await page.locator('.app-button-group__option').filter({ hasText: 'Quality' }).click();
    mark('quality mode');
    await page.waitForTimeout(200);
    result.activeShellMode = (await page.locator('.app-button-group__option.is-active').textContent())?.trim();
    result.collectionsVisibleInQuality = await page.locator('.app-data-card__title', { hasText: 'Collections focus' }).count();
    result.masterDataVisibleInQuality = await page.locator('.app-data-card__title', { hasText: 'Master data watch' }).count();

    await page.click('.app-header-menu-trigger');
    mark('notification menu');
    await page.waitForSelector('.app-header-menu-panel', { timeout: 5000 });
    result.notificationItems = await page.locator('.app-header-menu-item').count();
    await page.locator('.app-header-menu-item').first().click();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(120);

    result.portalFilter = (await page.locator('.app-portal-tabs .app-tab.is-tab-active').textContent())?.trim();

    await page.locator('.app-collapsible-card__header').first().click();
    mark('collapse card');
    result.firstPanelClosed = !(await page.locator('.app-collapsible-card').first().evaluate((el) => el.classList.contains('is-open')));
    await page.locator('.app-collapsible-card__header').first().click();
    result.firstPanelOpen = await page.locator('.app-collapsible-card').first().evaluate((el) => el.classList.contains('is-open'));

    result.workspaceContextCount = await page.locator('.app-data-card').count();

    await page.click('.app-search-bar-pro input');
    mark('command palette');
    await page.waitForSelector('.app-spotlight-modal', { timeout: 5000 });
    result.commandPaletteOpen = await page.locator('.app-spotlight-modal').isVisible();
    result.commandPaletteItems = await page.locator('.app-spotlight-item').count();
    await page.keyboard.press('Escape');
    await page.waitForSelector('.app-spotlight-modal', { state: 'hidden', timeout: 5000 });
    result.commandPaletteClosed = !(await page.locator('.app-spotlight-modal').isVisible().catch(() => false));

    await page.locator('.app-button-group__option').filter({ hasText: 'Overview' }).click();
    mark('overview mode');
    await page.evaluate(() => {
      const pane = document.querySelector('.app-content-pane');
      if (pane) pane.scrollTop = pane.scrollHeight;
    });
    await page.waitForTimeout(240);
    await page.evaluate(() => {
      const pane = document.querySelector('.app-content-pane');
      if (pane) pane.scrollTop = 0;
    });
    await page.waitForTimeout(180);
    result.dashboardWidgetCount = await page.locator('.app-shell-surface-grid .app-dashboard-section, .app-shell-surface-grid .app-dashboard-section--loading').count();

    await page.locator('.app-button-group__option').filter({ hasText: 'Execution' }).click();
    mark('execution mode');
    await page.waitForSelector('.app-execution-pad .app-textarea textarea', { timeout: 5000 });
    result.executionPadVisible = await page.locator('.app-execution-pad').isVisible();
    await page.fill('.app-execution-pad .app-textarea textarea', 'audit note from codex shell pass');
    await page.click('.app-execution-pad__actions .app-button.is-primary');
    await page.waitForTimeout(180);
    result.executionActivityLabels = await page.locator('.app-shell-activity-feed__label').allTextContents();

    await page.waitForSelector('.app-ops-surface', { timeout: 5000 });
    mark('operations surface');
    const opsMeta = await page.evaluate(() => ({
      visible: Boolean(document.querySelector('.app-ops-surface')),
      tabs: document.querySelectorAll('.app-ops-surface__tab').length,
    }));
    result.operationsSurfaceVisible = opsMeta.visible;
    result.operationsTabs = opsMeta.tabs;
    mark('operations meta');

    await activateOpsTab(page, 'comments');
    mark('ops comments');
    const commentBefore = await page.locator('.app-ops-comment-row').count();
    await page.fill('.app-ops-comments__composer .app-textarea textarea', 'Audit comment from codex');
    await page.$eval('.app-ops-comments__composer-actions .app-button.is-primary', (el) => el.click());
    await page.waitForTimeout(140);
    const commentAfter = await page.locator('.app-ops-comment-row').count();
    result.operationsCommentDelta = commentAfter - commentBefore;

    await activateOpsTab(page, 'files');
    mark('ops files');
    await page.waitForSelector('.app-ops-files__toolbar', { timeout: 5000 });
    const filesBefore = await page.locator('.app-ops-files__file-row').count();
    await page.$eval('.app-ops-files__toolbar .app-button.is-ghost', (el) => el.click());
    await page.waitForTimeout(140);
    const filesAfter = await page.locator('.app-ops-files__file-row').count();
    result.operationsFileDelta = filesAfter - filesBefore;

    await activateOpsTab(page, 'tasks');
    mark('ops tasks');
    await page.waitForSelector('.app-ops-task-board', { timeout: 5000 });
    const beforeNew = await page.locator('.app-ops-task-column').nth(0).locator('.app-ops-task-card').count();
    const beforeInProgress = await page.locator('.app-ops-task-column').nth(1).locator('.app-ops-task-card').count();
    const source = page.locator('.app-ops-task-column').nth(0).locator('.app-ops-task-card').first();
    const target = page.locator('.app-ops-task-column').nth(1);
    if (await source.count()) {
      try {
        await source.dragTo(target, { timeout: 5000 });
      } catch (_dragError) {
        result.notes.push('dragTo fallback: dispatch dragstart/drop events');
        await source.dispatchEvent('dragstart');
        await target.dispatchEvent('drop');
      }
      await page.waitForTimeout(150);
    }
    const afterNew = await page.locator('.app-ops-task-column').nth(0).locator('.app-ops-task-card').count();
    const afterInProgress = await page.locator('.app-ops-task-column').nth(1).locator('.app-ops-task-card').count();
    result.operationsTaskMoved = beforeNew > afterNew && beforeInProgress < afterInProgress;

    await activateOpsTab(page, 'milestones');
    mark('ops milestones');
    await page.waitForSelector('.app-ops-milestones__grid', { timeout: 5000 });
    result.operationsMilestoneCount = await page.locator('.app-ops-milestone').count();
    await page.locator('.app-ops-milestone').nth(1).click({ force: true });
    await page.waitForTimeout(120);
    result.operationsMilestoneTaskRows = await page.locator('.app-ops-milestones__task-row').count();

    await activateOpsTab(page, 'form');
    mark('ops form');
    await page.waitForSelector('.app-ops-form', { timeout: 5000 });
    const ownerInput = page.locator('.app-ops-form input').nth(1);
    await ownerInput.fill('Audit Owner');
    await page.$eval('.app-ops-form .app-button.is-primary', (el) => el.click());
    result.operationsFormRendered = await page.locator('.app-ops-form__grid .app-ops-form__field').count();

    result.surfaceAudit = {};
    const surfaceTargets = [
      { key: 'customers', label: 'Customers' },
      { key: 'vendors', label: 'Vendors' },
      { key: 'payments', label: 'Payments' },
      { key: 'reports', label: 'Reports' },
    ];
    for (const surface of surfaceTargets) {
      await activateSurface(page, surface.label);
      const paneTitle = ((await page.locator('.app-title-pro').textContent()) || '').trim();
      const activeNavLabels = (await page.locator('.app-sidebar .app-nav-item.active .app-item-text').allTextContents())
        .map((entry) => String(entry || '').trim())
        .filter(Boolean);
      const rowCount = await page.locator('.app-record-table tbody tr').count();
      result.surfaceAudit[surface.key] = { paneTitle, activeNavLabels, rowCount };
      const isSurfaceActive = activeNavLabels.some((entry) => entry.toLowerCase() === surface.label.toLowerCase());
      if (!isSurfaceActive) {
        result.errors.push(`Surface nav mismatch for ${surface.key}: active nav labels are "${activeNavLabels.join(', ')}"`);
      }
      if (!paneTitle.toLowerCase().includes(surface.label.toLowerCase())) {
        result.errors.push(`Surface title mismatch for ${surface.key}: pane title is "${paneTitle}"`);
      }
      if (rowCount < 1) {
        result.errors.push(`Surface table has no rows for ${surface.key}`);
      }
    }

    if (result.quickCreateGroups < 2) result.errors.push(`Expected >= 2 quick-create groups, got ${result.quickCreateGroups}`);
    if (result.quickCreateCards < 2) result.errors.push(`Expected >= 2 quick-create cards in first group, got ${result.quickCreateCards}`);
    if (result.quickCreateCardsSecondGroup < 2) result.errors.push(`Expected >= 2 quick-create cards in second group, got ${result.quickCreateCardsSecondGroup}`);
    if (result.profileSwitchGroups < 2) result.errors.push(`Expected profile switcher items, got ${result.profileSwitchGroups}`);
    if (result.activeShellMode !== 'Data quality') result.errors.push(`Expected active shell mode Data quality, got ${result.activeShellMode}`);
    if (result.collectionsVisibleInQuality !== 0) result.errors.push('Collections card should be hidden in Quality mode');
    if (result.masterDataVisibleInQuality < 1) result.errors.push('Master data card should be visible in Quality mode');
    if (result.notificationItems < 1) result.errors.push('Notification dropdown did not render items');
    if (result.lazySections < 3) result.errors.push(`Expected lazy section wrappers >= 3, got ${result.lazySections}`);
    if (result.dashboardWidgetCount < 1) result.errors.push(`Expected dashboard sections >= 1, got ${result.dashboardWidgetCount}`);
    if (!result.commandPaletteOpen) result.errors.push('Command palette did not open from topbar search trigger');
    if (result.commandPaletteItems < 1) result.errors.push('Command palette rendered zero actions');
    if (!result.commandPaletteClosed) result.errors.push('Command palette did not close on Escape');
    if (!result.executionPadVisible) result.errors.push('Execution pad is not visible in Execution mode');
    if (!result.executionActivityLabels.some((label) => /Execution note|Follow-up created/i.test(String(label)))) {
      result.errors.push('Execution action did not append activity feed label');
    }
    if (!result.operationsSurfaceVisible) result.errors.push('Operations surface is not visible');
    if (result.operationsTabs < 5) result.errors.push(`Expected >= 5 operations tabs, got ${result.operationsTabs}`);
    if (result.operationsCommentDelta < 1) result.errors.push('Comments tab did not append a new comment');
    if (result.operationsFileDelta < 1) result.errors.push('Files tab did not create a new draft file');
    if (!result.operationsTaskMoved) result.errors.push('Tasks board drag/drop did not move task to next status');
    if (result.operationsMilestoneCount < 2) result.errors.push(`Expected >= 2 milestones, got ${result.operationsMilestoneCount}`);
    if (result.operationsMilestoneTaskRows < 1) result.errors.push('Milestones tab did not render linked tasks');
    if (result.operationsFormRendered < 4) result.errors.push('Form tab did not render editable schema fields');

    await page.screenshot({ path: 'C:/git/customers/yo/odoo_yo/docs/app_ui_preview/shell_audit_interactions.png', fullPage: true });
    result.ok = result.errors.length === 0;
  } catch (error) {
    result.ok = false;
    result.errors.push(String((error && error.stack) || error));
  } finally {
    if (hardStop) clearTimeout(hardStop);
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
    console.log(JSON.stringify(result, null, 2));
  }
})();
