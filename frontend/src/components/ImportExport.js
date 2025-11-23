import React, { useRef } from 'react';
import api from '../api';

export default function ImportExport({ onImported }) {
  const fileRef = useRef();

  const download = async () => {
    try {
      const res = await api.get('/api/products/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
      alert('Export failed');
    }
  };

  const upload = async (file) => {
    const fd = new FormData();
    fd.append('csvFile', file);
    try {
      await api.post('/api/products/import', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert('Import finished');
      onImported();
    } catch (e) {
      console.error(e);
      alert('Import failed');
    }
  };

  return (
    <div style={{ display:'flex', gap:8 }}>
      <button className="button" onClick={() => fileRef.current.click()}>Import</button>
      <button className="button" onClick={download}>Export</button>
      <input ref={fileRef} type="file" accept=".csv" style={{ display:'none' }} onChange={e => upload(e.target.files[0])} />
    </div>
  );
}
