// ░█████╗░░█████╗░██╗███╗░░██╗███████╗
// ██╔══██╗██╔══██╗██║████╗░██║██╔════╝
// ██║░░╚═╝██║░░██║██║██╔██╗██║█████╗░░
// ██║░░██╗██║░░██║██║██║╚████║██╔══╝░░
// ╚█████╔╝╚█████╔╝██║██║░╚███║███████╗
// ░╚════╝░░╚════╝░╚═╝╚═╝░░╚══╝╚══════╝
// Constants
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@vantar-holding';
const INSTAGRAM_PROFILE_URL = 'https://www.instagram.com/vantar_holding/';
const TELEGRAM_CHANNEL_LINK = 'https://t.me/DaimoniumCommunity';

// Initialize coins
function initCoins() {
  if (!localStorage.getItem('coins')) {
    localStorage.setItem('coins', '0');
  }
  updateCoinDisplay();
}

// Update coin display
function updateCoinDisplay() {
  const coins = parseInt(localStorage.getItem('coins')) || 0;
  const coinDisplay = document.getElementById('coinCount');
  if (coinDisplay) coinDisplay.textContent = coins.toLocaleString('en-US');
}

// Reward handling
function completeOneTimeTask(taskKey, reward) {
  if (localStorage.getItem(taskKey) === 'done') {
    showNotification('⚠️ You’ve already completed this task.');
    return false;
  }

  const coins = parseInt(localStorage.getItem('coins')) || 0;
  localStorage.setItem('coins', coins + reward);
  localStorage.setItem(taskKey, 'done');

  updateCoinDisplay();
  showNotification(`🎉 Success! You earned ${reward} coins.`);
  return true;
}

// Fake verification (YouTube & Instagram)
async function fakeVerifyTask(taskKey, reward, redirectUrl) {
  if (localStorage.getItem(taskKey) === 'done') {
    showNotification('✅ You’ve already completed this task.');
    return false;
  }

  if (localStorage.getItem(`${taskKey}_inProgress`) === 'true') {
    showNotification('⏳ Verification in progress. Please wait...');
    return false;
  }

  localStorage.setItem(`${taskKey}_inProgress`, 'true');
  window.open(redirectUrl, '_blank');

  showNotification('⏳ Please wait while we verify your action...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  const granted = completeOneTimeTask(taskKey, reward);
  localStorage.removeItem(`${taskKey}_inProgress`);
  return granted;
}

// Telegram verification (real)
async function verifyTelegramSubscribe() {
  const userId = localStorage.getItem('telegramUserId');
  if (!userId) {
    showNotification('⚠️ Please log in with Telegram first.');
    return false;
  }

  try {
    showNotification('⏳ Checking your Telegram channel subscription...');
    const response = await fetch('/api/verify-telegram-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      showNotification('⚠️ Verification failed. Please try again.');
      return false;
    }

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    showNotification('❌ Server error. Please try again later.');
    return false;
  }
}

// Event Handlers
async function onTelegramSubscribeClick() {
  // 1. Open Telegram channel
  window.open(TELEGRAM_CHANNEL_LINK, '_blank');
  showNotification('📢 Redirecting you to the Telegram channel. Please join.');

  // 2. Wait 20 seconds
  showNotification('⏳ Waiting 20 seconds before verifying your subscription...');
  await new Promise(resolve => setTimeout(resolve, 20000));

  // 3. Verify with server
  const verified = await verifyTelegramSubscribe();
  if (verified) {
    completeOneTimeTask('subscribeTelegram', 100);
  } else {
    showNotification('❌ You are not a member yet or Telegram hasn’t updated your status. Please make sure to join and try again.');
  }
}

async function onYouTubeSubscribeClick() {
  await fakeVerifyTask('subscribeYouTube', 100, YOUTUBE_CHANNEL_URL);
}

async function onInstagramFollowClick() {
  await fakeVerifyTask('followInstagram', 100, INSTAGRAM_PROFILE_URL);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  initCoins();

  const btnTelegram = document.getElementById('btnTelegram');
  const btnYouTube = document.getElementById('btnYouTube');
  const btnInstagram = document.getElementById('btnInstagram');

  if (btnTelegram) {
    btnTelegram.addEventListener('click', onTelegramSubscribeClick);
  }

  if (btnYouTube) {
    btnYouTube.addEventListener('click', onYouTubeSubscribeClick);
  }

  if (btnInstagram) {
    btnInstagram.addEventListener('click', onInstagramFollowClick);
  }
});
