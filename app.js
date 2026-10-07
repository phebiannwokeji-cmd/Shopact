/**
 * Shopact - Owner Dashboard & WhatsApp Transaction Interface
 * 
 * Strict Compliance:
 * - Uses semantic color roles & tokens from tokens.css
 * - Follows Docs/Shop_Act_PRD.md and .agent/rules/alerts-and-dashboard.md
 * - In-place editing with permanent audit trail (FR3)
 * - Synchronous alerts for low stock and large expenses; computed debt age (FR2)
 * - Manual WhatsApp follow-up deep links (FR4)
 * - Full data export (FR7)
 */

(function () {
  'use strict';

  // --- Initial State (Persisted in localStorage with Nigerian retail demo data) ---
  const DEFAULT_STATE = {
    settings: {
      lowStockThresholdUnits: 10,
      largeExpenseThresholdNaira: 50000,
    },
    products: [
      { id: 'p1', name: 'Peak Milk (Tin)', quantity: 4, unitPrice: 750, updatedAt: '2026-09-29 08:30' },
      { id: 'p2', name: 'Dangote Sugar 1kg', quantity: 7, unitPrice: 1200, updatedAt: '2026-09-29 09:15' },
      { id: 'p3', name: 'Indomie Chicken 70g', quantity: 48, unitPrice: 250, updatedAt: '2026-09-29 10:00' },
      { id: 'p4', name: 'Golden Penny Spaghetti', quantity: 36, unitPrice: 800, updatedAt: '2026-09-28 17:20' },
      { id: 'p5', name: 'Milo Refill 500g', quantity: 18, unitPrice: 2200, updatedAt: '2026-09-28 16:45' },
      { id: 'p6', name: 'Sunlight Detergent 500g', quantity: 24, unitPrice: 450, updatedAt: '2026-09-27 14:10' },
    ],
    sales: [
      { id: 's1', product: 'Indomie Chicken 70g', quantity: 12, totalNaira: 3000, recordedBy: 'Staff (Chinedu)', time: 'Today 10:45 AM' },
      { id: 's2', product: 'Golden Penny Spaghetti', quantity: 4, totalNaira: 3200, recordedBy: 'Staff (Chinedu)', time: 'Today 10:12 AM' },
      { id: 's3', product: 'Milo Refill 500g', quantity: 2, totalNaira: 4400, recordedBy: 'Owner (Phebian)', time: 'Today 09:50 AM' },
      { id: 's4', product: 'Peak Milk (Tin)', quantity: 6, totalNaira: 4500, recordedBy: 'Staff (Chinedu)', time: 'Today 08:30 AM' },
      { id: 's5', product: 'Dangote Sugar 1kg', quantity: 5, totalNaira: 6000, recordedBy: 'Staff (Chinedu)', time: 'Yesterday 04:15 PM' },
    ],
    expenses: [
      { id: 'e1', amountNaira: 65000, note: 'Generator servicing, engine oil & 30L fuel', recordedBy: 'Staff (Chinedu)', time: 'Today 11:20 AM' },
      { id: 'e2', amountNaira: 4500, note: 'Roll of black plastic shopping bags', recordedBy: 'Staff (Chinedu)', time: 'Today 09:10 AM' },
      { id: 'e3', amountNaira: 8000, note: 'Shop sanitation and waste disposal fee', recordedBy: 'Owner (Phebian)', time: 'Yesterday 02:00 PM' },
    ],
    debts: [
      { id: 'd1', customerName: 'Musa Ibrahim', phone: '2348021112233', amountNaira: 12500, ageDays: 14, status: 'OPEN', createdAt: '14 days ago' },
      { id: 'd2', customerName: 'Alhaji Haruna', phone: '2348057778899', amountNaira: 18000, ageDays: 9, status: 'OPEN', createdAt: '9 days ago' },
      { id: 'd3', customerName: 'Mama Nkechi', phone: '2348034445566', amountNaira: 6000, ageDays: 3, status: 'OPEN', createdAt: '3 days ago' },
      { id: 'd4', customerName: 'Brother Jude', phone: '2348079990011', amountNaira: 4500, ageDays: 20, status: 'PAID', createdAt: '20 days ago' },
    ],
    auditLogs: [
      { id: 'a1', timestamp: '2026-09-29 09:30', entity: 'Product (Peak Milk)', field: 'quantity', oldValue: '10', newValue: '4', modifiedBy: 'Sale Transaction /sold' },
      { id: 'a2', timestamp: '2026-09-28 15:40', entity: 'Settings', field: 'lowStockThresholdUnits', oldValue: '8', newValue: '10', modifiedBy: 'Owner (Phebian Nwokeji)' },
    ]
  };

  // State Management
  function loadState() {
    try {
      const stored = localStorage.getItem('shopact_state');
      if (stored) {
        let rawStr = stored;
        if (rawStr.includes('Emeka')) {
          rawStr = rawStr.replace(/Emeka Okonkwo/g, 'Phebian Nwokeji').replace(/Emeka/g, 'Phebian');
          const updated = JSON.parse(rawStr);
          saveState(updated);
          return updated;
        }
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read localStorage', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  function saveState(state) {
    try {
      localStorage.setItem('shopact_state', JSON.stringify(state));
    } catch (e) {
      console.warn('Could not write localStorage', e);
    }
  }

  const appState = loadState();

  // Currency Formatter
  function formatNaira(amount) {
    return '₦' + Number(amount).toLocaleString('en-NG');
  }

  // --- Compute Alerts Synchronously (FR2, FR3) ---
  function computeActiveAlerts() {
    const alerts = [];

    // 1. Low Stock Alerts (Stock <= lowStockThresholdUnits)
    appState.products.forEach(p => {
      if (p.quantity <= appState.settings.lowStockThresholdUnits) {
        alerts.push({
          type: 'LOW_STOCK',
          id: `alert-stock-${p.id}`,
          title: `Low Stock Alert: ${p.name}`,
          description: `Only ${p.quantity} units remaining in stock (Business threshold: ${appState.settings.lowStockThresholdUnits}).`,
          entity: p,
          // FR4 WhatsApp Link: Message supplier to restock
          whatsappLink: `https://wa.me/2348030001122?text=${encodeURIComponent(
            `Hello Alhaji, please send a restock order for ${p.name} to Mama Chidi Stores.`
          )}`,
          actionLabel: 'Reorder via WhatsApp'
        });
      }
    });

    // 2. Aging Debt Alerts (Debts open >= 7 days)
    appState.debts.forEach(d => {
      if (d.status === 'OPEN' && d.ageDays >= 7) {
        alerts.push({
          type: 'AGING_DEBT',
          id: `alert-debt-${d.id}`,
          title: `Aging Debt Alert: ${d.customerName}`,
          description: `Outstanding balance of ${formatNaira(d.amountNaira)} has been open for ${d.ageDays} days (Older than 7 days).`,
          entity: d,
          // FR4 WhatsApp Link: Send gentle reminder to customer
          whatsappLink: `https://wa.me/${d.phone}?text=${encodeURIComponent(
            `Good day ${d.customerName}, this is Mama Chidi Stores sending a friendly reminder regarding your outstanding credit balance of ${formatNaira(d.amountNaira)}. Thank you for your continued patronage!`
          )}`,
          actionLabel: 'Send WhatsApp Reminder'
        });
      }
    });

    // 3. Large Expense Alerts (Expense >= largeExpenseThresholdNaira)
    appState.expenses.forEach(e => {
      if (e.amountNaira >= appState.settings.largeExpenseThresholdNaira) {
        alerts.push({
          type: 'LARGE_EXPENSE',
          id: `alert-expense-${e.id}`,
          title: `Large Expense Flag: ${formatNaira(e.amountNaira)}`,
          description: `"${e.note}" recorded by ${e.recordedBy} exceeds your ₦${Number(appState.settings.largeExpenseThresholdNaira).toLocaleString()} threshold.`,
          entity: e,
          actionLabel: 'Review Entry'
        });
      }
    });

    return alerts;
  }

  // --- Rendering Functions ---

  function renderAlerts() {
    const alerts = computeActiveAlerts();
    const alertsContainer = document.getElementById('alertsList');
    const badge = document.getElementById('activeAlertCount');
    const navBadge = document.getElementById('navAlertBadge');

    if (badge) badge.textContent = `${alerts.length} Alerts`;
    if (navBadge) navBadge.textContent = alerts.length;

    if (!alertsContainer) return;

    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div style="padding: 24px; text-align: center; background: var(--color-surface); border-radius: 12px; border: 1px solid var(--color-outline-variant);">
          <p class="type-body-large" style="color: #059669; font-weight: 600;">✨ All Clear - No Active Alerts</p>
          <p class="type-body-small" style="color: var(--color-on-surface-variant); margin-top: 4px;">
            Stock levels healthy, no debts older than 7 days, and no anomalous large expenses.
          </p>
        </div>
      `;
      return;
    }

    alertsContainer.innerHTML = alerts.map(a => {
      let icon = '📦';
      let cardClass = 'alert-stock';
      let tagText = 'Low Inventory';

      if (a.type === 'AGING_DEBT') {
        icon = '⏳';
        cardClass = 'alert-debt';
        tagText = 'Aging Debt';
      } else if (a.type === 'LARGE_EXPENSE') {
        icon = '⚠️';
        cardClass = 'alert-expense';
        tagText = 'Large Expense';
      }

      const actionBtn = a.whatsappLink
        ? `<a href="${a.whatsappLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
             <span>📲</span> ${a.actionLabel}
           </a>`
        : `<button class="btn btn-secondary btn-sm" onclick="window.ShopactApp.switchView('expenses')">${a.actionLabel}</button>`;

      return `
        <div class="alert-card ${cardClass}">
          <div class="alert-icon-wrapper">${icon}</div>
          <div class="alert-content">
            <span class="alert-tag">${tagText}</span>
            <h4 class="alert-title type-title-medium">${a.title}</h4>
            <p class="alert-desc">${a.description}</p>
          </div>
          <div class="alert-actions">
            ${actionBtn}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderKPIs() {
    const todaySales = appState.sales.reduce((sum, s) => sum + s.totalNaira, 0);
    const openDebts = appState.debts
      .filter(d => d.status === 'OPEN')
      .reduce((sum, d) => sum + d.amountNaira, 0);
    const lowStockCount = appState.products.filter(p => p.quantity <= appState.settings.lowStockThresholdUnits).length;
    const todayExpenses = appState.expenses.reduce((sum, e) => sum + e.amountNaira, 0);

    const elSales = document.getElementById('kpiSalesTotal');
    const elSalesMeta = document.getElementById('kpiSalesMeta');
    const elDebts = document.getElementById('kpiDebtsTotal');
    const elDebtsMeta = document.getElementById('kpiDebtsMeta');
    const elLowStock = document.getElementById('kpiLowStockTotal');
    const elExpenses = document.getElementById('kpiExpensesTotal');

    if (elSales) elSales.textContent = formatNaira(todaySales);
    if (elSalesMeta) elSalesMeta.textContent = `${appState.sales.length} transactions recorded`;
    if (elDebts) elDebts.textContent = formatNaira(openDebts);
    if (elDebtsMeta) {
      const openCount = appState.debts.filter(d => d.status === 'OPEN').length;
      const oldest = Math.max(...appState.debts.filter(d => d.status === 'OPEN').map(d => d.ageDays), 0);
      elDebtsMeta.textContent = `${openCount} customers (Oldest: ${oldest} days)`;
    }
    if (elLowStock) elLowStock.textContent = `${lowStockCount} Items`;
    if (elExpenses) elExpenses.textContent = formatNaira(todayExpenses);
  }

  function renderRecentActivity() {
    const tableBody = document.getElementById('recentActivityTable');
    if (!tableBody) return;

    // Combine sales and expenses for recent activity feed
    const combined = [
      ...appState.sales.map(s => ({ time: s.time, type: 'Sale', details: `${s.quantity}x ${s.product}`, amount: formatNaira(s.totalNaira), actor: s.recordedBy, raw: s, entity: 'sales' })),
      ...appState.expenses.map(e => ({ time: e.time, type: 'Expense', details: e.note, amount: formatNaira(e.amountNaira), actor: e.recordedBy, raw: e, entity: 'expenses' }))
    ].slice(0, 5);

    tableBody.innerHTML = combined.map(item => `
      <tr>
        <td>${item.time}</td>
        <td><span class="pill ${item.type === 'Sale' ? 'pill-paid' : 'pill-low'}">${item.type}</span></td>
        <td><strong>${item.details}</strong></td>
        <td><strong>${item.amount}</strong></td>
        <td><span class="pill pill-actor">${item.actor}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="window.ShopactApp.openCorrection('${item.entity}', '${item.raw.id}')">
            ✏️ Correct
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    const countPill = document.getElementById('salesCountPill');
    if (!tbody) return;

    if (countPill) countPill.textContent = `${appState.sales.length} records`;

    tbody.innerHTML = appState.sales.map(s => `
      <tr>
        <td>${s.time}</td>
        <td><strong>${s.product}</strong></td>
        <td>${s.quantity}</td>
        <td><strong>${formatNaira(s.totalNaira)}</strong></td>
        <td><span class="pill pill-actor">${s.recordedBy}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="window.ShopactApp.openCorrection('sales', '${s.id}')">
            ✏️ Correct
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    const countPill = document.getElementById('inventoryCountPill');
    if (!tbody) return;

    if (countPill) countPill.textContent = `${appState.products.length} items`;

    tbody.innerHTML = appState.products.map(p => {
      const isLow = p.quantity <= appState.settings.lowStockThresholdUnits;
      const statusPill = isLow
        ? `<span class="pill pill-low">Low Stock (${p.quantity})</span>`
        : `<span class="pill pill-ok">In Stock</span>`;

      return `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td>${p.quantity} units</td>
          <td>${statusPill}</td>
          <td>${formatNaira(p.unitPrice)}</td>
          <td style="color: var(--color-on-surface-variant); font-size: 13px;">${p.updatedAt}</td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="window.ShopactApp.openCorrection('inventory', '${p.id}')">
              ✏️ Adjust Stock
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderExpensesTable() {
    const tbody = document.getElementById('expensesTableBody');
    const countPill = document.getElementById('expensesCountPill');
    if (!tbody) return;

    if (countPill) countPill.textContent = `${appState.expenses.length} records`;

    tbody.innerHTML = appState.expenses.map(e => {
      const isLarge = e.amountNaira >= appState.settings.largeExpenseThresholdNaira;
      const flagPill = isLarge
        ? `<span class="pill pill-low">Large Expense Flag</span>`
        : `<span class="pill pill-ok">Normal</span>`;

      return `
        <tr>
          <td>${e.time}</td>
          <td><strong>${formatNaira(e.amountNaira)}</strong></td>
          <td>${e.note}</td>
          <td>${flagPill}</td>
          <td><span class="pill pill-actor">${e.recordedBy}</span></td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="window.ShopactApp.openCorrection('expenses', '${e.id}')">
              ✏️ Correct
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderDebtsTable() {
    const tbody = document.getElementById('debtsTableBody');
    const countPill = document.getElementById('debtsCountPill');
    if (!tbody) return;

    if (countPill) countPill.textContent = `${appState.debts.length} records`;

    tbody.innerHTML = appState.debts.map(d => {
      const isOpen = d.status === 'OPEN';
      const isAging = isOpen && d.ageDays >= 7;
      const statusPill = isOpen
        ? (isAging ? `<span class="pill pill-low">Overdue (${d.ageDays}d)</span>` : `<span class="pill pill-open">Open (${d.ageDays}d)</span>`)
        : `<span class="pill pill-paid">Paid</span>`;

      const whatsappBtn = isOpen
        ? `<a href="https://wa.me/${d.phone}?text=${encodeURIComponent(
            `Good day ${d.customerName}, friendly reminder from Mama Chidi Stores regarding your outstanding debt of ${formatNaira(d.amountNaira)}. Thank you!`
          )}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">📲 Remind</a>`
        : '';

      const markPaidBtn = isOpen
        ? `<button class="btn btn-secondary btn-sm" onclick="window.ShopactApp.markDebtPaid('${d.id}')">Mark Paid</button>`
        : '';

      return `
        <tr>
          <td><strong>${d.customerName}</strong></td>
          <td style="color: var(--color-on-surface-variant); font-size: 13px;">+${d.phone}</td>
          <td><strong>${formatNaira(d.amountNaira)}</strong></td>
          <td>${d.ageDays} days</td>
          <td>${statusPill}</td>
          <td style="display: flex; gap: 8px;">
            ${whatsappBtn}
            ${markPaidBtn}
            <button class="btn btn-outline btn-sm" onclick="window.ShopactApp.openCorrection('debts', '${d.id}')">✏️ Edit</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderAuditLogTable() {
    const tbody = document.getElementById('auditLogTableBody');
    if (!tbody) return;

    tbody.innerHTML = appState.auditLogs.map(a => `
      <tr>
        <td style="font-family: monospace; font-size: 12px;">${a.timestamp}</td>
        <td><strong>${a.entity}</strong></td>
        <td><code>${a.field}</code></td>
        <td style="color: var(--color-error);"><del>${a.oldValue}</del></td>
        <td style="color: #059669; font-weight: 600;">${a.newValue}</td>
        <td><span class="pill pill-actor">${a.modifiedBy}</span></td>
      </tr>
    `).join('');
  }

  function renderAll() {
    renderAlerts();
    renderKPIs();
    renderRecentActivity();
    renderSalesTable();
    renderInventoryTable();
    renderExpensesTable();
    renderDebtsTable();
    renderAuditLogTable();
  }

  // --- In-Place Correction Modal Logic (FR3) ---
  let activeCorrectionContext = null;

  function openCorrection(entityType, id) {
    activeCorrectionContext = { entityType, id };
    const modal = document.getElementById('correctionModal');
    const title = document.getElementById('modalTitle');
    const label = document.getElementById('modalFieldLabel');
    const input = document.getElementById('modalFieldValue');
    const reasonInput = document.getElementById('modalReason');

    reasonInput.value = '';

    if (entityType === 'sales') {
      const record = appState.sales.find(s => s.id === id);
      if (!record) return;
      title.textContent = `Correct Sale: ${record.product}`;
      label.textContent = `Sale Total (₦)`;
      input.value = record.totalNaira;
      activeCorrectionContext.field = 'totalNaira';
      activeCorrectionContext.oldValue = String(record.totalNaira);
    } else if (entityType === 'inventory') {
      const record = appState.products.find(p => p.id === id);
      if (!record) return;
      title.textContent = `Adjust Stock: ${record.name}`;
      label.textContent = `Current Stock Quantity (Units)`;
      input.value = record.quantity;
      activeCorrectionContext.field = 'quantity';
      activeCorrectionContext.oldValue = String(record.quantity);
    } else if (entityType === 'expenses') {
      const record = appState.expenses.find(e => e.id === id);
      if (!record) return;
      title.textContent = `Correct Expense`;
      label.textContent = `Expense Amount (₦)`;
      input.value = record.amountNaira;
      activeCorrectionContext.field = 'amountNaira';
      activeCorrectionContext.oldValue = String(record.amountNaira);
    } else if (entityType === 'debts') {
      const record = appState.debts.find(d => d.id === id);
      if (!record) return;
      title.textContent = `Correct Debt: ${record.customerName}`;
      label.textContent = `Debt Balance (₦)`;
      input.value = record.amountNaira;
      activeCorrectionContext.field = 'amountNaira';
      activeCorrectionContext.oldValue = String(record.amountNaira);
    }

    modal.classList.add('open');
  }

  function closeCorrectionModal() {
    const modal = document.getElementById('correctionModal');
    modal.classList.remove('open');
    activeCorrectionContext = null;
  }

  function saveCorrection() {
    if (!activeCorrectionContext) return;

    const input = document.getElementById('modalFieldValue');
    const reasonInput = document.getElementById('modalReason');
    const newValue = input.value.trim();
    const reason = reasonInput.value.trim() || 'Owner dashboard manual correction';

    const { entityType, id, field, oldValue } = activeCorrectionContext;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Update in-place & record audit log (FR3)
    if (entityType === 'sales') {
      const item = appState.sales.find(s => s.id === id);
      if (item) item[field] = Number(newValue);
    } else if (entityType === 'inventory') {
      const item = appState.products.find(p => p.id === id);
      if (item) item[field] = Number(newValue);
    } else if (entityType === 'expenses') {
      const item = appState.expenses.find(e => e.id === id);
      if (item) item[field] = Number(newValue);
    } else if (entityType === 'debts') {
      const item = appState.debts.find(d => d.id === id);
      if (item) item[field] = Number(newValue);
    }

    appState.auditLogs.unshift({
      id: 'a' + Date.now(),
      timestamp: nowStr,
      entity: `${entityType} (${id})`,
      field: field,
      oldValue: oldValue,
      newValue: newValue,
      modifiedBy: `Owner (Phebian) - ${reason}`
    });

    saveState(appState);
    closeCorrectionModal();
    renderAll();
  }

  function markDebtPaid(id) {
    const debt = appState.debts.find(d => d.id === id);
    if (!debt) return;

    debt.status = 'PAID';
    appState.auditLogs.unshift({
      id: 'a' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      entity: `Debt (${debt.customerName})`,
      field: 'status',
      oldValue: 'OPEN',
      newValue: 'PAID',
      modifiedBy: 'Owner (Phebian Nwokeji)'
    });

    saveState(appState);
    renderAll();
  }

  // --- WhatsApp Command Simulator (FR1) ---
  function addSimulatorMessage(text, isOut = false) {
    const container = document.getElementById('simulatorMessages');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${isOut ? 'msg-out' : 'msg-in'}`;
    bubble.innerHTML = text + `<div class="msg-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }

  function handleWhatsAppCommand(rawInput) {
    const text = rawInput.trim();
    if (!text) return;

    addSimulatorMessage(text, true);

    const parts = text.split(/\s+/);
    const cmd = parts[0].toLowerCase();

    // 1. /sold <product> <quantity>
    if (cmd === '/sold') {
      const prodName = parts[1];
      const qty = parseInt(parts[2], 10);

      if (!prodName || isNaN(qty) || qty <= 0) {
        addSimulatorMessage(`⚠️ Usage: <code>/sold &lt;product&gt; &lt;quantity&gt;</code> (e.g., /sold Indomie 3)`);
        return;
      }

      const product = appState.products.find(p => p.name.toLowerCase().includes(prodName.toLowerCase()));
      if (!product) {
        addSimulatorMessage(`❌ Product "${prodName}" not found in inventory.`);
        return;
      }

      if (product.quantity < qty) {
        addSimulatorMessage(`❌ Only ${product.quantity} ${product.name} left. Sale not recorded.`);
        return;
      }

      // Record Sale
      product.quantity -= qty;
      const total = qty * product.unitPrice;
      appState.sales.unshift({
        id: 's' + Date.now(),
        product: product.name,
        quantity: qty,
        totalNaira: total,
        recordedBy: 'Staff via WhatsApp',
        time: 'Just now'
      });

      saveState(appState);
      renderAll();
      addSimulatorMessage(`✅ Recorded: sold ${qty} ${product.name} for ${formatNaira(total)}. Stock remaining: ${product.quantity}.`);
      return;
    }

    // 2. /bought <product> <quantity> <amount>
    if (cmd === '/bought') {
      const prodName = parts[1];
      const qty = parseInt(parts[2], 10);
      const amount = parseInt(parts[3], 10);

      if (!prodName || isNaN(qty) || isNaN(amount)) {
        addSimulatorMessage(`⚠️ Usage: <code>/bought &lt;product&gt; &lt;quantity&gt; &lt;total_cost&gt;</code>`);
        return;
      }

      let product = appState.products.find(p => p.name.toLowerCase().includes(prodName.toLowerCase()));
      if (!product) {
        product = { id: 'p' + Date.now(), name: prodName, quantity: qty, unitPrice: Math.round(amount / qty), updatedAt: 'Just now' };
        appState.products.push(product);
      } else {
        product.quantity += qty;
        product.updatedAt = 'Just now';
      }

      saveState(appState);
      renderAll();
      addSimulatorMessage(`✅ Recorded: bought ${qty} ${product.name} for ${formatNaira(amount)}. New stock: ${product.quantity}.`);
      return;
    }

    // 3. /owa <name> <amount>
    if (cmd === '/owa') {
      const name = parts[1];
      const amount = parseInt(parts[2], 10);

      if (!name || isNaN(amount) || amount <= 0) {
        addSimulatorMessage(`⚠️ Usage: <code>/owa &lt;name&gt; &lt;amount&gt;</code> (e.g., /owa Musa 5000)`);
        return;
      }

      appState.debts.unshift({
        id: 'd' + Date.now(),
        customerName: name,
        phone: '234800000000',
        amountNaira: amount,
        ageDays: 0,
        status: 'OPEN',
        createdAt: 'Today'
      });

      saveState(appState);
      renderAll();
      addSimulatorMessage(`✅ Recorded: ${name} owes ${formatNaira(amount)}.`);
      return;
    }

    // 4. /paid <name>
    if (cmd === '/paid') {
      const name = parts[1];
      if (!name) {
        addSimulatorMessage(`⚠️ Usage: <code>/paid &lt;name&gt;</code>`);
        return;
      }

      const openDebts = appState.debts.filter(d => d.customerName.toLowerCase().includes(name.toLowerCase()) && d.status === 'OPEN');
      if (openDebts.length === 0) {
        addSimulatorMessage(`${name} has no open debt.`);
        return;
      }

      // Settle oldest open debt first
      const oldestDebt = openDebts.sort((a, b) => b.ageDays - a.ageDays)[0];
      oldestDebt.status = 'PAID';

      const remaining = openDebts.length - 1;
      saveState(appState);
      renderAll();

      if (remaining > 0) {
        addSimulatorMessage(`✅ Recorded: ${oldestDebt.customerName} paid ${formatNaira(oldestDebt.amountNaira)}. ${remaining} debt still open.`);
      } else {
        addSimulatorMessage(`✅ Recorded: ${oldestDebt.customerName} paid ${formatNaira(oldestDebt.amountNaira)}. All debts cleared!`);
      }
      return;
    }

    // 5. /spent <amount> <note>
    if (cmd === '/spent') {
      const amount = parseInt(parts[1], 10);
      const note = parts.slice(2).join(' ');

      if (isNaN(amount) || amount <= 0 || !note) {
        addSimulatorMessage(`⚠️ Tell me what it was for, for example: <code>/spent 5000 fuel for delivery bike</code>`);
        return;
      }

      appState.expenses.unshift({
        id: 'e' + Date.now(),
        amountNaira: amount,
        note: note,
        recordedBy: 'Staff via WhatsApp',
        time: 'Just now'
      });

      saveState(appState);
      renderAll();

      let reply = `✅ Recorded: expense of ${formatNaira(amount)}, ${note}.`;
      if (amount >= appState.settings.largeExpenseThresholdNaira) {
        reply += ` 🚨 [ALERT: Meets/exceeds ₦${Number(appState.settings.largeExpenseThresholdNaira).toLocaleString()} threshold]`;
      }
      addSimulatorMessage(reply);
      return;
    }

    // 6. /stock
    if (cmd === '/stock') {
      const low = appState.products.filter(p => p.quantity <= appState.settings.lowStockThresholdUnits);
      if (low.length === 0) {
        addSimulatorMessage(`📦 Nothing running low. All items above ${appState.settings.lowStockThresholdUnits} units.`);
      } else {
        const list = low.map(p => `• ${p.name}: ${p.quantity} left`).join('<br>');
        addSimulatorMessage(`🚨 <strong>Items running low:</strong><br>${list}`);
      }
      return;
    }

    // 7. /debts
    if (cmd === '/debts') {
      const open = appState.debts.filter(d => d.status === 'OPEN');
      if (open.length === 0) {
        addSimulatorMessage(`🎉 No open customer debts!`);
      } else {
        const total = open.reduce((sum, d) => sum + d.amountNaira, 0);
        const oldest = Math.max(...open.map(d => d.ageDays), 0);
        addSimulatorMessage(`📋 ${open.length} customers owe you ${formatNaira(total)}. Oldest is ${oldest} days.`);
      }
      return;
    }

    // Unrecognized command (FR1 fallback)
    addSimulatorMessage(`❓ Unrecognized command. Available fixed commands:<br>• <code>/sold &lt;product&gt; &lt;qty&gt;</code><br>• <code>/bought &lt;product&gt; &lt;qty&gt; &lt;amount&gt;</code><br>• <code>/owa &lt;name&gt; &lt;amount&gt;</code><br>• <code>/paid &lt;name&gt;</code><br>• <code>/spent &lt;amount&gt; &lt;note&gt;</code><br>• <code>/stock</code><br>• <code>/debts</code>`);
  }

  // --- Data Export Functionality (FR7) ---
  function exportCSV(filename, rows) {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(','),
      ...rows.map(row => keys.map(k => `"${String(row[k] || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportAllData() {
    exportCSV('shopact_sales.csv', appState.sales);
    exportCSV('shopact_inventory.csv', appState.products);
    exportCSV('shopact_expenses.csv', appState.expenses);
    exportCSV('shopact_debts.csv', appState.debts);
    exportCSV('shopact_audit_log.csv', appState.auditLogs);
    alert('Export completed: Downloaded CSV records for Sales, Inventory, Expenses, Debts, and Audit Logs.');
  }

  // --- View Navigation ---
  function switchView(viewName) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.view-section').forEach(el => {
      el.classList.remove('active');
    });

    const targetSection = document.getElementById(`view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    const headingMap = {
      dashboard: 'Dashboard Overview',
      sales: 'Sales Transactions',
      inventory: 'Inventory & Stock Management',
      expenses: 'Expense Tracker',
      debts: 'Customer Credit & Debts',
      settings: 'Shop Settings & Data Export'
    };

    const headingEl = document.getElementById('currentPageHeading');
    if (headingEl) headingEl.textContent = headingMap[viewName] || 'Dashboard';

    // Close mobile sidebar if open
    const sidebar = document.getElementById('appSidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  // --- Initialization & Event Listeners ---
  document.addEventListener('DOMContentLoaded', () => {
    renderAll();

    // Nav Item Clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        switchView(view);
      });
    });

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('appSidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // View All Sales Link
    const btnViewSales = document.getElementById('btnViewAllSales');
    if (btnViewSales) {
      btnViewSales.addEventListener('click', () => switchView('sales'));
    }

    // Export Buttons
    const btnTopExport = document.getElementById('btnExportTop');
    const btnFullExport = document.getElementById('btnExportFullData');
    if (btnTopExport) btnTopExport.addEventListener('click', exportAllData);
    if (btnFullExport) btnFullExport.addEventListener('click', exportAllData);

    // Settings Form Submit
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      const lowInput = document.getElementById('settingLowStock');
      const expenseInput = document.getElementById('settingLargeExpense');

      if (lowInput) lowInput.value = appState.settings.lowStockThresholdUnits;
      if (expenseInput) expenseInput.value = appState.settings.largeExpenseThresholdNaira;

      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldLow = appState.settings.lowStockThresholdUnits;
        const oldExpense = appState.settings.largeExpenseThresholdNaira;
        const newLow = parseInt(lowInput.value, 10);
        const newExpense = parseInt(expenseInput.value, 10);

        appState.settings.lowStockThresholdUnits = newLow;
        appState.settings.largeExpenseThresholdNaira = newExpense;

        appState.auditLogs.unshift({
          id: 'a' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          entity: 'Settings',
          field: 'thresholds',
          oldValue: `Low: ${oldLow}u, Exp: ₦${oldExpense}`,
          newValue: `Low: ${newLow}u, Exp: ₦${newExpense}`,
          modifiedBy: 'Owner (Phebian Nwokeji)'
        });

        saveState(appState);
        renderAll();
        alert('Settings updated successfully. Thresholds are active for all subsequent writes.');
      });
    }

    // Correction Modal Events
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnConfirmCorrection = document.getElementById('btnConfirmCorrection');

    if (btnCloseModal) btnCloseModal.addEventListener('click', closeCorrectionModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeCorrectionModal);
    if (btnConfirmCorrection) btnConfirmCorrection.addEventListener('click', saveCorrection);

    // WhatsApp Simulator Drawer
    const btnToggleSim = document.getElementById('btnToggleSimulator');
    const simDrawer = document.getElementById('simulatorDrawer');
    const btnCloseSim = document.getElementById('btnCloseSimulator');
    const simForm = document.getElementById('simulatorForm');
    const simInput = document.getElementById('simulatorInput');

    if (btnToggleSim && simDrawer) {
      btnToggleSim.addEventListener('click', () => {
        simDrawer.classList.toggle('open');
      });
    }

    if (btnCloseSim && simDrawer) {
      btnCloseSim.addEventListener('click', () => {
        simDrawer.classList.remove('open');
      });
    }

    if (simForm && simInput) {
      simForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cmd = simInput.value;
        simInput.value = '';
        handleWhatsAppCommand(cmd);
      });
    }

    // Quick Command Pills
    document.querySelectorAll('.cmd-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const cmd = pill.getAttribute('data-cmd');
        if (cmd) handleWhatsAppCommand(cmd);
      });
    });
  });

  // Expose methods for HTML inline triggers
  window.ShopactApp = {
    switchView,
    openCorrection,
    markDebtPaid,
    exportAllData,
  };
})();
