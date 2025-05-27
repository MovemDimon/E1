// ==== Task Configuration ====

const TASK_CONFIG = {
  thresholds: {
    invite3: 3,
    invite5: 5,
    invite10: 10,
    invite20: 20,
  },
  rewards: {
    invite3: 10000,
    invite5: 20000,
    invite10: 70000,
    invite20: 200000,
  },
};

// ==== Local State ====

let balance = parseInt(localStorage.getItem('balance')) || 0;
let invitedFriends = parseInt(localStorage.getItem('invitedFriends')) || 0;

// ==== Test Log ====
console.log("✅ Task.js loaded");
console.log("🔢 invitedFriends:", invitedFriends);
console.log("💰 balance:", balance);

// ==== Complete Invite Task ====

function completeTask(taskName) {
  alert("✅ completeTask triggered with: " + taskName);

  const userId = localStorage.getItem('userId') || "testUser123";
  if (!userId) {
    showNotification('⚠️ Please log in before claiming rewards.');
    return;
  }

  if (localStorage.getItem(taskName) === 'true') {
    showNotification('⚠️ You have already claimed this reward.');
    return;
  }

  const required = TASK_CONFIG.thresholds[taskName];
  const reward = TASK_CONFIG.rewards[taskName];

  if (invitedFriends >= required) {
    balance += reward;
    localStorage.setItem('balance', balance);
    localStorage.setItem(taskName, 'true');
    updateBalance();
    showNotification(`🎉 You received ${reward.toLocaleString()} coins!`);
    if (typeof syncWithServer === 'function') syncWithServer();
  } else {
    const remaining = required - invitedFriends;
    showNotification(`⚠️ Invite ${remaining} more friend${remaining === 1 ? '' : 's'} to claim this reward.`);
  }
}

// ==== Update Coin Display ====

function updateBalance() {
  const el = document.getElementById('balance');
  if (el) el.textContent = balance.toLocaleString();
}

// ==== Increase Invite Count (Test Mode) ====

function inviteFriend() {
  invitedFriends++;
  localStorage.setItem('invitedFriends', invitedFriends);
  updateInviteTaskStatus();
}

// ==== Enable/Disable Invite Buttons ====

function updateInviteTaskStatus() {
  ['invite3', 'invite5', 'invite10', 'invite20'].forEach(key => {
    const btnId = `claim${key.charAt(0).toUpperCase() + key.slice(1)}`;
    const btn = document.getElementById(btnId);
    if (btn) {
      const threshold = TASK_CONFIG.thresholds[key];
      const completed = localStorage.getItem(key) === 'true';

      btn.disabled = invitedFriends < threshold || completed;

      if (completed) {
        btn.textContent = '✅ Claimed';
      } else if (invitedFriends >= threshold) {
        btn.textContent = '💎 Claim';
      } else {
        const remaining = threshold - invitedFriends;
        btn.textContent = `⬜ ${remaining} more to unlock`;
      }
    }
  });

  const status = document.getElementById('inviteTaskStatus');
  if (status) {
    status.textContent =
      invitedFriends >= TASK_CONFIG.thresholds.invite3
        ? '✅ You have invited at least 3 friends.'
        : `⚠️ Invite ${TASK_CONFIG.thresholds.invite3 - invitedFriends} more friend(s).`;
  }
}

// ==== Initial Setup ====

updateBalance();
updateInviteTaskStatus();
