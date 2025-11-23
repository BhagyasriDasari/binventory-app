import React, { useEffect, useState } from 'react';
import api from './api';
import ProductTable from './components/ProductTable';
import ImportExport from './components/ImportExport';
import HistorySidebar from './components/HistorySidebar';

export default function App() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Inventory Management</h1>
        <div className="header-actions">
          <ImportExport onImported={fetchProducts} />
        </div>
      </header>

      <main className="main-area">
        <div style={{ flex: 1 }}>
          <ProductTable
            products={products}
            onRefresh={fetchProducts}
            onSelectHistory={p => setSelected(p)}
            loading={loading}
          />
        </div>

        <HistorySidebar product={selected} onClose={() => setSelected(null)} />
      </main>
    </div>
  );
}
