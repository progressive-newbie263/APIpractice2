function logout() {
  const user = JSON.parse(localStorage.getItem('user'));
  // Clear the local storage or cookies
  localStorage.removeItem('user'); // Assuming 'user' is stored in local storage

  // Optionally, clear other session data
  localStorage.removeItem('orders'); // If there's any other data to clear

  // Send a logout request to the backend (optional if backend session is involved)
  fetch('/logout', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
  })
  .then(response => {
      if (response.ok) {
          // Redirect to the login page
          window.location.href = 'http://127.0.0.1:5500/client/sign-in.html'; // Assuming login page is `login.html`
      } else {
          console.error('Logout failed');
      }
  })
  .catch(error => console.error('Error during logout:', error));
}
