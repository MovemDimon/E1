document.addEventListener('DOMContentLoaded', function () {
  const btn = document.querySelector('.task-button');

  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      showNotification("❌ امکان اتصال ولت شما تا تاریخ 2025/09/09 مقدور نیست!", "error");
    });
  }
});
