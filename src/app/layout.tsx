import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shopact | Record Keeping for Nigerian Retail',
  description: 'Fast, reliable WhatsApp transactions and owner review dashboard.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <nav className="sidebar" aria-label="Main Navigation" style={{
            width: '260px',
            backgroundColor: 'var(--color-surface-container)',
            borderRight: '1px solid var(--color-outline-variant)',
            padding: 'var(--space-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)'
          }}>
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                Shopact
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-outline)' }}>Owner Dashboard</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
              <Link href="/dashboard" className="nav-link" style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-on-surface)', fontWeight: 500 }}>
                🚨 Alerts & Overview
              </Link>
              <Link href="/sales" className="nav-link" style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-on-surface)', fontWeight: 500 }}>
                💰 Sales
              </Link>
              <Link href="/inventory" className="nav-link" style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-on-surface)', fontWeight: 500 }}>
                📦 Inventory
              </Link>
              <Link href="/expenses" className="nav-link" style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-on-surface)', fontWeight: 500 }}>
                🧾 Expenses
              </Link>
              <Link href="/debts" className="nav-link" style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-on-surface)', fontWeight: 500 }}>
                ⏳ Debts
              </Link>
              <Link href="/settings" className="nav-link" style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', color: 'var(--color-on-surface)', fontWeight: 500 }}>
                ⚙️ Settings & Export
              </Link>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-outline-variant)' }}>
              <Link href="/login" style={{ fontSize: '0.875rem', color: 'var(--color-outline)', textDecoration: 'none' }}>
                🔒 Logout
              </Link>
            </div>
          </nav>

          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
