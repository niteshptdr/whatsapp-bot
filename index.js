const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const app = express();
let latestQR = null; // store latest QR in memory

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Serve QR code as image
app.get('/qr', (req, res) => {
    if (!latestQR) {
        return res.status(404).send('QR code not available yet. Please check back.');
    }
    res.setHeader('Content-Type', 'image/png');
    res.send(latestQR);
});

// Root message
app.get('/', (req, res) => {
    res.send('<h2>WhatsApp Bot is running ✅</h2><p>Visit <a href="/qr">/qr</a> to scan the QR code.</p>');
});

// Generate QR code as PNG
client.on('qr', async (qr) => {
    try {
        latestQR = await QRCode.toBuffer(qr, { width: 300 });
        console.log(`\n📲 Open this link to scan your QR code: https://${process.env.RENDER_EXTERNAL_HOSTNAME}/qr`);
    } catch (err) {
        console.error('Error generating QR code image:', err);
    }
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

client.on('message', async (msg) => {
    console.log(`📩 Message from ${msg.from}: ${msg.body}`);
    if (msg.body.toLowerCase() === 'hi') {
        await msg.reply('Hello! I am your bot 🤖');
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
