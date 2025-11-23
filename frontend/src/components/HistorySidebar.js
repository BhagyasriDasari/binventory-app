import React, { useEffect, useState } from 'react';
import api from '../api';

export default function HistorySidebar({ product, onClose }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!product) return setHistory([]);
    api.get(`/api/products/${product.id}/history`).then(res => setHistory(res.data)).catch(e => console.error(e));
  }, [product]);

  return (
    <div className="sidebar">
      {!product ? (
        <div>
          <h3>Inventory History</h3>
          <div className="small">Select a product to view history</div>
        </div>
      ) : (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3>{product.name} — History</h3>
            <button className="button" onClick={onClose}>Close</button>
          </div>

          {history.length === 0 ? <div className="small">No history</div> : (
            <div style={{ marginTop:8 }}>
              {history.map(h => (
                <div className="history-item" key={h.id}>
                  <div style={{ fontWeight:600 }}>{new Date(h.change_date).toLocaleString()}</div>
                  <div>Old: {h.old_quantity} → New: {h.new_quantity}</div>
                  {h.user_info && <div className="small">User: {h.user_info}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
