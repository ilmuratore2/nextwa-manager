const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Includi la connessione a MongoDB
require('./db');

// Importa il modello Message
const Message = require('./models/Message');

// Middleware per il parsing del JSON
app.use(express.json());

// Endpoint di test
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Endpoint per creare un nuovo messaggio
app.post('/messages', async (req, res) => {
  try {
    const { content, sender } = req.body;
    const message = new Message({ content, sender });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Errore nella creazione del messaggio', details: err.message });
  }
});

// Endpoint per recuperare la lista dei messaggi
app.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dei messaggi', details: err.message });
  }
});

// Avvio del server
app.listen(port, () => {
  console.log(`Server in esecuzione sulla porta ${port}`);
});

// Avvio del client WhatsApp tramite Baileys
const { default: makeWASocket, useMultiFileAuthState } = require('@adiwajshing/baileys');

async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('messages.upsert', m => {
    console.log('Messaggio in arrivo:', JSON.stringify(m, null, 2));
  });
  
  return sock;
}

startWhatsApp().catch(err => console.error('Errore durante l\'avvio di WhatsApp:', err));
