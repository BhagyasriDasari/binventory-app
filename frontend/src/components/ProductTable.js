import React, { useState } from 'react';
import ProductRow from './ProductRow';
import ProductForm from './ProductForm';

export default function ProductTable({ products, onRefresh, onSelectHistory, loading }) {
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filtered = products.filter(p => {
    const q = query.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q)) return false;
    if (category && p.category !== category) return false;
    return true;
  });

  return (
    <div className="table">
      <div className="controls">
        <div style={{ display:'flex', gap:8 }}>
          <button className="button primary" onClick={() => setIsAdding(true)}>Add New Product</button>
          <button className="button" onClick={onRefresh}>Refresh</button>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <input className="input" placeholder="Search name..." value={query} onChange={e=>setQuery(e.target.value)} />
          <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isAdding && <ProductForm onDone={() => { setIsAdding(false); onRefresh(); }} onCancel={() => setIsAdding(false)} />}

      <table>
        <thead>
          <tr>
            <th style={{width:'34%'}}>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th style={{width:200}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="5">Loading...</td></tr>
          ) : filtered.length === 0 ? (
            <tr><td colSpan="5">No products</td></tr>
          ) : (
            filtered.map(p => (
              <ProductRow key={p.id} product={p} onRefresh={onRefresh} onSelectHistory={onSelectHistory} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
