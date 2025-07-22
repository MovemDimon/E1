function toBase64Unicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));
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
    let userId = localStorage.getItem('userId') || 'test-user';
    const paymentUrl = `/detail.html?coins=${encodeURIComponent(coins)}&usdPrice=${encodeURIComponent(usdPrice)}`;
    window.location.href = paymentUrl;

    // Polling localStorage every 1s to detect payment success
    const pollInterval = setInterval(async () => {
      const status = localStorage.getItem('payment_status');
      if (status === 'success') {
        clearInterval(pollInterval);
        const newBalance = localStorage.getItem('coins');
        localStorage.removeItem('payment_status'); // reset flag

        // به‌روزرسانی نمایش سکه‌ها
        const coinDisplay = document.getElementById('coinCount');
        if (coinDisplay) coinDisplay.textContent = parseInt(newBalance).toLocaleString('en-US');

        showNotification('✅ Payment successful!');

        // ارسال به سرور بک‌اند جداگانه
        try {
          await fetch('https://vercel-app-108-6bhs.vercel.app/data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
            },
            body: JSON.stringify({
              type: 'payment',
              userId,
              coins: parseInt(newBalance),
              usdPrice: parseFloat(usdPrice),
              status: 'success',
              errorMsg: '',
              timestamp: new Date().toISOString()
            })
          });
        } catch (syncErr) {
          console.error('Error syncing payment:', syncErr);
        }

        resetBtn();
      } else if (status === 'failed') {
        clearInterval(pollInterval);
        showNotification('❌ Payment failed: ' + (localStorage.getItem('payment_error') || 'Unknown error.'));
        localStorage.removeItem('payment_status');
        resetBtn();
      }
    }, 1000);

  } catch (err) {
    console.error('Unexpected error:', err);
    showNotification('❌ Unexpected error during payment process.');
    resetBtn();
  }
}
