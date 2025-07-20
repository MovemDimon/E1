function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// تابع نمایش نوتیفیکیشن
function showNotification(message) {
  // اگر مرورگر از Notification پشتیبانی نمی‌کند
  if (!("Notification" in window)) {
    alert(message);
    return;
  }

  // اگر اجازه داده نشده
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      } else {
        alert(message);
      }
    });
  } else {
    new Notification(message);
  }
}

// بررسی پارامتر و نمایش پیام مناسب
const reason = getQueryParam("w");
if (reason === "wallet_blocked") {
  showNotification("امکان اتصال ولت شما تا تاریخ 2025/09/09 مقدور نیست!");
}
