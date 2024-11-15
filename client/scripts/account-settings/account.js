import { userAccountButton } from "../amazon.js";
import { calculateCartQuantity } from "../../data/cart.js";

window.addEventListener("DOMContentLoaded", () => {
  // Gọi hàm để lấy và hiển thị dữ liệu user từ cookie
  getUserDataFromCookie();
  userAccountButton();
});


// Hàm lấy giá trị của cookie theo tên
function getCookie(name) {
  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) {
    return JSON.parse(decodeURIComponent(match[2]));
  }
  return null; // Trả về null nếu không tìm thấy cookie
}

// Hàm gọi API và lấy dữ liệu user
async function getUserDataFromCookie() {
  // Lấy thông tin user từ cookie
  const userSession = getCookie('user');
  
  if (!userSession || !userSession.id) {
    console.error('User ID not found in cookie');
    return;
  }

  const userId = userSession.id;

  try {
    const response = await fetch(`http://localhost:8082/users/${userId}`);
    
    if (!response.ok) {
      throw new Error("User not found or API error");
    }
    
    // Chuyển đổi dữ liệu JSON thành object
    const userData = await response.json();
    
    // Lấy các giá trị cần thiết
    const { name, email, password, location } = userData;

    // Cập nhật nội dung HTML với các giá trị lấy được
    document.getElementById("user-name").innerText = name;
    document.getElementById("user-email").innerText = email;
    document.getElementById("user-password").innerText = "********"; //set nó là chuỗi sao này. Muốn đổi mật khẩu thì nhập đúng mật khẩu cũ mới cho.
    document.getElementById("user-location").innerText = location.String || ''; // location chứa Object, cần lấy `String`
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

function cartQuantityDisplay() {
  const cartQuantity = calculateCartQuantity();
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
  //console.log(cartQuantity);
}

cartQuantityDisplay();


