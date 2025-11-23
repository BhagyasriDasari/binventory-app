import React, { useState } from 'react';
import api from '../api';

export default function ProductRow({ product, onRefresh, onSelectHistory }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: product.name || '',
    category: product.category || '',
    brand: product.brand || '',
    stock: product.stock || 0,
    image: product.image || ''
  });

  const save = async () => {
    try {
      await api.put(`/api/products/${product.id}`, form);
      setIsEditing(false);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Save failed');
    }
  };

  const del = async () => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await api.delete(`/api/products/${product.id}`);
      onRefresh();
    } catch (e) {
      console.error(e);
      alert('Delete failed');
    }
  };

  return (
    <tr>
      <td>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{ width:48, height:48, borderRadius:6, overflow:'hidden', background:'#f8fafc', flex:'none' }}>
            {product.image ? <img src={product.image} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <div style={{padding:8,color:'#9ca3af'}}>No image</div>}
          </div>
          <div>
            {isEditing ? <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /> : <div style={{fontWeight:600}}>{product.name}</div>}
            <div className="small">{product.unit} • ID: {product.id}</div>
          </div>
        </div>
      </td>

      <td>{isEditing ? <input className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} /> : product.category}</td>
      <td>{isEditing ? <input className="input" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} /> : product.brand}</td>

      <td>
        {isEditing ? <input className="input" type="number" value={form.stock} onChange={e=>setForm({...form, stock: Number(e.target.value)})} /> :
          <span className={product.stock === 0 ? 'status-out' : 'status-in'}>{product.stock}</span>}
      </td>

      <td>
        <div style={{ display:'flex', gap:8 }}>
          {isEditing ? (
            <>
              <button className="button primary" onClick={save}>Save</button>
              <button className="button" onClick={() => { setIsEditing(false); setForm({ name: product.name, category: product.category, brand: product.brand, stock: product.stock, image: product.image}); }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="button" onClick={() => setIsEditing(true)}>Edit</button>
              <button className="button" onClick={() => onSelectHistory(product)}>History</button>
              <button className="button" onClick={del}>Delete</button>
            </>
          )}
        </div>

        {isEditing && (
          <div style={{ marginTop:8 }}>
            <label style={{ fontSize:12, color:'#6b7280' }}>Image URL</label>
            <input className="input" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} placeholder="https://..." />
            <div style={{ fontSize:12, color:'#6b7280', marginTop:6 }}>You can paste an image URL or use Upload (if backend supports /api/products/upload-image).</div>
          </div>
        )}
      </td>
    </tr>
  );
}
