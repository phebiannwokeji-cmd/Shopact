export const dynamic = 'force-dynamic';

export default function SuspendedPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: 'var(--space-2xl)', backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-error)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⏸️</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-error)', margin: '0 0 12px 0' }}>
        Shop Records Paused
      </h1>
      <p style={{ color: 'var(--color-on-surface-variant)', lineHeight: '1.6', marginBottom: 'var(--space-xl)' }}>
        This shop's records have been paused after 3 months of no activity. Your data is fully preserved and has not been deleted.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <button
          type="button"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          🔄 Reactivate Shop Records
        </button>

        <button
          type="button"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--color-primary)',
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid var(--color-outline)',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          📥 Download All Data (CSV Export)
        </button>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-outline)', marginTop: 'var(--space-lg)' }}>
        You may export your data at any time without reactivating.
      </p>
    </div>
  );
}
