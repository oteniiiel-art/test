const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files dari folder saat ini
app.use(express.static(__dirname));

// Route untuk index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n✅ Server sedang berjalan di: http://localhost:${PORT}`);
    console.log(`📱 Buka browser dan akses: http://localhost:${PORT}\n`);
    console.log('Tekan Ctrl+C untuk menghentikan server\n');
});
