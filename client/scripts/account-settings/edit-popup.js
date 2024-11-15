const modal = document.getElementById("editModal");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("editForm");
const modalTitle = document.getElementById("modal-title");

let currentField = null;

document.querySelectorAll(".edit-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    modal.style.display = "block";
    currentField = e.target.parentElement.previousElementSibling.querySelector("label").getAttribute("for");
    modalTitle.textContent = `Change ${currentField.charAt(0).toUpperCase() + currentField.slice(1)}`;
    
    // If the field is location, adjust the placeholder to reflect it
    if (currentField === 'location') {
      document.getElementById("new-data").placeholder = "Enter your new location";
    } else if (currentField === 'name'){
      document.getElementById("new-data").placeholder = "Enter your new username";
    } else if (currentField === 'password'){
      document.getElementById("new-data").placeholder = "Enter your new password";
    }
  });
});

closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  form.reset();
});

window.addEventListener("click", (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
    form.reset();
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById("current-password").value;
  const newData = document.getElementById("new-data").value;
  const confirmData = document.getElementById("confirm-data").value;

  if (newData !== confirmData) {
    alert("New data and confirmation do not match.");
    return;
  }

  // Lấy userID từ cookie "user" và trường "id"
  const userID = getUserIDFromCookie('user');  // Hàm lấy userID từ cookie

  if (!userID) {
    alert("User ID not found in cookies.");
    return;
  }

  // Prepare payload based on the field being edited
  const payload = {
    userID: userID,  // Gửi userID cùng với payload
    currentPassword: currentPassword,
  };

  // Handle username or location update
  if (currentField === "name") {
    payload.newUsername = newData;
  } else if (currentField === "location") {
    payload.newLocation = newData;
  } else if (currentField === "password") {
    payload.newPassword = newData;
  }
  //tạm thời giới hạn chỉ cho 3 thằng này quyền đổi. 
  else {
    alert("Unknown field");
    return;
  }

  //console.log(payload); // Log để kiểm tra payload gửi đi

  try {
    let response;
    if (currentField === "name") {
      response = await sendUpdateUsernameRequest(payload);
    } else if (currentField === "location") {
      response = await sendUpdateLocationRequest(payload);
    } else if (currentField === "password") {
      response = await sendUpdatePasswordRequest(payload);
    }

    if (!response.ok) {
      const errorText = await response.text();
      alert(errorText || "Failed to update.");
      return;
    }

    // Update the UI with the new data
    //nếu update mật khẩu thì cứ để nó bị ẩn 
    if (currentField === "password") {
      document.getElementById(`user-${currentField}`).textContent = "********";
    } else {
      document.getElementById(`user-${currentField}`).textContent = newData;
    }
    form.reset();
    modal.style.display = "none";
    alert(`${currentField.charAt(0).toUpperCase() + currentField.slice(1)} updated successfully!`);
  } catch (error) {
    console.error("Error:", error);
    alert(`An error occurred while updating the ${currentField}.`);
  }
});

// Hàm lấy giá trị userID từ cookie "user"
function getUserIDFromCookie(cookieName) {
  const cookie = getCookie(cookieName);
  if (!cookie) return null;

  try {
    const parsedCookie = JSON.parse(cookie);
    return parsedCookie.id;  // Trả về giá trị "id" trong cookie
  } catch (error) {
    console.error("Error parsing cookie:", error);
    return null;
  }
}

// Hàm lấy giá trị cookie theo tên
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// hàm gọi đến API đổi tên:
async function sendUpdateUsernameRequest(payload) {
  return await fetch("http://localhost:8082/api/update-username", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

// hàm gọi đến API đổi địa chỉ:
async function sendUpdateLocationRequest(payload) {
  return await fetch("http://localhost:8082/api/update-location", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

// Hàm gọi đến API đổi mật khẩu:
async function sendUpdatePasswordRequest(payload) {
  return await fetch("http://localhost:8082/api/update-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}