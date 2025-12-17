// login-popup.js

function showLoginPopup() {
  // Đảm bảo ID này khớp với ID trong login-popup.html
  document
    .getElementById("login-popup-overlay")
    ?.classList.remove("hidden");
}

function hideLoginPopup() {
  document
    .getElementById("login-popup-overlay")
    ?.classList.add("hidden");
}

// Logic đóng Pop-up: Đảm bảo DOM đã được tải (do dùng defer)
// Lưu ý: Dùng document.addEventListener("click", ...) có thể tạo ra lỗi nếu gọi quá sớm, 
// nhưng với defer và các phần tử đã tồn tại, nó sẽ hoạt động.
document.addEventListener("click", function (e) {
  if (
    // Click vào nút X
    e.target.matches(".popup-close") || 
    // Click vào nút Hủy
    e.target.matches(".btn-cancel") ||
    // Click vào nền đen (Overlay)
    e.target.id === "login-popup-overlay" 
  ) {
    hideLoginPopup();
  }
});