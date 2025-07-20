function showNotification(message) {
  if (!("Notification" in window)) {
    alert(message);
    return;
  }

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

// تابعی که به دکمه وصل میشه
function triggerWalletBlocked() {
  showNotification("امکان اتصال ولت شما تا تاریخ 2025/09/09 مقدور نیست!");
}
