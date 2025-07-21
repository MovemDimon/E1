// Function to update the coin display
function updateCoinDisplay() {
  const coins = parseInt(localStorage.getItem('coins')) || 0;
  const coinDisplay = document.getElementById('coinCount');
  if (coinDisplay) coinDisplay.textContent = coins.toLocaleString('en-US');
}

// Update when coin value changes from other tabs
window.addEventListener('storage', ({ key }) => {
  if (key === 'coins') updateCoinDisplay();
});

// Initial load
updateCoinDisplay();

// Task completion with fake loading
function completeTaskUrl(taskId, reward, dummyUrl, taskStorageKey) {
  const today = new Date().toISOString().split('T')[0];

  if (localStorage.getItem(taskStorageKey) === today) {
    return showNotification('⚠️ This task has already been completed today.');
  }

  // Show loading overlay
  showLoadingOverlay("Processing...");

  // Wait for 2s, then give reward
  setTimeout(() => {
    hideLoadingOverlay();

    // Save as done
    localStorage.setItem(taskStorageKey, today);

    // Add coins
    let coins = parseInt(localStorage.getItem('coins')) || 0;
    coins += reward;
    localStorage.setItem('coins', coins);
    updateCoinDisplay();

    // Notify
    showNotification(`🎉 Congratulations! You earned ${reward.toLocaleString('en-US')} coins.`);
  }, 2000);
}
function showLoadingOverlay(text = "Loading...") {
  const overlay = document.getElementById("loadingOverlay");
  if (!overlay) return;
  overlay.style.display = "flex";
  overlay.querySelector("p").textContent = text;
}

function hideLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
}
