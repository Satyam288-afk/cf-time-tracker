const { Client, GatewayIntentBits } = require('discord.js');
const { linkUser, getUserStats, getLeaderboard } = require('./database');
const crypto = require('crypto');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Example: Setup interval to send motivational messages to a specific channel if needed
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!link')) {
        // Generate a random token
        const token = crypto.randomBytes(8).toString('hex');
        try {
            await linkUser(message.author.id, token);
            message.author.send(`Your Codeforces Extension link token is: \`${token}\`\nPut this in your extension settings!`);
            message.reply("I've DM'd you your token to link the extension!");
        } catch (err) {
            message.reply("Error generating token. You might need to allow DMs.");
        }
    }

    if (message.content.startsWith('!stats')) {
        const today = new Date().toISOString().split('T')[0];
        const stats = await getUserStats(message.author.id, today);
        const totalSecs = stats.problem_solving_seconds + stats.contest_seconds;
        
        if (totalSecs === 0) {
            return message.reply("You haven't spent any active time on Codeforces today! Time to grind 😈");
        }
        
        const formatTime = (secs) => {
            const h = Math.floor(secs / 3600);
            const m = Math.floor((secs % 3600) / 60);
            return `${h}h ${m}m`;
        };
        
        message.reply(`Today's Stats:\n📝 Problem Solving: **${formatTime(stats.problem_solving_seconds)}**\n🏆 Contests: **${formatTime(stats.contest_seconds)}**\n📈 Total: **${formatTime(totalSecs)}**`);
    }

    if (message.content.startsWith('!leaderboard')) {
        const today = new Date().toISOString().split('T')[0];
        const rows = await getLeaderboard(today);
        
        if (rows.length === 0) {
            return message.reply("No one has grinded today yet!");
        }

        let lb = "**Today's Codeforces Leaderboard** 😈\n";
        rows.forEach((r, i) => {
            const totalSecs = r.problem_solving_seconds + r.contest_seconds;
            const h = Math.floor(totalSecs / 3600);
            const m = Math.floor((totalSecs % 3600) / 60);
            lb += `${i + 1}. <@${r.discord_id}> - ${h}h ${m}m (Streak: ${r.current_streak}🔥)\n`;
        });
        
        message.channel.send(lb);
    }
});

const startBot = (token) => {
    client.login(token);
};

module.exports = { startBot };
