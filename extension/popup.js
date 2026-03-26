document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token');
    const saveBtn = document.getElementById('save');
    const statusTxt = document.getElementById('status');
  
    // Load existing token
    chrome.storage.local.get(['discordToken'], (res) => {
      if (res.discordToken) {
        tokenInput.value = res.discordToken;
      }
    });
  
    // Save new token
    saveBtn.addEventListener('click', () => {
      const token = tokenInput.value.trim();
      chrome.storage.local.set({ discordToken: token }, () => {
        statusTxt.textContent = "Token saved successfully!";
        setTimeout(() => { statusTxt.textContent = ""; }, 2000);
      });
    });
  });
