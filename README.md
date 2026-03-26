# Codeforces Time Tracker ⏱️😈

A complete end-to-end system that tracks your active problem-solving and contest time on [Codeforces](https://codeforces.com/) and displays your stats, leaderboards, and streaks directly inside **Discord**!

## 🌟 Features
- **Chrome Extension**: Automatically tracks your active time on Codeforces.
- **Discord Bot**: Provides commands to check your stats and daily grind.
- **Leaderboard**: Compete with your friends in your Discord server to see who grinds Codeforces the most.
- **Streaks**: Tracks your daily consistency.

## 🛠️ Project Structure
This repository contains two main parts:
1. `extension/` - A Manifest V3 Chrome Extension that privately tracks how long you actively spend on Codeforces problems and contests.
2. `server/` - A Node.js backend (using Express & Discord.js) that saves your time securely to an SQLite database and powers the Discord Bot.

## 🚀 Getting Started (Local Setup)

### 1. Backend Server & Bot Setup
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables. Rename `.env.example` to `.env` (or create a new `.env` file) and add your Discord Bot Token:
   ```env
   PORT=3000
   DISCORD_TOKEN=your_discord_bot_token_here
   ```
4. Start the server (this creates the local `cf_time.db` SQLite database):
   ```bash
   npm start
   ```

### 2. Chrome Extension Setup
1. Open Google Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode** in the top right.
3. Click "Load unpacked" and select the `extension` folder from this repository.

### 3. Linking the Bot & Extension
1. Once the bot is invited to your Discord server and running locally, type `!link` in any channel.
2. The bot will DM you a unique 16-character token.
3. Click on the extension icon in Chrome, paste the token, and click **Save**.
4. Go solve a problem! The extension syncs your active time with the background server every 60 seconds.

## 🤖 Discord Commands
- `!link` - Get your unique token via DM.
- `!stats` - Check your total time grouped by problems and contests.
- `!leaderboard` - See who has accumulated the most time on your server today!

## 📦 Deployment for Public Usage
To make this work 24/7 without your terminal open:
1. Deploy the `server` folder to a service that supports persistent storage (like Fly.io or Railway) so the SQLite database doesn't get wiped on restarts.
2. Update the `fetch()` URL in `extension/background.js` to point to your deployed server url instead of `localhost:3000`.
3. Zip the `extension` folder and publish it to the Chrome Web Store.
