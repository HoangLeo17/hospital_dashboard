require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

const os = require('os');
function getLANIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const item of interfaces[name]) {
      if (item.family === 'IPv4' && !item.internal) {
        return item.address;
      }
    }
  }
  return 'localhost';
}

const LAN_IP = getLANIP();

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running:`);
  console.log(`  - Local:   http://localhost:${PORT}`);
  console.log(`  - Network: http://${LAN_IP}:${PORT}`);
  console.log(`Connected to the MySQL database.`);
});
