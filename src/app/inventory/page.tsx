export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  const products = [
    { id: 'p1', name: 'Peak Milk (Tin)', quantity: 4, isLow: true },
    { id: 'p2', name: 'Dangote Sugar 1kg', quantity: 7, isLow: true },
    { id: 'p3', name: 'Indomie Chicken 70g', quantity: 48, isLow: false },
    { id: 'p4', name: 'Golden Penny Spaghetti', quantity: 36, isLow: false },
    { id: 'p5', name: 'Milo Refill 500g', quantity: 18, isLow: false },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>Inventory & Stock</h1>
          <p style={{ color: 'var(--color-outline)', margin: 0 }}>Stock is updated automatically via /sold and /bought commands.</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.quantity} units</td>
                <td>
                  {p.isLow ? (
                    <span className="badge-alert">Low Stock (≤ 10)</span>
                  ) : (
                    <span style={{ color: 'var(--color-outline)' }}>Adequate</span>
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
                    Correct Stock
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
