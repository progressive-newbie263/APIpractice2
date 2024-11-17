// Hàm xóa tất cả cookie
//đề phòng trường hợp có 1 chỗ nào đó, mình quên xoá cookie. đảm bảo application trống trơn hết.
function clearAllCookies() {
  const cookies = document.cookie.split(";");

  // Duyệt qua từng cookie và xóa
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=; path=/; expires=Thu, 26 Jan 2004 00:00:00 UTC; SameSite=Lax; Secure=false`;
  }
}
// Xóa tất cả cookie ngay khi trang được tải (on window loaded.)
document.addEventListener("DOMContentLoaded", () => {
  clearAllCookies();
});



// Hàm đăng nhập và lưu token vào cookie
async function LoginWithCookie() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Gửi yêu cầu đăng nhập
  const response = await fetch("http://localhost:8082/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
    credentials: "include", // Đảm bảo rằng cookie được gửi từ phía client
  });

  if (response.ok) {
    const data = await response.json();

    // Hiển thị thông báo đăng nhập thành công và tên người dùng
    alert(`Hello, ${data.user.name}!`);

    // Lưu token vào cookie (thời gian hết hạn là 1 ngày)
    setCookie("token", data.token, 1);

    // Lưu thông tin người dùng vào cookie (thời gian hết hạn là 1 ngày)
    setCookie("user", JSON.stringify(data.user), 1);

    // Chuyển hướng người dùng tùy theo vai trò (role)
    if (data.user.role === 'admin') {
      window.location.href = "http://localhost:8082/admin"; // Redirect đến trang admin
    } else {
      window.location.href = "./amazon.html"; // Redirect đến trang client
    }
  } else {
    const errorMessage = await response.text();
    // Hiển thị thông báo lỗi
    alert(`Login failed: ${errorMessage}`);
  }
}

// Hàm để thiết lập cookie
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Tính ngày hết hạn
    expires = "; expires=" + date.toUTCString();
  }

  // Thiết lập cookie với các flag đảm bảo bảo mật
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=None; Secure=false`;
  // Lưu ý: SameSite=None và Secure=false chỉ dành cho yêu cầu giữa các trang khác domain
}
