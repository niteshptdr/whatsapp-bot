const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

const app = express();
let latestQR = null;

app.use(express.json()); // <-- important

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

// Serve QR
app.get('/qr', (req, res) => {
    if (!latestQR) return res.status(404).send('QR not ready');
    res.setHeader('Content-Type', 'image/png');
    res.send(latestQR);
});

// Root
app.get('/', (req, res) => {
    res.send('<h2>WhatsApp Bot is running ✅</h2><p>Visit <a href="/qr">/qr</a></p>');
});

// New API route to send messages
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).json({ error: 'Number and message are required' });
    }
    try {
        const chatId = `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: err.message });
    }
});

// QR generation
client.on('qr', async (qr) => {
    try {
        latestQR = await QRCode.toBuffer(qr, { width: 300 });
        console.log(`📲 Scan QR: https://${process.env.RENDER_EXTERNAL_HOSTNAME}/qr`);
    } catch (err) {
        console.error('QR error:', err);
    }
});

client.on('ready', () => console.log('✅ WhatsApp bot is ready!'));
client.on('message', async (msg) => {
    console.log(`📩 ${msg.from}: ${msg.body}`);
    if (msg.body.toLowerCase() === 'hi') {
        await msg.reply('Hello! I am your bot 🤖');
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
