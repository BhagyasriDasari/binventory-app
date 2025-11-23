import React, { useState } from 'react';
import api from '../api';

export default function ProductForm({ onDone, onCancel }) {
  const [form, setForm] = useState({ name:'', unit:'pcs', category:'', brand:'', stock:0, status:'active', image:'' });
  const [uploading, setUploading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/products', form);
      onDone();
    } catch (err) {
      console.error(err);
      alert('Create failed');
    }
  };

  const uploadFile = async (file) => {
    if (!file) return;
    // optional: backend must support /api/products/upload-image
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/api/products/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      if (res.data && res.data.imageUrl) {
        setForm({...form, image: res.data.imageUrl});
      } else {
        alert('Upload succeeded but no image URL returned');
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed — paste URL instead');
    } finally { setUploading(false); }
  };

  return (
    <form onSubmit={submit} style={{ marginBottom:12, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
      <input className="input" required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input className="input" placeholder="Category" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
      <input className="input" placeholder="Brand" value={form.brand} onChange={e=>setForm({...form, brand:e.target.value})} />
      <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form, stock: Number(e.target.value)})} />
      <input className="input" placeholder="Image URL (or upload)" value={form.image} onChange={e=>setForm({...form, image:e.target.value})} />

      <input type="file" onChange={e=>uploadFile(e.target.files[0])} />

      <div style={{ display:'flex', gap:6 }}>
        <button className="button primary" type="submit">Create</button>
        <button type="button" className="button" onClick={onCancel}>Cancel</button>
      </div>

      {uploading && <div className="small">Uploading...</div>}
    </form>
  );
}
