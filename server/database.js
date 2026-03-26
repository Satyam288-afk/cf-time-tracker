const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'cf_time.db'));

// initialize tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            discord_id TEXT PRIMARY KEY,
            extension_token TEXT UNIQUE,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_active_date TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS daily_stats (
            discord_id TEXT,
            date TEXT,
            problem_solving_seconds INTEGER DEFAULT 0,
            contest_seconds INTEGER DEFAULT 0,
            PRIMARY KEY (discord_id, date)
        )
    `);
});

const getUserStats = (discordId, date) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM daily_stats WHERE discord_id = ? AND date = ?`, [discordId, date], (err, row) => {
            if (err) reject(err);
            resolve(row || { problem_solving_seconds: 0, contest_seconds: 0 });
        });
    });
};

const updateTime = (extensionToken, category, seconds) => {
    return new Promise((resolve, reject) => {
        const today = new Date().toISOString().split('T')[0];
        
        // Find discord ID by extension token
        db.get(`SELECT discord_id, last_active_date, current_streak FROM users WHERE extension_token = ?`, [extensionToken], (err, user) => {
            if (err) return reject(err);
            if (!user) return reject(new Error('User not found. Link your extension token via Discord.'));
            
            const discordId = user.discord_id;
            const column = category === 'contest' ? 'contest_seconds' : 'problem_solving_seconds';
            
            db.run(`
                INSERT INTO daily_stats (discord_id, date, ${column}) 
                VALUES (?, ?, ?) 
                ON CONFLICT(discord_id, date) 
                DO UPDATE SET ${column} = ${column} + ?
            `, [discordId, today, seconds, seconds], function(err) {
                if (err) return reject(err);
                
                // Update streaks logic
                let newStreak = user.current_streak;
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                
                if (user.last_active_date !== today) {
                    if (user.last_active_date === yesterday) {
                        newStreak += 1; // Continued streak
                    } else {
                        newStreak = 1; // Reset streak
                    }
                }
                
                db.run(`
                    UPDATE users 
                    SET last_active_date = ?, current_streak = ? 
                    WHERE discord_id = ?
                `, [today, newStreak, discordId]);
                
                resolve();
            });
        });
    });
};

const linkUser = (discordId, token) => {
    return new Promise((resolve, reject) => {
         db.run(`
            INSERT INTO users (discord_id, extension_token) 
            VALUES (?, ?) 
            ON CONFLICT(discord_id) 
            DO UPDATE SET extension_token = excluded.extension_token
        `, [discordId, token], (err) => {
             if (err) reject(err);
             else resolve();
         });
    });
};

const getLeaderboard = (date) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT u.discord_id, d.problem_solving_seconds, d.contest_seconds, u.current_streak
            FROM users u
            JOIN daily_stats d ON u.discord_id = d.discord_id
            WHERE d.date = ?
            ORDER BY (d.problem_solving_seconds + d.contest_seconds) DESC
        `, [date], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    db,
    getUserStats,
    updateTime,
    linkUser,
    getLeaderboard
};
