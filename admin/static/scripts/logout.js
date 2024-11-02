// Function to handle logging out
function logout() {
  // Show confirmation dialog
  const isConfirmed = confirm('Do you want to logout?');

  if (isConfirmed) {
    // Clear the cookie by setting an expiration date in the past
    document.cookie = "user=; expires=Fri, 18 Oct 2024 00:00:00 UTC; path=/;";
    
    // Optionally call the logout API to end the session on the server
    fetch('http://localhost:8082/api/logout', {
      method: 'POST',
      credentials: 'include',
    }).then((response) => {
      if (response.ok) {
        // Redirect to login page after logout
        window.location.href = 'http://127.0.0.1:5500/client/sign-in.html';
      } else {
        alert('Logout failed');
      }
    });
  } else {
    // User canceled the logout action
    console.log('Logout canceled');
  }
}
