async function Login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const response = await fetch("http://localhost:8082/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
  });

  if (response.ok) {
      const data = await response.json();
      // Display a success message and user's name
      alert(`Hello, ${data.user.name}!`);
      localStorage.setItem("user", JSON.stringify(data.user));
      // Optionally, redirect to a different page after login
      window.location.href = "./amazon.html"; // Replace with your dashboard page
  } else {
      const errorMessage = await response.text();
      // Show an error message
      alert(`Login failed: ${errorMessage}`);
  }
}
