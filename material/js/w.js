window.triggerWalletWarning = function () {
  if (typeof showNotification === 'function') {
    showNotification("❌ امکان اتصال ولت شما تا تاریخ 2025/09/09 مقدور نیست!", "error");
  } else {
    console.warn("showNotification is not ready yet!");
  }
};
