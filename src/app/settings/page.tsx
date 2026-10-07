export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>Shop Settings</h1>
          <p style={{ color: 'var(--color-outline)', margin: 0 }}>Configure alert thresholds and download full data exports.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-xl)' }}>
        {/* Thresholds Form */}
        <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>Threshold Settings</h2>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
                Low Stock Threshold (Units)
              </label>
              <input
                type="number"
                defaultValue={10}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)' }}>
                Items at or below this level trigger low-stock alerts.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
                Large Expense Threshold (₦)
              </label>
              <input
                type="number"
                defaultValue={50000}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)'
                }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)' }}>
                Expenses at or above this amount trigger immediate attention alerts.
              </span>
            </div>

            <button
              type="button"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: 'var(--space-sm)'
              }}
            >
              Save Settings
            </button>
          </form>
        </div>

        {/* Data Export (FR7) */}
        <div style={{ backgroundColor: 'var(--color-surface-container-low)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }}>Data Portability & Export</h2>
          <p style={{ color: 'var(--color-outline)', fontSize: '0.9rem' }}>
            Download complete records for your shop. Exports run synchronously directly from the database and produce 6 separate CSV files:
          </p>
          <ul style={{ color: 'var(--color-on-surface)', fontSize: '0.9rem', marginBottom: 'var(--space-lg)' }}>
            <li>Sales records (`sales.csv`)</li>
            <li>Purchase history (`purchases.csv`)</li>
            <li>Expense receipts (`expenses.csv`)</li>
            <li>Customer debts & payments (`debts.csv`)</li>
            <li>Customer registry (`customers.csv`)</li>
            <li>Product catalogue (`products.csv`)</li>
          </ul>

          <button
            type="button"
            style={{
              backgroundColor: 'var(--color-surface-container-high)',
              border: '1px solid var(--color-outline)',
              color: 'var(--color-on-surface)',
              padding: '10px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📥 Export All Shop Records (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
