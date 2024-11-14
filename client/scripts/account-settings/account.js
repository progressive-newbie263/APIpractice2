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


//edit pop-up:
// Get modal elements
const modal = document.getElementById("editModal");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("editForm");
const modalTitle = document.getElementById("modal-title");

// Variables to store the field being edited
let currentField = null;

// Show modal when edit button is clicked
document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    modal.style.display = "block";
    
    // Determine which field is being edited
    currentField = e.target.parentElement.previousElementSibling.querySelector("label").getAttribute("for");
    modalTitle.textContent = `Change ${currentField.charAt(0).toUpperCase() + currentField.slice(1)}`;
  });
});

// Close modal when 'x' is clicked
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  form.reset();
});

// Close modal when clicking outside of it
window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
    form.reset();
  }
});

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const currentPassword = document.getElementById("current-password").value;
  const newData = document.getElementById("new-data").value;
  const confirmData = document.getElementById("confirm-data").value;

  // Check if new data matches confirm data
  if (newData !== confirmData) {
    alert("New value and confirmation do not match.");
    return;
  }

  // Simulate password verification (replace this with actual password verification logic)
  const isPasswordCorrect = (currentPassword === "current-password"); 

  if (!isPasswordCorrect) {
    alert("Incorrect current password.");
    return;
  }

  // Update field value (replace this with actual update logic, such as an API call)
  document.getElementById(`user-${currentField}`).textContent = newData;

  // Close modal and reset form
  modal.style.display = "none";
  form.reset();
  alert(`${currentField.charAt(0).toUpperCase() + currentField.slice(1)} updated successfully!`);
});
