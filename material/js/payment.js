// تبدیل امن یونیکد به Base64
function toBase64Unicode(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

async function handlePayment(coins, usdPrice, btn) {
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Processing...';

  function resetBtn() {
    btn.disabled = false;
    btn.textContent = originalText;
  }

  try {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'test-user';
      showNotification('⚠️ [Test mode] No user ID found. Using test-user ID.');
    }

    // ساخت deeplink پرداخت و باز کردن آن
    const payloadForLink = { coins, usdPrice, userId };
    const encoded  = toBase64Unicode(JSON.stringify(payloadForLink));
    const deeplink = `https://t.me/Daimonium_bot?start=pay_${encoded}`;
    window.open(deeplink, '_blank');

    // فراخوانی API برای دریافت تنظیمات وب‌سوکت
    let data;
    try {
      const res = await fetch(`/api/ws-params?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = await res.json();
    } catch (fetchError) {
      showNotification('❌ Could not connect to payment server.');
      resetBtn();
      return;
    }

    const { wsUrl, wsApiKey } = data;
    if (!wsUrl || !wsApiKey) {
      showNotification('❌ Missing WebSocket configuration.');
      resetBtn();
      return;
    }

    // اتصال به WebSocket
    const ws = new WebSocket(`${wsUrl}?userId=${encodeURIComponent(userId)}&api_key=${encodeURIComponent(wsApiKey)}`);

    const timeoutId = setTimeout(() => {
      showNotification('❌ Payment timeout. Please try again.');
      ws.close();
    }, 30000);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ action: 'confirm_payment', data: payloadForLink }));
    });

    ws.addEventListener('message', async ({ data: msgData }) => {
      clearTimeout(timeoutId);

      let msg;
      try {
        msg = JSON.parse(msgData);
      } catch {
        console.error('Invalid message:', msgData);
        ws.close();
        return;
      }

      if (msg.event === 'payment_result') {
        const { newBalance, error } = msg.data;

        if (newBalance != null) {
          // 1) به‌روز کردن localStorage و UI
          localStorage.setItem('coins', newBalance);
          const coinDisplay = document.getElementById('coinCount');
          if (coinDisplay) coinDisplay.textContent = newBalance.toLocaleString('en-US');
          showNotification('✅ Payment successful!');

          // 2) ارسال لحظه‌ای به سرور
          const paymentPayload = {
            type: 'payment',
            userId,
            coins: newBalance,
            usdPrice,
            status: 'success',
            errorMsg: '',
            timestamp: new Date().toISOString()
          };

          try {
            await fetch('/data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
              },
              body: JSON.stringify(paymentPayload)
            });
          } catch (syncErr) {
            console.error('Error syncing payment:', syncErr);
          }
        } else {
          // پرداخت ناموفق
          showNotification('❌ Payment failed: ' + (error || 'Unknown error.'));
        }
      }

      ws.close();
    });

    ws.addEventListener('error', (e) => {
      clearTimeout(timeoutId);
      console.error('WebSocket error:', e);
      showNotification('❌ WebSocket connection error.');
      ws.close();
    });

    ws.addEventListener('close', () => {
      resetBtn();
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    showNotification('❌ Unexpected error during payment process.');
    resetBtn();
  }
}
