let lastActivityTime = Date.now();
const IDLE_TIMEOUT = 30000; // 30 seconds of inactivity before considered idle

// Listen to various UI events to track activity
['mousemove', 'mousedown', 'keydown', 'scroll', 'click'].forEach(evt => {
  document.addEventListener(evt, () => {
    lastActivityTime = Date.now();
  }, { passive: true });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CHECK_ACTIVITY") {
    const isActive = (Date.now() - lastActivityTime) < IDLE_TIMEOUT;
    const isVisible = !document.hidden;
    
    let category = "problem";
    const path = window.location.pathname;

    // Determine category based on URL
    if (path.startsWith('/contest/')) {
        // Being in a contest lobby is "contest" time.
        // Reviewing a specific problem is "problem" time.
        if (path.includes('/problem/')) {
            category = "problem";
        } else {
            category = "contest";
        }
    } else if (path.startsWith('/problemset/')) {
        category = "problem";
    }

    sendResponse({ 
      isActive: isActive && isVisible, 
      category: category 
    });
  }
  return true;
});
