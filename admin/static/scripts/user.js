// Get DOM elements
const userTable = document.getElementById("userTable");
const userForm = document.getElementById("addUserForm");
const searchUserInput = document.getElementById("searchUserInput");
const searchUserButton = document.getElementById("searchUserButton");

let users = []; // Store fetched users
let editingUser = null; // Track the user being edited

// Fetch and display users from users API.
async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:8082/users');
    if (!response.ok) throw new Error("Failed to fetch users.");
    
    users = await response.json();
    renderUserList(users);
  } catch (error) {
    console.error(error.message);
  }
}

// Filter the users based on the search query
function filterUsers(searchQuery) {
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  renderUserList(filteredUsers); // Render filtered users
}

// Render the user list in the table
function renderUserList(userArray) {
  userTable.innerHTML = ""; // Clear the table

  userArray.forEach((user) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.email}</td>
      <td>${user.password}</td>
      <td>${user.name}</td>
      <td>
        <button class="edit-btn" onclick="editUser('${user.id}')">
          Edit
        </button>
        <button class="delete-btn" onclick="deleteUser('${user.id}')">
          Delete
        </button>
      </td>
    `;
    userTable.appendChild(row);
  });
}

// Search users on Enter key press or search button click
searchUserInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchQuery = e.target.value;
    filterUsers(searchQuery); // Fetch users based on search query
  }
});

searchUserButton.addEventListener("click", () => {
  const searchQuery = searchUserInput.value;
  filterUsers(searchQuery); // Fetch users based on search query
});

// Add/Edit user functionality
userForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userData = {
    email: document.getElementById("userEmail").value,
    password: document.getElementById("userPassword").value,
    name: document.getElementById("Name").value,
  };

  try {
    if (editingUser) {
      // Update user
      await fetch(`http://localhost:8082/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      editingUser = null;
    } else {
      // Add new user
      await fetch(`http://localhost:8082/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
    }

    userForm.reset(); // Clear form
    fetchUsers(); // Refresh user list

  } catch (error) {
    console.error("Failed to submit user data:", error);
  }
});

// Edit user
function editUser(id) {
  const user = users.find((u) => u.id === id);

  document.getElementById("userEmail").value = user.email;
  document.getElementById("userPassword").value = user.password;
  document.getElementById("Name").value = user.name;

  editingUser = user;
}

// Delete user
async function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    try {
      await fetch(`http://localhost:8082/users/${id}`, {
        method: "DELETE",
      });
      fetchUsers(); // Refresh user list after deletion
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }
}

// Initialize by fetching users when the page loads
window.addEventListener("DOMContentLoaded", fetchUsers);