function showSection(sectionId) {
  const sections = document.querySelectorAll('.section');
  
  sections.forEach(section => {
    section.style.display = 'none';
  });

  document.getElementById(sectionId).style.display = 'block';
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