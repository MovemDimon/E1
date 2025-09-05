// ░█████╗░░█████╗░██╗███╗░░██╗███████╗
// ██╔══██╗██╔══██╗██║████╗░██║██╔════╝
// ██║░░╚═╝██║░░██║██║██╔██╗██║█████╗░░
// ██║░░██╗██║░░██║██║██║╚████║██╔══╝░░
// ╚█████╔╝╚█████╔╝██║██║░╚███║███████╗
// ░╚════╝░░╚════╝░╚═╝╚═╝░░╚══╝╚══════╝
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@vantar-holding';
const INSTAGRAM_PROFILE_URL = 'instagram://user?username=vantar_holding'; // ✅ Deep Link
const TELEGRAM_CHANNEL_LINK = 'https://t.me/DaimoniumCommunity';

const TELEGRAM_BOT_TOKEN = '3539344.gynnbhv';
const TELEGRAM_CHANNEL_USERNAME = 'DaimoniumCommunity';

// Telegram init
document.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    const initData = Telegram.WebApp.initDataUnsafe;
    if (initData && initData.user) {
      localStorage.setItem('telegramUserId', initData.user.id);
    }
  }

  initCoins();

  const btnTelegram = document.getElementById('btnTelegram');
  const btnYouTube = document.getElementById('btnYouTube');
  const btnInstagram = document.getElementById('btnInstagram');

  // ✅ دکمه‌هایی که disabled هستند رو فقط پیام می‌دیم
  [btnTelegram, btnYouTube, btnInstagram].forEach(btn => {
    if (!btn) return;
    if (btn.classList.contains('disabled')) {
      btn.addEventListener('click', () => {
        showNotification('⚠️ این بخش فعلاً غیرفعال است و به‌زودی فعال خواهد شد.');
      });
    }
  });

  // ✅ فقط اگر disabled نبودند، رفتار اصلی فعال میشه
  if (btnTelegram && !btnTelegram.classList.contains('disabled')) {
    btnTelegram.addEventListener('click', onTelegramSubscribeClick);
  }
  if (btnYouTube && !btnYouTube.classList.contains('disabled')) {
    btnYouTube.addEventListener('click', onYouTubeSubscribeClick);
  }
  if (btnInstagram && !btnInstagram.classList.contains('disabled')) {
    btnInstagram.addEventListener('click', onInstagramFollowClick);
  }
});

function initCoins() {
  if (!localStorage.getItem('coins')) {
    localStorage.setItem('coins', '0');
  }
  updateCoinDisplay();
}

function updateCoinDisplay() {
  const coins = parseInt(localStorage.getItem('coins')) || 0;
  const coinDisplay = document.getElementById('coinCount');
  if (coinDisplay) coinDisplay.textContent = coins.toLocaleString('en-US');
}

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

// ✅ Telegram verification using Telegram Bot API directly
async function verifyTelegramSubscribe() {
  const userId = localStorage.getItem('telegramUserId');
  if (!userId) {
    showNotification('⚠️ Please log in with Telegram first.');
    return false;
  }

  try {
    showNotification('⏳ Checking your Telegram channel subscription...');

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember?chat_id=@${TELEGRAM_CHANNEL_USERNAME}&user_id=${userId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.ok) {
      console.error('Telegram API error:', data);
      showNotification('❌ Verification failed. Please try again.');
      return false;
    }

    const status = data.result.status;
    return ['member', 'creator', 'administrator'].includes(status);
  } catch (error) {
    console.error('Error verifying Telegram membership:', error);
    showNotification('❌ Server error. Please try again later.');
    return false;
  }
}

async function onTelegramSubscribeClick() {
  window.open(TELEGRAM_CHANNEL_LINK, '_blank');
  showNotification('📢 Redirecting you to the Telegram channel. Please join.');
  showNotification('⏳ Waiting 20 seconds before verifying your subscription...');
  await new Promise(resolve => setTimeout(resolve, 20000));

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
