// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { db, init } = require('./db'); // keep your existing ./db module
const productsRouter = require('./routes/products');

const PORT = process.env.PORT || 5000;
const app = express();

// ensure uploads directory exists (recursive safe)
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory:', uploadsDir);
  }
} catch (err) {
  console.error('Error ensuring uploads directory:', err);
}

// Configure CORS
// If you want to restrict origins in production, set CORS_ORIGIN environment variable
// e.g. CORS_ORIGIN="https://your-frontend.vercel.app"
const corsOrigin = process.env.CORS_ORIGIN || '*';
if (corsOrigin === '*') {
  app.use(cors());
  console.log('CORS: allowing all origins (development).');
} else {
  app.use(cors({ origin: corsOrigin }));
  console.log('CORS: allowing origin:', corsOrigin);
}

app.use(express.json());
// serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Initialize DB (your ./db.init should create tables etc)
init()
  .then(() => console.log('Database initialized'))
  .catch((err) => {
    console.error('Database init failed:', err);
    // don't exit here — app can still start for debugging, but in prod you may want to exit.
  });

// Mount routers
app.use('/api/products', productsRouter);

// Basic health route
app.get('/', (req, res) => res.json({ message: 'Inventory backend running' }));

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
