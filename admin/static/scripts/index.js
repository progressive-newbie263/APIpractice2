// Hàm để hiển thị phần nội dung tương ứng và làm nổi bật item đã chọn
function showSection(sectionId) {
  // Ẩn tất cả các phần
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  // Hiển thị phần tương ứng
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }

  // Xóa lớp active khỏi tất cả các item trong sidebar
  const menuItems = document.querySelectorAll('.sidebar-menu li a');
  menuItems.forEach(item => {
    item.classList.remove('active');
  });

  // Thêm lớp active vào item đã chọn
  const selectedItem = Array.from(menuItems).find(item => 
    item.getAttribute('onclick') === `showSection('${sectionId}')`
  );

  if (selectedItem) {
    selectedItem.classList.add('active');
  }
}



// Function to get admin cookie by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to check if the user is an admin and set welcome message
function checkAdminUser() {
  const userCookie = getCookie('user');
  const user = userCookie ? JSON.parse(userCookie) : null;

  if (user && user.role === 'admin') {
    // Set the welcome message
    const welcomeMsg = document.getElementById('admin-welcome-msg');
    welcomeMsg.textContent = `Welcome Admin, ${user.name}`;
  } 
  else {
    // Redirect to login page if not admin or not logged in    
    //temporarily remove this. But this is the function that will redirect admin to the login page if logged out.

    //window.location.href = 'http://127.0.0.1:5500/client/sign-in.html';
    console.log("error logging in");
  }
}

// Call checkAdminUser when DOM is loaded
window.addEventListener('DOMContentLoaded', checkAdminUser);


