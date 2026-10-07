import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Scaffolding demo data conforming to PRD rules
  const activeAlerts = [
    {
      id: 'alt-1',
      type: 'AGING_DEBT',
      message: 'Musa Ibrahim owes ₦12,500 (14 days overdue).',
      phone: '2348021112233',
      prefilledText: 'Hello Musa, gentle reminder regarding the outstanding balance of N12,500 with Shopact.',
    },
    {
      id: 'alt-2',
      type: 'LOW_STOCK',
      message: 'Peak Milk (Tin) is running low: only 4 units left.',
      phone: '2348057778899',
      prefilledText: 'Hello supplier, please prepare an order for Peak Milk (Tin).',
    },
    {
      id: 'alt-3',
      type: 'LARGE_EXPENSE',
      message: 'Large expense recorded: ₦65,000 for "Generator servicing & fuel".',
      phone: null,
      prefilledText: null,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>Shop Overview</h1>
          <p style={{ color: 'var(--color-outline)', margin: 0 }}>Review alerts, stock warnings, and daily metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ padding: '6px 12px', borderRadius: '16px', background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', fontSize: '0.875rem', fontWeight: 600 }}>
            WhatsApp Active
          </span>
        </div>
      </div>

      {/* Alerts-First Section (FR2, FR3) */}
      <section style={{ marginBottom: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🚨 Attention Required ({activeAlerts.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-md)',
                backgroundColor: 'var(--color-surface-container-high)',
                borderLeft: '4px solid var(--color-error)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div>
                <span className="badge-alert" style={{ marginRight: '8px' }}>{alert.type}</span>
                <span style={{ fontWeight: 500 }}>{alert.message}</span>
              </div>

              {/* FR4: WhatsApp Deep Link for Manual Owner Follow-up */}
              {alert.phone && alert.prefilledText && (
                <a
                  href={`https://wa.me/${alert.phone}?text=${encodeURIComponent(alert.prefilledText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  💬 Message via WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Summary Metric Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-outline)', margin: '0 0 8px 0' }}>Open Debts</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>₦36,500</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>3 customers overdue</span>
        </div>

        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-outline)', margin: '0 0 8px 0' }}>Items Low in Stock</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--color-on-surface)' }}>2 Products</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)' }}>Threshold: 10 units</span>
        </div>

        <div style={{ padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-outline-variant)' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--color-outline)', margin: '0 0 8px 0' }}>Today's Sales</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--color-on-surface)' }}>₦21,100</p>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)' }}>5 transactions recorded</span>
        </div>
      </section>
    </div>
  );
}
