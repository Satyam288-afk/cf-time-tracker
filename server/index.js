require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { updateTime } = require('./database');
const { startBot } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API route for extension to push time data
app.post('/api/heartbeat', async (req, res) => {
    // extension sends: token, category (problem, contest), activeSeconds
    const { token, category, activeSeconds } = req.body;
    
    if (!token || !category || typeof activeSeconds !== 'number') {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    try {
        await updateTime(token, category, activeSeconds);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Start Discord Bot
    if (process.env.DISCORD_TOKEN) {
        startBot(process.env.DISCORD_TOKEN);
    } else {
        console.warn("No DISCORD_TOKEN found in .env. Bot will not start.");
    }
});
