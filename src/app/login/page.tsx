export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div style={{ maxWidth: '420px', margin: '100px auto', padding: 'var(--space-2xl)', backgroundColor: 'var(--color-surface-container)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-outline-variant)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0 0 6px 0' }}>Shopact</h1>
        <p style={{ color: 'var(--color-outline)', margin: 0, fontSize: '0.9rem' }}>Owner Dashboard Access</p>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>
            Registered Phone Number
          </label>
          <input
            type="tel"
            placeholder="e.g. 08012345678"
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid var(--color-outline)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-on-surface)'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}>
            Security PIN
          </label>
          <input
            type="password"
            maxLength={6}
            placeholder="••••"
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid var(--color-outline)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-on-surface)'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 'var(--space-sm)'
          }}
        >
          Sign In to Shopact
        </button>
      </form>

      <p style={{ fontSize: '0.75rem', color: 'var(--color-outline)', textAlign: 'center', marginTop: 'var(--space-xl)' }}>
        Staff members record transactions directly on WhatsApp. Dashboard login is reserved for the shop owner.
      </p>
    </div>
  );
}
