const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { db, init } = require('./db');
const productsRouter = require('./routes/products');

const PORT = 5000;
const app = express();


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

init();

app.use('/api/products', productsRouter);

app.get('/', (req, res) => res.json({ message: 'Inventory backend running' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
