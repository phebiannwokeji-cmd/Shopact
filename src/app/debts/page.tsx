export const dynamic = 'force-dynamic';

export default function DebtsPage() {
  const debts = [
    { id: 'd1', customerName: 'Musa Ibrahim', phone: '2348021112233', amountNaira: 12500, ageDays: 14, isAging: true },
    { id: 'd2', customerName: 'Alhaji Haruna', phone: '2348057778899', amountNaira: 18000, ageDays: 9, isAging: true },
    { id: 'd3', customerName: 'Mama Nkechi', phone: '2348034445566', amountNaira: 6000, ageDays: 3, isAging: false },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>Customer Debts</h1>
          <p style={{ color: 'var(--color-outline)', margin: 0 }}>Debts recorded via /owa; settled oldest-first via /paid.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Amount Owed</th>
              <th>Age (Days)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((debt) => (
              <tr key={debt.id}>
                <td style={{ fontWeight: 600 }}>{debt.customerName}</td>
                <td>{debt.phone}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-error)' }}>₦{debt.amountNaira.toLocaleString()}</td>
                <td>{debt.ageDays} days</td>
                <td>
                  {debt.isAging ? (
                    <span className="badge-alert">Aging (≥ 7 days)</span>
                  ) : (
                    <span style={{ color: 'var(--color-outline)' }}>Open</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Mark Paid
                    </button>
                    <button
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-outline)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--color-outline)',
                        fontSize: '0.85rem'
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
