export const dynamic = 'force-dynamic';

export default function ExpensesPage() {
  const expenses = [
    { id: 'e1', amountNaira: 65000, note: 'Generator servicing, engine oil & 30L fuel', recordedBy: 'Staff (Chinedu)', time: 'Today 11:20 AM', isLarge: true },
    { id: 'e2', amountNaira: 4500, note: 'Roll of black plastic shopping bags', recordedBy: 'Staff (Chinedu)', time: 'Today 09:10 AM', isLarge: false },
    { id: 'e3', amountNaira: 8000, note: 'Shop sanitation and waste disposal fee', recordedBy: 'Owner (Phebian)', time: 'Yesterday 02:00 PM', isLarge: false },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>Shop Expenses</h1>
          <p style={{ color: 'var(--color-outline)', margin: 0 }}>Recorded with required notes via /spent or the dashboard.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Amount</th>
              <th>Description / Note</th>
              <th>Recorded By</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.time}</td>
                <td style={{ fontWeight: 600 }}>₦{expense.amountNaira.toLocaleString()}</td>
                <td>{expense.note}</td>
                <td>{expense.recordedBy}</td>
                <td>
                  {expense.isLarge && (
                    <span className="badge-alert">Large Expense (≥ ₦50,000)</span>
                  )}
                </td>
                <td>
                  <button
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-outline)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'var(--color-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    Edit Note
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
