const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create client with local session storage
const client = new Client({
    authStrategy: new LocalAuth()
});

// Show QR code in console
client.on('qr', (qr) => {
    console.log('Scan this QR code:');
    qrcode.generate(qr, { small: true });
});

// Ready event
client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

// Listen for messages
client.on('message', async (msg) => {
    console.log(`📩 Message from ${msg.from}: ${msg.body}`);
    
    if (msg.body.toLowerCase() === 'hi') {
        await msg.reply('Hello! I am your bot 🤖');
    }
});

client.initialize();
