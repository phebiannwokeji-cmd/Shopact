export const dynamic = 'force-dynamic';

export default function SalesPage() {
  const sales = [
    { id: 's1', product: 'Indomie Chicken 70g', quantity: 12, totalNaira: 3000, recordedBy: 'Staff (Chinedu)', time: 'Today 10:45 AM' },
    { id: 's2', product: 'Golden Penny Spaghetti', quantity: 4, totalNaira: 3200, recordedBy: 'Staff (Chinedu)', time: 'Today 10:12 AM' },
    { id: 's3', product: 'Milo Refill 500g', quantity: 2, totalNaira: 4400, recordedBy: 'Owner (Phebian)', time: 'Today 09:50 AM' },
    { id: 's4', product: 'Peak Milk (Tin)', quantity: 6, totalNaira: 4500, recordedBy: 'Staff (Chinedu)', time: 'Today 08:30 AM' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>Sales Records</h1>
          <p style={{ color: 'var(--color-outline)', margin: 0 }}>All transactions recorded via /sold command or dashboard.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Amount</th>
              <th>Recorded By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.time}</td>
                <td style={{ fontWeight: 600 }}>{sale.product}</td>
                <td>{sale.quantity} units</td>
                <td>₦{sale.totalNaira.toLocaleString()}</td>
                <td>{sale.recordedBy}</td>
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
                    Edit (In-place)
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
