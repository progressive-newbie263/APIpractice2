// async function Login() {
//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   const response = await fetch("http://localhost:8082/api/login", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       email: email,
//       password: password,
//     }),
//     credentials: "include",
//   });

//   if (response.ok) {
//     const data = await response.json();
//     // Display a success message and user's name
//     alert(`Hello, ${data.user.name}!`);
//     localStorage.setItem("user", JSON.stringify(data.user));
//     // Optionally, redirect to a different page after login
//     window.location.href = "./amazon.html"; // Replace with your dashboard page
//   } else {
//     const errorMessage = await response.text();
//     // Show an error message
//     alert(`Login failed: ${errorMessage}`);
//   }
// }

async function LoginWithCookie() {
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
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    // Display a success message and user's name
    alert(`Hello, ${data.user.name}!`);

    // Set user data in a cookie
    setCookie("user", JSON.stringify(data.user), 1); // Expires in 1 day

    // Redirect to the appropriate page based on user role
    if (data.user.role === 'admin') {
      window.location.href = "http://localhost:8082/admin"; // Redirect to admin
    } else {
      window.location.href = "./amazon.html"; // Redirect to client page
    }
  } else {
    const errorMessage = await response.text();
    // Show an error message
    alert(`Login failed: ${errorMessage}`);
  }
}

// Function to set a cookie
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  /*
    // Set SameSite=None and Secure flags for cross-origin cookies
  */
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=None; Secure=false`; 
  //document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
