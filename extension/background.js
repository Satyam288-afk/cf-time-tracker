const TICK_INTERVAL_MS = 10000; // Poll every 10 seconds
let pendingSeconds = { problem: 0, contest: 0 };

// Poll active tabs to check if user is active on CF
setInterval(async () => {
    try {
        const tabs = await chrome.tabs.query({ url: "*://codeforces.com/*", active: true, currentWindow: true });
        if (tabs.length === 0) return;

        const tab = tabs[0];
        try {
            const response = await chrome.tabs.sendMessage(tab.id, { type: "CHECK_ACTIVITY" });
            if (response && response.isActive) {
                pendingSeconds[response.category] += (TICK_INTERVAL_MS / 1000);
            }
        } catch (err) {
            // Content script error or page loading
        }
    } catch (e) {
        console.error("Tab query error:", e);
    }
}, TICK_INTERVAL_MS);

// Sync data to server every 1 minute
chrome.alarms.create("syncData", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "syncData") {
    const { discordToken } = await chrome.storage.local.get(['discordToken']);
    if (!discordToken) return; 

    // Sync accumulated time for each category
    for (const cat of ['problem', 'contest']) {
        const secs = pendingSeconds[cat];
        if (secs > 0) {
            try {
                const res = await fetch('http://localhost:3000/api/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: discordToken,
                        category: cat,
                        activeSeconds: secs
                    })
                });

                if (res.ok) {
                    // Deduct correctly handled seconds
                    pendingSeconds[cat] -= secs; 
                }
            } catch (e) {
                console.error("Network error syncing stats to backend", e);
            }
        }
    }
  }
});
