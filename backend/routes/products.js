const express = require('express');
const router = express.Router();
const { db } = require('../db');
const upload = require('../middleware/upload');
const fs = require('fs');
const csv = require('csv-parser');
const { body, validationResult } = require('express-validator');

// GET /api/products - list with optional query params
router.get('/', (req, res) => {
  const { page, limit, sort, order, category, name } = req.query;
  let where = [];
  let params = [];
  if (category) {
    where.push('category = ?');
    params.push(category);
  }
  if (name) {
    where.push('name LIKE ?');
    params.push('%' + name + '%');
  }

  let sql = 'SELECT * FROM products';
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  if (sort) sql += ` ORDER BY ${sort} ${order && order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
  if (page && limit) {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET single product
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Product not found' });
    res.json(row);
  });
});

// PUT update product
router.put('/:id',
  body('name').notEmpty().withMessage('Name is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const { name, unit, category, brand, stock, status, image } = req.body;

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!existing) return res.status(404).json({ message: 'Product not found' });

      // check unique name (allow same name if same id)
      db.get('SELECT id FROM products WHERE name = ? AND id != ?', [name, id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (row) return res.status(400).json({ message: 'Product name already exists' });

        // if stock changed -> insert history
        const oldStock = existing.stock;
        if (oldStock !== parseInt(stock)) {
          db.run(`INSERT INTO inventory_history (product_id, old_quantity, new_quantity, change_date, user_info)
            VALUES (?, ?, ?, ?, ?)`,
            [id, oldStock, stock, new Date().toISOString(), req.body.user_info || null]
          );
        }

        db.run(`UPDATE products SET name = ?, unit = ?, category = ?, brand = ?, stock = ?, status = ?, image = ? WHERE id = ?`,
          [name, unit || null, category || null, brand || null, stock, status || null, image || null, id],
          function (errUpdate) {
            if (errUpdate) return res.status(500).json({ error: errUpdate.message });
            db.get('SELECT * FROM products WHERE id = ?', [id], (err3, updated) => {
              if (err3) return res.status(500).json({ error: err3.message });
              res.json(updated);
            });
          }
        );
      });
    });
  }
);

// POST create product
router.post('/',
  body('name').notEmpty().withMessage('Name is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, unit, category, brand, stock, status, image } = req.body;
    db.run(`INSERT INTO products (name, unit, category, brand, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, unit || null, category || null, brand || null, stock || 0, status || null, image || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err2, row) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.status(201).json(row);
        });
      }
    );
  }
);

// DELETE product
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  });
});

// GET history for product
router.get('/:id/history', (req, res) => {
  db.all('SELECT * FROM inventory_history WHERE product_id = ? ORDER BY change_date DESC', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST import CSV
router.post('/import', upload.single('csvFile'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'CSV file is required' });

  const filePath = req.file.path;
  let added = 0;
  let skipped = 0;
  const duplicates = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      const name = (data.name || '').trim();
      if (!name) return;

      db.get('SELECT id FROM products WHERE name = ?', [name], (err, row) => {
        if (err) return;
        if (row) {
          skipped++;
          duplicates.push({ name });
        } else {
          const stock = parseInt(data.stock) || 0;
          db.run(`INSERT INTO products (name, unit, category, brand, stock, status, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, data.unit || null, data.category || null, data.brand || null, stock, data.status || null, data.image || null]
          );
          added++;
        }
      });
    })
    .on('end', () => {
      try { fs.unlinkSync(filePath); } catch (e) {}
      res.json({ added, skipped, duplicates });
    })
    .on('error', (err) => {
      res.status(500).json({ error: err.message });
    });
});

// GET export CSV
router.get('/export', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const headers = ['id','name','unit','category','brand','stock','status','image'];
    const lines = [headers.join(',')];
    rows.forEach(r => {
      const vals = headers.map(h => {
        const v = r[h] === null || r[h] === undefined ? '' : String(r[h]).replace(/\"/g, '\"\"');
        return v.includes(',') || v.includes('"') ? `"${v}"` : v;
      });
      lines.push(vals.join(','));
    });
    const csvData = lines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
    res.status(200).send(csvData);
  });
});

module.exports = router;
